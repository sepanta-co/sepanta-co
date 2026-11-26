import Link from "next/link";
import { ArrowUpLeft, PhoneCall, SlidersHorizontal } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { toPersianDigits } from "@/lib/persian-seo";

const PERSONA_PATHS = [
  {
    index: "۰۱",
    title: "تعویض پنجره قدیمی بدون تخریب",
    description:
      "اجرای پروفیل بازسازی روی چهارچوب فعلی در یک روز کاری بدون آسیب به نما و گچ‌کاری",
    href: "/#renovation",
  },
  {
    index: "۰۲",
    title: "ساختمان نوساز و ویلا",
    description:
      "انتخاب مهندسی بین uPVC چندمحفظه و آلومینیوم ترمال بریک متناسب با دهانه و اقلیم پروژه",
    href: "/configurator/?product=thermal-break",
  },
  {
    index: "۰۳",
    title: "معماران، سازندگان و پروژه B2B",
    description:
      "تامین یکپارچه خطوط تولید کارخانه، ارسال فایل جدول بازشوها و مشاوره مستقیم دفتر فنی زنجان",
    href: "/about/#contact",
  },
] as const;

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-border bg-canvas"
    >
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 md:py-20 lg:px-8">
        {/* Asymmetric Split Architectural Hero (Start 7 cols / End 5 cols) */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Specification & Editorial Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-accent-deep" aria-hidden="true" />
              <p className="text-xs font-bold tracking-wide text-primary">
                کارخانه مستقیم زنجان · اجرای سراسری ایران
              </p>
            </div>

            <h1
              id="hero-heading"
              className="mt-5 text-3xl font-extrabold leading-[1.28] tracking-tight text-anthracite sm:text-4xl lg:text-[2.75rem]"
            >
              تولید مهندسی درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-ink-muted sm:text-base">
              از برش و جوش حرارتی CNC در کارخانه زنجان تا اندازه‌گیری لیزری در
              محل، آب‌بندی اصولی و تحویل ضمانت‌نامه مکتوب{" "}
              <span className="tabular-nums font-bold text-anthracite">
                {toPersianDigits(10)} تا {toPersianDigits(25)} ساله
              </span>
              ؛ ساخته‌شده برای سکوت بیشتر، اتلاف انرژی کمتر و دوام سال‌های طولانی.
            </p>

            {/* Dual Architectural CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/configurator/"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep"
              >
                <SlidersHorizontal
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span>شروع پیکربندی و برآورد آنلاین</span>
              </Link>

              <Link
                href="/about/#contact"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] border border-primary bg-surface px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <PhoneCall
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span>درخواست بازدید و مشاوره</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-xs text-ink-muted">
              <span className="tabular-nums font-bold text-eco">
                کاهش تراز صدا تا {toPersianDigits(40)} دسی‌بل
              </span>
              <span className="tabular-nums font-medium text-ink">
                ۷ خط تولید یکپارچه در شهرک صنعتی زنجان
              </span>
              <span className="tabular-nums font-medium text-ink">
                تحویل پروژه‌ای {toPersianDigits(10)} تا {toPersianDigits(25)} روز کاری
              </span>
            </div>
          </div>

          {/* Framed Architectural Visual Plate (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative border border-border-strong bg-surface p-2.5">
              {/* Architectural Corner Dimension Ticks */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 -start-1 h-2.5 w-2.5 border-t-2 border-s-2 border-primary"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 -end-1 h-2.5 w-2.5 border-t-2 border-e-2 border-primary"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 -start-1 h-2.5 w-2.5 border-b-2 border-s-2 border-primary"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 -end-1 h-2.5 w-2.5 border-b-2 border-e-2 border-primary"
              />

              <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-anthracite lg:aspect-[4/4.3]">
                <PictureImage
                  imageKey="hero-architecture"
                  alt="نمای معماری مدرن مجهز به درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک گروه صنعتی سپنتا"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                  fill
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border px-1 pt-2.5 text-xs">
                <span className="font-bold text-primary">
                  خط برش و جوش CNC · کنترل کیفیت زنجان
                </span>
                <span
                  dir="ltr"
                  className="tabular-nums font-mono text-[11px] font-bold text-eco"
                >
                  Uw 1.1 – 1.8 W/m²K
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Hero: 3 Tactile Architectural Persona Paths */}
        <div
          aria-label="مسیر سریع انتخاب سیستم بر اساس نوع نیاز"
          className="mt-12 grid grid-cols-1 border-t border-s border-border bg-surface md:grid-cols-3"
        >
          {PERSONA_PATHS.map((item) => (
            <Link
              key={item.index}
              href={item.href}
              className="group flex items-start justify-between gap-4 border-e border-b border-border p-5 transition-colors hover:bg-surface-warm/60 sm:p-6"
            >
              <div className="min-w-0">
                <span className="font-display tabular-nums inline-block text-xs font-extrabold text-accent-deep">
                  {item.index}
                </span>
                <h2 className="mt-1.5 text-sm font-bold text-anthracite transition-colors group-hover:text-primary sm:text-base">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-xs leading-6 text-ink-muted">
                  {item.description}
                </p>
              </div>
              <ArrowUpLeft
                className="mt-1 h-4 w-4 shrink-0 text-border-strong transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
