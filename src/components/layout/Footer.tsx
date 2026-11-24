import React from "react";
import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { COMPANY_DATA } from "@/data/company";
import { PRODUCTS } from "@/data/products";

export function Footer() {
  return (
    <footer className="bg-obsidian text-zinc-300 border-t border-white/10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-white/40 flex items-center justify-center p-1.5 text-white">
                <svg viewBox="0 0 24 24" className="w-full h-full stroke-current fill-none stroke-[1.75]">
                  <rect x="3" y="3" width="18" height="18" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="11" x2="21" y2="11" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                {COMPANY_DATA.brandName}
              </span>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              {COMPANY_DATA.shortBio}
            </p>

            <div className="text-xs text-zinc-500 space-y-1 pt-1">
              <p>تولید صنعتی مطابق با استانداردهای RAL-GZ 716/1 و ISIRI 12291</p>
              <p>سیستم مدیریت کیفیت ISO 9001:2015 با نظارت مقیم کارخانه</p>
            </div>
          </div>

          {/* Product Lines (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-white">
              محصولات کارخانه
            </h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {PRODUCTS.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug}/`}
                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>{p.persianTitle}</span>
                    <span className="text-xs text-zinc-500 group-hover:text-brass transition-colors">
                      {p.budgetTier}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-white">
              کارخانه و دفتر مرکزی
            </h3>
            <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brass shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block">تلفن دفتر مرکزی:</span>
                  <a
                    href={`tel:${COMPANY_DATA.contact.phone}`}
                    className="text-white hover:text-brass text-sm font-bold"
                  >
                    <span dir="ltr" className="inline-block tabular-nums">
                      {COMPANY_DATA.contact.phoneDisplay}
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brass shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block">مشاوره فنی و ارسال نقشه:</span>
                  <a
                    href={`tel:${COMPANY_DATA.contact.mobileSales}`}
                    className="text-brass hover:underline text-sm font-bold"
                  >
                    <span dir="ltr" className="inline-block tabular-nums">
                      {COMPANY_DATA.contact.mobileSalesDisplay}
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block">نشانی کارخانه:</span>
                  <p className="text-zinc-300">{COMPANY_DATA.contact.factoryAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 block">ساعات پاسخگویی:</span>
                  <p>{COMPANY_DATA.contact.workingHours.weekdays}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© ۱۳۸۰–۱۴۰۵ گروه صنعتی سپنتا. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-5 text-zinc-400">
            <Link href="/about/" className="hover:text-white transition-colors">
              درباره کارخانه
            </Link>
            <span>•</span>
            <Link href="/configurator/" className="hover:text-white transition-colors">
              محاسبه‌گر آنلاین
            </Link>
            <span>•</span>
            <Link href="/projects/" className="hover:text-white transition-colors">
              پروژه‌ها
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
