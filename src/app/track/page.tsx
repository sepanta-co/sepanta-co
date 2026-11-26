import { Suspense } from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { OrderTracker } from "@/components/track/OrderTracker";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { buildCanonicalUrl } from "@/lib/persian-seo";
import { buildBreadcrumbSchema, WEBSITE_ID } from "@/lib/schema";

const PAGE_TITLE = "پیگیری وضعیت سفارش و استعلام";
const PAGE_DESCRIPTION =
  "پیگیری آنلاین مراحل اندازه‌گیری، پیش‌فاکتور، تولید در کارخانه زنجان و نصب درب و پنجره با کد رهگیری اختصاصی گروه صنعتی سپنتا.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonicalUrl("/track/"),
  },
  openGraph: {
    title: `${PAGE_TITLE} | گروه صنعتی سپنتا`,
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/track/"),
    locale: "fa_IR",
    type: "website",
  },
};

export default function TrackOrderPage() {
  const canonical = buildCanonicalUrl("/track/");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "fa-IR",
        isPartOf: { "@id": WEBSITE_ID },
      },
      buildBreadcrumbSchema([
        { name: "صفحه اصلی", pathname: "/" },
        { name: "پیگیری سفارش", pathname: "/track/" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <Breadcrumb
            items={[
              { label: "صفحه اصلی", href: "/" },
              { label: "پیگیری سفارش" },
            ]}
          />

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            پیگیری وضعیت سفارش و استعلام پروژه
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            کد رهگیری اختصاصی (<span dir="ltr">SPN-XXXXXX</span>) و شماره تماس
            ثبت‌شده (یا ۴ رقم آخر آن) را وارد کنید تا آخرین وضعیت پرونده شما در
            خط تولید کارخانه زنجان نمایش داده شود.
          </p>
        </div>
      </section>

      <section className="bg-surface py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-border bg-surface-subtle p-8 text-sm text-ink-muted">
                در حال آماده‌سازی سامانه پیگیری سفارش...
              </div>
            }
          >
            <OrderTracker />
          </Suspense>
        </div>
      </section>
    </>
  );
}
