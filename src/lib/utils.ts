import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export { assetPath, BASE_PATH } from "./assets";
export { toPersianDigits, toEnglishDigits, normalizePersianText, formatTomanRange } from "./format";
