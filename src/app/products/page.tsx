import React from "react";
import Link from "next/link";
import { PRODUCTS, PRODUCT_CLUSTERS } from "@/data/products";
import { formatTomanRange, toPersianDigits } from "@/lib/format";
import { StaticImage } from "@/components/ui/StaticImage";

export const metadata = {
  title: "مشخصات فنی هفت خط تولید گروه صنعتی سپنتا",
  description:
    "کاتالوگ جامع ۷ خط تولید سپنتا: درب و پنجره uPVC، آلومینیوم ترمال بریک، شیشه بالکنی، توری کشویی، درب ضد سرقت، درب چوبی و چهارچوب فلزی.",
};

export default function ProductsPage() {
  return (
    <div className="w-full bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Page Top Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold text-brass block">
            کاتالوگ فنی کارخانه
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            مشخصات فنی هفت خط تولید گروه صنعتی سپنتا
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
            سیستم‌های بازشو و نما با دقیق‌ترین کنترل کیفیت، استاندارد ملی ایران و انطباق با رده‌های بین‌المللی RAL آلمان.
          </p>
        </div>

        {/* Clusters */}
        {PRODUCT_CLUSTERS.map((cluster) => {
          const clusterProducts = PRODUCTS.filter((p) => p.cluster === cluster.id);
          return (
            <section key={cluster.id} className="space-y-10">
              <div className="border-b border-zinc-200 pb-4">
                <span className="text-xs font-bold text-brass block">
                  خوشه صنعتی • {toPersianDigits(clusterProducts.length)} خط تولید
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 pt-1">
                  {cluster.title}
                </h2>
                <p className="text-sm text-zinc-500 pt-1 max-w-2xl">
                  {cluster.description}
                </p>
              </div>

              {/* Products 2-column large editorial layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {clusterProducts.map((product) => {
                  return (
                    <article
                      key={product.id}
                      id={product.slug}
                      className="border border-zinc-200 bg-white hover:border-zinc-400 transition-colors flex flex-col justify-between scroll-mt-28"
                    >
                      <div>
                        {/* High-res Image Header 16:10 */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border-b border-zinc-200">
                          <StaticImage
                            src={product.image}
                            alt={product.persianTitle}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 space-y-5">
                          <div>
                            <div className="flex items-center justify-between pb-1">
                              <span className="text-xs font-bold text-brass">
                                {product.tag}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium">
                                ضمانت {toPersianDigits(product.warrantyYears)} ساله کتبی
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-950">
                              {product.persianTitle}
                            </h3>
                            <p className="font-mono text-xs text-zinc-400 pt-0.5">
                              {product.name}
                            </p>
                          </div>

                          <p className="text-sm text-zinc-600 leading-relaxed">
                            {product.fullDescription}
                          </p>

                          {/* Technical Specs Key-Value Table */}
                          <div className="bg-zinc-50 border border-zinc-200 divide-y divide-zinc-200 text-xs">
                            {product.acousticRating && (
                              <div className="flex items-center justify-between p-2.5">
                                <span className="text-zinc-500">شاخص افت آکوستیک:</span>
                                <span className="font-bold text-zinc-900">{product.acousticRating}</span>
                              </div>
                            )}
                            {product.thermalRating && (
                              <div className="flex items-center justify-between p-2.5">
                                <span className="text-zinc-500">ضریب انتقال حرارت (Uw):</span>
                                <span className="font-bold text-zinc-900">{product.thermalRating}</span>
                              </div>
                            )}
                            {product.profileSpecs.slice(0, 3).map((spec, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between p-2.5">
                                <span className="text-zinc-500">{spec.label}:</span>
                                <span className="font-medium text-zinc-900 text-end">{spec.value}</span>
                              </div>
                            ))}
                            {product.basePricePerSqmEstimated && (
                              <div className="flex items-center justify-between p-2.5 bg-amber-50/50">
                                <span className="text-zinc-700 font-bold">
                                  بازه برآورد {product.priceUnit}:
                                </span>
                                <span className="font-bold text-brass tabular-nums">
                                  {formatTomanRange(
                                    product.basePricePerSqmEstimated.min,
                                    product.basePricePerSqmEstimated.max
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Ideal Use Cases */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-xs font-bold text-zinc-700 block">
                              کاربردهای پیشنهادی در پروژه:
                            </span>
                            <ul className="text-xs text-zinc-600 space-y-1">
                              {product.idealUseCases.map((useCase, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-brass">▪</span>
                                  <span>{useCase}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom CTA */}
                      <div className="p-6 pt-0 border-t border-zinc-100 flex items-center justify-between">
                        {product.configuratorSystem ? (
                          <Link
                            href={`/configurator/?product=${product.configuratorSystem}`}
                            className="w-full inline-flex items-center justify-center py-2.5 text-xs font-bold text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors min-h-[44px]"
                          >
                            <span>پیکربندی ابعادی این سیستم</span>
                            <span className="ms-1.5 font-bold">←</span>
                          </Link>
                        ) : (
                          <Link
                            href="/about/#contact"
                            className="w-full inline-flex items-center justify-center py-2.5 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-[2px] transition-colors min-h-[44px]"
                          >
                            <span>استعلام تلفنی ابعاد سفارشی</span>
                            <span className="ms-1.5 font-bold">←</span>
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
