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
  Minus,
  Plus,
  Printer,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  FRAME_FINISHES,
  GLASS_OPTIONS,
  isValidSystemKey,
  OPENING_LABELS,
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

const ROOM_ARCHITECTURAL_PRESETS: readonly {
  title: string;
  sizeLabel: string;
  width: number;
  height: number;
}[] = [
  { title: "اتاق خواب", sizeLabel: "۱۰۰ × ۱۲۰", width: 100, height: 120 },
  { title: "پذیرایی استاندارد", sizeLabel: "۱۵۰ × ۱۴۰", width: 150, height: 140 },
  { title: "درب بالکنی", sizeLabel: "۲۰۰ × ۲۲۰", width: 200, height: 220 },
  { title: "قدی و ویلایی", sizeLabel: "۳۰۰ × ۲۲۰", width: 300, height: 220 },
];

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

function SystemSilhouetteIcon({
  systemKey,
  active,
}: {
  systemKey: ConfiguratorSystemKey;
  active: boolean;
}) {
  const stroke = active ? "#141413" : "#5C5852";
  const accent = "#9A6B3F";

  if (systemKey === "upvc") {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
      >
        <rect x="4" y="5" width="28" height="26" stroke={stroke} strokeWidth="1.5" />
        <rect x="7" y="8" width="22" height="20" stroke={stroke} strokeWidth="1" strokeOpacity="0.45" />
        <line x1="18" y1="5" x2="18" y2="31" stroke={stroke} strokeWidth="1.5" />
        <path d="M9 10 L16 18 L9 26" stroke={accent} strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    );
  }

  if (systemKey === "thermal-break") {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="30" height="28" stroke={stroke} strokeWidth="1.5" />
        <line x1="18" y1="4" x2="18" y2="32" stroke={stroke} strokeWidth="1.2" />
        <line x1="11" y1="18" x2="16" y2="18" stroke={accent} strokeWidth="1.4" />
        <polyline points="14,15.5 16.5,18 14,20.5" stroke={accent} strokeWidth="1.3" />
        <rect x="5" y="6" width="26" height="24" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.4" />
      </svg>
    );
  }

  if (systemKey === "balcony-glass") {
    return (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
      >
        <rect x="4" y="6" width="28" height="24" stroke={stroke} strokeWidth="1.5" />
        <line x1="11" y1="6" x2="11" y2="30" stroke={stroke} strokeWidth="1.1" />
        <line x1="18" y1="6" x2="18" y2="30" stroke={stroke} strokeWidth="1.1" />
        <line x1="25" y1="6" x2="25" y2="30" stroke={stroke} strokeWidth="1.1" />
        <polyline points="6,20 11,16 16,20" stroke={accent} strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      className="h-9 w-9 shrink-0"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="26" height="26" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M10 7 V29 M14 7 V29 M18 7 V29 M22 7 V29 M26 7 V29"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      <line x1="8" y1="18" x2="28" y2="18" stroke={accent} strokeWidth="1.3" strokeDasharray="2 2" />
    </svg>
  );
}

