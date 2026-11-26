"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Plus,
  Printer,
  Send,
  Trash2,
} from "lucide-react";
import {
  FRAME_FINISHES,
  GLASS_OPTIONS,
  isValidSystemKey,
  OPENING_LABELS,
  STANDARD_PRESET_SIZES,
  SYSTEM_LIST,
  SYSTEM_RULES,
  validateConfiguration,
  type ConfiguratorSystemKey,
  type FrameFinishKey,
  type GlassOptionKey,
  type OpeningType,
} from "@/lib/configurator-rules";
import { toLatinDigits, toPersianDigits } from "@/lib/persian-seo";
import {
  calculateInquiryTotals,
  calculateItemPrice,
  formatToman,
  type PricableInquiryItem,
  type PricingRuleRow,
  type PublicFxSummary,
} from "@/lib/pricing-calculator";
import { formatFxTimestamp, getFxSourceLabel } from "@/lib/fx-labels";
import { DrawingAttachmentInput } from "@/components/ui/DrawingAttachmentInput";
import { SITE_CONFIG } from "@/lib/site-config";
import { WindowSvgPreview } from "./WindowSvgPreview";

const STORAGE_KEY = "sepanta_inquiry_items_v1";
const STORAGE_EVENT = "sepanta-inquiry-change";

interface InquiryItem {
  id: string;
  locationName: string;
  system: ConfiguratorSystemKey;
  widthCm: number;
  heightCm: number;
  panelCount: number;
  openings: OpeningType[];
  glass?: GlassOptionKey;
  glassType?: GlassOptionKey;
  finish: FrameFinishKey;
  includeMesh: boolean;
  quantity: number;
  areaSqm: number;
}

interface SubmissionSuccess {
  trackingCode: string;
  estimatedTotalIrr: number;
  estimatedTotalToman: number;
  itemCount: number;
}

function resolveItemGlass(item: InquiryItem): GlassOptionKey {
  return item.glassType ?? item.glass ?? SYSTEM_RULES[item.system].defaultGlass;
}

function buildDefaultOpenings(
  system: ConfiguratorSystemKey,
  panelCount: number
): OpeningType[] {
  const rule = SYSTEM_RULES[system];
  return Array.from({ length: panelCount }, (_, i) => {
    if (system === "upvc" || system === "thermal-break") {
      return i === 0 ? rule.defaultOpening : "fixed";
    }
    return rule.defaultOpening;
  });
}

function parseDimensionInput(raw: string): number {
  const normalized = toLatinDigits(raw).replace(/[^0-9]/g, "");
  return normalized ? Number(normalized) : 0;
}

function subscribeInquiryStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function getInquirySnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerInquirySnapshot(): string {
  return "[]";
}

