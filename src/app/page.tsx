import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, CheckCircle2 } from "lucide-react";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { ClosingCtaSection } from "@/components/sections/ClosingCtaSection";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { FactoryProcessSection } from "@/components/sections/FactoryProcessSection";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductsGridSection } from "@/components/sections/ProductsGridSection";
import { PictureImage } from "@/components/ui/PictureImage";
import { GENERAL_FAQS } from "@/data/faqs";
import { buildCanonicalUrl, toPersianDigits } from "@/lib/persian-seo";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_CONFIG.name} | تولیدکننده درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک`,
  },
  description: SITE_CONFIG.tagline,
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
};

const RETROFIT_BENEFITS = [
  "نصب مستقیم فریم بازسازی روی چهارچوب فلزی قبلی بدون تخریب سنگ نما، کاغذدیواری یا گچ‌کاری",
  `تکمیل تعویض کل پنجره‌های یک واحد مسکونی متعارف در ${toPersianDigits(1)} روز کاری با کمترین گردوغبار`,
  "کاهش محسوس صدای خیابان و اتلاف گرمایش و سرمایش بلافاصله پس از آب‌بندی و رگلاژ نهایی",
] as const;

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. 7 Production Lines Grid */}
      <ProductsGridSection />

      {/* 3. Non-Destructive Window Replacement Band */}
      <section
        aria-labelledby="retrofit-heading"
        className="border-b border-border bg-surface py-16 md:py-24"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold tracking-wide text-accent">
              بازسازی و نوسازی هوشمند ساختمان
            </p>
            <h2
              id="retrofit-heading"
              className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
            >
              تعویض پنجره‌های قدیمی بدون تخریب در یک روز کاری
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink-muted sm:text-base">
              اگر پنجره‌های فعلی ساختمان عایق نیستند، نیازی به عملیات بنایی و
              تخریب نما ندارید. با پروفیل بازسازی uPVC سپنتا، تغییر آرامش و
              عایق‌بندی خانه در کوتاه‌ترین زمان انجام می‌شود.
            </p>

            <ul className="mt-6 space-y-3.5">
              {RETROFIT_BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-sm leading-7 text-ink"
                >
                  <CheckCircle2
                    className="mt-1.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/configurator/?product=upvc"
                className="inline-flex items-center gap-2 rounded-xl bg-surface-dark px-5 py-3 text-sm font-semibold text-ink-inverse transition-colors hover:bg-surface-elevated"
              >
                <span>محاسبه هزینه تعویض پنجره</span>
                <ArrowUpLeft className="h-4 w-4 text-amber-400" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BeforeAfterSlider
              beforeSlot={
                <PictureImage
                  imageKey="renovation-before"
                  alt="وضعیت پنجره قدیمی آهنی یا تک‌جداره پیش از تعویض"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  fill
                />
              }
              afterSlot={
                <PictureImage
                  imageKey="renovation-after"
                  alt="نمای پنجره دوجداره uPVC سپنتا پس از تعویض بدون تخریب"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  fill
                />
              }
            />
          </div>
        </div>
      </section>

      {/* 4. Technical Decision Band (uPVC vs Thermal Break) */}
      <section
        aria-labelledby="comparison-heading"
        className="border-b border-border bg-surface-subtle py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-wide text-accent">
              راهنمای انتخاب مهندسی
            </p>
            <h2
              id="comparison-heading"
              className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
            >
              مقایسه فنی پنجره دوجداره uPVC و آلومینیوم ترمال بریک
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
              انتخاب بین uPVC و ترمال بریک به ابعاد دهانه، ارتفاع ساختمان، سطح
              عایق‌کاری مورد انتظار و بودجه پروژه بستگی دارد. اولویت خود را انتخاب
              کنید تا معیارهای کلیدی برجسته شوند.
            </p>
          </div>

          <div className="mt-8">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* 5. Factory Production & 4-Step Engineering Workflow */}
      <FactoryProcessSection />

      {/* 6. Featured Projects */}
      <FeaturedProjectsSection />

      {/* 7. Practical Buyer FAQs & Closing CTA */}
      <section
        aria-labelledby="faq-heading"
        className="border-b border-border bg-surface-subtle py-16 md:py-24"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wide text-accent">
                پرسش‌های متداول خریداران و سازندگان
              </p>
              <h2
                id="faq-heading"
                className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
              >
                پاسخ‌های روشن پیش از ثبت سفارش
              </h2>
            </div>

            <Link
              href="/about/#contact"
              className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              سوال تخصصی دارید؟ با ما تماس بگیرید
            </Link>
          </div>

          <div className="mt-8">
            <FaqAccordion items={GENERAL_FAQS.slice(0, 6)} />
          </div>
        </div>
      </section>

      <ClosingCtaSection />
    </>
  );
}
