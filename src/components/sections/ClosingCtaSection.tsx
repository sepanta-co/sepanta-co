import Link from "next/link";
import { FileText, Phone, SlidersHorizontal } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function ClosingCtaSection() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="bg-surface-dark py-16 text-ink-inverse md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 rounded-3xl border border-border-dark bg-surface-elevated p-8 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-wide text-amber-400">
              آماده استعلام فنی یا برآورد سریع هستید؟
            </p>
            <h2
              id="closing-cta-heading"
              className="mt-2 text-2xl font-extrabold text-ink-inverse sm:text-3xl"
            >
              از محاسبه ابعاد تا تولید مستقیم در کارخانه زنجان همراه شما هستیم
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              چه برای تعویض پنجره یک واحد مسکونی و چه برای تامین پکیج درب و پنجره
              پروژه‌های ساختمانی و معماری، می‌توانید برآورد اولیه را آنلاین دریافت
              کنید یا مستقیماً با دفتر فنی کارخانه در ارتباط باشید.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Link
              href="/configurator/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>شروع کانفیگوریتور هوشمند</span>
            </Link>

            <Link
              href="/about/#contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-surface-dark px-5 py-3.5 text-sm font-semibold text-ink-inverse transition-colors hover:border-amber-400 hover:text-amber-300"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>مشاوره مهندسی کارخانه</span>
            </Link>

            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
            >
              <Phone className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span dir="ltr" className="tabular-nums">
                {SITE_CONFIG.contact.phoneDisplay}
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
