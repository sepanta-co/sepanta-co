import Link from "next/link";
import { ArrowRight, LayoutGrid, SlidersHorizontal } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:py-24">
      <div className="w-full rounded-2xl border border-border bg-surface-subtle p-8 shadow-xs sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-accent-soft px-3.5 py-1 text-xs font-bold text-accent-hover tabular-nums">
          <span>خطای ۴۰۴</span>
          <span aria-hidden="true">•</span>
          <span>مسیر یافت نشد</span>
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          صفحه مورد نظر در وب‌سایت گروه صنعتی سپنتا یافت نشد
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-7 text-ink-muted sm:text-base">
          ممکن است نشانی وارد شده تغییر یافته باشد یا صفحه در حال حاضر در دسترس
          نباشد. از مسیرهای زیر می‌توانید به بخش‌های اصلی بازگردید.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-dark px-5 py-3 text-sm font-semibold text-ink-inverse transition-colors hover:bg-surface-elevated"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>

          <Link
            href="/products/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
          >
            <LayoutGrid className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>مشاهده محصولات</span>
          </Link>

          <Link
            href="/configurator/"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>کانفیگوریتور هوشمند</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
