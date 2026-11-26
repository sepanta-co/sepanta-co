import Link from "next/link";
import { Factory, LayoutGrid, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { toPersianDigits } from "@/lib/persian-seo";

const HERO_STATS = [
  {
    value: `${toPersianDigits(7)} خط تولید`,
    label: "از پروفیل uPVC تا چهارچوب فلزی",
  },
  {
    value: `${toPersianDigits(1)} روز کاری`,
    label: "تعویض پنجره بدون تخریب نما",
  },
  {
    value: "تامین سراسری",
    label: "کارخانه زنجان و نصب در کل کشور",
  },
] as const;

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border bg-surface bg-[linear-gradient(to_right,#e2e8f040_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f040_1px,transparent_1px)] bg-[size:48px_48px]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:gap-12 lg:px-8">
        {/* Text Column */}
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent-hover">
            <Factory className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>کارخانه صنعتی سپنتا — زنجان، ارسال و نصب سراسری</span>
          </div>

          <h1
            id="hero-heading"
            className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.25]"
          >
            تولید مستقیم درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-8 text-ink-muted sm:text-base">
            تولید دقیق با خطوط برش و جوش CNC در کارخانه زنجان، اندازه‌گیری لیزری
            و نصب استاندارد در سراسر کشور همراه با ضمانت مکتوب{" "}
            <span className="tabular-nums font-semibold text-ink">
              {toPersianDigits(10)} تا {toPersianDigits(25)}
            </span>{" "}
            ساله اصالت پروفیل و عملکرد فنی.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/configurator/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>برآورد و پیکربندی هوشمند</span>
            </Link>

            <Link
              href="/products/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
            >
              <LayoutGrid className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>مشاهده ۷ خط تولید</span>
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
              فروش مستقیم از کارخانه بدون واسطه • مناسب پروژه‌های ساختمانی و بازسازی
            </span>
          </div>
        </div>

        {/* Framed Obsidian Visual Column */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-border-dark bg-surface-dark p-3 shadow-xl sm:p-4">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-elevated">
              <PictureImage
                imageKey="hero-architecture"
                alt="نمای معماری مدرن مجهز به درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک گروه صنعتی سپنتا"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                fill
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-xl border border-border-dark bg-surface-elevated px-3.5 py-3 text-start"
                >
                  <p className="tabular-nums text-sm font-bold text-amber-400">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-300">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
