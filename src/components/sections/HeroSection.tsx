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
      <div className="mx-auto max-w-[1280px] px-4 pt-8 pb-12 sm:px-6 md:pt-12 md:pb-16 lg:px-8">
        {/* Asymmetric Split Architectural Hero (Start 7 cols / End 5 cols) */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Specification & Editorial Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-6 bg-bronze" aria-hidden="true" />
              <p className="text-xs font-medium tracking-wide text-ink-muted">
                کارخانه مستقیم زنجان · اجرای سراسری ایران
              </p>
            </div>

            <h1
              id="hero-heading"
              className="mt-3 text-3xl font-extrabold leading-[1.3] tracking-tight text-charcoal md:text-[42px]"
            >
              تولید مهندسی درب و پنجره دوجداره{" "}
              <span
                dir="ltr"
                className="inline-block font-bold tracking-tight text-[0.9em]"
              >
                uPVC
              </span>{" "}
              و آلومینیوم ترمال بریک
            </h1>

            <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.85] text-ink-muted">
              از برش و جوش حرارتی CNC در کارخانه زنجان تا اندازه‌گیری لیزری در
              محل، آب‌بندی اصولی و تحویل ضمانت‌نامه مکتوب{" "}
              <span className="tabular-nums font-semibold text-charcoal">
                {toPersianDigits(10)} تا {toPersianDigits(25)} ساله
              </span>
              ؛ ساخته‌شده برای سکوت بیشتر، اتلاف انرژی کمتر و دوام سال‌های طولانی.
            </p>

            {/* Dual Architectural CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/configurator/"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[3px] bg-charcoal px-6 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-[#2A2926]"
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
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[3px] border border-border-strong bg-surface px-5 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal"
              >
                <PhoneCall
                  className="h-4 w-4 shrink-0 text-ink-muted"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span>درخواست بازدید و مشاوره</span>
              </Link>
            </div>

            {/* Uniform Architectural Metrics Strip */}
            <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-border pt-5">
              <div>
                <dt className="font-display tabular-nums text-base font-bold text-charcoal sm:text-lg">
                  تا {toPersianDigits(40)} دسی‌بل
                </dt>
                <dd className="mt-0.5 text-xs text-ink-muted">کاهش تراز صدا</dd>
              </div>
              <div>
                <dt className="font-display tabular-nums text-base font-bold text-charcoal sm:text-lg">
                  {toPersianDigits(7)} خط تولید
                </dt>
                <dd className="mt-0.5 text-xs text-ink-muted">
                  کارخانه مستقیم زنجان
                </dd>
              </div>
              <div>
                <dt className="font-display tabular-nums text-base font-bold text-charcoal sm:text-lg">
                  {toPersianDigits(10)} تا {toPersianDigits(25)} سال
                </dt>
                <dd className="mt-0.5 text-xs text-ink-muted">
                  ضمانت‌نامه مکتوب
                </dd>
              </div>
            </dl>
          </div>

          {/* Framed Architectural Visual Plate (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-ink">
              <PictureImage
                imageKey="hero-architecture"
                alt="نمای معماری مدرن مجهز به درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک گروه صنعتی سپنتا"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
                fill
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-charcoal/85 px-4 py-2.5 text-xs text-canvas backdrop-blur-sm">
                <span className="font-medium">
                  خط برش و جوش CNC · کنترل کیفیت زنجان
                </span>
                <span
                  dir="ltr"
                  className="tabular-nums font-mono text-[11px] text-border-strong"
                >
                  Uw 1.1 – 1.8 W/m²K
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Hero: 3 Hairline-Divided Architectural Persona Paths */}
        <div
          aria-label="مسیر سریع انتخاب سیستم بر اساس نوع نیاز"
          className="mt-8 grid grid-cols-1 divide-y divide-border border border-border bg-surface md:mt-10 md:grid-cols-3 md:divide-x md:divide-y-0 md:divide-x-reverse"
        >
          {PERSONA_PATHS.map((item) => (
            <Link
              key={item.index}
              href={item.href}
              className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-surface-warm/60"
            >
              <div className="min-w-0">
                <span className="font-display tabular-nums inline-block text-xs font-bold text-bronze">
                  {item.index}
                </span>
                <h2 className="mt-1.5 text-sm font-bold text-charcoal transition-colors group-hover:text-bronze sm:text-[15px]">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs leading-6 text-ink-muted">
                  {item.description}
                </p>
              </div>
              <ArrowUpLeft
                className="mt-1 h-4 w-4 shrink-0 text-border-strong transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-bronze"
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
