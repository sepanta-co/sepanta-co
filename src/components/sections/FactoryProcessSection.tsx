import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { toPersianDigits } from "@/lib/persian-seo";

const PROCESS_STEPS = [
  {
    step: 1,
    title: "مشاوره و برآورد اولیه",
    description:
      "بررسی نیاز اقلیمی، نوع بازشو و ارائه برآورد شفاف در کانفیگوریتور هوشمند یا تماس مستقیم با مهندسان فروش.",
  },
  {
    step: 2,
    title: "اندازه‌گیری دقیق در محل",
    description:
      "اعزام کارشناس فنی به پروژه جهت برداشت لیزری ابعاد دهانه‌ها، کنترل شاقول و تراز و ثبت نقشه ساخت نهایی.",
  },
  {
    step: 3,
    title: "تولید CNC در کارخانه زنجان",
    description:
      "برش دقیق، جاگذاری گالوانیزه استاندارد، جوش حرارتی یا پانچ آلومینیوم و مونتاژ شیشه در خط تولید صنعتی سپنتا.",
  },
  {
    step: 4,
    title: "نصب استاندارد و صدور ضمانت‌نامه مکتوب",
    description:
      "نصب با فوم پلی‌اورتان و چسب سیلیکون خنثی، رگلاژ نهایی یراق‌آلات و تحویل شناسنامه فنی و ضمانت‌نامه مکتوب.",
  },
] as const;

export function FactoryProcessSection() {
  return (
    <section
      aria-labelledby="process-heading"
      className="border-b border-border bg-surface-subtle py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-border bg-surface p-3 shadow-sm">
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-surface-subtle">
              <PictureImage
                imageKey="factory-line"
                alt="خط تولید و مونتاژ صنعتی درب و پنجره گروه صنعتی سپنتا در کارخانه زنجان"
                sizes="(max-width: 1024px) 100vw, 42vw"
                fill
              />
            </div>
            <div className="mt-3 flex items-center justify-between px-2 pb-1 text-xs text-ink-muted">
              <span>کارخانه مرکزی: شهرک صنعتی زنجان</span>
              <span className="tabular-nums font-semibold text-accent">
                تحویل {toPersianDigits(10)} تا {toPersianDigits(25)} روز کاری
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p className="text-xs font-bold tracking-wide text-accent">
            فرآیند شفاف از کارخانه تا نصب
          </p>
          <h2
            id="process-heading"
            className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
          >
            ۴ مرحله استاندارد تولید، کنترل کیفیت و اجرا
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            تمامی مراحل ساخت در کارخانه زنجان تحت نظارت واحد کنترل کیفیت انجام
            می‌شود تا در محل پروژه بدون اتلاف وقت و با آب‌بندی کامل نصب شود.
          </p>

          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROCESS_STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="tabular-nums inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-dark text-xs font-bold text-amber-400">
                    {toPersianDigits(item.step)}
                  </span>
                  <h3 className="text-sm font-bold text-ink sm:text-base">
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
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              <span>آشنایی با خطوط تولید کارخانه زنجان</span>
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
