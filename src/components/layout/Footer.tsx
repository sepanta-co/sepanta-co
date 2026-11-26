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
    <footer className="border-t border-border-dark bg-surface-dark text-ink-inverse">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 md:pb-10 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand Identity */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-ink-inverse"
            >
              <BrandMark className="h-7 w-7 text-ink-inverse" />
              <span className="text-base font-bold">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm leading-7 text-slate-300">
              {SITE_CONFIG.coverageNote}
            </p>
            <div className="flex items-start gap-2.5 rounded-xl border border-border-dark bg-surface-elevated p-3.5 text-xs leading-6 text-slate-300">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                aria-hidden="true"
              />
              <span>{SITE_CONFIG.warrantySummary}</span>
            </div>
          </div>

          {/* Column 2: 7 Production Lines */}
          <div>
            <h2 className="text-sm font-bold text-ink-inverse">
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
          <div>
            <h2 className="text-sm font-bold text-ink-inverse">
              دسترسی سریع و ابزارها
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
          <div>
            <h2 className="text-sm font-bold text-ink-inverse">
              کارخانه و اطلاعات تماس
            </h2>
            <ul className="mt-4 space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-1 h-4 w-4 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span className="leading-7">
                  {SITE_CONFIG.contact.factoryAddress}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  dir="ltr"
                  className="tabular-nums font-medium text-ink-inverse transition-colors hover:text-amber-400"
                >
                  {SITE_CONFIG.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="mt-1 h-4 w-4 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span className="tabular-nums leading-7">
                  {SITE_CONFIG.contact.workingHours}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border-dark pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© ۱۴۰۵ {SITE_CONFIG.name}. تمامی حقوق محفوظ است.</p>
          <p>معماری صنعتی • تولید مستقیم از کارخانه زنجان</p>
        </div>
      </div>
    </footer>
  );
}