function writeInquiryStore(nextItems: InquiryItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export function WindowConfigurator() {
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product");
  const initialSystem: ConfiguratorSystemKey = isValidSystemKey(productParam)
    ? productParam
    : "upvc";

  return (
    <WindowConfiguratorInner
      key={initialSystem}
      initialSystem={initialSystem}
    />
  );
}

function WindowConfiguratorInner({
  initialSystem,
}: {
  initialSystem: ConfiguratorSystemKey;
}) {
  const [system, setSystem] = useState<ConfiguratorSystemKey>(initialSystem);
  const [locationName, setLocationName] = useState("پنجره پذیرایی");
  const [widthCm, setWidthCm] = useState<number>(
    SYSTEM_RULES[initialSystem].defaultWidth
  );
  const [heightCm, setHeightCm] = useState<number>(
    SYSTEM_RULES[initialSystem].defaultHeight
  );
  const [panelCount, setPanelCount] = useState<number>(
    SYSTEM_RULES[initialSystem].defaultPanels
  );
  const [openings, setOpenings] = useState<OpeningType[]>(() =>
    buildDefaultOpenings(
      initialSystem,
      SYSTEM_RULES[initialSystem].defaultPanels
    )
  );
  const [glass, setGlass] = useState<GlassOptionKey>(
    SYSTEM_RULES[initialSystem].defaultGlass
  );
  const [finish, setFinish] = useState<FrameFinishKey>("white");
  const [includeMesh, setIncludeMesh] = useState<boolean>(
    SYSTEM_RULES[initialSystem].supportsMesh
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  // Live SQLite pricing rules & FX status
  const [rulesMap, setRulesMap] = useState<Record<string, PricingRuleRow> | null>(
    null
  );
  const [fxSummary, setFxSummary] = useState<PublicFxSummary | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  // Official inquiry submission state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<SubmissionSuccess | null>(
    null
  );
  const [codeCopied, setCodeCopied] = useState(false);

  const nextIdSeqRef = useRef(1);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/pricing-rules/", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch pricing rules");
        const data = (await res.json()) as {
          ok?: boolean;
          fx?: PublicFxSummary;
          rules?: PricingRuleRow[];
        };
        if (!cancelled && data.ok && Array.isArray(data.rules)) {
          const map = Object.fromEntries(
            data.rules.map((r) => [r.system_key, r])
          );
          setRulesMap(map);
          if (data.fx) {
            setFxSummary(data.fx);
          }
        }
      })
      .catch(() => {
        // Graceful fallback to dimension-only mode
      })
      .finally(() => {
        if (!cancelled) {
          setPricingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const rawItemsJson = useSyncExternalStore(
    subscribeInquiryStore,
    getInquirySnapshot,
    getServerInquirySnapshot
  );

  const items = useMemo<InquiryItem[]>(() => {
    try {
      const parsed = JSON.parse(rawItemsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [rawItemsJson]);

  const activeRule = SYSTEM_RULES[system];

  const handleSystemChange = (nextSystem: ConfiguratorSystemKey) => {
    const nextRule = SYSTEM_RULES[nextSystem];
    setSystem(nextSystem);
    setWidthCm(nextRule.defaultWidth);
    setHeightCm(nextRule.defaultHeight);
    setPanelCount(nextRule.defaultPanels);
    setOpenings(buildDefaultOpenings(nextSystem, nextRule.defaultPanels));
    setGlass(nextRule.defaultGlass);
    setIncludeMesh(nextRule.supportsMesh);
  };

  const handlePanelCountChange = (nextCount: number) => {
    setPanelCount(nextCount);
    setOpenings((prev) =>
      Array.from({ length: nextCount }, (_, idx) => {
        const existing = prev[idx];
        if (existing && activeRule.allowedOpenings.includes(existing)) {
          return existing;
        }
        return activeRule.defaultOpening;
      })
    );
  };

  const handleOpeningChange = (index: number, nextOpening: OpeningType) => {
    setOpenings((prev) =>
      prev.map((item, idx) => (idx === index ? nextOpening : item))
    );
  };

  const validation = validateConfiguration({
    system,
    widthCm,
    heightCm,
    panelCount,
    openings,
    glass,
    finish,
    includeMesh,
  });

  const activePriceBreakdown = useMemo(() => {
    if (!rulesMap || !rulesMap[system] || !validation.isValid) return null;
    return calculateItemPrice(
      {
        locationName: locationName.trim() || "پنجره انتخاب‌شده",
        system,
        widthCm,
        heightCm,
        panelCount,
        openings: openings.slice(0, panelCount),
        glassType: glass,
        finish,
        includeMesh: activeRule.supportsMesh && includeMesh,
        quantity: Math.max(1, Math.min(50, quantity)),
      },
      rulesMap[system]
    );
  }, [
    rulesMap,
    system,
    validation.isValid,
    locationName,
    widthCm,
    heightCm,
    panelCount,
    openings,
    glass,
    finish,
    activeRule.supportsMesh,
    includeMesh,
    quantity,
  ]);

  const handleAddItem = () => {
    if (!validation.isValid) return;

    const seq = nextIdSeqRef.current;
    nextIdSeqRef.current = seq + 1;

    const nextItem: InquiryItem = {
      id: `item-${items.length + 1}-${seq}-${system}`,
      locationName: locationName.trim() || "دهانه بدون عنوان",
      system,
      widthCm,
      heightCm,
      panelCount,
      openings: openings.slice(0, panelCount),
      glassType: glass,
      finish,
      includeMesh: activeRule.supportsMesh && includeMesh,
      quantity: Math.max(1, Math.min(50, quantity)),
      areaSqm: validation.areaSqm,
    };

    writeInquiryStore([...items, nextItem]);
  };

  const handleRemoveItem = (id: string) => {
    writeInquiryStore(items.filter((item) => item.id !== id));
  };

  const handleClearList = () => {
    writeInquiryStore([]);
  };

  const effectiveItems = useMemo<InquiryItem[]>(
    () =>
      items.length > 0
        ? items
        : [
            {
              id: "active-preview",
              locationName: locationName.trim() || "پنجره انتخاب‌شده",
              system,
              widthCm,
              heightCm,
              panelCount,
              openings: openings.slice(0, panelCount),
              glassType: glass,
              finish,
              includeMesh: activeRule.supportsMesh && includeMesh,
              quantity: Math.max(1, Math.min(50, quantity)),
              areaSqm: validation.areaSqm,
            },
          ],
    [
      items,
      locationName,
      system,
      widthCm,
      heightCm,
      panelCount,
      openings,
      glass,
      finish,
      activeRule.supportsMesh,
      includeMesh,
      quantity,
      validation.areaSqm,
    ]
  );

  const pricedSummary = useMemo(() => {
    if (!rulesMap) return null;
    try {
      const pricable: PricableInquiryItem[] = effectiveItems.map((item) => ({
        locationName: item.locationName,
        system: item.system,
        widthCm: item.widthCm,
        heightCm: item.heightCm,
        panelCount: item.panelCount,
        openings: item.openings,
        glassType: resolveItemGlass(item),
        finish: item.finish,
        includeMesh: item.includeMesh,
        quantity: item.quantity,
      }));
      return calculateInquiryTotals(pricable, rulesMap);
    } catch {
      return null;
    }
  }, [effectiveItems, rulesMap]);

  const totalCount = effectiveItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAreaSqm = Number(
    effectiveItems
      .reduce((sum, item) => sum + item.areaSqm * item.quantity, 0)
      .toFixed(2)
  );

  const buildPlainTextSummary = () => {
    const header = submitSuccess
      ? `برگه مشخصات فنی پروژه — ${SITE_CONFIG.name} (کد رهگیری: ${submitSuccess.trackingCode})`
      : `برگه مشخصات فنی پروژه — ${SITE_CONFIG.name}`;
    const rows = effectiveItems.map((item, idx) => {
      const sysLabel = SYSTEM_RULES[item.system].label;
      const gKey = resolveItemGlass(item);
      const glassLabel = GLASS_OPTIONS[gKey].shortLabel;
      const finishLabel = FRAME_FINISHES[item.finish].label;
      const opsLabel = item.openings.map((o) => OPENING_LABELS[o]).join(" + ");
      const meshNote = item.includeMesh ? " | همراه با توری پلیسه" : "";
      const itemPriceNote = pricedSummary?.items[idx]
        ? ` | برآورد: ${formatToman(pricedSummary.items[idx].breakdown.totalIrr)}`
        : "";
      return `${toPersianDigits(idx + 1)}. ${item.locationName} (${toPersianDigits(
        item.quantity
      )} عدد): ${sysLabel} | ابعاد ${toPersianDigits(
        item.widthCm
      )}×${toPersianDigits(item.heightCm)} سم | ${toPersianDigits(
        item.panelCount
      )} لنگه (${opsLabel}) | شیشه: ${glassLabel} | رنگ: ${finishLabel}${meshNote} | مساحت کل: ${toPersianDigits(
        Number((item.areaSqm * item.quantity).toFixed(2))
      )} مترمربع${itemPriceNote}`;
    });

    const totalLine = submitSuccess
      ? `برآورد رسمی ثبت‌شده: ${formatToman(submitSuccess.estimatedTotalIrr)}`
      : pricedSummary
        ? `مجموع برآورد تقریبی: ${formatToman(pricedSummary.totalIrr)}`
        : null;

    return [
      header,
      "-----------------------------------",
      ...rows,
      "-----------------------------------",
      `جمع کل دهانه‌ها: ${toPersianDigits(totalCount)} عدد`,
      `مجموع مساحت: ${toPersianDigits(totalAreaSqm)} مترمربع`,
      totalLine,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextSummary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const handleOfficialSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSubmitError(null);

    if (items.length === 0 && !validation.isValid) {
      setSubmitError(
        validation.errors[0] || "لطفاً ابتدا ابعاد معتبر برای دهانه وارد کنید."
      );
      return;
    }

    const normalizedPhone = toLatinDigits(phone).replace(/[\s\-()]/g, "");
    if (customerName.trim().length < 2) {
      setSubmitError("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }
    if (!/^0[0-9]{10}$/.test(normalizedPhone)) {
      setSubmitError(
        "شماره تماس معتبر با پیش‌شماره (۱۱ رقم، مثلاً ۰۹۱۲ یا ۰۲۴) وارد کنید."
      );
      return;
    }
    if (city.trim().length < 2) {
      setSubmitError("لطفاً نام شهر محل پروژه را وارد کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const payloadItems = effectiveItems.map((item) => ({
        locationName: item.locationName,
        system: item.system,
        widthCm: item.widthCm,
        heightCm: item.heightCm,
        panelCount: item.panelCount,
        openings: item.openings,
        glassType: resolveItemGlass(item),
        finish: item.finish,
        includeMesh: item.includeMesh,
        quantity: item.quantity,
      }));

      const payloadObject = {
        customerName: customerName.trim(),
        phone: normalizedPhone,
        city: city.trim(),
        projectType:
          effectiveItems.length > 1
            ? "پکیج چندقلمی کانفیگوریتور"
            : SYSTEM_RULES[effectiveItems[0].system].label,
        notes: inquiryNotes.trim(),
        items: payloadItems,
        website: honeypot,
      };

      let res: Response;
      if (attachmentFile) {
        const formData = new FormData();
        formData.append("payload", JSON.stringify(payloadObject));
        formData.append("attachment", attachmentFile);
        res = await fetch("/api/inquiries/", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/inquiries/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadObject),
        });
      }

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        trackingCode?: string;
        estimatedTotalIrr?: number;
        estimatedTotalToman?: number;
        itemCount?: number;
      };

      if (!res.ok || !data.ok || !data.trackingCode) {
        setSubmitError(
          data.error || "خطا در ثبت استعلام؛ لطفاً ورودی‌ها را بررسی کنید."
        );
        return;
      }

      setSubmitSuccess({
        trackingCode: data.trackingCode,
        estimatedTotalIrr: data.estimatedTotalIrr ?? 0,
        estimatedTotalToman: data.estimatedTotalToman ?? 0,
        itemCount: data.itemCount ?? totalCount,
      });
    } catch {
      setSubmitError("ارتباط با سرور برقرار نشد؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTrackingCode = async () => {
    if (!submitSuccess) return;
    try {
      await navigator.clipboard.writeText(submitSuccess.trackingCode);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 3000);
    } catch {
      setCodeCopied(false);
    }
  };

  const whatsappUrl = `${SITE_CONFIG.contact.whatsappHref}?text=${encodeURIComponent(
    buildPlainTextSummary()
  )}`;

  return (
    <div className="space-y-10">
      {/* Honest Pricing Transparency Banner */}
      <div className="no-print space-y-3 border border-border border-s-2 border-s-bronze bg-surface p-4 text-xs leading-6 text-ink sm:p-5 sm:text-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-1 h-5 w-5 shrink-0 text-bronze" strokeWidth={1.6} aria-hidden="true" />
          <p>
            <strong>برآورد قیمت هوشمند بر اساس تعرفه روز کارخانه سپنتا و نرخ
            لحظه‌ای ارز محاسبه می‌شود؛</strong>{" "}
            مبلغ قطعی پس از اندازه‌گیری دقیق لیزری در محل پروژه و تایید نهایی نوع
            یراق‌آلات اعلام می‌گردد.
          </p>
        </div>

        {fxSummary && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-[11px] sm:text-xs">
            <span className="tabular-nums border border-bronze/30 bg-bronze-soft px-2.5 py-1 font-bold text-bronze-hover">
              نرخ مبنای دلار: {formatToman(fxSummary.activeUsdIrr)}
            </span>
            <span className="border border-border bg-canvas px-2.5 py-1 font-bold text-ink">
              منبع: {getFxSourceLabel(fxSummary.sourceUsed)}
            </span>
            <span className="border border-border bg-canvas px-2.5 py-1 text-ink-muted">
              آخرین بروزرسانی: {formatFxTimestamp(fxSummary.lastSyncedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Main Configurator Workspace */}
      <div className="no-print grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Step 1: System Selection */}
          <div className="border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-base font-bold text-charcoal">
              ۱. انتخاب سیستم تولیدی
            </h2>
            <div
              role="group"
              aria-label="انتخاب سیستم درب و پنجره"
              className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            >
              {SYSTEM_LIST.map((sys) => {
                const active = system === sys.key;
                return (
                  <button
                    key={sys.key}
                    type="button"
                    onClick={() => handleSystemChange(sys.key)}
                    aria-pressed={active}
                    className={`rounded-[3px] border p-3.5 text-start transition-colors ${
                      active
                        ? "border-charcoal bg-surface-warm text-charcoal"
                        : "border-border bg-canvas text-ink-muted hover:border-border-strong hover:text-ink"
                    }`}
                  >
                    <p className="text-sm font-bold text-ink">{sys.label}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">
                      {sys.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Dimensions & Location */}
          <div className="border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">
              ۲. ابعاد دهانه و موقعیت در ساختمان
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label
                  htmlFor="cfg-location"
                  className="block text-xs font-semibold text-ink"
                >
                  موقعیت دهانه
                </label>
                <input
                  id="cfg-location"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="مثلاً: پنجره پذیرایی"
                  className="mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-bronze focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="cfg-width"
                  className="block text-xs font-semibold text-ink"
                >
                  عرض دهانه (سانتی‌متر)
                </label>
                <input
                  id="cfg-width"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={widthCm || ""}
                  onChange={(e) => setWidthCm(parseDimensionInput(e.target.value))}
                  className="tabular-nums mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-end text-sm font-semibold text-ink focus:border-bronze focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-ink-muted tabular-nums">
                  محدوده مجاز: {toPersianDigits(activeRule.minWidth)} تا{" "}
                  {toPersianDigits(activeRule.maxWidth)} سم
                </p>
              </div>

              <div>
                <label
                  htmlFor="cfg-height"
                  className="block text-xs font-semibold text-ink"
                >
                  ارتفاع دهانه (سانتی‌متر)
                </label>
                <input
                  id="cfg-height"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={heightCm || ""}
                  onChange={(e) => setHeightCm(parseDimensionInput(e.target.value))}
                  className="tabular-nums mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-end text-sm font-semibold text-ink focus:border-bronze focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-ink-muted tabular-nums">
                  محدوده مجاز: {toPersianDigits(activeRule.minHeight)} تا{" "}
                  {toPersianDigits(activeRule.maxHeight)} سم
                </p>
              </div>
            </div>

            {/* Quick Standard Architectural Presets */}
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-muted">
                سایزهای سریع استاندارد ساختمانی (سانتی‌متر):
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STANDARD_PRESET_SIZES.filter(
                  (p) =>
                    p.width >= activeRule.minWidth &&
                    p.width <= activeRule.maxWidth &&
                    p.height >= activeRule.minHeight &&
                    p.height <= activeRule.maxHeight
                ).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setWidthCm(preset.width);
                      setHeightCm(preset.height);
                    }}
                    className="tabular-nums rounded-[2px] border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-charcoal hover:text-bronze"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Panels, Openings, Glass, Finish & Mesh */}
          <div className="space-y-5 border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">
              ۳. تعداد لنگه، نوع بازشو، شیشه و رنگ پروفیل
            </h2>

            {/* Panel Count */}
            <div>
              <p className="text-xs font-semibold text-ink">تعداد لنگه / پنل</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from(
                  { length: activeRule.maxPanels - activeRule.minPanels + 1 },
                  (_, i) => activeRule.minPanels + i
                ).map((count) => {
                  const active = panelCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handlePanelCountChange(count)}
                      aria-pressed={active}
                      className={`tabular-nums rounded-[2px] px-4 py-2 text-xs font-bold transition-colors ${
                        active
                          ? "bg-charcoal text-canvas"
                          : "border border-border bg-surface-subtle text-ink hover:border-charcoal"
                      }`}
                    >
                      {toPersianDigits(count)} لنگه
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Per-Panel Opening Type */}
            <div>
              <p className="text-xs font-semibold text-ink">
                نوع بازشوی هر لنگه (از راست به چپ)
              </p>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: panelCount }).map((_, idx) => (
                  <div key={idx}>
                    <label
                      htmlFor={`panel-opening-${idx}`}
                      className="block text-[11px] text-ink-muted"
                    >
                      لنگه {toPersianDigits(idx + 1)}
                    </label>
                    <select
                      id={`panel-opening-${idx}`}
                      value={openings[idx] ?? activeRule.defaultOpening}
                      onChange={(e) =>
                        handleOpeningChange(idx, e.target.value as OpeningType)
                      }
                      disabled={activeRule.allowedOpenings.length === 1}
                      className="mt-1 w-full rounded-[2px] border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-ink focus:border-bronze focus:outline-none disabled:opacity-75"
                    >
                      {activeRule.allowedOpenings.map((op) => (
                        <option key={op} value={op}>
                          {OPENING_LABELS[op]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Glass Type */}
            <div>
              <label
                htmlFor="cfg-glass"
                className="block text-xs font-semibold text-ink"
              >
                نوع شیشه مصرفی
              </label>
              <select
                id="cfg-glass"
                value={glass}
                onChange={(e) => setGlass(e.target.value as GlassOptionKey)}
                disabled={activeRule.allowedGlasses.length === 1}
                className="mt-1.5 w-full rounded-[2px] border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink focus:border-bronze focus:outline-none disabled:opacity-75"
              >
                {activeRule.allowedGlasses.map((gKey) => (
                  <option key={gKey} value={gKey}>
                    {GLASS_OPTIONS[gKey].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Frame Finishes */}
            <div>
              <p className="text-xs font-semibold text-ink">رنگ و پوشش پروفیل</p>
              <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {(Object.keys(FRAME_FINISHES) as FrameFinishKey[]).map((fKey) => {
                  const swatch = FRAME_FINISHES[fKey];
                  const active = finish === fKey;
                  return (
                    <button
                      key={fKey}
                      type="button"
                      onClick={() => setFinish(fKey)}
                      aria-pressed={active}
                      className={`flex items-center gap-2.5 rounded-[3px] border p-2.5 text-start text-xs font-bold transition-colors ${
                        active
                          ? "border-charcoal bg-surface-warm text-charcoal"
                          : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink"
                      }`}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border border-border-strong"
                        style={{ backgroundColor: swatch.hex }}
                        aria-hidden="true"
                      />
                      <span>{swatch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Optional Matching Mesh */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="cfg-qty"
                  className="text-xs font-semibold text-ink"
                >
                  تعداد این دهانه:
                </label>
                <input
                  id="cfg-qty"
                  type="number"
                  min={1}
                  max={50}
                  dir="ltr"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(50, Number(e.target.value) || 1))
                    )
                  }
                  className="tabular-nums w-20 rounded-[2px] border border-border bg-surface px-3 py-2 text-center text-sm font-bold text-ink focus:border-bronze focus:outline-none"
                />
              </div>

              {activeRule.supportsMesh && (
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-ink sm:text-sm">
                  <input
                    type="checkbox"
                    checked={includeMesh}
                    onChange={(e) => setIncludeMesh(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-bronze"
                  />
                  <span>افزودن توری پلیسه همرنگ</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Live SVG Preview + Engineering & Live Price Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-5 border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">
                پیش‌نمایش مهندسی و برآورد زنده
              </h2>
              <span className="rounded-[2px] bg-bronze-soft px-2.5 py-1 text-xs font-bold text-bronze-hover">
                {activeRule.shortLabel}
              </span>
            </div>

            <WindowSvgPreview
              system={system}
              widthCm={widthCm}
              heightCm={heightCm}
              panelCount={panelCount}
              openings={openings}
              finish={finish}
            />

            {/* Live Engineering Metrics */}
            <dl className="grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-[2px] border border-border bg-surface-subtle p-3">
                <dt className="text-[11px] text-ink-muted">مساحت واحد</dt>
                <dd className="tabular-nums mt-1 text-sm font-extrabold text-ink">
                  {toPersianDigits(validation.areaSqm)} م²
                </dd>
              </div>
              <div className="rounded-[2px] border border-border bg-surface-subtle p-3">
                <dt className="text-[11px] text-ink-muted">عرض هر لنگه</dt>
                <dd className="tabular-nums mt-1 text-sm font-extrabold text-ink">
                  {toPersianDigits(validation.panelWidthCm)} سم
                </dd>
              </div>
              <div className="rounded-[2px] border border-border bg-surface-subtle p-3">
                <dt className="text-[11px] text-ink-muted">محیط فریم</dt>
                <dd className="tabular-nums mt-1 text-sm font-extrabold text-ink">
                  {toPersianDigits(validation.perimeterMeters)} م
                </dd>
              </div>
            </dl>

            {/* Live Price Card */}
            {pricingLoading ? (
              <div className="rounded-[2px] border border-border bg-surface-subtle p-4 text-xs text-ink-muted">
                در حال دریافت تعرفه روز کارخانه...
              </div>
            ) : activePriceBreakdown ? (
              <div className="border border-border-dark bg-charcoal p-4 text-canvas">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-border-strong">
                    برآورد تقریبی ({toPersianDigits(quantity)} عدد):
                  </span>
                  <span className="tabular-nums text-base font-extrabold text-bronze">
                    {formatToman(activePriceBreakdown.totalIrr)}
                  </span>
                </div>
                <p className="tabular-nums mt-1.5 text-[11px] text-ink-subtle">
                  شامل پروفیل، شیشه، نصب و رگلاژ استاندارد • مساحت مبنای محاسبه:{" "}
                  {toPersianDigits(activePriceBreakdown.billableAreaSqm)} مترمربع
                  {fxSummary
                    ? ` • نرخ مبنا: ${formatToman(fxSummary.activeUsdIrr)}`
                    : ""}
                </p>
              </div>
            ) : null}

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div
                role="alert"
                className="space-y-1.5 rounded-[3px] border border-red-200 bg-red-50 p-3.5 text-xs leading-6 text-[#991B1B]"
              >
                {validation.errors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}

            {/* Engineering Warnings */}
            {validation.warnings.length > 0 && (
              <div className="space-y-2 rounded-[3px] border border-bronze/40 bg-bronze-soft/75 p-3.5 text-xs leading-6 text-bronze-hover">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                  <span>توصیه‌های فنی کارشناسی</span>
                </div>
                {validation.warnings.map((warn) => (
                  <p key={warn}>{warn}</p>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddItem}
              disabled={!validation.isValid}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[3px] bg-charcoal px-5 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>افزودن به لیست استعلام پروژه</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Item Project Inquiry List */}
      <section
        aria-labelledby="inquiry-list-heading"
        className="no-print border border-border bg-surface p-5 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="inquiry-list-heading"
              className="text-lg font-extrabold text-charcoal sm:text-xl"
            >
              لیست اقلام استعلام پروژه
            </h2>
            <p className="mt-1 text-xs text-ink-muted sm:text-sm">
              {items.length > 0
                ? `تعداد ${toPersianDigits(
                    items.length
                  )} ردیف (${toPersianDigits(
                    totalCount
                  )} دهانه) به مجموع مساحت ${toPersianDigits(
                    totalAreaSqm
                  )} مترمربع ثبت شده است.`
                : "هنوز ردیفی به لیست اضافه نشده است؛ می‌توانید چند دهانه بسازید یا دهانه فعلی را مستقیماً ثبت و ارسال کنید."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {pricedSummary && (
              <div className="rounded-[2px] border border-bronze/30 bg-bronze-soft px-4 py-2 text-xs sm:text-sm">
                <span className="text-bronze-hover">جمع برآورد تقریبی: </span>
                <strong className="tabular-nums text-charcoal">
                  {formatToman(pricedSummary.totalIrr)}
                </strong>
              </div>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearList}
                className="inline-flex items-center gap-1.5 rounded-[2px] border border-border px-3.5 py-2 text-xs font-semibold text-ink-muted hover:border-red-300 hover:text-[#991B1B]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>پاک کردن لیست</span>
              </button>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-5 divide-y divide-border border border-border bg-surface-subtle">
            {items.map((item, idx) => {
              const gKey = resolveItemGlass(item);
              const itemPriced = pricedSummary?.items[idx];
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular-nums rounded-[2px] bg-charcoal px-2 py-0.5 text-[11px] font-bold text-bronze">
                        {toPersianDigits(idx + 1)}
                      </span>
                      <span className="text-sm font-bold text-charcoal">
                        {item.locationName}
                      </span>
                      <span className="rounded-[2px] bg-bronze-soft px-2 py-0.5 text-xs font-semibold text-bronze-hover">
                        {SYSTEM_RULES[item.system].shortLabel}
                      </span>
                    </div>
                    <p className="tabular-nums text-xs leading-6 text-ink-muted">
                      ابعاد: {toPersianDigits(item.widthCm)} ×{" "}
                      {toPersianDigits(item.heightCm)} سم •{" "}
                      {toPersianDigits(item.panelCount)} لنگه (
                      {item.openings.map((o) => OPENING_LABELS[o]).join(" + ")}) •{" "}
                      {GLASS_OPTIONS[gKey].shortLabel} • رنگ{" "}
                      {FRAME_FINISHES[item.finish].label}
                      {item.includeMesh ? " • همراه با توری پلیسه" : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="tabular-nums text-end text-xs">
                      <p className="font-bold text-ink">
                        {toPersianDigits(item.quantity)} عدد (
                        {toPersianDigits(
                          Number((item.areaSqm * item.quantity).toFixed(2))
                        )}{" "}
                        م²)
                      </p>
                      {itemPriced && (
                        <p className="mt-0.5 font-bold text-bronze-hover">
                          {formatToman(itemPriced.breakdown.totalIrr)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`حذف ${item.locationName}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-border bg-surface text-ink-muted transition-colors hover:border-red-300 hover:text-[#991B1B]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Export Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-[3px] bg-charcoal px-5 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft"
          >
            <Printer className="h-4 w-4 text-bronze" aria-hidden="true" />
            <span>چاپ / ذخیره PDF برگه مشخصات فنی (A4)</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[3px] border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal"
          >
            <ExternalLink className="h-4 w-4 text-bronze" aria-hidden="true" />
            <span>ارسال لیست به واتساپ کارخانه</span>
          </a>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 rounded-[3px] border border-border bg-surface-subtle px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-surface"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-pine" aria-hidden="true" />
                <span>مشخصات فنی کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                <span>کپی متن مشخصات فنی</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Official Server-Authoritative Inquiry Submission Panel */}
      <section
        aria-labelledby="official-submit-heading"
        className="no-print border border-border bg-surface-subtle p-5 sm:p-8"
      >
        {submitSuccess ? (
          <div className="border border-bronze/40 bg-surface p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 bg-bronze-soft px-3.5 py-1 text-xs font-bold text-bronze-hover">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>درخواست شما با موفقیت در سامانه کارخانه ثبت شد</span>
            </div>

            <h2
              id="official-submit-heading"
              className="mt-4 text-xl font-extrabold text-charcoal"
            >
              کد رهگیری رسمی پروژه شما صادر شد
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[2px] border border-border bg-surface-subtle p-4">
              <div>
                <p className="text-xs text-ink-muted">کد رهگیری اختصاصی</p>
                <p
                  dir="ltr"
                  className="mt-1 font-mono text-xl font-extrabold tracking-wider text-charcoal"
                >
                  {submitSuccess.trackingCode}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyTrackingCode}
                className="inline-flex items-center gap-1.5 rounded-[2px] border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-charcoal hover:border-charcoal"
              >
                {codeCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-pine" aria-hidden="true" />
                    <span>کد کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                    <span>کپی کد رهگیری</span>
                  </>
                )}
              </button>

              <div className="ms-auto text-start sm:text-end">
                <p className="text-xs text-ink-muted">
                  برآورد محاسبه‌شده سرور ({toPersianDigits(submitSuccess.itemCount)}{" "}
                  دهانه)
                </p>
                <p className="tabular-nums mt-1 text-base font-extrabold text-bronze-hover">
                  {formatToman(submitSuccess.estimatedTotalIrr)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/track/?code=${submitSuccess.trackingCode}`}
                className="inline-flex items-center gap-2 rounded-[3px] bg-charcoal px-5 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft"
              >
                <span>پیگیری وضعیت درخواست</span>
              </Link>

              <button
                type="button"
                onClick={() => setSubmitSuccess(null)}
                className="inline-flex items-center gap-2 rounded-[3px] border border-border-strong bg-surface px-4 py-3 text-sm font-semibold text-charcoal hover:border-charcoal"
              >
                <span>ثبت استعلام جدید</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOfficialSubmit} noValidate className="space-y-5">
            <div>
              <h2
                id="official-submit-heading"
                className="text-lg font-extrabold text-charcoal sm:text-xl"
              >
                ثبت رسمی استعلام و دریافت کد رهگیری
              </h2>
              <p className="mt-1 text-xs leading-6 text-ink-muted sm:text-sm">
                اطلاعات تماس خود را وارد کنید تا لیست اقلام بالا در سامانه
                کارخانه ثبت شده و کد رهگیری <span dir="ltr">SPN-XXXXXX</span>{" "}
                برای شما صادر شود.
              </p>
            </div>

            {/* Honeypot anti-spam field */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="submit-name"
                  className="block text-xs font-semibold text-ink"
                >
                  نام و نام خانوادگی *
                </label>
                <input
                  id="submit-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثلاً: مهندس علی محمدی"
                  className="mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-bronze focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="submit-phone"
                  className="block text-xs font-semibold text-ink"
                >
                  شماره تماس *
                </label>
                <input
                  id="submit-phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09120000000"
                  className="tabular-nums mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-end text-sm text-ink focus:border-bronze focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="submit-city"
                  className="block text-xs font-semibold text-ink"
                >
                  شهر پروژه *
                </label>
                <input
                  id="submit-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثلاً: زنجان / تهران"
                  className="mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-bronze focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="submit-notes"
                className="block text-xs font-semibold text-ink"
              >
                توضیحات اختیاری (طبقه نصب، وضعیت بازسازی یا زمان‌بندی)
              </label>
              <textarea
                id="submit-notes"
                rows={2}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                placeholder="مثلاً: تعویض بدون تخریب پنجره‌های طبقه سوم..."
                className="mt-1.5 w-full rounded-[2px] border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-bronze focus:outline-none"
              />
            </div>

            <DrawingAttachmentInput
              id="cfg-attachment"
              file={attachmentFile}
              error={attachmentError}
              onFileChange={(file, err) => {
                setAttachmentFile(file);
                setAttachmentError(err);
              }}
            />

            {submitError && (
              <div
                role="alert"
                className="rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-[#991B1B] sm:text-sm"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-charcoal px-6 py-3.5 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>
                {submitting
                  ? "در حال ثبت درخواست..."
                  : "ثبت رسمی استعلام و دریافت کد رهگیری"}
              </span>
            </button>
          </form>
        )}
      </section>

      {/* Official A4 Print-Only Specification Sheet */}
      <div className="hidden print:block print:text-black">
        <div className="border-b-2 border-black pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-black">
                {SITE_CONFIG.name} — برگه مشخصات فنی و برآورد قیمت پروژه
              </h2>
              <p className="mt-1 text-xs text-ink-muted">
                {SITE_CONFIG.coverageNote}
              </p>
              {submitSuccess && (
                <p className="mt-1 text-xs font-bold text-black">
                  کد رهگیری سامانه: {submitSuccess.trackingCode}
                </p>
              )}
            </div>
            <div className="text-end text-xs">
              <p className="font-bold">
                تلفن کارخانه: {SITE_CONFIG.contact.phoneDisplay}
              </p>
              <p className="mt-1">وب‌سایت: sepanta-co.ir</p>
            </div>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse border border-black text-start text-xs">
          <thead>
            <tr className="bg-surface-warm font-bold">
              <th className="border border-black px-2 py-2 text-start">ردیف</th>
              <th className="border border-black px-2 py-2 text-start">موقعیت</th>
              <th className="border border-black px-2 py-2 text-start">سیستم</th>
              <th className="border border-black px-2 py-2 text-start">ابعاد (سم)</th>
              <th className="border border-black px-2 py-2 text-start">بازشو و لنگه</th>
              <th className="border border-black px-2 py-2 text-start">شیشه و رنگ</th>
              <th className="border border-black px-2 py-2 text-start">تعداد</th>
              <th className="border border-black px-2 py-2 text-start">مساحت</th>
              <th className="border border-black px-2 py-2 text-start">برآورد (تومان)</th>
            </tr>
          </thead>
          <tbody>
            {effectiveItems.map((item, idx) => {
              const gKey = resolveItemGlass(item);
              const itemPriced = pricedSummary?.items[idx];
              return (
                <tr key={item.id}>
                  <td className="tabular-nums border border-black px-2 py-2">
                    {toPersianDigits(idx + 1)}
                  </td>
                  <td className="border border-black px-2 py-2 font-semibold">
                    {item.locationName}
                  </td>
                  <td className="border border-black px-2 py-2">
                    {SYSTEM_RULES[item.system].shortLabel}
                  </td>
                  <td className="tabular-nums border border-black px-2 py-2">
                    {toPersianDigits(item.widthCm)} ×{" "}
                    {toPersianDigits(item.heightCm)}
                  </td>
                  <td className="tabular-nums border border-black px-2 py-2">
                    {toPersianDigits(item.panelCount)} لنگه (
                    {item.openings.map((o) => OPENING_LABELS[o]).join(" + ")})
                  </td>
                  <td className="border border-black px-2 py-2">
                    {GLASS_OPTIONS[gKey].shortLabel} /{" "}
                    {FRAME_FINISHES[item.finish].label}
                    {item.includeMesh ? " + توری" : ""}
                  </td>
                  <td className="tabular-nums border border-black px-2 py-2">
                    {toPersianDigits(item.quantity)}
                  </td>
                  <td className="tabular-nums border border-black px-2 py-2">
                    {toPersianDigits(
                      Number((item.areaSqm * item.quantity).toFixed(2))
                    )}{" "}
                    م²
                  </td>
                  <td className="tabular-nums border border-black px-2 py-2 font-semibold">
                    {itemPriced
                      ? formatToman(itemPriced.breakdown.totalIrr)
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border border-black bg-canvas px-4 py-3 text-sm font-bold">
          <span className="tabular-nums">
            مجموع دهانه‌ها: {toPersianDigits(totalCount)} عدد
          </span>
          <span className="tabular-nums">
            مجموع مساحت: {toPersianDigits(totalAreaSqm)} مترمربع
          </span>
          {pricedSummary && (
            <span className="tabular-nums">
              برآورد کل:{" "}
              {formatToman(
                submitSuccess
                  ? submitSuccess.estimatedTotalIrr
                  : pricedSummary.totalIrr
              )}
            </span>
          )}
        </div>

        <p className="mt-4 text-[11px] leading-6 text-ink-muted">
          توضیح فنی: برآورد قیمت بر اساس تعرفه روز کارخانه محاسبه شده است.
          اندازه‌گیری نهایی پیش از تولید توسط کارشناس فنی گروه صنعتی سپنتا با
          ابزار لیزری در محل انجام و پیش‌فاکتور قطعی صادر خواهد شد.
        </p>
      </div>
    </div>
  );
}
