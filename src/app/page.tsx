import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { ClosingCtaSection } from "@/components/sections/ClosingCtaSection";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { FactoryProcessSection } from "@/components/sections/FactoryProcessSection";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductsGridSection } from "@/components/sections/ProductsGridSection";
import { WindowSelectorQuiz } from "@/components/sections/WindowSelectorQuiz";
import { JsonLd } from "@/components/seo/JsonLd";
import { PictureImage } from "@/components/ui/PictureImage";
import { GENERAL_FAQS } from "@/data/faqs";
import { buildCanonicalUrl } from "@/lib/persian-seo";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from "@/lib/schema";
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

const RENOVATION_GUARANTEES = [
  {
    code: "۰۱",
    text: "نصب در یک روز بدون تخریب دیوار، سنگ نما، کاشی و گچ‌کاری",
  },
  {
    code: "۰۲",
    text: "آب‌بندی استاندارد و چندمرحله‌ای با فوم پلی‌اورتان و چسب ماستیک",
  },
  {
    code: "۰۳",
    text: "جمع‌آوری فریم قدیمی، حمل ضایعات و تمیزکاری کامل محل پس از نصب",
  },
] as const;

export default function HomePage() {
  const homeUrl = buildCanonicalUrl("/");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      {
        "@type": "WebPage",
        "@id": `${homeUrl}#webpage`,
        url: homeUrl,
        name: `${SITE_CONFIG.name} | تولیدکننده درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک`,
        description: SITE_CONFIG.tagline,
        inLanguage: "fa-IR",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
      },
      buildFaqSchema(GENERAL_FAQS.slice(0, 6)),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero + 3 Persona Routing Paths */}
      <HeroSection />

      {/* 01. Editorial 7-Line Production Index */}
      <ProductsGridSection />

      {/* 02. Interactive 4-Question Quick Window Selector */}
      <WindowSelectorQuiz />

      {/* 03. Non-Destructive 1-Day Window Replacement Plate */}
      <section
        id="renovation"
        aria-labelledby="retrofit-heading"
        className="scroll-mt-24 border-b border-border bg-surface py-16 md:py-24"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-eco" aria-hidden="true" />
              <p className="text-xs font-bold tracking-wide text-eco">
                ۰۳ — تعویض یک‌روزه بدون تخریب
              </p>
            </div>
            <h2
              id="retrofit-heading"
              className="mt-2 text-2xl font-bold text-anthracite sm:text-3xl"
            >
              نوسازی پنجره‌های قدیمی بدون بنایی و آسیب به خانه
            </h2>
            <p className="mt-4 text-sm leading-8 text-ink-muted sm:text-[15px]">
              برای جایگزینی پنجره‌های آهنی یا تک‌جداره قدیمی، نیازی به تخریب
              سنگ نما یا کثیف‌کاری گچ نیست. فریم بازسازی uPVC سپنتا مستقیماً روی
              قاب موجود نصب و آب‌بندی می‌شود.
            </p>

            <ol className="mt-6 divide-y divide-border border border-border bg-canvas">
              {RENOVATION_GUARANTEES.map((item) => (
                <li key={item.code} className="flex items-start gap-3 p-4">
                  <span className="font-display tabular-nums mt-0.5 text-xs font-extrabold text-eco">
                    {item.code}
                  </span>
                  <span className="text-sm leading-6 text-anthracite">
                    {item.text}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7">
              <Link
                href="/configurator/?product=upvc"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[4px] bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
              >
                <span>محاسبه هزینه تعویض پنجره</span>
                <ArrowUpLeft
                  className="h-4 w-4 text-amber-400"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
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

      {/* 04. Engineering Comparison Ledger (uPVC vs Thermal Break) */}
      <section
        id="comparison"
        aria-labelledby="comparison-heading"
        className="border-b border-border bg-canvas py-16 md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-accent-deep" aria-hidden="true" />
              <p className="text-xs font-bold tracking-wide text-primary">
                ۰۴ — دفتر مقایسه مهندسی سیستم‌ها
              </p>
            </div>
            <h2
              id="comparison-heading"
              className="mt-2 text-2xl font-bold text-anthracite sm:text-3xl"
            >
              مقایسه فنی پنجره دوجداره uPVC و آلومینیوم ترمال بریک
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-[15px]">
              انتخاب صحیح میان uPVC و ترمال بریک به عرض دهانه، تراز سر‌و‌صدای
              محیط و بودجه ساخت بستگی دارد. اولویت پروژه خود را انتخاب کنید تا
              معیارهای تعیین‌کننده برجسته شوند.
            </p>
          </div>

          <div className="mt-8">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* 05. Factory Workflow & CNC Production */}
      <FactoryProcessSection />

      {/* 06. Featured Executed Projects */}
      <FeaturedProjectsSection />

      {/* 07. Practical Buyer FAQs */}
      <section
        aria-labelledby="faq-heading"
        className="border-b border-border bg-surface py-16 md:py-24"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-accent-deep" aria-hidden="true" />
                <p className="text-xs font-bold tracking-wide text-primary">
                  ۰۷ — پرسش‌های متداول خریداران و سازندگان
                </p>
              </div>
              <h2
                id="faq-heading"
                className="mt-2 text-2xl font-bold text-anthracite sm:text-3xl"
              >
                پاسخ‌های روشن پیش از اندازه‌گیری و سفارش
              </h2>
            </div>

            <Link
              href="/about/#contact"
              className="text-sm font-bold text-primary transition-colors hover:text-accent-deep"
            >
              سوال تخصصی دارید؟ با دفتر فنی تماس بگیرید
            </Link>
          </div>

          <div className="mt-8">
            <FaqAccordion items={GENERAL_FAQS.slice(0, 6)} />
          </div>
        </div>
      </section>

      {/* Closing Dark Anthracite Consultation Band */}
      <ClosingCtaSection />
    </>
  );
}
