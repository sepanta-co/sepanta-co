"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Info,
  Plus,
  Printer,
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
  glass: GlassOptionKey;
  finish: FrameFinishKey;
  includeMesh: boolean;
  quantity: number;
  areaSqm: number;
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

  const nextIdSeqRef = useRef(1);

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
      glass,
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

  // Fallback to current active configuration if list is empty for instant print/WhatsApp/copy
  const effectiveItems: InquiryItem[] =
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
            glass,
            finish,
            includeMesh: activeRule.supportsMesh && includeMesh,
            quantity: Math.max(1, Math.min(50, quantity)),
            areaSqm: validation.areaSqm,
          },
        ];

  const totalCount = effectiveItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAreaSqm = Number(
    effectiveItems
      .reduce((sum, item) => sum + item.areaSqm * item.quantity, 0)
      .toFixed(2)
  );

  const buildPlainTextSummary = () => {
    const header = `برگه مشخصات فنی پروژه — ${SITE_CONFIG.name}`;
    const rows = effectiveItems.map((item, idx) => {
      const sysLabel = SYSTEM_RULES[item.system].label;
      const glassLabel = GLASS_OPTIONS[item.glass].shortLabel;
      const finishLabel = FRAME_FINISHES[item.finish].label;
      const opsLabel = item.openings.map((o) => OPENING_LABELS[o]).join(" + ");
      const meshNote = item.includeMesh ? " | همراه با توری پلیسه" : "";
      return `${toPersianDigits(idx + 1)}. ${item.locationName} (${toPersianDigits(
        item.quantity
      )} عدد): ${sysLabel} | ابعاد ${toPersianDigits(
        item.widthCm
      )}×${toPersianDigits(item.heightCm)} سم | ${toPersianDigits(
        item.panelCount
      )} لنگه (${opsLabel}) | شیشه: ${glassLabel} | رنگ: ${finishLabel}${meshNote} | مساحت کل: ${toPersianDigits(
        Number((item.areaSqm * item.quantity).toFixed(2))
      )} مترمربع`;
    });

    return [
      header,
      "-----------------------------------",
      ...rows,
      "-----------------------------------",
      `جمع کل دهانه‌ها: ${toPersianDigits(totalCount)} عدد`,
      `مجموع مساحت: ${toPersianDigits(totalAreaSqm)} مترمربع`,
    ].join("\n");
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

  const whatsappUrl = `${SITE_CONFIG.contact.whatsappHref}?text=${encodeURIComponent(
    buildPlainTextSummary()
  )}`;

  return (
    <div className="space-y-10">
      {/* Honest Phase-1 Positioning Banner */}
      <div className="no-print flex items-start gap-3 rounded-2xl border border-amber-200 bg-accent-soft p-4 text-xs leading-6 text-accent-hover sm:p-5 sm:text-sm">
        <Info className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          <strong>شفافیت قیمت‌گذاری کارخانه‌ای:</strong> به دلیل نوسان روزانه نرخ
          پروفیل، شیشه و یراق‌آلات در بازار ایران، این ابزار بدون درج قیمت‌های
          حدسی و غیرواقعی، ابعاد دقیق مهندسی، مساحت کل (مترمربع) و هشدارهای فنی
          شما را محاسبه کرده و خروجی استاندارد A4 برای استعلام فوری از کارخانه
          زنجان تولید می‌کند.
        </p>
      </div>

      {/* Main Configurator Workspace */}
      <div className="no-print grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Controls Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Step 1: System Selection */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">
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
                    className={`rounded-xl border p-3.5 text-start transition-colors ${
                      active
                        ? "border-accent bg-accent-soft/60 text-ink shadow-xs"
                        : "border-border bg-surface-subtle text-ink-muted hover:border-slate-300 hover:text-ink"
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
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
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
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
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
                  className="tabular-nums mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-end text-sm font-semibold text-ink focus:border-accent focus:outline-none"
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
                  className="tabular-nums mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-end text-sm font-semibold text-ink focus:border-accent focus:outline-none"
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
                    className="tabular-nums rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Panels, Openings, Glass, Finish & Mesh */}
          <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">
              ۳. تعداد لنگه، نوع بازشو، شیشه و رنگ پروفیل
            </h2>

            {/* Panel Count */}
            <div>
              <p className="text-xs font-semibold text-ink">
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
                      className={`tabular-nums rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                        active
                          ? "bg-surface-dark text-ink-inverse"
                          : "border border-border bg-surface-subtle text-ink hover:border-accent"
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
                      className="mt-1 w-full rounded-xl border border-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-ink focus:border-accent focus:outline-none disabled:opacity-75"
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
                className="mt-1.5 w-full rounded-xl border border-border bg-surface-subtle px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-75"
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
              <p className="text-xs font-semibold text-ink">
                رنگ و پوشش پروفیل
              </p>
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
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-start text-xs font-semibold transition-colors ${
                        active
                          ? "border-accent bg-accent-soft/50 text-ink"
                          : "border-border bg-surface text-ink-muted hover:text-ink"
                      }`}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-md border border-slate-300"
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
                  className="tabular-nums w-20 rounded-xl border border-border bg-surface px-3 py-2 text-center text-sm font-bold text-ink focus:border-accent focus:outline-none"
                />
              </div>

              {activeRule.supportsMesh && (
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-ink sm:text-sm">
                  <input
                    type="checkbox"
                    checked={includeMesh}
                    onChange={(e) => setIncludeMesh(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-amber-700"
                  />
                  <span>افزودن توری پلیسه همرنگ</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Live SVG Preview + Engineering Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">
                پیش‌نمایش مهندسی زنده
              </h2>
              <span className="rounded-md bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent-hover">
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
              <div className="rounded-xl border border-border bg-surface-subtle p-3">
                <dt className="text-[11px] text-ink-muted">مساحت واحد</dt>
                <dd className="tabular-nums mt-1 text-sm font-extrabold text-ink">
                  {toPersianDigits(validation.areaSqm)} م²
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface-subtle p-3">
                <dt className="text-[11px] text-ink-muted">عرض هر لنگه</dt>
                <dd className="tabular-nums mt-1 text-sm font-extrabold text-ink">
                  {toPersianDigits(validation.panelWidthCm)} سم
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface-subtle p-3">
                <dt className="text-[11px] text-ink-muted">محیط فریم</dt>
                <dd className="tabular-nums mt-1 text-sm font-extrabold text-ink">
                  {toPersianDigits(validation.perimeterMeters)} م
                </dd>
              </div>
            </dl>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div
                role="alert"
                className="space-y-1.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs leading-6 text-red-700"
              >
                {validation.errors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}

            {/* Engineering Warnings */}
            {validation.warnings.length > 0 && (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-accent-soft/65 p-3.5 text-xs leading-6 text-accent-hover">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
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
        className="no-print rounded-2xl border border-border bg-surface p-5 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="inquiry-list-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
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
                : "هنوز ردیفی به لیست اضافه نشده است؛ می‌توانید با دکمه «افزودن به لیست» چند دهانه بسازید یا مشخصات فعلی را مستقیماً چاپ و ارسال کنید."}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearList}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-ink-muted hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>پاک کردن لیست</span>
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-surface-subtle">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums rounded-md bg-surface-dark px-2 py-0.5 text-[11px] font-bold text-amber-400">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <span className="text-sm font-bold text-ink">
                      {item.locationName}
                    </span>
                    <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-hover">
                      {SYSTEM_RULES[item.system].shortLabel}
                    </span>
                  </div>
                  <p className="tabular-nums text-xs leading-6 text-ink-muted">
                    ابعاد: {toPersianDigits(item.widthCm)} ×{" "}
                    {toPersianDigits(item.heightCm)} سم •{" "}
                    {toPersianDigits(item.panelCount)} لنگه (
                    {item.openings.map((o) => OPENING_LABELS[o]).join(" + ")}) •{" "}
                    {GLASS_OPTIONS[item.glass].shortLabel} • رنگ{" "}
                    {FRAME_FINISHES[item.finish].label}
                    {item.includeMesh ? " • همراه با توری پلیسه" : ""}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="tabular-nums text-end text-xs">
                    <p className="font-bold text-ink">
                      {toPersianDigits(item.quantity)} عدد
                    </p>
                    <p className="text-ink-muted">
                      {toPersianDigits(
                        Number((item.areaSqm * item.quantity).toFixed(2))
                      )}{" "}
                      مترمربع
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label={`حذف ${item.locationName}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-dark px-5 py-3 text-sm font-semibold text-ink-inverse transition-colors hover:bg-surface-elevated"
          >
            <Printer className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>چاپ / ذخیره PDF برگه مشخصات فنی (A4)</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span>ارسال لیست کامل به واتساپ کارخانه</span>
          </a>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-subtle px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-accent" aria-hidden="true" />
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

      {/* Official A4 Print-Only Specification Sheet */}
      <div className="hidden print:block print:text-black">
        <div className="border-b-2 border-black pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-black">
                {SITE_CONFIG.name} — برگه مشخصات فنی و استعلام پروژه
              </h2>
              <p className="mt-1 text-xs text-slate-700">
                {SITE_CONFIG.coverageNote}
              </p>
            </div>
            <div className="text-end text-xs">
              <p className="font-bold">تلفن کارخانه: {SITE_CONFIG.contact.phoneDisplay}</p>
              <p className="mt-1">وب‌سایت: sepanta-co.ir</p>
            </div>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse border border-black text-start text-xs">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black px-2.5 py-2 text-start">ردیف</th>
              <th className="border border-black px-2.5 py-2 text-start">موقعیت</th>
              <th className="border border-black px-2.5 py-2 text-start">سیستم</th>
              <th className="border border-black px-2.5 py-2 text-start">ابعاد (سم)</th>
              <th className="border border-black px-2.5 py-2 text-start">بازشو و لنگه</th>
              <th className="border border-black px-2.5 py-2 text-start">شیشه و رنگ</th>
              <th className="border border-black px-2.5 py-2 text-start">تعداد</th>
              <th className="border border-black px-2.5 py-2 text-start">مساحت کل</th>
            </tr>
          </thead>
          <tbody>
            {effectiveItems.map((item, idx) => (
              <tr key={item.id}>
                <td className="tabular-nums border border-black px-2.5 py-2">
                  {toPersianDigits(idx + 1)}
                </td>
                <td className="border border-black px-2.5 py-2 font-semibold">
                  {item.locationName}
                </td>
                <td className="border border-black px-2.5 py-2">
                  {SYSTEM_RULES[item.system].shortLabel}
                </td>
                <td className="tabular-nums border border-black px-2.5 py-2">
                  {toPersianDigits(item.widthCm)} × {toPersianDigits(item.heightCm)}
                </td>
                <td className="tabular-nums border border-black px-2.5 py-2">
                  {toPersianDigits(item.panelCount)} لنگه (
                  {item.openings.map((o) => OPENING_LABELS[o]).join(" + ")})
                </td>
                <td className="border border-black px-2.5 py-2">
                  {GLASS_OPTIONS[item.glass].shortLabel} /{" "}
                  {FRAME_FINISHES[item.finish].label}
                  {item.includeMesh ? " + توری" : ""}
                </td>
                <td className="tabular-nums border border-black px-2.5 py-2">
                  {toPersianDigits(item.quantity)}
                </td>
                <td className="tabular-nums border border-black px-2.5 py-2">
                  {toPersianDigits(
                    Number((item.areaSqm * item.quantity).toFixed(2))
                  )}{" "}
                  م²
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex items-center justify-between border border-black bg-slate-50 px-4 py-3 text-sm font-bold">
          <span className="tabular-nums">
            مجموع تعداد دهانه‌ها: {toPersianDigits(totalCount)} عدد
          </span>
          <span className="tabular-nums">
            مجموع مساحت کل پروژه: {toPersianDigits(totalAreaSqm)} مترمربع
          </span>
        </div>

        <p className="mt-4 text-[11px] leading-6 text-slate-700">
          توضیح فنی: این برگه بر اساس ابعاد اولیه اعلامی جهت برآورد قیمت روز
          کارخانه صادر شده است. اندازه‌گیری نهایی پیش از تولید توسط کارشناس فنی
          گروه صنعتی سپنتا با ابزار لیزری در محل انجام خواهد شد.
        </p>
      </div>
    </div>
  );
}
