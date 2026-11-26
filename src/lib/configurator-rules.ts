import type { ConfiguratorKey } from "@/data/types";
import { toPersianDigits } from "./persian-seo";

export type ConfiguratorSystemKey = Exclude<ConfiguratorKey, null>;

export type OpeningType =
  | "fixed"
  | "casement"
  | "tilt-turn"
  | "sliding"
  | "folding";

export type GlassOptionKey =
  | "double-standard"
  | "double-acoustic"
  | "triple-thermal"
  | "tempered-8mm"
  | "none";

export type FrameFinishKey =
  | "white"
  | "anthracite"
  | "walnut"
  | "matte-black";

export interface SystemSpecRule {
  key: ConfiguratorSystemKey;
  label: string;
  shortLabel: string;
  description: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  minPanels: number;
  maxPanels: number;
  defaultWidth: number;
  defaultHeight: number;
  defaultPanels: number;
  defaultOpening: OpeningType;
  allowedOpenings: readonly OpeningType[];
  defaultGlass: GlassOptionKey;
  allowedGlasses: readonly GlassOptionKey[];
  supportsMesh: boolean;
}

export const SYSTEM_RULES: Record<ConfiguratorSystemKey, SystemSpecRule> = {
  upvc: {
    key: "upvc",
    label: "پنجره دوجداره uPVC",
    shortLabel: "uPVC دوجداره",
    description: "عایق حرارتی و صوتی بالا مناسب واحدهای مسکونی، اداری و بازسازی بدون تخریب",
    minWidth: 40,
    maxWidth: 360,
    minHeight: 40,
    maxHeight: 260,
    minPanels: 1,
    maxPanels: 4,
    defaultWidth: 150,
    defaultHeight: 140,
    defaultPanels: 2,
    defaultOpening: "tilt-turn",
    allowedOpenings: ["fixed", "casement", "tilt-turn", "sliding"],
    defaultGlass: "double-standard",
    allowedGlasses: ["double-standard", "double-acoustic", "triple-thermal"],
    supportsMesh: true,
  },
  "thermal-break": {
    key: "thermal-break",
    label: "پنجره آلومینیوم ترمال بریک",
    shortLabel: "ترمال بریک",
    description: "ایستایی سازه‌ای بالا مناسب دهانه‌های عریض، پنجره‌های قدی و نمای مدرن",
    minWidth: 40,
    maxWidth: 480,
    minHeight: 40,
    maxHeight: 320,
    minPanels: 1,
    maxPanels: 4,
    defaultWidth: 200,
    defaultHeight: 220,
    defaultPanels: 2,
    defaultOpening: "sliding",
    allowedOpenings: ["fixed", "casement", "tilt-turn", "sliding"],
    defaultGlass: "double-standard",
    allowedGlasses: ["double-standard", "double-acoustic", "triple-thermal"],
    supportsMesh: true,
  },
  "balcony-glass": {
    key: "balcony-glass",
    label: "شیشه بالکنی تاشو",
    shortLabel: "شیشه بالکنی",
    description: "پنل‌های سکوریت ۸ میلی‌متر جمع‌شو بدون فریم عمودی مزاحم برای تراس و بالکن",
    minWidth: 100,
    maxWidth: 600,
    minHeight: 120,
    maxHeight: 280,
    minPanels: 2,
    maxPanels: 8,
    defaultWidth: 300,
    defaultHeight: 220,
    defaultPanels: 4,
    defaultOpening: "folding",
    allowedOpenings: ["folding"],
    defaultGlass: "tempered-8mm",
    allowedGlasses: ["tempered-8mm"],
    supportsMesh: false,
  },
  "pleated-mesh": {
    key: "pleated-mesh",
    label: "توری کشویی و پلیسه",
    shortLabel: "توری پلیسه",
    description: "شبکه فایبرگلاس آکاردئونی قابل جمع‌شدن با فریم آلومینیومی باریک",
    minWidth: 40,
    maxWidth: 320,
    minHeight: 40,
    maxHeight: 260,
    minPanels: 1,
    maxPanels: 2,
    defaultWidth: 120,
    defaultHeight: 140,
    defaultPanels: 1,
    defaultOpening: "sliding",
    allowedOpenings: ["sliding"],
    defaultGlass: "none",
    allowedGlasses: ["none"],
    supportsMesh: false,
  },
};

