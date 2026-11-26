import { SITE_CONFIG } from "./site-config";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;

/**
 * Normalizes Arabic characters into standard Persian equivalents while preserving ZWNJ (\u200C).
 */
export function normalizePersian(text: string): string {
  return text
    .replace(/\u064A/g, "\u06CC") // Arabic Yeh -> Persian Yeh
    .replace(/\u0643/g, "\u06A9") // Arabic Kaf -> Persian Keheh
    .replace(/\u0629/g, "\u0647") // Teh Marbuta -> Heh
    .replace(/\u0640/g, ""); // Remove stray Tatweel
}

/**
 * Converts ASCII digits (0-9) and Arabic-Indic digits to Persian digits (۰-۹) for UI display.
 */
export function toPersianDigits(input: string | number): string {
  return String(input)
    .replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)])
    .replace(/[\u0660-\u0669]/g, (digit) =>
      PERSIAN_DIGITS[digit.charCodeAt(0) - 0x0660]
    );
}

/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII (0-9) for URLs, tel:, and JSON-LD.
 */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[\u06F0-\u06F9]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06F0)
    )
    .replace(/[\u0660-\u0669]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660)
    );
}

/**
 * Builds an absolute canonical URL from SITE_CONFIG.siteUrl with trailing slash enforcement.
 */
export function buildCanonicalUrl(pathname: string): string {
  const base = SITE_CONFIG.siteUrl.replace(/\/+$/, "");
  const cleanPath = pathname.trim().replace(/\/+/g, "/");

  if (!cleanPath || cleanPath === "/") {
    return `${base}/`;
  }

  const withLeadingSlash = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  const withTrailingSlash = withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;

  return `${base}${withTrailingSlash}`;
}
