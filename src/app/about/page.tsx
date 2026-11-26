import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Cog,
  FileSpreadsheet,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { StaticInquiryForm } from "@/components/about/StaticInquiryForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PictureImage } from "@/components/ui/PictureImage";
import { PRODUCTS } from "@/data/products";
import { buildCanonicalUrl, toPersianDigits } from "@/lib/persian-seo";
import { SITE_CONFIG } from "@/lib/site-config";

const PAGE_TITLE = "کارخانه زنجان و تماس با ما";
const PAGE_DESCRIPTION =
  "معرفی خطوط تولید کارخانه گروه صنعتی سپنتا در زنجان، استانداردهای کنترل کیفیت CNC، شرایط ضمانت مکتوب و راه‌های تماس مستقیم با واحد فروش و مهندسی.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonicalUrl("/about/"),
  },
  openGraph: {
    title: `${PAGE_TITLE} | گروه صنعتی سپنتا`,
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/about/"),
    locale: "fa_IR",
    type: "website",
  },
};

const QUALITY_PILLARS = [
  {
    icon: Cog,
    title: "برش و جوش دقیق CNC",
    description:
      "برش زاویه ۴۵ درجه، تخلیه آب، شیارزنی یراق و جوش حرارتی چهارگوشه uPVC و پانچ آلومینیوم با دستگاه‌های کالیبره‌شده کارخانه‌ای انجام می‌شود.",
  },
  {
    icon: Layers,
    title: "انتخاب پروفیل و یراق استاندارد",
    description:
      "جاگذاری گالوانیزه تقویتی سراسری داخل فریم و لنگه همراه با یراق‌آلات معتبر تک‌حالته، دوحالته و لیفت اند اسلاید متناسب با وزن شیشه.",
  },
  {
    icon: ShieldCheck,
    title: "شیشه‌های دوجداره و سه‌جداره عایق",
    description:
      "تولید شیشه‌های دوجداره و سه‌جداره صنعتی با اسپیسر رطوبت‌گیر، تزریق گاز آرگون و امکان انتخاب شیشه لمینت آکوستیک یا سکوریت Low-E.",
  },
  {
    icon: CheckCircle2,
    title: "کنترل کیفیت پیش از ارسال",
    description:
      "کنترل گونیا بودن فریم‌ها، روانی حرکت اسپانیولت و قفل‌ها، تست درزگیرهای EPDM و بسته‌بندی ایمن پیش از بارگیری از زنجان.",
  },
] as const;

const WARRANTY_ITEMS = [
  `${toPersianDigits(10)} تا ${toPersianDigits(15)} سال ضمانت کتبی پروفیل در برابر تغییر رنگ، زردشدگی و دفرمگی`,
  "پوشش ضمانت یراق‌آلات مصرفی و ریل‌های استاندارد مطابق شناسنامه فنی هر سفارش",
  "ضمانت آب‌بندی نصب و خدمات رگلاژ دوره‌ای لنگه‌ها و اسپانیولت پس از تحویل پروژه",
  "ارائه پیش‌فاکتور شفاف شامل نوع پروفیل، ضخامت گالوانیزه، نوع شیشه و برند یراق‌آلات",
] as const;

