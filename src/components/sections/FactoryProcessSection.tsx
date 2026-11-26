import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { toPersianDigits } from "@/lib/persian-seo";

const PROCESS_STEPS = [
  {
    step: 1,
    title: "بررسی نیاز و برآورد شفاف",
    description:
      "محاسبه آنلاین ابعاد و تعرفه روز در کانفیگوریتور یا گفت‌وگوی مستقیم با مهندسان کارخانه زنجان.",
  },
  {
    step: 2,
    title: "اندازه‌گیری لیزری در محل",
    description:
      "برداشت میلی‌متری ابعاد دهانه‌ها توسط کارشناس فنی، کنترل شاقول و تایید نقشه ساخت نهایی.",
  },
  {
    step: 3,
    title: "تولید CNC در کارخانه زنجان",
    description:
      "برش دقیق، جاگذاری گالوانیزه ۱.۵ میلی‌متری، جوش حرارتی یا پانچ آلومینیوم و کنترل کیفیت خروج.",
  },
  {
    step: 4,
    title: "نصب اصولی و ضمانت مکتوب",
    description:
      "آب‌بندی با فوم پلی‌اورتان و چسب سیلیکون خنثی، رگلاژ یراق‌آلات و تحویل ضمانت‌نامه ۱۰ تا ۲۵ ساله.",
  },
] as const;

export function FactoryProcessSection() {
  return (
    <section
      aria-labelledby="process-heading"
      className="border-b border-border bg-surface py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="lg:col-span-5">
          <div className="border border-border-strong bg-canvas p-2.5">
            <div className="relative aspect-[16/11] w-full overflow-hidden border border-border bg-surface">
              <PictureImage
                imageKey="factory-line"
                alt="خط تولید و مونتاژ صنعتی درب و پنجره گروه صنعتی سپنتا در کارخانه زنجان"
                sizes="(max-width: 1024px) 100vw, 42vw"
                fill
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-border px-1 pt-2.5 text-xs text-ink-muted">
              <span className="font-bold text-charcoal">
                کارخانه مرکزی: شهرک صنعتی زنجان
              </span>
              <span className="tabular-nums font-semibold text-bronze">
                تحویل {toPersianDigits(10)} تا {toPersianDigits(25)} روز کاری
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-6 bg-bronze" aria-hidden="true" />
            <p className="text-xs font-medium tracking-wide text-ink-muted">
              ۰۵ — فرآیند تولید و اجرای شفاف کارخانه
            </p>
          </div>
          <h2
            id="process-heading"
            className="mt-2 text-2xl font-bold text-charcoal sm:text-3xl"
          >
            ۴ مرحله مشخص از اندازه‌گیری لیزری تا رگلاژ نهایی
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            تمامی مراحل برش، مونتاژ شیشه و تست یراق در کارخانه زنجان انجام
            می‌شود تا در محل ساختمان با کمترین معطلی و آب‌بندی کامل نصب شود.
          </p>

          <ol className="mt-7 grid grid-cols-1 border-t border-s border-border sm:grid-cols-2">
            {PROCESS_STEPS.map((item) => (
              <li
                key={item.step}
                className="border-e border-b border-border bg-canvas p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display tabular-nums inline-flex h-7 w-7 shrink-0 items-center justify-center bg-charcoal text-xs font-bold text-canvas">
                    {toPersianDigits(item.step).padStart(2, "۰")}
                  </span>
                  <h3 className="text-sm font-bold text-charcoal sm:text-base">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-xs leading-6 text-ink-muted sm:text-sm">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <Link
              href="/about/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal transition-colors hover:text-bronze"
            >
              <span>آشنایی با خطوط تولید و استانداردهای کارخانه زنجان</span>
              <ArrowUpLeft
                className="h-4 w-4 text-bronze"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
