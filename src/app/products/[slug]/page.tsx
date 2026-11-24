import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Volume2,
  Thermometer,
  Layers,
  Wrench,
  CheckCircle2,
  SlidersHorizontal,
  Phone,
} from "lucide-react";
import { PRODUCTS, getProductBySlug } from "@/data/products";
import { StaticImage } from "@/components/ui/StaticImage";
import { toPersianDigits, formatTomanRange } from "@/lib/format";

export const dynamicParams = false;

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
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
    return {
      title: "محصول یافت نشد | گروه صنعتی سپنتا",
    };
  }

  return {
    title: `${product.persianTitle} | گروه صنعتی سپنتا`,
    description: product.shortDescription,
    keywords: [
      product.persianTitle,
      product.name,
      "گروه صنعتی سپنتا",
      "تولید در و پنجره دوجداره",
      "کارخانه زنجان",
    ],
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

  const relatedProducts = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

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
          <Link href="/products/" className="hover:text-zinc-950 transition-colors">
            محصولات کارخانه
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-zinc-400 shrink-0" />
          <span className="text-zinc-900 font-semibold">{product.persianTitle}</span>
        </nav>

        {/* Product Hero: Image + Overview Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Hero Image */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/10] sm:aspect-[16/10] w-full overflow-hidden border border-zinc-200 bg-zinc-900 shadow-sm">
              <StaticImage
                src={product.image}
                alt={product.persianTitle}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span>استاندارد کارخانه: ISO 9001:2015 و RAL-GZ 716/1</span>
              <span>کد سیستم: {product.id}</span>
            </div>
          </div>

          {/* Product Key Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {product.clusterName}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-brass border border-brass/25">
                  رده کیفی: {product.budgetTier}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-eco-teal border border-eco-teal/25">
                  {toPersianDigits(product.warrantyYears)} سال ضمانت کارخانه
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
                {product.persianTitle}
              </h1>
              <p className="text-xs sm:text-sm font-mono text-zinc-500 uppercase tracking-wide">
                {product.name}
              </p>
            </div>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Price & Unit Meta Box */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>مبنای برآورد قیمت:</span>
                <span className="font-bold text-zinc-900">{product.priceUnit}</span>
              </div>
              {product.basePricePerSqmEstimated && (
                <div className="flex items-baseline justify-between pt-1 border-t border-zinc-200">
                  <span className="text-xs text-zinc-600">بازه تخمینی هر مترمربع:</span>
                  <span className="text-sm sm:text-base font-bold text-brass tabular-nums">
                    {formatTomanRange(
                      product.basePricePerSqmEstimated.min,
                      product.basePricePerSqmEstimated.max
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Direct Primary Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {product.configuratorAvailable && product.configuratorSystem ? (
                <Link
                  href={`/configurator/?product=${product.configuratorSystem}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-white bg-brass hover:bg-brass-hover transition-colors shadow-xs min-h-[46px]"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>پیکربندی و محاسبه قیمت</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/about/#contact"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-white bg-obsidian hover:bg-zinc-800 transition-colors shadow-xs min-h-[46px]"
                >
                  <Phone className="w-4 h-4 text-brass" />
                  <span>استعلام و مشاوره فنی کارخانه</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/about/#contact"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 transition-colors min-h-[46px]"
              >
                <span>ارسال نقشه پروژه</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Metric Engineering Performance Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-zinc-200">
          <div className="p-4 bg-white border border-zinc-200 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Volume2 className="w-4 h-4 text-brass" />
              <span>کاهش صوت (Acoustic)</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-950">
              {product.acousticRating || "عایق استاندارد"}
            </p>
          </div>

          <div className="p-4 bg-white border border-zinc-200 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Thermometer className="w-4 h-4 text-brass" />
              <span>ضریب حرارتی (Uw)</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-950" dir="ltr">
              {product.thermalRating || "عایق بهینه"}
            </p>
          </div>

          <div className="p-4 bg-white border border-zinc-200 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-brass" />
              <span>گارانتی کتبی</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-950">
              {toPersianDigits(product.warrantyYears)} سال تضمین پروفیل
            </p>
          </div>

          <div className="p-4 bg-white border border-zinc-200 space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Layers className="w-4 h-4 text-brass" />
              <span>استاندارد بازدهی</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-950">
              مبحث ۱۹ مقررات ملی
            </p>
          </div>
        </div>

        {/* Full Engineering Specs & Architecture Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Description & Use Cases (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-950">
                بررسی تخصصی و معماری سیستم
              </h2>
              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                {product.fullDescription}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950">
                مزایای فنی و ویژگی‌های شاخص
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-zinc-50 border border-zinc-200 text-xs text-zinc-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-eco-teal shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ideal Use Cases */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-zinc-950">
                کاربردهای پیشنهادی در پروژه‌های ساختمانی
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
                {product.idealUseCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-3 border-s-2 border-s-brass bg-white border border-zinc-200">
                    <span className="text-brass font-bold">▪</span>
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Specs Tables (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-zinc-200 bg-white p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-200">
                <Wrench className="w-4 h-4 text-brass" />
                <h3 className="text-base font-bold text-zinc-950">
                  جدول مشخصات مقاطع و متریال
                </h3>
              </div>

              <dl className="divide-y divide-zinc-100 text-xs">
                {product.profileSpecs.map((spec, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <dt className="text-zinc-500">{spec.label}</dt>
                    <dd className="font-bold text-zinc-900 text-end max-w-[60%]">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {product.glassSpecs && product.glassSpecs.length > 0 && (
                <div className="pt-3 border-t border-zinc-200 space-y-2">
                  <span className="text-xs font-bold text-zinc-800 block">
                    مشخصات شیشه‌بندی قابل سفارش:
                  </span>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    {product.glassSpecs.map((glass, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-zinc-400">•</span>
                        <span>{glass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.hardwareSpecs && (
                <div className="pt-3 border-t border-zinc-200 space-y-1 text-xs">
                  <span className="font-bold text-zinc-800 block">یراق‌آلات استاندارد:</span>
                  <p className="text-zinc-600 leading-relaxed">{product.hardwareSpecs}</p>
                </div>
              )}
            </div>

            {/* Quick Consultation Banner */}
            <div className="p-6 bg-obsidian text-white border border-white/10 space-y-3">
              <span className="text-xs font-bold text-brass block">پشتیبانی مهندسی سپنتا</span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                جهت تطبیق ابعاد پنجره‌ها با نقشه‌های معماری فاز ۲ یا تعیین ضخامت شیشه‌های آکوستیک، با کارشناسان کارخانه تماس حاصل فرمایید.
              </p>
              <a
                href="tel:02433445566"
                className="inline-flex items-center gap-2 text-sm font-bold text-brass hover:underline"
              >
                <span>تماس با دفتر فنی:</span>
                <span dir="ltr" className="tabular-nums">۰۲۴-۳۳۴۴۵۵۶۶</span>
              </a>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="pt-10 border-t border-zinc-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950">
              سایر سیستم‌های تولیدی کارخانه
            </h2>
            <Link
              href="/products/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brass hover:underline"
            >
              <span>مشاهده تمام خطوط تولید</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <article
                key={rel.id}
                className="border border-zinc-200 bg-white hover:border-zinc-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border-b border-zinc-200">
                    <StaticImage
                      src={rel.image}
                      alt={rel.persianTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-semibold text-brass block">
                      {rel.clusterName}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950">
                      {rel.persianTitle}
                    </h3>
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {rel.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-zinc-100 flex items-center justify-between text-xs pt-3">
                  <span className="text-zinc-500 font-medium">{rel.budgetTier}</span>
                  <Link
                    href={`/products/${rel.slug}/`}
                    className="font-bold text-zinc-950 hover:text-brass transition-colors inline-flex items-center gap-1"
                  >
                    <span>بررسی مشخصات فنی</span>
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
