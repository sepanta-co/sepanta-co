import { toLatinDigits } from "./persian-seo";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "measured"
  | "quoted"
  | "in_production"
  | "installed"
  | "cancelled";

export const INQUIRY_STATUS_STEPS: readonly {
  key: Exclude<InquiryStatus, "cancelled">;
  label: string;
  description: string;
}[] = [
  {
    key: "new",
    label: "ثبت درخواست",
    description: "درخواست در سامانه کارخانه زنجان ثبت و به کارشناس فروش ارجاع شد.",
  },
  {
    key: "contacted",
    label: "تماس کارشناس",
    description: "تماس اولیه برای هماهنگی جزئیات فنی و زمان بازدید انجام شد.",
  },
  {
    key: "measured",
    label: "اندازه‌گیری در محل",
    description: "ابعاد دقیق لیزری دهانه‌ها در محل پروژه برداشت و تایید شد.",
  },
  {
    key: "quoted",
    label: "اعلام پیش‌فاکتور قطعی",
    description: "پیش‌فاکتور نهایی بر اساس ابعاد دقیق و مشخصات یراق صادر شد.",
  },
  {
    key: "in_production",
    label: "در حال تولید در کارخانه",
    description: "برش CNC، مونتاژ پروفیل، شیشه‌گذاری و کنترل کیفیت در جریان است.",
  },
  {
    key: "installed",
    label: "نصب و تحویل نهایی",
    description: "نصب استاندارد، رگلاژ کامل و تحویل پروژه به کارفرما تکمیل شد.",
  },
] as const;

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  new: "ثبت درخواست",
  contacted: "تماس کارشناس",
  measured: "اندازه‌گیری در محل",
  quoted: "اعلام پیش‌فاکتور قطعی",
  in_production: "در حال تولید در کارخانه",
  installed: "نصب و تحویل نهایی",
  cancelled: "لغو شده",
};

export const SERVICE_REQUEST_TYPE_LABELS: Record<string, string> = {
  adjustment: "رگلاژ و تنظیم لنگه و یراق‌آلات",
  inspection: "بازدید فنی و بررسی عایق‌بندی",
  hardware: "تامین یا تعویض قطعه یراق / لاستیک",
};

export const WARRANTY_STATUS_LABELS: Record<string, string> = {
  active: "فعال و معتبر",
  expired: "منقضی شده",
  suspended: "معلق",
};

export function maskPhone(phone: string): string {
  const digits = toLatinDigits(phone).replace(/[^0-9]/g, "");
  if (digits.length < 7) return "****";
  return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
}

export function doesPhoneVerify(storedPhone: string, phoneVerify: string): boolean {
  const normalizedStored = toLatinDigits(storedPhone).replace(/[\s\-()]/g, "");
  const normalizedInput = toLatinDigits(phoneVerify).replace(/[\s\-()]/g, "");

  if (!normalizedStored || !normalizedInput) {
    return false;
  }

  if (normalizedInput === normalizedStored) {
    return true;
  }

  if (/^[0-9]{4}$/.test(normalizedInput)) {
    return normalizedStored.endsWith(normalizedInput);
  }

  return false;
}
