import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Layers,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  Phone,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { PROJECTS, getProjectBySlug } from "@/data/projects";
import { StaticImage } from "@/components/ui/StaticImage";

export const dynamicParams = false;

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.slug,
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
    return {
      title: "پروژه یافت نشد | گروه صنعتی سپنتا",
    };
  }

  return {
    title: `${project.title} (${project.city}) | گروه صنعتی سپنتا`,
    description: `${project.title} - ${project.systemUsed} در ${project.city}. چالش و راهکار مهندسی سپنتا.`,
    keywords: [
      project.title,
      project.city,
      project.systemUsed,
      "پروژه‌های پنجره دوجداره",
      "گروه صنعتی سپنتا",
    ],
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

  const otherProjects = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <div className="bg-canvas text-ink min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="مسیر راهنما"
          className="flex items-center gap-2 text-xs text-zinc-500 overflow-x-auto whitespace-nowrap pb-1"
        >
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            صفحه اصلی
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-zinc-400 shrink-0" />
          <Link href="/projects/" className="hover:text-zinc-950 transition-colors">
            پروژه‌ها و کارنامه اجرایی
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-zinc-400 shrink-0" />
          <span className="text-zinc-900 font-semibold">{project.title}</span>
        </nav>

        {/* Project Header Banner */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
              {project.categoryLabel}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-brass border border-brass/25">
              {project.city}
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200 tabular-nums">
              سال اجرا: {project.yearFa}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-600 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brass" />
              <span>موقعیت: {project.city}، {project.locationArea}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-zinc-500" />
              <span>سیستم: {project.systemUsed}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>حجم کار: {project.estimatedUnitsFa}</span>
            </div>
          </div>
        </div>

        {/* Main Hero Photo */}
        <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden border border-zinc-200 bg-zinc-900 shadow-sm">
          <StaticImage
            src={project.image}
            alt={project.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Engineering Deep Dive: Challenge vs Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Architectural Challenge */}
          <div className="p-6 sm:p-8 bg-zinc-50 border-s-4 border-s-amber-600 border border-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold">چالش معماری و موقعیت پروژه</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
              {project.architecturalChallenge}
            </p>
          </div>

          {/* Technical Solution */}
          <div className="p-6 sm:p-8 bg-zinc-50 border-s-4 border-s-eco-teal border border-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-eco-teal">
              <Sparkles className="w-5 h-5 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold">راهکار مهندسی و اجرایی سپنتا</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
              {project.technicalSolution}
            </p>
          </div>
        </div>

        {/* Key Highlights & Specifications */}
        <div className="p-6 sm:p-8 bg-white border border-zinc-200 space-y-5">
          <h2 className="text-lg font-bold text-zinc-950">
            شاخص‌های فنی و دستاوردهای اجرایی این پروژه
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.specHighlights.map((hl, idx) => (
              <div
                key={idx}
                className="p-4 bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-800"
              >
                <CheckCircle2 className="w-4 h-4 text-brass shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Conversion Call to Action */}
        <div className="p-8 sm:p-10 bg-obsidian text-white border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start">
            <h3 className="text-xl sm:text-2xl font-bold">
              پروژه‌ای با مشخصات مشابه در دست اجرا دارید؟
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              تیم فنی و مهندسی کارخانه سپنتا آماده محاسبه پیش‌فاکتور اولیه، بررسی نقشه‌های ابعادی و ارائه پیشنهاد پروفیل بهینه برای پروژه شماست.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/configurator/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brass hover:bg-brass-hover text-white text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>محاسبه‌گر آنلاین پروژه</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/about/#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/30 hover:border-white text-white text-xs sm:text-sm font-bold transition-colors"
            >
              <Phone className="w-4 h-4 text-brass" />
              <span>مشاوره و ارسال نقشه</span>
            </Link>
          </div>
        </div>

        {/* Related Projects Grid */}
        <div className="pt-10 border-t border-zinc-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950">
              سایر پروژه‌های اجراشده سپنتا
            </h2>
            <Link
              href="/projects/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brass hover:underline"
            >
              <span>مشاهده همه پروژه‌ها</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherProjects.map((op) => (
              <article
                key={op.id}
                className="border border-zinc-200 bg-white hover:border-zinc-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border-b border-zinc-200">
                    <StaticImage
                      src={op.image}
                      alt={op.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-bold text-brass">{op.city}</span>
                      <span className="tabular-nums font-semibold">{op.yearFa}</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-950 leading-snug">
                      {op.title}
                    </h3>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {op.architecturalChallenge}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs pt-3">
                  <span className="text-zinc-500 font-medium">{op.categoryLabel}</span>
                  <Link
                    href={`/projects/${op.slug}/`}
                    className="font-bold text-zinc-950 hover:text-brass transition-colors inline-flex items-center gap-1"
                  >
                    <span>جزئیات پروژه</span>
                    <span>←</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
