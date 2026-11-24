"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PROJECTS, type ProjectCategory } from "@/data/projects";
import { StaticImage } from "@/components/ui/StaticImage";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<{ key: ProjectCategory | "all"; label: string }> = [
  { key: "all", label: "همه پروژه‌ها" },
  { key: "residential", label: "مسکونی و اداری" },
  { key: "villa", label: "ویلایی لوکس" },
  { key: "renovation", label: "بازسازی بدون تخریب" },
  { key: "mass-housing", label: "انبوه‌سازی" },
];

function ProjectsGallery() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "all">("all");

  const filteredProjects =
    activeCategory === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-10">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-[2px] transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brass",
                isActive
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              )}
            >
              <span>{cat.label}</span>
              <span className="ms-1.5 opacity-70 tabular-nums">
                ({toPersianDigits(
                  cat.key === "all"
                    ? PROJECTS.length
                    : PROJECTS.filter((p) => p.category === cat.key).length
                )})
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <article
            key={project.id}
            className="border border-zinc-200 bg-white hover:border-zinc-400 transition-colors flex flex-col justify-between shadow-xs"
          >
            <div>
              {/* Image at Top in aspect-[4/3] */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 border-b border-zinc-200">
                <StaticImage
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-bold text-brass">
                    {project.city} • {project.locationArea}
                  </span>
                  <span className="tabular-nums font-semibold">{project.yearFa}</span>
                </div>

                <div>
                  <span className="text-xs font-medium text-zinc-500 block mb-1">
                    {project.categoryLabel}
                  </span>
                  <h3 className="text-xl font-bold text-zinc-950 leading-snug">
                    {project.title}
                  </h3>
                </div>

                <div className="bg-zinc-50 p-3 border border-zinc-200 text-xs space-y-1">
                  <span className="text-zinc-500 block">سیستم اجراشده:</span>
                  <p className="font-bold text-zinc-900">{project.systemUsed}</p>
                  <p className="text-brass font-semibold pt-1">
                    حجم کار: {project.estimatedUnitsFa}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">چالش معماری: </span>
                    <span className="text-zinc-600 leading-relaxed">
                      {project.architecturalChallenge}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-700">راهکار مهندسی سپنتا: </span>
                    <span className="text-zinc-600 leading-relaxed">
                      {project.technicalSolution}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <ul className="text-xs text-zinc-600 space-y-1">
                    {project.specHighlights.map((hl, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-brass">✓</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-xs">
              <span className="text-zinc-500">پوشش سراسری:</span>
              <span className="font-bold text-zinc-900">تأمین و نصب توسط سپنتا</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="w-full bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-brass block">
            سوابق اجرایی کارخانه
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            پروژه‌های تأمین و اجراشده توسط گروه صنعتی سپنتا
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
            بیش از دو دهه اجرای پروژه‌های مسکونی مدرن، ویلاهای لوکس کوهستانی، انبوه‌سازی و تعویض پنجره بدون تخریب در زنجان و سراسر کشور.
          </p>
        </div>

        {/* Gallery */}
        <ProjectsGallery />

        {/* Consultation Callout */}
        <div className="bg-obsidian text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-2xl font-bold">پروژه ساختمانی یا بازسازی در دست اقدام دارید؟</h3>
            <p className="text-sm text-zinc-300">
              مهندسان فنی سپنتا برای محاسبه دقیق متراژ، انتخاب مقاطع و بازدید کارگاهی در خدمت شما هستند.
            </p>
          </div>
          <Link
            href="/about/#contact"
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors shrink-0 min-h-[44px]"
          >
            <span>ارسال اطلاعات پروژه و تماس</span>
            <span className="ms-2 font-bold">←</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
