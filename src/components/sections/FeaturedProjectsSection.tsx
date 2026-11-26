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
      className="border-b border-border bg-canvas py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 bg-accent-deep" aria-hidden="true" />
              <p className="text-xs font-bold tracking-wide text-primary">
                ۰۶ — کارنامه پروژه‌های اجراشده
              </p>
            </div>
            <h2
              id="projects-heading"
              className="mt-2 text-2xl font-bold text-anthracite sm:text-3xl"
            >
              پروژه‌های مستندشده در زنجان، تهران و شهرهای همجوار
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
              مشخصات واقعی متراژ، سیستم مصرفی و چالش حل‌شده در پروژه‌های
              مسکونی، ویلایی و بازسازی بدون تخریب.
            </p>
          </div>

          <Link
            href="/projects/"
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[4px] border border-border-strong bg-surface px-4 py-2 text-sm font-bold text-anthracite transition-colors hover:border-primary hover:text-primary"
          >
            <span>مشاهده همه پروژه‌ها</span>
            <ArrowUpLeft
              className="h-4 w-4 text-accent-deep"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 border-t border-s border-border md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <article
              key={project.slug}
              className="group flex flex-col border-e border-b border-border bg-surface"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-canvas">
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
                    <span className="inline-flex items-center gap-1 font-bold text-ink-muted">
                      <MapPin
                        className="h-3.5 w-3.5 text-accent-deep"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                      <span>
                        {project.city}، {project.province}
                      </span>
                    </span>

                    <span className="tabular-nums border border-eco/25 bg-eco-soft px-2 py-0.5 font-bold text-eco">
                      {toPersianDigits(project.areaSqm)} مترمربع
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-anthracite sm:text-lg">
                    {project.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
                    {project.solution}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.systemsUsed.map((slug) => (
                      <span
                        key={slug}
                        className="border border-border bg-canvas px-2 py-0.5 text-[11px] font-bold text-ink"
                      >
                        {PRODUCT_TITLE_BY_SLUG.get(slug) ?? slug}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <Link
                    href={`/projects/${project.slug}/`}
                    className="inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-accent-deep"
                  >
                    <span>گزارش فنی پروژه</span>
                    <ArrowUpLeft
                      className="h-3.5 w-3.5 text-accent-deep"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </Link>

                  <span className="tabular-nums font-bold text-ink-muted">
                    {toPersianDigits(project.year)}
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
