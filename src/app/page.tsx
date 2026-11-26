import Link from "next/link";
import { ArrowUpLeft, CheckCircle2, Ruler, SlidersHorizontal } from "lucide-react";
import { PRODUCT_NAV_LINKS, SITE_CONFIG } from "@/lib/site-config";

const COLOR_TOKENS = [
  {
    name: "بوم اصلی (Surface)",
    hex: "#FFFFFF",
    swatchClass: "bg-surface border border-border",
    usage: "پس‌زمینه اصلی صفحات و بخش‌های محتوایی",
  },
  {
    name: "بوم ظریف (Surface Subtle)",
    hex: "#F8F9FA",
    swatchClass: "bg-surface-subtle border border-border",
    usage: "کارت‌های مشخصات فنی و پس‌زمینه ثانویه",
  },
  {
    name: "تیره معماری (Surface Dark)",
    hex: "#0B0E11",
    swatchClass: "bg-surface-dark border border-border-dark",
    usage: "فوتر، بخش‌های کنتراست بالا و دکمه‌های تیره",
  },
  {
    name: "برنز دقیق (Accent)",
    hex: "#B45309",
    swatchClass: "bg-accent",
    usage: "فراخوان اقدام اصلی (CTA) و نشانگرهای فعال",
  },
] as const;

const SAMPLE_SPECS = [
  { label: "عرض استاندارد دهانه", value: "۱۴۰ سانتی‌متر" },
  { label: "ارتفاع چهارچوب", value: "۲۲۰ سانتی‌متر" },
  { label: "ضخامت شیشه دوجداره", value: "۲۴ میلی‌متر (۴+۱۶+۴)" },
  { label: "شماره تماس کارخانه", value: SITE_CONFIG.contact.phoneDisplay },
] as const;

export default function Home() {
  return (
    <div className="bg-surface">
      {/* Architectural Shell Preview Banner */}
      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent-hover">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>پیش‌نمایش سیستم طراحی و پوسته RTL — زیرفاز ۱.۲</span>
          </div>

          <h1 className="mt-5 max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {SITE_CONFIG.name} — مهندسی دقیق درب و پنجره معماری
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base sm:leading-8">
            {SITE_CONFIG.tagline}
          </p>

          {/* Button System Preview */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/configurator/"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>دکمه اصلی (برآورد هوشمند)</span>
            </Link>

            <Link
              href="/products/"
              className="inline-flex items-center gap-2 rounded-xl bg-surface-dark px-5 py-3 text-sm font-semibold text-ink-inverse transition-colors hover:bg-surface-elevated"
            >
              <span>دکمه تیره معماری (محصولات)</span>
            </Link>

            <Link
              href="/non-existent-test/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
            >
              <span>بررسی صفحه ۴۰۴</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Typography Scale & Tabular Numbers */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:col-span-7">
            <p className="text-xs font-bold tracking-wide text-accent">
              سلسله‌مراتب تایپوگرافی (فونت محلی Estedad-FD)
            </p>

            <div className="mt-5 space-y-5 divide-y divide-border">
              <div className="pb-4">
                <span className="text-xs text-ink-muted">تیتر اصلی (H1)</span>
                <p className="mt-1 text-3xl font-extrabold text-ink">
                  پروفیل دوجداره uPVC و ترمال بریک
                </p>
              </div>

              <div className="pb-4">
                <span className="text-xs text-ink-muted">تیتر بخش (H2)</span>
                <h2 className="mt-1 text-2xl font-bold text-ink">
                  کنترل کیفیت ابعادی و مونتاژ صنعتی در کارخانه زنجان
                </h2>
              </div>

              <div className="pb-4">
                <span className="text-xs text-ink-muted">زیرتیتر (H3)</span>
                <h3 className="mt-1 text-lg font-semibold text-ink">
                  عایق‌بندی صوتی و حرارتی مطابق استانداردهای ساختمانی
                </h3>
              </div>

              <div>
                <span className="text-xs text-ink-muted">متن بدنه (Body)</span>
                <p className="mt-1 text-sm leading-7 text-ink-muted">
                  کلیه خطوط تولید گروه صنعتی سپنتا بدون وابستگی به فونت یا
                  سرورهای خارجی، با فونت فارسی استعداد و اعداد هم‌عرض جدول‌بندی
                  شده ارائه می‌شوند.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-subtle p-6 sm:p-8 lg:col-span-5">
            <div className="flex items-center gap-2 text-accent">
              <Ruler className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-bold">تست اعداد جدول‌بندی (Tabular Nums)</p>
            </div>

            <dl className="mt-5 space-y-4">
              {SAMPLE_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <dt className="text-xs font-medium text-ink-muted sm:text-sm">
                    {spec.label}
                  </dt>
                  <dd className="tabular-nums text-sm font-bold text-ink">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Color System Tokens */}
      <section className="border-t border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-ink">پالت رنگی معماری صنعتی</h2>
          <p className="mt-2 text-sm text-ink-muted">
            توکن‌های رنگ تعریف‌شده در سیستم طراحی Tailwind v4
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_TOKENS.map((token) => (
              <div
                key={token.hex}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className={`h-16 w-full rounded-xl ${token.swatchClass}`} />
                <p className="mt-3 text-sm font-bold text-ink">{token.name}</p>
                <p
                  dir="ltr"
                  className="mt-0.5 text-end font-mono text-xs text-ink-muted"
                >
                  {token.hex}
                </p>
                <p className="mt-2 text-xs leading-6 text-ink-muted">
                  {token.usage}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive Product Line Grid Preview */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">
              شبکه خطوط تولید ۷گانه (بررسی گرید واکنش‌گرا)
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              پیوندهای آماده جهت توسعه صفحات محصول در زیرفازهای بعدی
            </p>
          </div>
          <Link
            href="/products/"
            className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            مشاهده فهرست کامل محصولات
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCT_NAV_LINKS.map((item, idx) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent hover:bg-surface-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="tabular-nums rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-bold text-ink-muted group-hover:bg-accent-soft group-hover:text-accent-hover">
                  ۰{idx + 1}
                </span>
                <ArrowUpLeft
                  className="h-4 w-4 text-ink-muted transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-5">
                <h3 className="text-base font-bold text-ink">{item.title}</h3>
                <p
                  dir="ltr"
                  className="mt-1 text-end text-xs text-ink-muted tabular-nums"
                >
                  {item.href}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