export const SYSTEM_LIST: readonly SystemSpecRule[] = [
  SYSTEM_RULES.upvc,
  SYSTEM_RULES["thermal-break"],
  SYSTEM_RULES["balcony-glass"],
  SYSTEM_RULES["pleated-mesh"],
];

export const OPENING_LABELS: Record<OpeningType, string> = {
  fixed: "ثابت",
  casement: "تک‌حالته لولایی",
  "tilt-turn": "دوحالته",
  sliding: "کشویی",
  folding: "تاشو بالکنی",
};

export const GLASS_OPTIONS: Record<
  GlassOptionKey,
  { key: GlassOptionKey; label: string; shortLabel: string }
> = {
  "double-standard": {
    key: "double-standard",
    label: "دوجداره استاندارد (۴-۱۶-۴ میلی‌متر با گاز آرگون)",
    shortLabel: "دوجداره استاندارد آرگون",
  },
  "double-acoustic": {
    key: "double-acoustic",
    label: "دوجداره عایق صوتی (لمینت + آرگون، ویژه معابر پرتردد)",
    shortLabel: "دوجداره لمینت صوتی",
  },
  "triple-thermal": {
    key: "triple-thermal",
    label: "سه‌جداره فوق‌عایق حرارتی (ویژه اقلیم سرد و نمای آفتاب‌گیر)",
    shortLabel: "سه‌جداره فوق‌عایق",
  },
  "tempered-8mm": {
    key: "tempered-8mm",
    label: "سکوریت ۸ میلی‌متر (پیش‌فرض برای شیشه بالکنی)",
    shortLabel: "سکوریت ۸ میلی‌متر",
  },
  none: {
    key: "none",
    label: "بدون شیشه (ویژه توری پلیسه)",
    shortLabel: "بدون شیشه",
  },
};

export const FRAME_FINISHES: Record<
  FrameFinishKey,
  { key: FrameFinishKey; label: string; hex: string; isDark: boolean }
> = {
  white: {
    key: "white",
    label: "سفید کارخانه‌ای",
    hex: "#F8FAFC",
    isDark: false,
  },
  anthracite: {
    key: "anthracite",
    label: "طوسی آنتراسیت",
    hex: "#334155",
    isDark: true,
  },
  walnut: {
    key: "walnut",
    label: "طرح چوب گردویی",
    hex: "#6B4423",
    isDark: true,
  },
  "matte-black": {
    key: "matte-black",
    label: "مشکی مات",
    hex: "#18181B",
    isDark: true,
  },
};

export const STANDARD_PRESET_SIZES: readonly {
  label: string;
  width: number;
  height: number;
}[] = [
  { label: "۱۰۰ × ۱۲۰", width: 100, height: 120 },
  { label: "۱۵۰ × ۱۴۰", width: 150, height: 140 },
  { label: "۲۰۰ × ۱۴۰", width: 200, height: 140 },
  { label: "۲۰۰ × ۲۲۰", width: 200, height: 220 },
  { label: "۳۰۰ × ۲۲۰", width: 300, height: 220 },
];

export interface WindowConfigInput {
  system: ConfiguratorSystemKey;
  widthCm: number;
  heightCm: number;
  panelCount: number;
  openings: OpeningType[];
  glass: GlassOptionKey;
  finish: FrameFinishKey;
  includeMesh: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  areaSqm: number;
  perimeterMeters: number;
  panelWidthCm: number;
}

