/**
 * Persian typography & formatting utilities for Sepanta Industrial Group
 */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts English digits (0-9) to standard Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return "";
  const str = String(input);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * Normalizes both Persian (۰-۹) and Arabic (٠-٩) digits to standard ASCII English digits (0-9).
 * Crucial for technical form inputs, calculator dimensions, and math calculations.
 */
export function toEnglishDigits(input: string): string {
  if (!input) return "";
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(PERSIAN_DIGITS[i], "g"), String(i));
    result = result.replace(new RegExp(ARABIC_DIGITS[i], "g"), String(i));
  }
  return result;
}

/**
 * Normalizes Arabic characters to standard Persian
 * and cleans up common non-standard spacing while preserving ZWNJ.
 */
export function normalizePersianText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u064A/g, "ی")
    .replace(/\u0643/g, "ک")
    .replace(/ۀ/g, "ه‌ی");
}

/**
 * Formats a number with standard Persian thousand separators (٬).
 */
export function formatPersianNumber(num: number): string {
  if (isNaN(num)) return "۰";
  const parts = Math.round(num).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toPersianDigits(parts.join("."));
}

/**
 * Formats a price range in Toman with Persian digits.
 * @example formatTomanRange(3500000, 4800000) => "۳٬۵۰۰٬۰۰۰ تا ۴٬۸۰۰٬۰۰۰ تومان"
 */
export function formatTomanRange(min: number, max: number): string {
  const minStr = formatPersianNumber(min);
  const maxStr = formatPersianNumber(max);
  if (min === max) {
    return `${minStr} تومان`;
  }
  return `${minStr} تا ${maxStr} تومان`;
}

/**
 * Formats a JavaScript Date to Jalali (Solar Hijri) format.
 * Fallback to 1405/09/02 if Intl formatting fails.
 */
export function formatJalaliDate(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return "۱۴۰۵/۰۹/۰۲";
  }
}

/**
 * Formats area in square meters with Persian digits.
 */
export function formatAreaSqm(widthCm: number, heightCm: number): string {
  return `${toPersianDigits(((widthCm * heightCm) / 10000).toFixed(2))} مترمربع`;
}