export default function AboutAndContactPage() {
  const productOptions = PRODUCTS.map((product) => product.name);

  return (
    <>
      {/* 1. Factory Overview Hero */}
      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <Breadcrumb
            items={[
              { label: "صفحه اصلی", href: "/" },
              { label: "کارخانه و تماس" },
            ]}
          />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <span className="inline-block rounded-full border border-amber-200 bg-accent-soft px-3.5 py-1 text-xs font-semibold text-accent-hover">
                واحد تولیدی و دفتر فنی زنجان
              </span>

              <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
                کارخانه گروه صنعتی سپنتا — تولید مستقیم در زنجان، اجرای سراسری
              </h1>

              <p className="mt-4 text-sm leading-8 text-ink-muted sm:text-base">
                گروه صنعتی سپنتا به‌عنوان تولیدکننده تخصصی سیستم‌های درب و
                پنجره دوجداره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی، توری
                پلیسه و درب‌های ساختمانی، تمام مراحل طراحی نقشه ساخت، تولید و
                کنترل کیفیت را در کارخانه زنجان انجام می‌دهد و پروژه‌ها را در
                سراسر ایران به اجرا می‌رساند.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>ارتباط با واحد فنی و فروش</span>
                </a>

                <Link
                  href="/configurator/"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
                >
                  <SlidersHorizontal
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  <span>کانفیگوریتور هوشمند</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-border bg-surface p-3 shadow-sm">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-subtle">
                  <PictureImage
                    imageKey="factory-line"
                    alt="خط تولید صنعتی درب و پنجره گروه صنعتی سپنتا در زنجان"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    fill
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Production & Quality Standards */}
      <section
        aria-labelledby="standards-heading"
        className="border-b border-border bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-wide text-accent">
              استانداردهای خط تولید
            </p>
            <h2
              id="standards-heading"
              className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
            >
              ۴ رکن کیفیت در تولید و مونتاژ سپنتا
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {QUALITY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-border bg-surface-subtle p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-dark text-amber-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-ink-muted sm:text-sm">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Written Warranty & After-Sales Transparency */}
      <section
        aria-labelledby="warranty-heading"
        className="border-b border-border bg-surface-subtle py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border-dark bg-surface-dark p-6 text-ink-inverse sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-bold tracking-wide text-amber-400">
                  تعهد و پشتیبانی پس از فروش
                </p>
                <h2
                  id="warranty-heading"
                  className="mt-2 text-2xl font-extrabold text-ink-inverse sm:text-3xl"
                >
                  شفافیت ضمانت‌نامه مکتوب و خدمات رگلاژ
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  در گروه صنعتی سپنتا، تمامی تعهدات مربوط به نوع پروفیل،
                  ضخامت ورق گالوانیزه و یراق‌آلات به‌صورت دقیق در قرارداد ثبت
                  شده و پشتیبانی فنی پس از نصب ادامه دارد.
                </p>
              </div>

              <div className="lg:col-span-7">
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {WARRANTY_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 rounded-2xl border border-border-dark bg-surface-elevated p-4 text-xs leading-6 text-slate-200 sm:text-sm"
                    >
                      <CheckCircle2
                        className="mt-1 h-4 w-4 shrink-0 text-amber-400"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Contact & Consultation Section */}
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="scroll-mt-24 bg-surface py-12 md:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Start Column: Contact Details & Drawing Submission Guide */}
            <div className="space-y-6 lg:col-span-5">
              <div>
                <p className="text-xs font-bold tracking-wide text-accent">
                  ارتباط مستقیم با کارخانه
                </p>
                <h2
                  id="contact-heading"
                  className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
                >
                  نشانی کارخانه و مشاوره تخصصی
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  برای استعلام قیمت پروژه‌های ساختمانی، هماهنگی بازدید کارشناس
                  اندازه‌گیری یا ارسال نقشه‌های معماری با واحد فنی تماس بگیرید.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-border bg-surface-subtle p-6">
                <div className="flex items-start gap-3">
                  <MapPin
                    className="mt-1 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-bold text-ink">
                      نشانی کارخانه زنجان
                    </p>
                    <p className="mt-1 text-sm leading-7 text-ink-muted">
                      {SITE_CONFIG.contact.factoryAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone
                    className="mt-1 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-bold text-ink">
                      تلفن مستقیم فروش و فنی
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <a
                        href={SITE_CONFIG.contact.phoneHref}
                        dir="ltr"
                        className="tabular-nums text-sm font-bold text-ink hover:text-accent"
                      >
                        {SITE_CONFIG.contact.phoneDisplay}
                      </a>
                      <a
                        href={SITE_CONFIG.contact.mobileHref}
                        dir="ltr"
                        className="tabular-nums text-sm font-semibold text-ink-muted hover:text-accent"
                      >
                        {SITE_CONFIG.contact.mobileDisplay}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    className="mt-1 h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-bold text-ink">ساعات پاسخگویی</p>
                    <p className="tabular-nums mt-1 text-sm leading-7 text-ink-muted">
                      {SITE_CONFIG.contact.workingHours}
                    </p>
                  </div>
                </div>

                {SITE_CONFIG.contact.isPlaceholder && (
                  <p className="rounded-xl border border-amber-200 bg-accent-soft px-3.5 py-2.5 text-xs leading-6 text-accent-hover">
                    توجه: شماره‌های تماس و نشانی دقیق پلاک کارگاهی در نسخه فعلی
                    به‌صورت نمونه آزمایشی درج شده‌اند و پیش از انتشار نهایی با
                    اطلاعات رسمی شرکت جایگزین می‌شوند.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-sm font-bold text-ink">
                  <FileSpreadsheet
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  <span>نحوه ارسال نقشه معماری یا جدول بازشوها</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-ink-muted sm:text-sm">
                  اگر فایل اتوکد (DWG)، PDF جدول پنجره‌ها یا تصویر ابعاد
                  دهانه‌ها را دارید، فرم روبه‌رو را تکمیل کرده و فایل خود را
                  همراه با متن آماده در واتساپ کارخانه ارسال کنید تا برآورد دقیق
                  مهندسی صادر شود.
                </p>
              </div>
            </div>

            {/* End Column: Zero-Backend Static Inquiry Form */}
            <div className="lg:col-span-7">
              <StaticInquiryForm productOptions={productOptions} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
