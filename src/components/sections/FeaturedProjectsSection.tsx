import Link from "next/link";
import { ArrowUpLeft, MapPin } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import { PRODUCTS } from "@/data/products";
import { PROJECTS } from "@/data/projects";
import { toPersianDigits } from "@/lib/persian-seo";

const PRODUCT_TITLE_BY_SLUG = new Map(
  PRODUCTS.map((product) => [product.slug, product.shortName])
);

export function FeaturedProjectsSection() {
  const featuredProjects = PROJECTS.slice(0, 3);

  return (
    <section
      aria-labelledby="projects-heading"
      className="border-b border-border bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wide text-accent">
              نمونه پروژه‌های اجراشده
            </p>
            <h2
              id="projects-heading"
              className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl"
            >
              کارنامه اجرایی در زنجان، تهران و شهرهای همجوار
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
              از تعویض یک‌روزه پنجره در آپارتمان‌های مسکونی تا اجرای دهانه‌های قدی
              ترمال بریک در پروژه‌های ویلایی و برج‌های مسکونی.
            </p>
          </div>

          <Link
            href="/projects/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-subtle px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <span>مشاهده همه پروژه‌ها</span>
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <article
              key={project.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
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

              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2.5 py-1 font-semibold text-ink-muted">
                      <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      <span>
                        {project.city}، {project.province}
                      </span>
                    </span>

                    <span className="tabular-nums rounded-md bg-accent-soft px-2.5 py-1 font-bold text-accent-hover">
                      {toPersianDigits(project.areaSqm)} مترمربع
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-ink sm:text-lg">
                    {project.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
                    {project.solution}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.systemsUsed.map((slug) => (
                      <span
                        key={slug}
                        className="rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-ink"
                      >
                        {PRODUCT_TITLE_BY_SLUG.get(slug) ?? slug}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <Link
                    href={`/projects/${project.slug}/`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-accent"
                  >
                    <span>جزئیات پروژه</span>
                    <ArrowUpLeft className="h-4 w-4 text-accent" aria-hidden="true" />
                  </Link>
                  <span className="tabular-nums text-ink-muted">
                    {project.usageType} • {project.year}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
