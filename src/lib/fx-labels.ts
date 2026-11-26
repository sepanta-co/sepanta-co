import { isValidSystemKey } from "./configurator-rules";

const FX_SOURCE_LABELS: Record<string, string> = {
  "primary-api": "سرویس نرخ ارز اصلی",
  "tgju-usd": "نرخ آزاد دلار (TGJU)",
  "fallback-usdt": "نرخ لحظه‌ای تتر (نوبیتکس)",
  "fallback-wallex": "نرخ لحظه‌ای تتر (والکس)",
  "fallback-bitpin": "نرخ لحظه‌ای تتر (بیت‌پین)",
  manual: "نرخ دستی مدیر",
  cached: "کش ذخیره‌شده سرور",
  seed: "مقدار پایه اولیه",
};

export function getFxSourceLabel(source: string | null | undefined): string {
  if (!source) return "نامشخص";
  return FX_SOURCE_LABELS[source] ?? source;
}

export function formatFxTimestamp(iso: string | null | undefined): string {
  if (!iso) return "هنوز همگام‌سازی نشده";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

export function resolveProductPricingKey(slug: string): string {
  switch (slug) {
    case "upvc-window":
      return "upvc";
    case "thermal-break-window":
      return "thermal-break";
    case "balcony-glass":
      return "balcony-glass";
    case "pleated-mesh":
      return "pleated-mesh";
    default:
      return slug;
  }
}

export function getPricingUnitLabel(systemKey: string): string {
  if (isValidSystemKey(systemKey)) {
    return "هر مترمربع";
  }
  return "هر واحد استاندارد";
}