export function isValidSystemKey(
  value: string | null | undefined
): value is ConfiguratorSystemKey {
  return (
    value === "upvc" ||
    value === "thermal-break" ||
    value === "balcony-glass" ||
    value === "pleated-mesh"
  );
}

export function validateConfiguration(
  config: WindowConfigInput
): ValidationResult {
  const rule = SYSTEM_RULES[config.system];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    !Number.isFinite(config.widthCm) ||
    config.widthCm < rule.minWidth ||
    config.widthCm > rule.maxWidth
  ) {
    errors.push(
      `عرض دهانه برای ${rule.shortLabel} باید بین ${toPersianDigits(
        rule.minWidth
      )} تا ${toPersianDigits(rule.maxWidth)} سانتی‌متر باشد.`
    );
  }

  if (
    !Number.isFinite(config.heightCm) ||
    config.heightCm < rule.minHeight ||
    config.heightCm > rule.maxHeight
  ) {
    errors.push(
      `ارتفاع دهانه برای ${rule.shortLabel} باید بین ${toPersianDigits(
        rule.minHeight
      )} تا ${toPersianDigits(rule.maxHeight)} سانتی‌متر باشد.`
    );
  }

  if (
    config.panelCount < rule.minPanels ||
    config.panelCount > rule.maxPanels
  ) {
    errors.push(
      `تعداد لنگه مجاز برای ${rule.shortLabel} بین ${toPersianDigits(
        rule.minPanels
      )} تا ${toPersianDigits(rule.maxPanels)} عدد است.`
    );
  }

  const safeWidth = Number.isFinite(config.widthCm) ? Math.max(config.widthCm, 1) : 1;
  const safeHeight = Number.isFinite(config.heightCm) ? Math.max(config.heightCm, 1) : 1;
  const safePanels = Math.max(config.panelCount, 1);

  const panelWidthCm = Number((safeWidth / safePanels).toFixed(1));
  const areaSqm = Number(((safeWidth * safeHeight) / 10000).toFixed(2));
  const perimeterMeters = Number(((2 * (safeWidth + safeHeight)) / 100).toFixed(2));

  const hasWideHingedSash = config.openings
    .slice(0, safePanels)
    .some((opening) => opening === "casement" || opening === "tilt-turn");

  if (hasWideHingedSash && panelWidthCm > 95) {
    warnings.push(
      `عرض هر لنگه بازشو (${toPersianDigits(
        panelWidthCm
      )} سانتی‌متر) بیش از ۹۵ سانتی‌متر است؛ وزن شیشه می‌تواند به لولاها فشار بیاورد. افزایش تعداد لنگه‌ها یا ثابت‌کردن یکی از لنگه‌ها پیشنهاد می‌شود.`
    );
  }

  if (
    (config.system === "upvc" || config.system === "thermal-break") &&
    safeHeight > 220
  ) {
    warnings.push(
      `برای ارتفاع بالای ۲۲۰ سانتی‌متر (${toPersianDigits(
        safeHeight
      )} سانتی‌متر)، افزودن کتیبه افقی در بالا یا پایین جهت ایستایی بهتر فریم توصیه می‌شود.`
    );
  }

  if (config.system === "upvc" && safeWidth > 300) {
    warnings.push(
      "در دهانه‌های عریض‌تر از ۳۰۰ سانتی‌متر در سیستم uPVC، استفاده از پروفیل اتصال تقویتی (کوپلینگ) الزامی است."
    );
  }

  if (config.system === "balcony-glass" && panelWidthCm > 85) {
    warnings.push(
      `عرض هر پنل شیشه بالکنی (${toPersianDigits(
        panelWidthCm
      )} سانتی‌متر) زیاد است؛ افزایش تعداد پنل‌ها حرکت روان‌تری روی ریل ایجاد می‌کند.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    areaSqm,
    perimeterMeters,
    panelWidthCm,
  };
}
