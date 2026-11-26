import { Suspense } from "react";
import type { Metadata } from "next";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { WindowConfigurator } from "@/components/configurator/WindowConfigurator";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { GENERAL_FAQS } from "@/data/faqs";
import { buildCanonicalUrl } from "@/lib/persian-seo";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  ORGANIZATION_ID,
} from "@/lib/schema";

const PAGE_TITLE = "کانفیگوریتور هوشمند ابعاد و مشخصات فنی";
const PAGE_DESCRIPTION =
  "ابزار مهندسی پیکربندی درب و پنجره دوجداره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی تاشو و توری پلیسه با پیش‌نمایش زنده SVG، محاسبه مساحت و خروجی برگه مشخصات A4.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonicalUrl("/configurator/"),
  },
  openGraph: {
    title: `${PAGE_TITLE} | گروه صنعتی سپنتا`,
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/configurator/"),
    locale: "fa_IR",
    type: "website",
  },
};

export default function ConfiguratorPage() {
  const canonical = buildCanonicalUrl("/configurator/");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${canonical}#webapp`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: canonical,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: "fa-IR",
        creator: { "@id": ORGANIZATION_ID },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IRR",
        },
      },
      buildFaqSchema(GENERAL_FAQS.slice(0, 4)),
      buildBreadcrumbSchema([
        { name: "صفحه اصلی", pathname: "/" },
        { name: "کانفیگوریتور هوشمند", pathname: "/configurator/" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="no-print border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <Breadcrumb
            items={[
              { label: "صفحه اصلی", href: "/" },
              { label: "کانفیگوریتور هوشمند" },
            ]}
          />

          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            پیکربندی و برآورد فنی درب و پنجره
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            سیستم تولیدی، ابعاد دهانه، تعداد لنگه و نوع بازشو را انتخاب کنید تا
            نقشه شماتیک، مساحت دقیق و لیست استعلام پروژه آماده ارسال به کارخانه
            زنجان شود.
          </p>
        </div>
      </section>

      <section
        aria-label="ابزار پیکربندی درب و پنجره"
        className="bg-surface py-10 md:py-14 print:py-0"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 print:max-w-none print:px-0">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-border bg-surface-subtle p-8 text-sm text-ink-muted">
                در حال بارگذاری ابزار پیکربندی فنی...
              </div>
            }
          >
            <WindowConfigurator />
          </Suspense>
        </div>
      </section>

      <section
        aria-labelledby="configurator-faq-heading"
        className="no-print border-t border-border bg-surface-subtle py-12 md:py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2
            id="configurator-faq-heading"
            className="text-xl font-extrabold text-ink sm:text-2xl"
          >
            سوالات متداول پیش از ثبت استعلام
          </h2>
          <div className="mt-6">
            <FaqAccordion items={GENERAL_FAQS.slice(0, 4)} />
          </div>
        </div>
      </section>
    </>
  );
}
