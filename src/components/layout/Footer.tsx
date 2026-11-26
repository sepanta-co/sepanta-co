import Link from "next/link";
import { Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import {
  FOOTER_UTILITY_LINKS,
  PRODUCT_NAV_LINKS,
  SITE_CONFIG,
} from "@/lib/site-config";
import { BrandMark } from "./BrandMark";

export function Footer() {
  return (
    <footer className="border-t border-border-dark bg-anthracite text-ink-inverse">
      <div className="mx-auto max-w-[1280px] px-4 pt-12 pb-24 sm:px-6 md:pb-10 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 border-t border-s border-border-dark sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand Identity */}
          <div className="space-y-4 border-e border-b border-border-dark p-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-ink-inverse"
            >
              <BrandMark className="h-7 w-7 text-amber-400" />
              <span className="font-display text-base font-extrabold">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm leading-7 text-slate-300">
              {SITE_CONFIG.coverageNote}
            </p>
            <div className="flex items-start gap-2.5 border border-border-dark bg-surface-elevated p-3.5 text-xs leading-6 text-slate-300">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span>{SITE_CONFIG.warrantySummary}</span>
            </div>
          </div>

          {/* Column 2: 7 Production Lines */}
          <div className="border-e border-b border-border-dark p-6">
            <h2 className="border-b border-border-dark pb-2.5 text-sm font-bold text-amber-400">
              خطوط تولید و محصولات
            </h2>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_NAV_LINKS.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={product.href}
                    className="text-sm text-slate-300 transition-colors hover:text-amber-400"
                  >
                    {product.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Main Pages & Utilities */}
          <div className="border-e border-b border-border-dark p-6">
            <h2 className="border-b border-border-dark pb-2.5 text-sm font-bold text-amber-400">
              دسترسی سریع و پورتال‌ها
            </h2>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_UTILITY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-300 transition-colors hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Factory Address, Phone, Hours */}
          <div className="border-e border-b border-border-dark p-6">
            <h2 className="border-b border-border-dark pb-2.5 text-sm font-bold text-amber-400">
              کارخانه زنجان و تماس مستقیم
            </h2>
            <ul className="mt-4 space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-1 h-4 w-4 shrink-0 text-amber-400"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="leading-7">
                  {SITE_CONFIG.contact.factoryAddress}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-amber-400"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  dir="ltr"
                  className="tabular-nums font-bold text-white transition-colors hover:text-amber-400"
                >
                  {SITE_CONFIG.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-1 h-4 w-4 shrink-0 text-amber-400"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="tabular-nums leading-6">
                  {SITE_CONFIG.contact.workingHours}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>{SITE_CONFIG.name} — تولید مستقیم درب و پنجره دوجداره و نمای مدرن در کارخانه زنجان</p>
          <p className="text-slate-400">
            تمامی مشخصات فنی، ضمانت‌نامه مکتوب و تعرفه‌های کارخانه بدون واسطه ارائه می‌شوند.
          </p>
        </div>
      </div>
    </footer>
  );
}
