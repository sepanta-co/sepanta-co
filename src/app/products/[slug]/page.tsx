import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpLeft,
  CheckCircle2,
  MapPin,
  Phone,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { ClosingCtaSection } from "@/components/sections/ClosingCtaSection";
import { FaqAccordion } from "@/components/sections/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PictureImage } from "@/components/ui/PictureImage";
import { ProductLivePriceCard } from "@/components/products/ProductLivePriceCard";
import { IMAGE_MANIFEST } from "@/data/image-manifest";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { PROJECTS } from "@/data/projects";
import { buildCanonicalUrl, toPersianDigits } from "@/lib/persian-seo";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  ORGANIZATION_ID,
} from "@/lib/schema";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamicParams = false;

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const canonical = buildCanonicalUrl(`/products/${product.slug}/`);

  return {
    title: {
      absolute: product.seoTitle,
    },
    description: product.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      url: canonical,
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProjects = PROJECTS.filter((project) =>
    project.systemsUsed.includes(product.slug)
  );
  const relatedProducts = PRODUCTS.filter(
    (item) => item.slug !== product.slug
  ).slice(0, 3);

  const canonical = buildCanonicalUrl(`/products/${product.slug}/`);
  const imageUrl = `${SITE_CONFIG.siteUrl}${IMAGE_MANIFEST[product.imageKey].src}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonical}#product`,
        name: product.name,
        description: product.seoDescription,
        image: imageUrl,
        url: canonical,
        category: product.category,
        brand: {
          "@type": "Brand",
          name: SITE_CONFIG.name,
        },
        manufacturer: {
          "@id": ORGANIZATION_ID,
        },
        additionalProperty: product.specs.map((spec) => ({
          "@type": "PropertyValue",
          name: spec.label,
          value: spec.value,
        })),
      },
      buildFaqSchema(product.faqs),
      buildBreadcrumbSchema([
        { name: "صفحه اصلی", pathname: "/" },
        { name: "محصولات", pathname: "/products/" },
        { name: product.name, pathname: `/products/${product.slug}/` },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* 1. Breadcrumb + Hero Split */}
      <section className="border-b border-border bg-surface-subtle">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <Breadcrumb
            items={[
              { label: "صفحه اصلی", href: "/" },
              { label: "محصولات", href: "/products/" },
              { label: product.name },
            ]}
          />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 bg-accent" aria-hidden="true" />
                <span className="text-xs font-bold text-brand">
                  {product.category}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm font-bold leading-7 text-brand sm:text-base">
                {product.tagline}
              </p>

              <p className="mt-4 text-sm leading-8 text-ink-muted sm:text-base">
                {product.summary}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                {product.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2.5 text-sm leading-7 text-ink"
                  >
                    <CheckCircle2
                      className="mt-1.5 h-4 w-4 shrink-0 text-eco"
                      aria-hidden="true"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <ProductLivePriceCard
                productSlug={product.slug}
                configuratorEligible={product.configuratorEligible}
                configuratorKey={product.configuratorKey}
              />

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                {product.configuratorEligible && product.configuratorKey ? (
                  <>
                    <Link
                      href={`/configurator/?product=${product.configuratorKey}`}
                      className="inline-flex items-center gap-2 rounded-[2px] bg-brand px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
                    >
                      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                      <span>برآورد هوشمند این سیستم</span>
                    </Link>

                    <Link
                      href="/about/#contact"
                      className="inline-flex items-center gap-2 rounded-[2px] border border-border bg-surface px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand"
                    >
                      <span>درخواست مشاوره کارخانه</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/about/#contact"
                      className="inline-flex items-center gap-2 rounded-[2px] bg-brand px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
                    >
                      <span>استعلام قیمت و سفارش تولید</span>
                      <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <a
                      href={SITE_CONFIG.contact.phoneHref}
                      className="inline-flex items-center gap-2 rounded-[2px] border border-border bg-surface px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand"
                    >
                      <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                      <span>تماس با واحد فروش</span>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-border bg-surface p-2.5">
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-border bg-surface-subtle">
                  <PictureImage
                    imageKey={product.imageKey}
                    alt={product.name}
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

      {/* 2. Technical Specifications Table */}
      <section
        aria-labelledby="specs-heading"
        className="border-b border-border bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2
            id="specs-heading"
            className="text-xl font-extrabold text-ink sm:text-2xl"
          >
            جدول مشخصات فنی و استاندارد ساخت
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            مقادیر فنی و گزینه‌های استاندارد تولید برای {product.shortName} در
            کارخانه زنجان
          </p>

          <div className="mt-6 overflow-hidden border border-border bg-surface">
            <table className="w-full border-collapse text-start">
              <tbody className="divide-y divide-border text-sm">
                {product.specs.map((spec) => (
                  <tr
                    key={spec.label}
                    className="flex flex-col sm:table-row odd:bg-surface-subtle/60"
                  >
                    <th
                      scope="row"
                      className="border-e border-border px-4 pt-3 pb-1 text-start text-xs font-bold text-ink sm:w-[34%] sm:px-6 sm:py-4 sm:text-sm"
                    >
                      {toPersianDigits(spec.label)}
                    </th>
                    <td className="tabular-nums px-4 pt-0 pb-3 text-sm leading-7 text-ink-muted sm:px-6 sm:py-4">
                      {toPersianDigits(spec.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Honest Engineering Trade-offs & Ideal Use Cases */}
      <section
        aria-labelledby="tradeoffs-heading"
        className="border-b border-border bg-surface-subtle py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="tradeoffs-heading"
            className="text-xl font-extrabold text-ink sm:text-2xl"
          >
            بررسی صادقانه مهندسی و کاربردهای پیشنهادی
          </h2>

          <div className="mt-6 grid grid-cols-1 border-t border-s border-border lg:grid-cols-3">
            {/* Pros */}
            <div className="border-e border-b border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <CheckCircle2 className="h-4 w-4 text-eco" aria-hidden="true" />
                <h3>مزایا و نقاط قوت مهندسی</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-muted">
                {product.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-eco" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="border-e border-b border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <AlertTriangle
                  className="h-4 w-4 text-accent"
                  aria-hidden="true"
                />
                <h3>محدودیت‌ها و نکات قابل توجه</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-muted">
                {product.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-slate-400" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideal For */}
            <div className="border-e border-b border-border bg-surface p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Target className="h-4 w-4 text-brand" aria-hidden="true" />
                <h3>کاربردهای پیشنهادی</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-ink-muted">
                {product.idealFor.map((useCase) => (
                  <li key={useCase} className="flex items-start gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-brand" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Related Executed Projects */}
      {relatedProjects.length > 0 && (
        <section
          aria-labelledby="related-projects-heading"
          className="border-b border-border bg-surface py-12 md:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2
                  id="related-projects-heading"
                  className="text-xl font-extrabold text-ink sm:text-2xl"
                >
                  پروژه‌های اجراشده با {product.shortName}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  نمونه‌های واقعی اجراشده از این خط تولید در شهرهای مختلف
                </p>
              </div>
              <Link
                href="/projects/"
                className="text-sm font-semibold text-accent hover:text-accent-hover"
              >
                مشاهده همه پروژه‌ها
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 border-t border-s border-border md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <article
                  key={project.slug}
                  className="group flex flex-col border-e border-b border-border bg-surface"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                    <PictureImage
                      imageKey={project.imageKey}
                      alt={project.title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      fill
                      className="transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 text-ink-muted">
                          <MapPin
                            className="h-3.5 w-3.5 text-accent"
                            aria-hidden="true"
                          />
                          <span>
                            {project.city}، {project.province}
                          </span>
                        </span>
                        <span className="tabular-nums font-bold text-accent">
                          {toPersianDigits(project.areaSqm)} مترمربع
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-base font-bold text-ink">
                        {project.title}
                      </h3>
                    </div>

                    <div className="mt-4 border-t border-border pt-3">
                      <Link
                        href={`/projects/${project.slug}/`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent"
                      >
                        <span>جزئیات پروژه</span>
                        <ArrowUpLeft
                          className="h-4 w-4 text-accent"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Product-Specific FAQs */}
      <section
        aria-labelledby="product-faq-heading"
        className="border-b border-border bg-surface-subtle py-12 md:py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2
            id="product-faq-heading"
            className="text-xl font-extrabold text-ink sm:text-2xl"
          >
            پرسش‌های متداول فنی درباره {product.shortName}
          </h2>
          <div className="mt-6">
            <FaqAccordion items={product.faqs} />
          </div>
        </div>
      </section>

      {/* 6. Related Production Lines */}
      <section
        aria-labelledby="related-products-heading"
        className="bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="related-products-heading"
              className="text-xl font-extrabold text-ink sm:text-2xl"
            >
              سایر خطوط تولید گروه صنعتی سپنتا
            </h2>
            <Link
              href="/products/"
              className="text-sm font-semibold text-accent hover:text-accent-hover"
            >
              بازگشت به کاتالوگ محصولات
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 border-t border-s border-border md:grid-cols-3">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.slug}
                href={`/products/${rel.slug}/`}
                className="group flex flex-col justify-between border-e border-b border-border bg-surface-subtle p-5 transition-colors hover:bg-surface"
              >
                <div>
                  <span className="border border-border bg-surface px-2 py-0.5 text-xs font-bold text-ink-muted">
                    {rel.category}
                  </span>
                  <h3 className="mt-3 text-base font-extrabold text-ink group-hover:text-brand">
                    {rel.name}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-ink-muted">
                    {rel.tagline}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand">
                  <span>مشاهده مشخصات فنی</span>
                  <ArrowUpLeft className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ClosingCtaSection />
    </>
  );
}
