import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpLeft,
  CheckCircle2,
  Layers,
  MapPin,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { ClosingCtaSection } from "@/components/sections/ClosingCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PictureImage } from "@/components/ui/PictureImage";
import { IMAGE_MANIFEST } from "@/data/image-manifest";
import { getProductBySlug } from "@/data/products";
import { getProjectBySlug, PROJECTS } from "@/data/projects";
import type { ProductLine } from "@/data/types";
import { buildCanonicalUrl, toPersianDigits } from "@/lib/persian-seo";
import {
  buildBreadcrumbSchema,
  ORGANIZATION_ID,
  persianYearToIsoDate,
} from "@/lib/schema";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamicParams = false;

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const canonical = buildCanonicalUrl(`/projects/${project.slug}/`);

  return {
    title: {
      absolute: project.seoTitle,
    },
    description: project.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: project.seoTitle,
      description: project.seoDescription,
      url: canonical,
      locale: "fa_IR",
      type: "article",
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const resolvedSystems = project.systemsUsed
    .map((sysSlug) => getProductBySlug(sysSlug))
    .filter((item): item is ProductLine => Boolean(item));

  const moreProjects = PROJECTS.filter((item) => item.slug !== project.slug).slice(
    0,
    3
  );

  const metadataCells = [
    {
      label: "شهر و استان",
      value: `${project.city}، ${project.province}`,
    },
    {
      label: "سال اجرا",
      value: project.year,
    },
    {
      label: "متراژ تقریبی",
      value: `${toPersianDigits(project.areaSqm)} مترمربع`,
    },
    {
      label: "سیستم‌های اجراشده",
      value: `${toPersianDigits(resolvedSystems.length)} خط تولید`,
    },
  ] as const;

  const canonical = buildCanonicalUrl(`/projects/${project.slug}/`);
  const imageUrl = `${SITE_CONFIG.siteUrl}${IMAGE_MANIFEST[project.imageKey].src}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: project.title,
        description: project.seoDescription,
        image: imageUrl,
        url: canonical,
        datePublished: persianYearToIsoDate(project.year),
        inLanguage: "fa-IR",
        contentLocation: {
          "@type": "Place",
          name: `${project.city}، ${project.province}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: project.city,
            addressRegion: project.province,
            addressCountry: "IR",
          },
        },
        author: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
      },
      buildBreadcrumbSchema([
        { name: "صفحه اصلی", pathname: "/" },
        { name: "پروژه‌ها", pathname: "/projects/" },
        { name: project.title, pathname: `/projects/${project.slug}/` },
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
              { label: "پروژه‌ها", href: "/projects/" },
              { label: project.title },
            ]}
          />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-6 bg-bronze" aria-hidden="true" />
                <span className="text-xs font-medium text-ink-muted">
                  پروژه {project.usageType}
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-charcoal sm:text-4xl">
                {project.title}
              </h1>

              {/* 4-cell Architectural Metadata Strip */}
              <dl className="mt-6 grid grid-cols-2 border-t border-s border-border bg-surface">
                {metadataCells.map((cell) => (
                  <div
                    key={cell.label}
                    className="border-e border-b border-border p-3.5"
                  >
                    <dt className="text-xs font-medium text-ink-muted">
                      {cell.label}
                    </dt>
                    <dd className="tabular-nums mt-1 text-sm font-extrabold text-charcoal">
                      {cell.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/configurator/"
                  className="inline-flex items-center gap-2 rounded-[3px] bg-charcoal px-5 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-charcoal-soft"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span>برآورد پروژه مشابه</span>
                </Link>

                <Link
                  href="/about/#contact"
                  className="inline-flex items-center gap-2 rounded-[3px] border border-border-strong bg-surface px-5 py-3 text-sm font-semibold text-charcoal transition-colors hover:border-charcoal"
                >
                  <span>مشاوره با کارخانه زنجان</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="border border-border bg-surface p-2.5">
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-border bg-surface-subtle">
                  <PictureImage
                    imageKey={project.imageKey}
                    alt={project.title}
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

      {/* 2. Engineering Case Study */}
      <section
        aria-labelledby="case-study-heading"
        className="border-b border-border bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="case-study-heading"
            className="text-xl font-extrabold text-ink sm:text-2xl"
          >
            بررسی مهندسی و جزئیات اجرای پروژه
          </h2>

          <div className="mt-6 grid grid-cols-1 border-t border-s border-border md:grid-cols-2">
            <div className="border-e border-b border-border bg-surface-subtle p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-charcoal">
                <Layers className="h-4 w-4 text-bronze" aria-hidden="true" />
                <h3>چالش فنی پروژه</h3>
              </div>
              <p className="mt-3 text-sm leading-8 text-ink-muted">
                {project.challenge}
              </p>
            </div>

            <div className="border-e border-b border-border bg-surface-subtle p-6">
              <div className="flex items-center gap-2 text-sm font-extrabold text-charcoal">
                <Wrench className="h-4 w-4 text-charcoal" aria-hidden="true" />
                <h3>راهکار مهندسی سپنتا</h3>
              </div>
              <p className="mt-3 text-sm leading-8 text-ink-muted">
                {project.solution}
              </p>
            </div>
          </div>

          <div className="mt-6 border border-border bg-surface p-6">
            <h3 className="text-sm font-extrabold text-charcoal sm:text-base">
              دستاوردها و نکات کلیدی اجرا
            </h3>
            <ul className="mt-4 grid grid-cols-1 border-t border-s border-border md:grid-cols-3">
              {project.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2.5 border-e border-b border-border bg-surface-subtle p-4 text-xs leading-6 text-ink sm:text-sm"
                >
                  <CheckCircle2
                    className="mt-1 h-4 w-4 shrink-0 text-bronze"
                    aria-hidden="true"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Systems Used in This Project */}
      <section
        aria-labelledby="systems-used-heading"
        className="border-b border-border bg-surface-subtle py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="systems-used-heading"
            className="text-xl font-extrabold text-charcoal sm:text-2xl"
          >
            سیستم‌های تولیدی استفاده‌شده در این پروژه
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            مشخصات فنی هر خط تولید اجراشده را بررسی کرده یا ابعاد پروژه خود را
            محاسبه کنید
          </p>

          <div className="mt-6 grid grid-cols-1 border-t border-s border-border md:grid-cols-2 lg:grid-cols-3">
            {resolvedSystems.map((system) => (
              <div
                key={system.slug}
                className="flex flex-col justify-between border-e border-b border-border bg-surface p-6"
              >
                <div>
                  <span className="border border-border bg-surface-subtle px-2 py-0.5 text-xs font-bold text-ink-muted">
                    {system.category}
                  </span>
                  <h3 className="mt-3 text-base font-extrabold text-charcoal">
                    {system.name}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-ink-muted">
                    {system.tagline}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                  <Link
                    href={`/products/${system.slug}/`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal hover:text-bronze"
                  >
                    <span>صفحه محصول</span>
                    <ArrowUpLeft
                      className="h-4 w-4 text-bronze"
                      aria-hidden="true"
                    />
                  </Link>

                  {system.configuratorEligible && system.configuratorKey && (
                    <Link
                      href={`/configurator/?product=${system.configuratorKey}`}
                      className="inline-flex items-center gap-1.5 rounded-[3px] border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-charcoal hover:border-charcoal"
                    >
                      <SlidersHorizontal
                        className="h-3.5 w-3.5 text-bronze"
                        aria-hidden="true"
                      />
                      <span>برآورد قیمت</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. More Executed Projects */}
      <section
        aria-labelledby="more-projects-heading"
        className="bg-surface py-12 md:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="more-projects-heading"
              className="text-xl font-extrabold text-charcoal sm:text-2xl"
            >
              سایر پروژه‌های اجراشده سپنتا
            </h2>
            <Link
              href="/projects/"
              className="text-sm font-semibold text-charcoal hover:text-bronze"
            >
              بازگشت به گالری پروژه‌ها
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 border-t border-s border-border md:grid-cols-3">
            {moreProjects.map((other) => (
              <Link
                key={other.slug}
                href={`/projects/${other.slug}/`}
                className="group flex flex-col border-e border-b border-border bg-surface-subtle transition-colors hover:bg-surface"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border">
                  <PictureImage
                    imageKey={other.imageKey}
                    alt={other.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    fill
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin
                        className="h-3.5 w-3.5 text-bronze"
                        aria-hidden="true"
                      />
                      <span>{other.city}</span>
                    </span>
                    <span className="tabular-nums font-bold text-charcoal">
                      {toPersianDigits(other.areaSqm)} مترمربع
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-extrabold text-charcoal group-hover:text-bronze sm:text-base">
                    {other.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ClosingCtaSection />
    </>
  );
}
