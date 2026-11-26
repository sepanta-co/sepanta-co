import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { WarrantyPortal } from "@/components/warranty/WarrantyPortal";
import { buildCanonicalUrl } from "@/lib/persian-seo";
import { buildBreadcrumbSchema, WEBSITE_ID } from "@/lib/schema";

const PAGE_TITLE = "اصالت گارانتی و درخواست رگلاژ";
const PAGE_DESCRIPTION =
  "بررسی آنلاین اصالت ضمانت‌نامه ۱۰ تا ۲۵ ساله درب و پنجره گروه صنعتی سپنتا و ثبت درخواست خدمات پس از فروش و رگلاژ دوره‌ای.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonicalUrl("/warranty/"),
  },
  openGraph: {
    title: `${PAGE_TITLE} | گروه صنعتی سپنتا`,
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/warranty/"),
    locale: "fa_IR",
    type: "website",
  },
};

export default function WarrantyPage() {
  const canonical = buildCanonicalUrl("/warranty/");
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
        { name: "اصالت گارانتی و رگلاژ", pathname: "/warranty/" },
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
              { label: "اصالت گارانتی و رگلاژ" },
            ]}
          />

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            پورتال اصالت ضمانت‌نامه و خدمات رگلاژ سپنتا
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            اصالت ضمانت‌نامه کارخانه‌ای خود را استعلام بگیرید و در صورت نیاز،
            درخواست رگلاژ یراق‌آلات یا بازدید فنی تیم پشتیبانی را ثبت نمایید.
          </p>
        </div>
      </section>

      <section className="bg-surface py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <WarrantyPortal />
        </div>
      </section>
    </>
  );
}
