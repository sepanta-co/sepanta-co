import Link from "next/link";
import { FileText, Phone, SlidersHorizontal } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function ClosingCtaSection() {
  return (
    <section
      aria-labelledby="closing-cta-heading"
      className="bg-anthracite py-16 text-ink-inverse md:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border border-border-dark bg-surface-elevated p-8 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-amber-400" aria-hidden="true" />
              <p className="text-xs font-bold tracking-wide text-amber-400">
                ارتباط مستقیم با دفتر فنی و کارخانه زنجان
              </p>
            </div>
            <h2
              id="closing-cta-heading"
              className="mt-3 text-2xl font-bold text-white sm:text-3xl"
            >
              از محاسبه ابعاد تا تولید، نصب و رگلاژ نهایی کنار شما هستیم
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              چه برای تعویض پنجره‌های یک واحد مسکونی و چه برای تامین پکیج درب و
              پنجره پروژه‌های ساختمانی و معماری، می‌توانید برآورد روز را آنلاین
              مشاهده کنید یا با واحد مهندسی کارخانه تماس بگیرید.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Link
              href="/configurator/"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep"
            >
              <SlidersHorizontal
                className="h-4 w-4"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span>پیکربندی و برآورد آنلاین</span>
            </Link>

            <Link
              href="/about/#contact"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] border border-slate-600 bg-anthracite px-5 py-3 text-sm font-bold text-white transition-colors hover:border-amber-400 hover:text-amber-300"
            >
              <FileText className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
              <span>ارسال نقشه به کارخانه</span>
            </Link>

            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
            >
              <Phone
                className="h-4 w-4 text-amber-400"
                strokeWidth={1.6}
                aria-hidden="true"
              />
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
