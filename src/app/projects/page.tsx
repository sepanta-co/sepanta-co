import type { Metadata } from "next";
import { Building2, Compass, Ruler } from "lucide-react";
import { ProjectsGalleryGrid } from "@/components/projects/ProjectsGalleryGrid";
import { ClosingCtaSection } from "@/components/sections/ClosingCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PRODUCTS } from "@/data/products";
import { PROJECTS } from "@/data/projects";
import { buildCanonicalUrl, toPersianDigits } from "@/lib/persian-seo";
import { buildBreadcrumbSchema, WEBSITE_ID } from "@/lib/schema";

const PAGE_TITLE = "پروژه‌های اجراشده";
const PAGE_DESCRIPTION =
  "گزارش فنی و نمونه پروژه‌های اجراشده گروه صنعتی سپنتا در زنجان، تهران، کرج، قزوین و تبریز شامل پنجره دوجداره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی و درب ضد سرقت.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: buildCanonicalUrl("/projects/"),
  },
  openGraph: {
    title: `${PAGE_TITLE} | گروه صنعتی سپنتا`,
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/projects/"),
    locale: "fa_IR",
    type: "website",
  },
};

export default function ProjectsGalleryPage() {
  const totalAreaSqm = PROJECTS.reduce((sum, item) => sum + item.areaSqm, 0);
  const productNames = Object.fromEntries(
    PRODUCTS.map((product) => [product.slug, product.shortName])
  );
  const canonical = buildCanonicalUrl("/projects/");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        url: canonical,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "fa-IR",
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "ItemList",
        itemListElement: PROJECTS.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.title,
          url: buildCanonicalUrl(`/projects/${project.slug}/`),
        })),
      },
      buildBreadcrumbSchema([
        { name: "صفحه اصلی", pathname: "/" },
        { name: "پروژه‌ها", pathname: "/projects/" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Header & Summary Strip */}
      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <Breadcrumb
            items={[
              { label: "صفحه اصلی", href: "/" },
              { label: "پروژه‌ها" },
            ]}
          />

          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            پروژه‌های اجراشده گروه صنعتی سپنتا
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-ink-muted sm:text-base">
            گزیده‌ای از پروژه‌های مسکونی، ویلایی، اداری و بازسازی بدون تخریب که
            در خط تولید کارخانه زنجان ساخته شده و توسط تیم‌های فنی سپنتا در
            زنجان، تهران، کرج، قزوین و تبریز نصب و رگلاژ شده‌اند.
          </p>

          {/* Compact Summary Metric Strip */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="tabular-nums text-lg font-extrabold text-ink">
                  {toPersianDigits(PROJECTS.length)} پروژه شاخص
                </p>
                <p className="text-xs text-ink-muted">
                  مسکونی، ویلایی، اداری و بازسازی
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                <Ruler className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="tabular-nums text-lg font-extrabold text-ink">
                  {toPersianDigits(totalAreaSqm.toLocaleString("en-US"))} مترمربع
                </p>
                <p className="text-xs text-ink-muted">
                  مجموع متراژ پروژه‌های مستندشده
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-hover">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-ink">نصب سراسری</p>
                <p className="text-xs text-ink-muted">
                  تولید در زنجان • اعزام تیم اجرایی
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Filter & Projects Grid */}
      <section
        aria-label="گالری پروژه‌های اجراشده"
        className="bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProjectsGalleryGrid projects={PROJECTS} productNames={productNames} />
        </div>
      </section>

      <ClosingCtaSection />
    </>
  );
}