function OpeningSchematicIcon({ opening }: { opening: OpeningType }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" stroke="#5C5852" strokeWidth="1.4" />
      {opening === "fixed" && (
        <g stroke="#5C5852" strokeWidth="1.3">
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </g>
      )}
      {opening === "casement" && (
        <path
          d="M5 5 L19 12 L5 19"
          stroke="#141413"
          strokeWidth="1.3"
          strokeDasharray="2.5 2"
        />
      )}
      {opening === "tilt-turn" && (
        <>
          <path
            d="M5 5 L19 12 L5 19"
            stroke="#141413"
            strokeWidth="1.2"
            strokeDasharray="2.5 2"
          />
          <path
            d="M5 19 L12 5 L19 19"
            stroke="#9A6B3F"
            strokeWidth="1.2"
            strokeDasharray="2.5 2"
          />
        </>
      )}
      {opening === "sliding" && (
        <g stroke="#141413" strokeWidth="1.4">
          <line x1="7" y1="12" x2="17" y2="12" />
          <polyline points="14,9 17,12 14,15" />
        </g>
      )}
      {opening === "folding" && (
        <polyline
          points="5,9 12,14 19,9"
          stroke="#9A6B3F"
          strokeWidth="1.3"
          strokeDasharray="2 2"
        />
      )}
    </svg>
  );
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
  const [justAdded, setJustAdded] = useState(false);

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

  const adjustWidthBy = (delta: number) => {
    const base =
      Number.isFinite(widthCm) && widthCm > 0
        ? widthCm
        : activeRule.defaultWidth;
    const clamped = Math.max(
      activeRule.minWidth,
      Math.min(activeRule.maxWidth, base + delta)
    );
    setWidthCm(clamped);
  };

  const adjustHeightBy = (delta: number) => {
    const base =
      Number.isFinite(heightCm) && heightCm > 0
        ? heightCm
        : activeRule.defaultHeight;
    const clamped = Math.max(
      activeRule.minHeight,
      Math.min(activeRule.maxHeight, base + delta)
    );
    setHeightCm(clamped);
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
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
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
      )}×${toPersianDigits(item.heightCm)} سانتی‌متر | ${toPersianDigits(
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

  const sliderWidthValue = Math.min(
    activeRule.maxWidth,
    Math.max(activeRule.minWidth, widthCm || activeRule.minWidth)
  );
  const sliderHeightValue = Math.min(
    activeRule.maxHeight,
    Math.max(activeRule.minHeight, heightCm || activeRule.minHeight)
  );

  const visiblePresets = ROOM_ARCHITECTURAL_PRESETS.filter(
    (p) =>
      p.width >= activeRule.minWidth &&
      p.width <= activeRule.maxWidth &&
      p.height >= activeRule.minHeight &&
      p.height <= activeRule.maxHeight
  );

  return (
    <div className="space-y-10">
      {/* Main 12-Column Architectural Studio Workbench */}
      <div className="no-print grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Right/Start: Unified Architectural Specification Sheet (7 cols) */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] divide-y divide-[#E6E2D8]">
            {/* Slim Architectural Step Index Header */}
            <nav
              aria-label="فهرست مراحل پیکربندی"
              className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF9F6] px-5 py-3.5 text-xs"
            >
              <div className="flex flex-wrap items-center gap-3 font-medium text-[#5C5852]">
                <a
                  href="#step-system"
                  className="inline-flex items-center gap-1.5 text-[#141413] transition-colors hover:text-[#9A6B3F]"
                >
                  <span className="font-display font-bold text-[#9A6B3F]">۰۱</span>
                  <span>سیستم</span>
                </a>
                <span className="text-[#CEC8BA]" aria-hidden="true">
                  ·
                </span>
                <a
                  href="#step-dimensions"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#141413]"
                >
                  <span className="font-display font-bold text-[#9A6B3F]">۰۲</span>
                  <span>ابعاد</span>
                </a>
                <span className="text-[#CEC8BA]" aria-hidden="true">
                  ·
                </span>
                <a
                  href="#step-openings"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#141413]"
                >
                  <span className="font-display font-bold text-[#9A6B3F]">۰۳</span>
                  <span>بازشو و شیشه</span>
                </a>
                <span className="text-[#CEC8BA]" aria-hidden="true">
                  ·
                </span>
                <a
                  href="#official-submit-heading"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#141413]"
                >
                  <span className="font-display font-bold text-[#9A6B3F]">۰۴</span>
                  <span>ثبت و نقشه</span>
                </a>
              </div>

              <span className="hidden text-[11px] text-[#5C5852] sm:inline">
                برگه مشخصات مهندسی کارخانه زنجان
              </span>
            </nav>

            {/* Section 01: System Selection */}
            <section id="step-system" className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="font-display inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#F1EFEA] text-xs font-bold text-[#9A6B3F]">
                  ۰۱
                </span>
                <h2 className="font-display text-base font-bold text-[#141413]">
                  انتخاب سیستم تولیدی
                </h2>
              </div>

              <div
                role="group"
                aria-label="انتخاب سیستم درب و پنجره"
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {SYSTEM_LIST.map((sys) => {
                  const active = system === sys.key;
                  return (
                    <button
                      key={sys.key}
                      type="button"
                      onClick={() => handleSystemChange(sys.key)}
                      aria-pressed={active}
                      className={`relative flex items-start gap-3 rounded-[4px] border p-4 text-start transition-colors ${
                        active
                          ? "border-[#141413] bg-[#FAF9F6] text-[#141413]"
                          : "border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:border-[#CEC8BA] hover:text-[#141413]"
                      }`}
                    >
                      {active && (
                        <span
                          className="absolute top-3 end-3 h-2 w-2 rounded-full bg-[#9A6B3F]"
                          aria-hidden="true"
                        />
                      )}
                      <SystemSilhouetteIcon systemKey={sys.key} active={active} />
                      <div className="min-w-0 flex-1 pe-2">
                        <p className="font-display text-sm font-bold text-[#141413]">
                          {sys.label}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#5C5852]">
                          {sys.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Section 02: Humanized Dimensions & Presets */}
            <section id="step-dimensions" className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-display inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#F1EFEA] text-xs font-bold text-[#9A6B3F]">
                    ۰۲
                  </span>
                  <h2 className="font-display text-base font-bold text-[#141413]">
                    ابعاد دهانه و موقعیت در ساختمان
                  </h2>
                </div>
                <span className="text-xs text-[#5C5852]">
                  مقیاس به سانتی‌متر
                </span>
              </div>

              {/* Location Name */}
              <div>
                <label
                  htmlFor="cfg-location"
                  className="block text-xs font-semibold text-[#141413]"
                >
                  عنوان یا موقعیت دهانه در نقشه
                </label>
                <input
                  id="cfg-location"
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="مثلاً: پنجره پذیرایی جنوبی"
                  className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141413] transition-colors focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                />
              </div>

              {/* Ergonomic Width & Height Steppers + Range Sliders */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Width Control */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="cfg-width"
                      className="text-xs font-semibold text-[#141413]"
                    >
                      عرض دهانه
                    </label>
                    <span className="tabular-nums text-[11px] text-[#5C5852]">
                      {toPersianDigits(activeRule.minWidth)} تا{" "}
                      {toPersianDigits(activeRule.maxWidth)} سانتی‌متر
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-stretch overflow-hidden rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] focus-within:border-[#9A6B3F]">
                    <button
                      type="button"
                      onClick={() => adjustWidthBy(-5)}
                      aria-label="کاهش عرض ۵ سانتی‌متر"
                      className="inline-flex items-center justify-center border-e border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs font-bold text-[#141413] transition-colors hover:bg-[#F1EFEA]"
                    >
                      - ۵
                    </button>
                    <input
                      id="cfg-width"
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      value={widthCm || ""}
                      onChange={(e) =>
                        setWidthCm(parseDimensionInput(e.target.value))
                      }
                      className="tabular-nums min-w-0 flex-1 bg-transparent px-2 py-2.5 text-center text-sm font-bold text-[#141413] focus:outline-none"
                    />
                    <span className="flex items-center border-s border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-[11px] font-medium text-[#5C5852]">
                      سانتی‌متر
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustWidthBy(5)}
                      aria-label="افزایش عرض ۵ سانتی‌متر"
                      className="inline-flex items-center justify-center border-s border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs font-bold text-[#141413] transition-colors hover:bg-[#F1EFEA]"
                    >
                      + ۵
                    </button>
                  </div>

                  <input
                    type="range"
                    aria-label="اسلایدر تنظیم عرض دهانه"
                    min={activeRule.minWidth}
                    max={activeRule.maxWidth}
                    step={1}
                    value={sliderWidthValue}
                    onChange={(e) => setWidthCm(Number(e.target.value))}
                    className="mt-2.5 h-1.5 w-full cursor-pointer accent-[#141413]"
                  />
                </div>

                {/* Height Control */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="cfg-height"
                      className="text-xs font-semibold text-[#141413]"
                    >
                      ارتفاع دهانه
                    </label>
                    <span className="tabular-nums text-[11px] text-[#5C5852]">
                      {toPersianDigits(activeRule.minHeight)} تا{" "}
                      {toPersianDigits(activeRule.maxHeight)} سانتی‌متر
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-stretch overflow-hidden rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] focus-within:border-[#9A6B3F]">
                    <button
                      type="button"
                      onClick={() => adjustHeightBy(-5)}
                      aria-label="کاهش ارتفاع ۵ سانتی‌متر"
                      className="inline-flex items-center justify-center border-e border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs font-bold text-[#141413] transition-colors hover:bg-[#F1EFEA]"
                    >
                      - ۵
                    </button>
                    <input
                      id="cfg-height"
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      value={heightCm || ""}
                      onChange={(e) =>
                        setHeightCm(parseDimensionInput(e.target.value))
                      }
                      className="tabular-nums min-w-0 flex-1 bg-transparent px-2 py-2.5 text-center text-sm font-bold text-[#141413] focus:outline-none"
                    />
                    <span className="flex items-center border-s border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-[11px] font-medium text-[#5C5852]">
                      سانتی‌متر
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustHeightBy(5)}
                      aria-label="افزایش ارتفاع ۵ سانتی‌متر"
                      className="inline-flex items-center justify-center border-s border-[#E6E2D8] bg-[#FAF9F6] px-3 text-xs font-bold text-[#141413] transition-colors hover:bg-[#F1EFEA]"
                    >
                      + ۵
                    </button>
                  </div>

                  <input
                    type="range"
                    aria-label="اسلایدر تنظیم ارتفاع دهانه"
                    min={activeRule.minHeight}
                    max={activeRule.maxHeight}
                    step={1}
                    value={sliderHeightValue}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="mt-2.5 h-1.5 w-full cursor-pointer accent-[#141413]"
                  />
                </div>
              </div>

              {/* Iranian Architectural Room Presets */}
              {visiblePresets.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#5C5852]">
                    ابعاد متداول فضاهای مسکونی و ویلایی (سانتی‌متر):
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {visiblePresets.map((preset) => {
                      const isPresetActive =
                        widthCm === preset.width && heightCm === preset.height;
                      return (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => {
                            setWidthCm(preset.width);
                            setHeightCm(preset.height);
                          }}
                          className={`rounded-[3px] border px-3 py-2 text-start transition-colors ${
                            isPresetActive
                              ? "border-[#141413] bg-[#FAF9F6] text-[#141413]"
                              : "border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:border-[#CEC8BA] hover:text-[#141413]"
                          }`}
                        >
                          <span className="block text-xs font-bold text-[#141413]">
                            {preset.title}
                          </span>
                          <span className="tabular-nums mt-0.5 block text-[11px] text-[#5C5852]">
                            {preset.sizeLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warm Human Reassurance Note */}
              <div className="flex items-start gap-2.5 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-xs leading-6 text-[#5C5852]">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#2C5E4F]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <p>
                  نگران دقت میلی‌متری نباشید؛ پیش از ساخت، کارشناس سپنتا دهانه‌ها
                  را با متر لیزری اندازه‌گیری می‌کند.
                </p>
              </div>
            </section>

            {/* Section 03: Sashes, Opening Types, Glass & Finish */}
            <section id="step-openings" className="space-y-6 p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="font-display inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#F1EFEA] text-xs font-bold text-[#9A6B3F]">
                  ۰۳
                </span>
                <h2 className="font-display text-base font-bold text-[#141413]">
                  تعداد لنگه، نوع بازشو، شیشه و رنگ پروفیل
                </h2>
              </div>

              {/* Panel Count */}
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  تعداد لنگه / پنل
                </p>
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
                        className={`tabular-nums rounded-[3px] px-4 py-2 text-xs font-bold transition-colors ${
                          active
                            ? "bg-[#141413] text-[#FAF9F6]"
                            : "border border-[#E6E2D8] bg-[#FAF9F6] text-[#141413] hover:border-[#141413]"
                        }`}
                      >
                        {toPersianDigits(count)} لنگه
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Per-Panel Opening Type with Schematic Icons */}
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  نوع بازشوی هر لنگه (از راست به چپ)
                </p>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Array.from({ length: panelCount }).map((_, idx) => {
                    const currentOpening =
                      openings[idx] ?? activeRule.defaultOpening;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] p-2.5"
                      >
                        <OpeningSchematicIcon opening={currentOpening} />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`panel-opening-${idx}`}
                            className="block text-[11px] font-medium text-[#5C5852]"
                          >
                            لنگه {toPersianDigits(idx + 1)}
                          </label>
                          <select
                            id={`panel-opening-${idx}`}
                            value={currentOpening}
                            onChange={(e) =>
                              handleOpeningChange(
                                idx,
                                e.target.value as OpeningType
                              )
                            }
                            disabled={activeRule.allowedOpenings.length === 1}
                            className="mt-0.5 w-full rounded-[2px] border border-[#E6E2D8] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-semibold text-[#141413] focus:border-[#9A6B3F] focus:outline-none disabled:opacity-75"
                          >
                            {activeRule.allowedOpenings.map((op) => (
                              <option key={op} value={op}>
                                {OPENING_LABELS[op]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Glass Type */}
              <div>
                <label
                  htmlFor="cfg-glass"
                  className="block text-xs font-semibold text-[#141413]"
                >
                  نوع شیشه مصرفی
                </label>
                <select
                  id="cfg-glass"
                  value={glass}
                  onChange={(e) => setGlass(e.target.value as GlassOptionKey)}
                  disabled={activeRule.allowedGlasses.length === 1}
                  className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none disabled:opacity-75"
                >
                  {activeRule.allowedGlasses.map((gKey) => (
                    <option key={gKey} value={gKey}>
                      {GLASS_OPTIONS[gKey].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tactile Profile Frame Finish Tiles */}
              <div>
                <p className="text-xs font-semibold text-[#141413]">
                  رنگ و پوشش پروفیل
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(Object.keys(FRAME_FINISHES) as FrameFinishKey[]).map(
                    (fKey) => {
                      const swatch = FRAME_FINISHES[fKey];
                      const active = finish === fKey;
                      return (
                        <button
                          key={fKey}
                          type="button"
                          onClick={() => setFinish(fKey)}
                          aria-pressed={active}
                          className={`flex items-center gap-2.5 rounded-[3px] border p-2.5 text-start text-xs font-bold transition-all ${
                            active
                              ? "border-[#141413] bg-[#FAF9F6] text-[#141413] ring-1 ring-[#141413]"
                              : "border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] hover:border-[#CEC8BA] hover:text-[#141413]"
                          }`}
                        >
                          <span
                            className="h-5 w-5 shrink-0 rounded-full border border-[#CEC8BA]"
                            style={{ backgroundColor: swatch.hex }}
                            aria-hidden="true"
                          />
                          <span className="truncate">{swatch.label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Quantity & Optional Matching Mesh */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E2D8] pt-4">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="cfg-qty"
                    className="text-xs font-semibold text-[#141413]"
                  >
                    تعداد این دهانه:
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="کاهش تعداد"
                      className="inline-flex items-center justify-center border-e border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-[#141413] hover:bg-[#F1EFEA]"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
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
                      className="tabular-nums w-14 bg-transparent px-2 py-2 text-center text-sm font-bold text-[#141413] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                      aria-label="افزایش تعداد"
                      className="inline-flex items-center justify-center border-s border-[#E6E2D8] bg-[#FAF9F6] px-2.5 text-[#141413] hover:bg-[#F1EFEA]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {activeRule.supportsMesh && (
                  <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-xs font-semibold text-[#141413]">
                    <input
                      type="checkbox"
                      checked={includeMesh}
                      onChange={(e) => setIncludeMesh(e.target.checked)}
                      className="h-4 w-4 rounded border-[#CEC8BA] accent-[#9A6B3F]"
                    />
                    <span>افزودن توری پلیسه همرنگ</span>
                  </label>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Left/End: Sticky Architectural Studio Frame (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <div className="overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]">
            {/* Studio Header Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E2D8] bg-[#FFFFFF] px-4 py-3">
              <div>
                <p className="font-display text-sm font-bold text-[#141413]">
                  {activeRule.label}
                </p>
                <p className="tabular-nums text-[11px] text-[#5C5852]">
                  ابعاد فعال: {toPersianDigits(widthCm)} ×{" "}
                  {toPersianDigits(heightCm)} سانتی‌متر
                </p>
              </div>

              {fxSummary ? (
                <div className="flex items-center gap-2 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 py-1 text-[11px]">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-[#2C5E4F]"
                    aria-hidden="true"
                  />
                  <span className="tabular-nums font-medium text-[#141413]">
                    مبنای ارز: {formatToman(fxSummary.activeUsdIrr)}
                  </span>
                  <span className="hidden text-[#5C5852] sm:inline">
                    ({formatFxTimestamp(fxSummary.lastSyncedAt)})
                  </span>
                </div>
              ) : (
                <span className="rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-2.5 py-1 text-[11px] font-medium text-[#5C5852]">
                  {activeRule.shortLabel}
                </span>
              )}
            </div>

            {/* Full-Bleed Architectural Drafting Canvas */}
            <div
              className="bg-[#F7F5F0] px-4 py-5"
              style={{
                backgroundImage:
                  "radial-gradient(#D5CFC3 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <WindowSvgPreview
                system={system}
                widthCm={widthCm}
                heightCm={heightCm}
                panelCount={panelCount}
                openings={openings}
                finish={finish}
              />
            </div>

            {/* Compact Metric Ribbon */}
            <dl className="grid grid-cols-3 divide-x divide-x-reverse divide-[#E6E2D8] border-t border-[#E6E2D8] bg-[#FAF9F6] text-center">
              <div className="px-2 py-3">
                <dt className="text-[11px] text-[#5C5852]">مساحت واحد</dt>
                <dd className="font-display tabular-nums mt-0.5 text-sm font-bold text-[#141413]">
                  {toPersianDigits(validation.areaSqm)} مترمربع
                </dd>
              </div>
              <div className="px-2 py-3">
                <dt className="text-[11px] text-[#5C5852]">عرض هر لنگه</dt>
                <dd className="font-display tabular-nums mt-0.5 text-sm font-bold text-[#141413]">
                  {toPersianDigits(validation.panelWidthCm)} سانتی‌متر
                </dd>
              </div>
              <div className="px-2 py-3">
                <dt className="text-[11px] text-[#5C5852]">محیط فریم</dt>
                <dd className="font-display tabular-nums mt-0.5 text-sm font-bold text-[#141413]">
                  {toPersianDigits(validation.perimeterMeters)} متر
                </dd>
              </div>
            </dl>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div
                role="alert"
                className="space-y-1 border-t border-[#F5C6C6] bg-[#FDF2F2] px-4 py-3 text-xs leading-6 text-[#991B1B]"
              >
                {validation.errors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}

            {/* Engineering Warnings (Calm Warm-Bronze Architectural Advisory) */}
            {validation.warnings.length > 0 && (
              <div className="space-y-1.5 border-t border-[#E2D3BC] bg-[#FBF8F3] px-4 py-3 text-xs leading-6 text-[#5C4428]">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle
                    className="h-4 w-4 shrink-0 text-[#9A6B3F]"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <span>توصیه فنی کارشناسی</span>
                </div>
                {validation.warnings.map((warn) => (
                  <p key={warn}>{warn}</p>
                ))}
              </div>
            )}

            {/* WCAG-AAA High-Contrast Dark Financial Bar + Primary Action */}
            <div className="bg-[#141413] p-5 text-[#FAF9F6]">
              {pricingLoading ? (
                <p className="text-xs text-[#B8B3AA]">
                  در حال دریافت تعرفه روز کارخانه زنجان...
                </p>
              ) : activePriceBreakdown ? (
                <div>
                  <p className="text-xs font-medium text-[#D6C2A5]">
                    برآورد تقریبی کارخانه ({toPersianDigits(quantity)} عدد)
                  </p>
                  <p className="font-display tabular-nums mt-1 text-2xl font-extrabold tracking-tight text-[#FAF9F6] sm:text-[28px]">
                    {formatToman(activePriceBreakdown.totalIrr)}
                  </p>
                  <p className="tabular-nums mt-1.5 text-xs leading-relaxed text-[#B8B3AA]">
                    شامل پروفیل، شیشه، نصب و رگلاژ استاندارد · مساحت مبنا:{" "}
                    {toPersianDigits(activePriceBreakdown.billableAreaSqm)}{" "}
                    مترمربع
                    {fxSummary
                      ? ` · ${getFxSourceLabel(fxSummary.sourceUsed)}`
                      : ""}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#B8B3AA]">
                  برای مشاهده برآورد قیمت، ابعاد معتبر در بازه مجاز انتخاب کنید.
                </p>
              )}

              <button
                type="button"
                onClick={handleAddItem}
                disabled={!validation.isValid}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[3px] bg-[#FAF9F6] px-5 py-2.5 text-sm font-bold text-[#141413] transition-colors hover:bg-[#E8E2D5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4 text-[#2C5E4F]" aria-hidden="true" />
                    <span>به لیست پروژه اضافه شد</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>افزودن به لیست استعلام پروژه</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 04: Multi-Item Project Inquiry List + Official Submission */}
      <section
        aria-labelledby="inquiry-list-heading"
        className="no-print overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6E2D8] bg-[#FAF9F6] px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-display inline-flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#F1EFEA] text-xs font-bold text-[#9A6B3F]">
                ۰۴
              </span>
              <h2
                id="inquiry-list-heading"
                className="font-display text-lg font-bold text-[#141413]"
              >
                لیست اقلام استعلام پروژه و خروجی نقشه
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#5C5852] sm:text-sm">
              {items.length > 0
                ? `تعداد ${toPersianDigits(
                    items.length
                  )} ردیف (${toPersianDigits(
                    totalCount
                  )} دهانه) به مجموع مساحت ${toPersianDigits(
                    totalAreaSqm
                  )} مترمربع ثبت شده است.`
                : "هنوز ردیفی اضافه نشده است؛ می‌توانید چند دهانه بسازید یا دهانه فعلی را مستقیماً ثبت و ارسال کنید."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {pricedSummary && (
              <div className="rounded-[3px] border border-[#E2D3BC] bg-[#FBF8F3] px-4 py-2 text-xs sm:text-sm">
                <span className="text-[#5C4428]">جمع برآورد تقریبی: </span>
                <strong className="font-display tabular-nums text-[#141413]">
                  {formatToman(pricedSummary.totalIrr)}
                </strong>
              </div>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearList}
                className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#5C5852] hover:border-red-300 hover:text-[#991B1B]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>پاک کردن لیست</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {items.length > 0 && (
            <div className="mb-6 divide-y divide-[#E6E2D8] rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6]">
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
                        <span className="tabular-nums rounded-[2px] border border-[#DFDBD0] bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-bold text-[#141413]">
                          {toPersianDigits(idx + 1)}
                        </span>
                        <span className="text-sm font-bold text-[#141413]">
                          {item.locationName}
                        </span>
                        <span className="rounded-[2px] border border-[#E7D3B5] bg-[#FBF5EC] px-2 py-0.5 text-xs font-semibold text-[#8A5A2B]">
                          {SYSTEM_RULES[item.system].shortLabel}
                        </span>
                      </div>
                      <p className="tabular-nums text-xs leading-6 text-[#5C5852]">
                        ابعاد: {toPersianDigits(item.widthCm)} ×{" "}
                        {toPersianDigits(item.heightCm)} سانتی‌متر ·{" "}
                        {toPersianDigits(item.panelCount)} لنگه (
                        {item.openings.map((o) => OPENING_LABELS[o]).join(" + ")}
                        ) · {GLASS_OPTIONS[gKey].shortLabel} · رنگ{" "}
                        {FRAME_FINISHES[item.finish].label}
                        {item.includeMesh ? " · همراه با توری پلیسه" : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="tabular-nums text-end text-xs">
                        <p className="font-bold text-[#141413]">
                          {toPersianDigits(item.quantity)} عدد (
                          {toPersianDigits(
                            Number((item.areaSqm * item.quantity).toFixed(2))
                          )}{" "}
                          مترمربع)
                        </p>
                        {itemPriced && (
                          <p className="mt-0.5 font-bold text-[#9A6B3F]">
                            {formatToman(itemPriced.breakdown.totalIrr)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label={`حذف ${item.locationName}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] text-[#5C5852] transition-colors hover:border-red-300 hover:text-[#991B1B]"
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
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-[3px] bg-[#141413] px-5 py-2.5 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#262523]"
            >
              <Printer className="h-4 w-4 text-[#D6C2A5]" aria-hidden="true" />
              <span>چاپ / ذخیره PDF برگه مشخصات فنی (A4)</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[3px] border border-[#CEC8BA] bg-[#FFFFFF] px-5 py-2.5 text-sm font-semibold text-[#141413] transition-colors hover:border-[#141413]"
            >
              <ExternalLink
                className="h-4 w-4 text-[#9A6B3F]"
                aria-hidden="true"
              />
              <span>ارسال لیست به واتساپ کارخانه</span>
            </a>

            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-4 py-2.5 text-sm font-semibold text-[#141413] transition-colors hover:border-[#CEC8BA] hover:bg-[#FFFFFF]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[#2C5E4F]" aria-hidden="true" />
                  <span>مشخصات فنی کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#5C5852]" aria-hidden="true" />
                  <span>کپی متن مشخصات فنی</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Official Server-Authoritative Inquiry Submission Panel */}
      <section
        aria-labelledby="official-submit-heading"
        className="no-print overflow-hidden rounded-[4px] border border-[#E6E2D8] bg-[#FFFFFF] p-5 sm:p-8"
      >
        {submitSuccess ? (
          <div className="rounded-[3px] border border-[#C5DDD3] bg-[#EDF5F1]/40 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-[3px] border border-[#C5DDD3] bg-[#EDF5F1] px-3.5 py-1 text-xs font-bold text-[#234E40]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>درخواست شما با موفقیت در سامانه کارخانه ثبت شد</span>
            </div>

            <h2
              id="official-submit-heading"
              className="font-display mt-4 text-xl font-extrabold text-[#141413]"
            >
              کد رهگیری رسمی پروژه شما صادر شد
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[3px] border border-[#E6E2D8] bg-[#FFFFFF] p-4">
              <div>
                <p className="text-xs text-[#5C5852]">کد رهگیری اختصاصی</p>
                <p
                  dir="ltr"
                  className="mt-1 font-mono text-xl font-extrabold tracking-wider text-[#141413]"
                >
                  {submitSuccess.trackingCode}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyTrackingCode}
                className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2 text-xs font-semibold text-[#141413] hover:border-[#141413]"
              >
                {codeCopied ? (
                  <>
                    <Check
                      className="h-3.5 w-3.5 text-[#2C5E4F]"
                      aria-hidden="true"
                    />
                    <span>کد کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy
                      className="h-3.5 w-3.5 text-[#5C5852]"
                      aria-hidden="true"
                    />
                    <span>کپی کد رهگیری</span>
                  </>
                )}
              </button>

              <div className="ms-auto text-start sm:text-end">
                <p className="text-xs text-[#5C5852]">
                  برآورد محاسبه‌شده سرور ({toPersianDigits(submitSuccess.itemCount)}{" "}
                  دهانه)
                </p>
                <p className="font-display tabular-nums mt-1 text-base font-extrabold text-[#141413]">
                  {formatToman(submitSuccess.estimatedTotalIrr)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/track/?code=${submitSuccess.trackingCode}`}
                className="inline-flex items-center gap-2 rounded-[3px] bg-[#141413] px-5 py-3 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#262523]"
              >
                <span>پیگیری وضعیت درخواست</span>
              </Link>

              <button
                type="button"
                onClick={() => setSubmitSuccess(null)}
                className="inline-flex items-center gap-2 rounded-[3px] border border-[#CEC8BA] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-[#141413] hover:border-[#141413]"
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
                className="font-display text-lg font-extrabold text-[#141413] sm:text-xl"
              >
                ثبت رسمی استعلام و دریافت کد رهگیری
              </h2>
              <p className="mt-1 text-xs leading-6 text-[#5C5852] sm:text-sm">
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
                  className="block text-xs font-semibold text-[#141413]"
                >
                  نام و نام خانوادگی *
                </label>
                <input
                  id="submit-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثلاً: مهندس علی محمدی"
                  className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="submit-phone"
                  className="block text-xs font-semibold text-[#141413]"
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
                  className="tabular-nums mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-end text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="submit-city"
                  className="block text-xs font-semibold text-[#141413]"
                >
                  شهر پروژه *
                </label>
                <input
                  id="submit-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثلاً: زنجان / تهران"
                  className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="submit-notes"
                className="block text-xs font-semibold text-[#141413]"
              >
                توضیحات اختیاری (طبقه نصب، وضعیت بازسازی یا زمان‌بندی)
              </label>
              <textarea
                id="submit-notes"
                rows={2}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                placeholder="مثلاً: تعویض بدون تخریب پنجره‌های طبقه سوم..."
                className="mt-1.5 w-full rounded-[3px] border border-[#E6E2D8] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#141413] focus:border-[#9A6B3F] focus:bg-[#FFFFFF] focus:outline-none"
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
                className="rounded-[3px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-[#991B1B] sm:text-sm"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-[3px] bg-[#141413] px-6 py-3.5 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#262523] disabled:cursor-not-allowed disabled:opacity-60"
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
              <th className="border border-black px-2 py-2 text-start">
                ابعاد (سانتی‌متر)
              </th>
              <th className="border border-black px-2 py-2 text-start">
                بازشو و لنگه
              </th>
              <th className="border border-black px-2 py-2 text-start">
                شیشه و رنگ
              </th>
              <th className="border border-black px-2 py-2 text-start">تعداد</th>
              <th className="border border-black px-2 py-2 text-start">مساحت</th>
              <th className="border border-black px-2 py-2 text-start">
                برآورد (تومان)
              </th>
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
                    مترمربع
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
