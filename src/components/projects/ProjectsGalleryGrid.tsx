"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, MapPin, RotateCcw } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import type { ProjectCase } from "@/data/types";
import { toPersianDigits } from "@/lib/persian-seo";

export interface ProjectsGalleryGridProps {
  projects: ProjectCase[];
  productNames: Record<string, string>;
}

export function ProjectsGalleryGrid({
  projects,
  productNames,
}: ProjectsGalleryGridProps) {
  const [selectedUsage, setSelectedUsage] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const usageTypes = Array.from(new Set(projects.map((p) => p.usageType)));
  const cities = Array.from(new Set(projects.map((p) => p.city)));

  const filteredProjects = projects.filter((project) => {
    const matchesUsage =
      selectedUsage === "all" || project.usageType === selectedUsage;
    const matchesCity =
      selectedCity === "all" || project.city === selectedCity;
    return matchesUsage && matchesCity;
  });

  const resetFilters = () => {
    setSelectedUsage("all");
    setSelectedCity("all");
  };

  return (
    <div className="space-y-8">
      {/* Filter Controls */}
      <div className="space-y-4 border border-border bg-surface-subtle p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Usage Type Tabs */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-ink-muted">نوع کاربری پروژه</p>
            <div
              role="group"
              aria-label="فیلتر کاربری پروژه"
              className="inline-flex flex-wrap border-t border-s border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => setSelectedUsage("all")}
                aria-pressed={selectedUsage === "all"}
                className={`border-e border-b border-border px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm ${
                  selectedUsage === "all"
                    ? "bg-brand text-white"
                    : "bg-surface text-ink-muted hover:bg-surface-panel hover:text-ink"
                }`}
              >
                همه پروژه‌ها
              </button>

              {usageTypes.map((usage) => {
                const active = selectedUsage === usage;
                return (
                  <button
                    key={usage}
                    type="button"
                    onClick={() => setSelectedUsage(usage)}
                    aria-pressed={active}
                    className={`border-e border-b border-border px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm ${
                      active
                        ? "bg-brand text-white"
                        : "bg-surface text-ink-muted hover:bg-surface-panel hover:text-ink"
                    }`}
                  >
                    {usage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-ink-muted">شهر اجرا</p>
            <div
              role="group"
              aria-label="فیلتر شهر پروژه"
              className="inline-flex flex-wrap border-t border-s border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => setSelectedCity("all")}
                aria-pressed={selectedCity === "all"}
                className={`border-e border-b border-border px-3 py-2 text-xs font-bold transition-colors ${
                  selectedCity === "all"
                    ? "bg-accent text-white"
                    : "bg-surface text-ink-muted hover:bg-surface-panel hover:text-ink"
                }`}
              >
                همه شهرها
              </button>

              {cities.map((city) => {
                const active = selectedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    aria-pressed={active}
                    className={`border-e border-b border-border px-3 py-2 text-xs font-bold transition-colors ${
                      active
                        ? "bg-accent text-white"
                        : "bg-surface text-ink-muted hover:bg-surface-panel hover:text-ink"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-ink-muted">
          <p className="tabular-nums">
            نمایش{" "}
            <span className="font-bold text-ink">
              {toPersianDigits(filteredProjects.length)}
            </span>{" "}
            پروژه از مجموع {toPersianDigits(projects.length)} پروژه شاخص
          </p>

          {(selectedUsage !== "all" || selectedCity !== "all") && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 font-bold text-brand hover:text-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>پاک کردن فیلترها</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State or Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="border border-border bg-surface-subtle p-10 text-center">
          <p className="text-base font-extrabold text-ink">
            پروژه‌ای با ترکیب فیلتر انتخاب‌شده یافت نشد
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            برای مشاهده تمام پروژه‌های اجراشده در زنجان و سایر شهرها، فیلترها را
            بازنشانی کنید.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex items-center gap-2 rounded-[2px] bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>نمایش همه پروژه‌ها</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 border-t border-s border-border md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <article
              key={project.slug}
              className="group flex flex-col border-e border-b border-border bg-surface transition-colors hover:bg-surface-panel/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-surface-subtle">
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
                      <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                      <span>
                        {project.city}، {project.province}
                      </span>
                    </span>

                    <span className="tabular-nums border border-border bg-surface-panel px-2 py-0.5 font-bold text-brand">
                      {project.year} • {toPersianDigits(project.areaSqm)} مترمربع
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-extrabold text-ink sm:text-lg">
                    {project.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
                    {project.solution}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.systemsUsed.map((slug) => (
                      <span
                        key={slug}
                        className="border border-border bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-ink"
                      >
                        {productNames[slug] ?? slug}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <Link
                    href={`/projects/${project.slug}/`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-brand transition-colors hover:text-accent"
                  >
                    <span>مشاهده جزئیات پروژه</span>
                    <ArrowUpLeft className="h-4 w-4 text-accent" aria-hidden="true" />
                  </Link>
                  <span className="text-ink-muted">{project.usageType}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
