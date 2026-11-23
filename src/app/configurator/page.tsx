"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Printer,
  Plus,
  Trash2,
  Check,
  Upload,
  AlertTriangle,
  ArrowLeft,
  FileCheck,
} from "lucide-react";
import {
  WindowStudioSVG,
  type SystemType,
  type OpeningType,
  type FrameColor,
} from "@/components/configurator/WindowStudioSVG";
import {
  toPersianDigits,
  toEnglishDigits,
  formatTomanRange,
  formatJalaliDate,
  formatAreaSqm,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// Persian Dictionaries - Zero English enums in cart or print proforma
const SYSTEM_LABELS: Record<SystemType, string> = {
  upvc: "پنجره دوجداره uPVC",
  "thermal-break": "آلومینیوم ترمال بریک",
  "balcony-glass": "شیشه بالکنی تاشو",
  "pleated-mesh": "توری کشویی پلیسه",
};

const FRAME_COLOR_LABELS: Record<FrameColor, string> = {
  white: "سفید استاندارد",
  anthracite: "آنتراسیت مات",
  champagne: "شامپاینی متالیک",
  wood: "طرح چوب بلوطی",
};

const OPENING_LABELS: Record<OpeningType, string> = {
  fixed: "ثابت (بدون بازشو)",
  turn: "تک‌حالته (لولایی)",
  "tilt-turn": "دوحالته (لولایی و شیب‌دار)",
  sliding: "کشویی (ریلی)",
  folding: "تاشو (آکاردئونی)",
};

const GLASS_LABELS: Record<string, string> = {
  "double-clear": "دوجداره فلوت ساده",
  "double-lowe": "دوجداره کنترل حرارت Low-E",
  "double-laminated": "دوجداره لمینت آکوستیک ضد ضربه",
  triple: "سه‌جداره فوق عایق",
};

const INSTALL_LABELS: Record<string, string> = {
  renovation: "بازسازی بدون تخریب (پروفیل لبه‌دار)",
  new: "نوساز (نصب روی فریم فلزی)",
  none: "بدون نصب (تحویل درب کارخانه)",
};

interface CartItem {
  id: string;
  name: string;
  system: SystemType;
  systemTitle: string;
  widthCm: number;
  heightCm: number;
  panes: number;
  hasTransom: boolean;
  transomHeightCm: number;
  openingType: OpeningType;
  openingTitle: string;
  frameColor: FrameColor;
  frameColorTitle: string;
  glassType: string;
  glassTitle: string;
  installation: string;
  installTitle: string;
  minPrice: number;
  maxPrice: number;
  areaSqmFormatted: string;
}

function ConfiguratorStudio() {
  const searchParams = useSearchParams();

  // Primary specs
  const [system, setSystem] = useState<SystemType>("upvc");
  const [widthInput, setWidthInput] = useState<string>("180");
  const [heightInput, setHeightInput] = useState<string>("160");
  const [panes, setPanes] = useState<number>(2);
  const [hasTransom, setHasTransom] = useState<boolean>(false);
  const [transomHeightInput, setTransomHeightInput] = useState<string>("45");
  const [openingType, setOpeningType] = useState<OpeningType>("tilt-turn");
  const [frameColor, setFrameColor] = useState<FrameColor>("white");
  const [glassType, setGlassType] = useState<string>("double-lowe");
  const [installation, setInstallation] = useState<string>("renovation");

  // Cart & Project state
  const [cart, setCart] = useState<CartItem[]>([]);
  const isCartLoaded = useRef(false);

  // Uploaded plan & customer details
  const [planFileName, setPlanFileName] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [isAddedFeedback, setIsAddedFeedback] = useState<boolean>(false);

  // Hydration-safe quote metadata
  const [quoteMeta, setQuoteMeta] = useState<{ id: string; date: string }>({
    id: "۴۸۲۹۰۱",
    date: "۱۴۰۵/۰۹/۰۲",
  });

  // Parse deep-link query parameters
  useEffect(() => {
    const rawProd = searchParams.get("product") || "";
    const rawW = searchParams.get("w") || "";
    const rawH = searchParams.get("h") || "";
    const rawPanes = searchParams.get("panes") || "";

    const normalizedSys =
      rawProd === "upvc-window" || rawProd === "upvc"
        ? "upvc"
        : rawProd === "thermal-break-window" || rawProd === "thermal-break"
        ? "thermal-break"
        : rawProd === "balcony-glass"
        ? "balcony-glass"
        : rawProd === "pleated-mesh"
        ? "pleated-mesh"
        : null;

    if (normalizedSys) {
      setSystem(normalizedSys);
      if (normalizedSys === "balcony-glass") {
        setOpeningType("folding");
        setPanes(4);
      } else if (normalizedSys === "pleated-mesh") {
        setOpeningType("sliding");
        setPanes(1);
      }
    }

    if (rawW) {
      const numW = parseInt(toEnglishDigits(rawW), 10);
      if (!isNaN(numW) && numW >= 40 && numW <= 600) setWidthInput(String(numW));
    }

    if (rawH) {
      const numH = parseInt(toEnglishDigits(rawH), 10);
      if (!isNaN(numH) && numH >= 40 && numH <= 400) setHeightInput(String(numH));
    }

    if (rawPanes) {
      const numPanes = parseInt(toEnglishDigits(rawPanes), 10);
      if (!isNaN(numPanes) && numPanes >= 1 && numPanes <= 6) setPanes(numPanes);
    }
  }, [searchParams]);

  // Hydration-safe localStorage & Quote Meta initialization
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sepanta_quote_cart_v2");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // Storage unavailable or invalid
    }
    isCartLoaded.current = true;

    setQuoteMeta({
      id: toPersianDigits(Math.floor(100000 + Math.random() * 900000)),
      date: formatJalaliDate(new Date()),
    });
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    setCart(items);
    if (isCartLoaded.current) {
      try {
        localStorage.setItem("sepanta_quote_cart_v2", JSON.stringify(items));
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Constrain opening types & panes when system changes
  const handleSystemChange = (newSys: SystemType) => {
    setSystem(newSys);
    if (newSys === "pleated-mesh") {
      setOpeningType("sliding");
      if (panes > 2) setPanes(2);
    } else if (newSys === "balcony-glass") {
      setOpeningType("folding");
      if (panes < 2) setPanes(4);
    } else if (openingType === "folding") {
      setOpeningType("tilt-turn");
    }
  };

  // Dimension sanitization with blur clamping
  const parsedWidth = parseInt(toEnglishDigits(widthInput) || "180", 10);
  const parsedHeight = parseInt(toEnglishDigits(heightInput) || "160", 10);
  const parsedTransom = parseInt(toEnglishDigits(transomHeightInput) || "45", 10);

  const widthCm = Math.max(40, Math.min(600, isNaN(parsedWidth) ? 180 : parsedWidth));
  const heightCm = Math.max(40, Math.min(400, isNaN(parsedHeight) ? 160 : parsedHeight));
  const transomHeightCm = Math.max(25, Math.min(90, isNaN(parsedTransom) ? 45 : parsedTransom));

  const handleWidthBlur = () => {
    setWidthInput(String(widthCm));
  };

  const handleHeightBlur = () => {
    setHeightInput(String(heightCm));
  };

  const handleTransomBlur = () => {
    setTransomHeightInput(String(transomHeightCm));
  };

  // Area & Price calculations
  const areaSqm = (widthCm * heightCm) / 10000;
  const sashWidth = widthCm / panes;

  const SYSTEM_RATES: Record<SystemType, number> = {
    upvc: 3900000,
    "thermal-break": 8500000,
    "balcony-glass": 4500000,
    "pleated-mesh": 1450000,
  };

  const COLOR_MULTIPLIERS: Record<FrameColor, number> = {
    white: 1.0,
    anthracite: 1.12,
    champagne: 1.18,
    wood: 1.22,
  };

  const GLASS_ADDONS: Record<string, number> = {
    "double-clear": 0,
    "double-lowe": 450000,
    "double-laminated": 950000,
    triple: 1400000,
  };

  const HARDWARE_ADDONS: Record<OpeningType, number> = {
    fixed: 0,
    turn: 480000,
    "tilt-turn": 880000,
    sliding: 750000,
    folding: 600000,
  };

  const baseCost = areaSqm * SYSTEM_RATES[system];
  const colorMultiplier = COLOR_MULTIPLIERS[frameColor];
  const glassCost = system === "pleated-mesh" ? 0 : areaSqm * (GLASS_ADDONS[glassType] || 0);
  const hardwareCost = HARDWARE_ADDONS[openingType] * (panes > 1 ? Math.floor(panes / 2) : 1);
  const transomCost = hasTransom ? 450000 : 0;
  const installMultiplier =
    installation === "renovation" ? 1.12 : installation === "new" ? 1.08 : 1.0;

  const medianPrice =
    (baseCost * colorMultiplier + glassCost + hardwareCost + transomCost) * installMultiplier;

  const currentMinPrice = Math.round((medianPrice * 0.92) / 10000) * 10000;
  const currentMaxPrice = Math.round((medianPrice * 1.08) / 10000) * 10000;

  // Engineering Validation Warnings
  const warnings: string[] = [];
  if (sashWidth > 100 && (openingType === "turn" || openingType === "tilt-turn")) {
    warnings.push(
      `عرض هر لنگه (${toPersianDigits(Math.round(sashWidth))} سانتیمتر) بیش از ۱۰۰ سانتیمتر است. جهت جلوگیری از افتادگی لولا، پیشنهاد می‌شود تعداد لنگه را افزایش داده یا از سیستم کشویی/ترمال بریک استفاده کنید.`
    );
  }
  if (heightCm > 220 && !hasTransom) {
    warnings.push(
      `ارتفاع دهانه (${toPersianDigits(heightCm)} سانتیمتر) بیش از ۲۲۰ سانتیمتر است. پیشنهاد مهندسی سپنتا، افزودن کتیبه بالا (Transom) یا استفاده از مقاطع مقاوم آلومینیوم ترمال بریک است.`
    );
  }
  if (areaSqm > 3.2) {
    warnings.push(
      `مساحت کل دهانه (${toPersianDigits(areaSqm.toFixed(2))} مترمربع) از ۳.۲ مترمربع بیشتر است. طبق مبحث ۴ مقررات ملی، استفاده از شیشه سکوریت یا لمینت ایمنی پیشنهاد اکید می‌شود.`
    );
  }

  // Cart actions
  const handleAddToCart = () => {
    const newItem: CartItem = {
      id: "item-" + Date.now(),
      name: `دهانه ${toPersianDigits(widthCm)}×${toPersianDigits(heightCm)} (${SYSTEM_LABELS[system]})`,
      system,
      systemTitle: SYSTEM_LABELS[system],
      widthCm,
      heightCm,
      panes,
      hasTransom,
      transomHeightCm,
      openingType,
      openingTitle: OPENING_LABELS[openingType],
      frameColor,
      frameColorTitle: FRAME_COLOR_LABELS[frameColor],
      glassType,
      glassTitle: system === "pleated-mesh" ? "توری فایبرگلاس پلی‌استری" : GLASS_LABELS[glassType],
      installation,
      installTitle: INSTALL_LABELS[installation],
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      areaSqmFormatted: formatAreaSqm(widthCm, heightCm),
    };

    saveCart([...cart, newItem]);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 2500);
  };

  const handleRemoveItem = (id: string) => {
    saveCart(cart.filter((c) => c.id !== id));
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const totalMinPrice = cart.reduce((acc, it) => acc + it.minPrice, 0);
  const totalMaxPrice = cart.reduce((acc, it) => acc + it.maxPrice, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Top Headline */}
        <div className="max-w-3xl space-y-3 no-print">
          <span className="text-xs font-bold text-brass block">
            محاسبهگر فنی و مهندسی سپنتا
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            پیکربندی ابعادی و برآورد قیمت کارخانه
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            ابعاد دقیق دهانه، سیستم پروفیل، نوع بازشو و شیشه را وارد کنید تا پیش‌نمایش معماری مقطع و برآورد شفاف قیمت تولید کارخانه با خطای ±۸٪ محاسبه گردد.
          </p>
        </div>

        {/* Main 2-Column Configurator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start no-print">
          {/* Left Column: Interactive CAD Preview & Specs Ledger (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sticky top-28">
            <div className="bg-[#FAFAFA] border border-zinc-300 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                <span className="text-xs font-bold text-zinc-800">
                  نقشه شماتیک CAD دهانه بازشو
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  مقیاس دینامیک معماری
                </span>
              </div>

              {/* Dynamic SVG Drawing */}
              <WindowStudioSVG
                widthCm={widthCm}
                heightCm={heightCm}
                panes={panes}
                hasTransom={hasTransom}
                transomHeightCm={transomHeightCm}
                system={system}
                openingType={openingType}
                frameColor={frameColor}
              />
            </div>

            {/* Engineering Warnings Box */}
            {warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>توصیه‌های فنی و ایمنی مهندسی:</span>
                </div>
                <ul className="text-xs text-amber-800 space-y-1.5 ps-6 list-disc">
                  {warnings.map((w, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Live Calculation Summary Box */}
            <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                <div>
                  <span className="text-xs text-zinc-500 block">برآورد هزینه تمام‌شده این دهانه:</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-brass tabular-nums">
                    {formatTomanRange(currentMinPrice, currentMaxPrice)}
                  </div>
                </div>

                <div className="text-xs text-zinc-600 sm:text-end">
                  <span>مساحت دهانه: </span>
                  <strong className="text-zinc-950 font-bold tabular-nums">
                    {formatAreaSqm(widthCm, heightCm)}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-colors rounded-[2px] min-h-[44px]",
                    isAddedFeedback
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-brass hover:bg-brass-hover"
                  )}
                >
                  {isAddedFeedback ? (
                    <>
                      <Check className="w-4 h-4 me-2 stroke-[2.5]" />
                      <span>به پیش‌فاکتور افزوده شد</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 me-2 stroke-[2.5]" />
                      <span>افزودن این دهانه به پیش‌فاکتور</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-zinc-500 max-w-xs">
                  قیمت نهایی پس از برداشت ابعاد دقیق کارگاهی توسط کارشناس سپنتا قطعی می‌شود.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Parameter Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-8 bg-white border border-zinc-200 p-6 sm:p-7">
            {/* 1. System Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-950 block">
                ۱. سیستم پروفیل و خط تولید:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(["upvc", "thermal-break", "balcony-glass", "pleated-mesh"] as SystemType[]).map((sys) => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => handleSystemChange(sys)}
                    className={cn(
                      "p-3 text-start border transition-colors rounded-[2px] min-h-[44px] flex flex-col justify-center",
                      system === sys
                        ? "bg-amber-50/70 border-brass text-zinc-950 font-bold"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span>{SYSTEM_LABELS[sys]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Dimensions */}
            <div className="space-y-3 border-t border-zinc-100 pt-5">
              <label className="text-sm font-bold text-zinc-950 block">
                ۲. ابعاد دهانه (سانتیمتر):
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-1">عرض دهانه (۴۰ تا ۶۰۰):</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={toPersianDigits(widthInput)}
                    onChange={(e) => setWidthInput(toEnglishDigits(e.target.value))}
                    onBlur={handleWidthBlur}
                    className="w-full p-2.5 border border-zinc-300 text-zinc-950 font-bold rounded-[2px] focus:ring-2 focus:ring-brass focus:border-brass text-center min-h-[44px]"
                  />
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">ارتفاع دهانه (۴۰ تا ۴۰۰):</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={toPersianDigits(heightInput)}
                    onChange={(e) => setHeightInput(toEnglishDigits(e.target.value))}
                    onBlur={handleHeightBlur}
                    className="w-full p-2.5 border border-zinc-300 text-zinc-950 font-bold rounded-[2px] focus:ring-2 focus:ring-brass focus:border-brass text-center min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Panes & Transom */}
            <div className="space-y-3 border-t border-zinc-100 pt-5">
              <label className="text-sm font-bold text-zinc-950 block">
                ۳. ساختار لنگه‌ها و کتیبه:
              </label>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-1.5">تعداد لنگه‌های دهانه:</span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((num) => {
                      const disabled =
                        (system === "pleated-mesh" && num > 2) ||
                        (system === "balcony-glass" && num < 2);
                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={disabled}
                          onClick={() => setPanes(num)}
                          className={cn(
                            "py-2 px-1 text-center border font-bold rounded-[2px] min-h-[44px] transition-colors",
                            disabled
                              ? "opacity-30 cursor-not-allowed bg-zinc-100 border-zinc-200 text-zinc-400"
                              : panes === num
                              ? "bg-zinc-950 text-white border-zinc-950"
                              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                          )}
                        >
                          {toPersianDigits(num)} لنگه
                        </button>
                      );
                    })}
                  </div>
                </div>

                {system !== "balcony-glass" && system !== "pleated-mesh" && (
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasTransom}
                        onChange={(e) => setHasTransom(e.target.checked)}
                        className="w-4 h-4 accent-brass"
                      />
                      <span className="text-zinc-800 font-semibold">افزودن کتیبه ثابت بالا (Transom)</span>
                    </label>

                    {hasTransom && (
                      <div className="mt-2 ps-6">
                        <span className="text-zinc-500 block mb-1">ارتفاع کتیبه (۲۵ تا ۹۰ سانتیمتر):</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={toPersianDigits(transomHeightInput)}
                          onChange={(e) => setTransomHeightInput(toEnglishDigits(e.target.value))}
                          onBlur={handleTransomBlur}
                          className="w-32 p-2 border border-zinc-300 text-zinc-950 font-bold rounded-[2px] text-center min-h-[44px]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Opening Type */}
            <div className="space-y-3 border-t border-zinc-100 pt-5">
              <label className="text-sm font-bold text-zinc-950 block">
                ۴. نوع بازشوی دهانه:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(["fixed", "turn", "tilt-turn", "sliding", "folding"] as OpeningType[]).map((op) => {
                  const disabled =
                    (system === "pleated-mesh" && op !== "sliding") ||
                    (system === "balcony-glass" && op !== "folding") ||
                    ((system === "upvc" || system === "thermal-break") && op === "folding");
                  if (disabled) return null;

                  return (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOpeningType(op)}
                      className={cn(
                        "p-3 text-start border transition-colors rounded-[2px] min-h-[44px] flex flex-col justify-center",
                        openingType === op
                          ? "bg-amber-50/70 border-brass text-zinc-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span>{OPENING_LABELS[op]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Frame Color & Finish */}
            <div className="space-y-3 border-t border-zinc-100 pt-5">
              <label className="text-sm font-bold text-zinc-950 block">
                ۵. رنگ و پوشش فریم:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(["white", "anthracite", "champagne", "wood"] as FrameColor[]).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFrameColor(col)}
                    className={cn(
                      "p-3 text-start border transition-colors rounded-[2px] min-h-[44px] flex items-center gap-2",
                      frameColor === col
                        ? "bg-amber-50/70 border-brass text-zinc-950 font-bold"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0"
                      style={{
                        backgroundColor:
                          col === "white"
                            ? "#FFFFFF"
                            : col === "anthracite"
                            ? "#1E242B"
                            : col === "champagne"
                            ? "#B8A58D"
                            : "#6A3F1F",
                      }}
                    />
                    <span>{FRAME_COLOR_LABELS[col]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Glass Specification */}
            {system !== "pleated-mesh" && (
              <div className="space-y-3 border-t border-zinc-100 pt-5">
                <label className="text-sm font-bold text-zinc-950 block">
                  ۶. ساختار و مشخصات شیشه:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.keys(GLASS_LABELS).map((gKey) => (
                    <button
                      key={gKey}
                      type="button"
                      onClick={() => setGlassType(gKey)}
                      className={cn(
                        "p-3 text-start border transition-colors rounded-[2px] min-h-[44px] flex flex-col justify-center",
                        glassType === gKey
                          ? "bg-amber-50/70 border-brass text-zinc-950 font-bold"
                          : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      )}
                    >
                      <span>{GLASS_LABELS[gKey]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Installation Mode */}
            <div className="space-y-3 border-t border-zinc-100 pt-5">
              <label className="text-sm font-bold text-zinc-950 block">
                ۷. وضعیت نصب و خدمات کارگاهی:
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {Object.keys(INSTALL_LABELS).map((instKey) => (
                  <button
                    key={instKey}
                    type="button"
                    onClick={() => setInstallation(instKey)}
                    className={cn(
                      "p-3 text-start border transition-colors rounded-[2px] min-h-[44px] flex items-center justify-between",
                      installation === instKey
                        ? "bg-amber-50/70 border-brass text-zinc-950 font-bold"
                        : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span>{INSTALL_LABELS[instKey]}</span>
                    {installation === instKey && (
                      <Check className="w-4 h-4 text-brass stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Proforma Quote Cart & Submission (Screens & Print) */}
        <section className="bg-zinc-50 border border-zinc-200 p-6 sm:p-10 space-y-8 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <span className="text-xs font-bold text-brass block mb-1">
                پیش‌فاکتور رسمی و تجمیعی
              </span>
              <h2 className="text-2xl font-bold text-zinc-950">
                فهرست اقلام انتخابی پروژه ({toPersianDigits(cart.length)} دهانه)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {cart.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-[2px] hover:bg-zinc-800 transition-colors min-h-[44px]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>چاپ پیش‌فاکتور رسمی A4</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 text-zinc-600 text-xs font-medium hover:text-red-700 transition-colors min-h-[44px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف همه</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cart Table */}
          {cart.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm space-y-2">
              <p>هنوز دهانه‌ای به پیش‌فاکتور اضافه نشده است.</p>
              <p className="text-xs text-zinc-400">
                مشخصات دهانه مورد نظر خود را در بالا تنظیم نموده و دکمه «افزودن این دهانه به پیش‌فاکتور» را بزنید.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto bg-white border border-zinc-200">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-800 font-bold border-b border-zinc-200">
                      <th className="p-3 text-start">ردیف</th>
                      <th className="p-3 text-start">شرح سیستم و دهانه</th>
                      <th className="p-3 text-start">ابعاد و مساحت</th>
                      <th className="p-3 text-start">بازشو و فریم</th>
                      <th className="p-3 text-start">شیشه</th>
                      <th className="p-3 text-start">برآورد هزینه (±۸٪)</th>
                      <th className="p-3 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {cart.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-zinc-50/80">
                        <td className="p-3 font-bold tabular-nums">{toPersianDigits(idx + 1)}</td>
                        <td className="p-3 font-bold text-zinc-950">
                          {item.name}
                        </td>
                        <td className="p-3 tabular-nums">
                          {toPersianDigits(item.widthCm)}×{toPersianDigits(item.heightCm)} cm
                          <span className="block text-[11px] text-zinc-400">{item.areaSqmFormatted}</span>
                        </td>
                        <td className="p-3">
                          {item.openingTitle}
                          <span className="block text-[11px] text-zinc-500">{item.frameColorTitle}</span>
                        </td>
                        <td className="p-3">{item.glassTitle}</td>
                        <td className="p-3 font-bold text-brass tabular-nums">
                          {formatTomanRange(item.minPrice, item.maxPrice)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-zinc-400 hover:text-red-700 transition-colors p-1"
                            aria-label="حذف این ردیف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grand Total Strip */}
              <div className="bg-white border border-zinc-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-zinc-500 block">جمع کل برآورد کارخانه ({toPersianDigits(cart.length)} دهانه):</span>
                  <div className="text-2xl font-extrabold text-brass tabular-nums">
                    {formatTomanRange(totalMinPrice, totalMaxPrice)}
                  </div>
                </div>

                <div className="text-xs text-zinc-500 sm:text-end space-y-0.5">
                  <p>محاسبه‌شده بر اساس قیمت مواد اولیه کارخانه‌ای</p>
                  <p>تضمین ثبات قیمت تا ۷ روز کاری پس از صدور</p>
                </div>
              </div>

              {/* Architectural Plan Upload & Contact Desk */}
              <div className="bg-white border border-zinc-200 p-6 sm:p-8 space-y-6">
                <div className="border-b border-zinc-100 pb-4">
                  <h3 className="text-lg font-bold text-zinc-950">
                    تأیید نهایی، ارسال نقشه معماری و اعزام کارشناس
                  </h3>
                  <p className="text-xs text-zinc-500 pt-1">
                    در صورت داشتن فایل نقشه (اتوکد، PDF یا عکس)، آن را ضمیمه کنید تا مهندسی فروش مستقیماً با شما هماهنگ شود.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1.5">
                      نام و نام خانوادگی کارفرما:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: مهندس حسینی"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded-[2px] text-zinc-950 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1.5">
                      شماره تماس همراه:
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="۰۹۱۲XXXXXXX"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full p-2.5 border border-zinc-300 rounded-[2px] text-zinc-950 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1.5">
                      بارگذاری فایل نقشه پروژه:
                    </label>
                    <label className="flex items-center justify-center gap-2 w-full p-2.5 border border-dashed border-zinc-400 bg-zinc-50 hover:bg-zinc-100 cursor-pointer rounded-[2px] min-h-[44px]">
                      {planFileName ? (
                        <>
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-zinc-800 font-semibold truncate max-w-[180px]">{planFileName}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="text-zinc-600">انتخاب فایل (.pdf, .dwg, .jpg)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setPlanFileName(file.name);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <a
                    href={`https://wa.me/989121415500?text=${encodeURIComponent(
                      `سلام، درخواست برآورد پیش‌فاکتور سپنتا برای ${cart.length} دهانه.\nجمع برآورد: ${formatTomanRange(
                        totalMinPrice,
                        totalMaxPrice
                      )}\nنام: ${clientName || "کارفرما"}\nتلفن: ${clientPhone || "-"}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[2px] transition-colors min-h-[44px]"
                  >
                    <span>ارسال مشخصات به واحد مهندسی فروش (واتس‌اپ)</span>
                    <ArrowLeft className="w-4 h-4 ms-2" />
                  </a>

                  <p className="text-xs text-zinc-500">
                    یا تماس تلفنی مستقیم با خط کارخانه:{" "}
                    <a href="tel:02433445566" className="font-bold text-zinc-950 underline">
                      ۰۲۴-۳۳۴۴۵۵۶۶
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            OFFICIAL A4 PRINT PROFORMA INVOICE
            Renders ONLY when window.print() is executed (@media print in globals.css)
            ========================================================================= */}
        <div className="hidden print-only text-black bg-white p-2">
          {/* Proforma Header */}
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-zinc-900 flex items-center justify-center p-1.5">
                <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[2]">
                  <rect x="3" y="3" width="18" height="18" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="11" x2="21" y2="11" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">گروه صنعتی سپنتا</h1>
                <p className="text-xs font-semibold text-zinc-700">
                  تولید صنعتی درب و پنجره دوجداره، آلومینیوم ترمال بریک و دربهای ساختمانی
                </p>
              </div>
            </div>

            <div className="text-start text-xs space-y-1">
              <p>
                <strong>شماره پیش‌فاکتور:</strong> <span className="tabular-nums font-bold">{quoteMeta.id}</span>
              </p>
              <p>
                <strong>تاریخ صدور:</strong> <span className="tabular-nums font-bold">{quoteMeta.date}</span>
              </p>
              <p>
                <strong>اعتبار قیمت:</strong> <span>۷ روز کاری</span>
              </p>
            </div>
          </div>

          {/* Client & Project Specs Header */}
          <div className="grid grid-cols-2 gap-4 border border-zinc-300 p-3 mb-6 text-xs bg-zinc-50">
            <div>
              <p>
                <strong>کارفرما / پروژه:</strong> {clientName || "کارفرمای محترم"}
              </p>
              <p className="pt-1">
                <strong>شماره تماس:</strong> {clientPhone || "—"}
              </p>
            </div>
            <div>
              <p>
                <strong>واحد صادرکننده:</strong> واحد مهندسی فروش کارخانه سپنتا زنجان
              </p>
              <p className="pt-1">
                <strong>تلفن پیگیری:</strong> ۰۲۴-۳۳۴۴۵۵۶۶ | ۰۹۱۲-۱۴۱-۵۵۰۰
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs border border-zinc-400 mb-6 border-collapse">
            <thead>
              <tr className="bg-zinc-100 font-bold border-b border-zinc-400">
                <th className="p-2 text-start border-e border-zinc-300 w-10">ردیف</th>
                <th className="p-2 text-start border-e border-zinc-300">شرح مشخصات سیستم</th>
                <th className="p-2 text-start border-e border-zinc-300">ابعاد دهانه</th>
                <th className="p-2 text-start border-e border-zinc-300">مساحت</th>
                <th className="p-2 text-start border-e border-zinc-300">یراق و فریم</th>
                <th className="p-2 text-start border-e border-zinc-300">شیشه</th>
                <th className="p-2 text-start">برآورد کارخانه (تومان)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-300">
              {cart.map((item, idx) => (
                <tr key={item.id} className="print-avoid-break">
                  <td className="p-2 border-e border-zinc-300 tabular-nums text-center">{toPersianDigits(idx + 1)}</td>
                  <td className="p-2 border-e border-zinc-300 font-bold">{item.name}</td>
                  <td className="p-2 border-e border-zinc-300 tabular-nums">
                    {toPersianDigits(item.widthCm)}×{toPersianDigits(item.heightCm)} cm
                  </td>
                  <td className="p-2 border-e border-zinc-300 tabular-nums">{item.areaSqmFormatted}</td>
                  <td className="p-2 border-e border-zinc-300">
                    {item.openingTitle} ({item.frameColorTitle})
                  </td>
                  <td className="p-2 border-e border-zinc-300">{item.glassTitle}</td>
                  <td className="p-2 tabular-nums font-bold">
                    {formatTomanRange(item.minPrice, item.maxPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Grand Total Strip */}
          <div className="border border-zinc-400 p-3 mb-6 bg-zinc-50 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold">مجموع کل برآورد هزینه کارخانه ({toPersianDigits(cart.length)} دهانه):</span>
            </div>
            <div className="text-base font-extrabold tabular-nums">
              {formatTomanRange(totalMinPrice, totalMaxPrice)}
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="border border-zinc-300 p-3 text-[11px] text-zinc-700 space-y-1 mb-8 leading-relaxed">
            <p>۱. ابعاد فوق بر اساس اظهار اولیه کارفرما ثبت گردیده و ابعاد اجرایی پس از اندازه‌گیری با متر لیزری قطعی می‌شود.</p>
            <p>۲. کلیه مقاطع و شیشه‌ها مشمول ضمانت کتبی کارخانه‌ای ۱۰ تا ۲۵ ساله گروه صنعتی سپنتا می‌باشند.</p>
            <p>۳. نشانی کارخانه: زنجان، شهرک صنعتی اشراق، فاز توسعه، بلوار صنعت، پلاک ۴۲ | تلفن: ۰۲۴-۳۳۴۴۵۵۶۶</p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 text-xs">
            <div className="border-t border-zinc-400 pt-2 text-center">
              <span>امضای کارفرما / نماینده پروژه</span>
            </div>
            <div className="border-t border-zinc-400 pt-2 text-center">
              <span>مهر و امضای مهندسی فروش کارخانه سپنتا</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguratorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center pt-28 pb-20">
          <div className="text-sm font-semibold text-zinc-500">
            در حال بارگذاری محاسبهگر فنی سپنتا...
          </div>
        </div>
      }
    >
      <ConfiguratorStudio />
    </Suspense>
  );
}
