"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { PRODUCTS, type ProductItem } from "@/data/products";
import { StaticImage } from "@/components/ui/StaticImage";
import { toPersianDigits, formatTomanRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductShowcase() {
  const [activeId, setActiveId] = useState<string>(PRODUCTS[0].id);
  const activeProduct: ProductItem =
    PRODUCTS.find((p) => p.id === activeId) || PRODUCTS[0];

  const windowsFacadeProducts = PRODUCTS.filter((p) => p.cluster === "windows-facade");
  const doorsFramesProducts = PRODUCTS.filter((p) => p.cluster === "doors-frames");

  const tabListId = useId();

  const handleKeyDown = (e: React.KeyboardEvent, currentId: string) => {
    const allIds = PRODUCTS.map((p) => p.id);
    const currentIndex = allIds.indexOf(currentId);

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % allIds.length;
      setActiveId(allIds[nextIndex]);
      const nextEl = document.getElementById(`prod-tab-${allIds[nextIndex]}`);
      nextEl?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + allIds.length) % allIds.length;
      setActiveId(allIds[prevIndex]);
      const prevEl = document.getElementById(`prod-tab-${allIds[prevIndex]}`);
      prevEl?.focus();
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <span className="text-xs font-bold text-brass block mb-2">
            خطوط تولید کارخانه سپنتا
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            هفت محصول ساختمانی، از بازشوی نما تا چهارچوب فلزی
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg pt-3 leading-relaxed">
            از پنجره‌های دوجداره و آلومینیوم ترمال بریک تا شیشه‌های مدولار بالکنی و درب‌های ساختمانی؛ تولید صنعتی مطابق با رده‌های استاندارد بین‌المللی.
          </p>
        </div>

        {/* Asymmetric Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left / Selector Column (5 cols) */}
          <div
            role="tablist"
            id={tabListId}
            aria-label="خطوط تولید کارخانه سپنتا"
            className="lg:col-span-5 flex flex-col border border-zinc-200 divide-y divide-zinc-200 bg-white"
          >
            {/* Cluster 1: Windows & Facade */}
            <div className="bg-zinc-50/80 px-4 py-2 border-b border-zinc-200 text-xs font-bold text-zinc-700">
              بازشو، نما و حفاظتی
            </div>
            {windowsFacadeProducts.map((prod) => {
              const isActive = prod.id === activeId;
              return (
                <button
                  key={prod.id}
                  id={`prod-tab-${prod.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`prod-panel-${prod.id}`}
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  onClick={() => setActiveId(prod.id)}
                  onKeyDown={(e) => handleKeyDown(e, prod.id)}
                  className={cn(
                    "text-start py-4 px-4 transition-colors flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-brass focus:ring-inset",
                    isActive
                      ? "bg-zinc-50 border-s-4 border-s-brass ps-3.5"
                      : "hover:bg-zinc-50/70"
                  )}
                >
                  <div className="space-y-0.5">
                    <span
                      className={cn(
                        "text-base font-bold transition-colors block",
                        isActive ? "text-zinc-950" : "text-zinc-700 group-hover:text-zinc-950"
                      )}
                    >
                      {prod.persianTitle}
                    </span>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {prod.tag}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "text-xs font-bold transition-transform duration-200",
                      isActive ? "text-brass translate-x-[-3px]" : "text-zinc-400 group-hover:text-zinc-700"
                    )}
                  >
                    ←
                  </span>
                </button>
              );
            })}

            {/* Cluster 2: Doors & Frames */}
            <div className="bg-zinc-50/80 px-4 py-2 border-t border-b border-zinc-200 text-xs font-bold text-zinc-700">
              درب ساختمانی و چهارچوب
            </div>
            {doorsFramesProducts.map((prod) => {
              const isActive = prod.id === activeId;
              return (
                <button
                  key={prod.id}
                  id={`prod-tab-${prod.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`prod-panel-${prod.id}`}
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  onClick={() => setActiveId(prod.id)}
                  onKeyDown={(e) => handleKeyDown(e, prod.id)}
                  className={cn(
                    "text-start py-4 px-4 transition-colors flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-brass focus:ring-inset",
                    isActive
                      ? "bg-zinc-50 border-s-4 border-s-brass ps-3.5"
                      : "hover:bg-zinc-50/70"
                  )}
                >
                  <div className="space-y-0.5">
                    <span
                      className={cn(
                        "text-base font-bold transition-colors block",
                        isActive ? "text-zinc-950" : "text-zinc-700 group-hover:text-zinc-950"
                      )}
                    >
                      {prod.persianTitle}
                    </span>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {prod.tag}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "text-xs font-bold transition-transform duration-200",
                      isActive ? "text-brass translate-x-[-3px]" : "text-zinc-400 group-hover:text-zinc-700"
                    )}
                  >
                    ←
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right / Visual Presentation Column (7 cols) */}
          <div
            id={`prod-panel-${activeProduct.id}`}
            role="tabpanel"
            aria-labelledby={`prod-tab-${activeProduct.id}`}
            className="lg:col-span-7 sticky top-28 space-y-5"
          >
            {/* 16:10 Image Container */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border border-zinc-200 shadow-sm">
              <StaticImage
                src={activeProduct.image}
                alt={activeProduct.persianTitle}
                fill
                className="object-cover"
              />
            </div>

            {/* Clean Typographic Caption Strip & Details */}
            <div className="bg-zinc-50 p-6 sm:p-7 border border-zinc-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-200 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-950">
                    {activeProduct.persianTitle}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono pt-0.5">
                    {activeProduct.name}
                  </p>
                </div>

                <div className="text-xs text-zinc-600 font-medium">
                  ضمانت کارخانه:{" "}
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {toPersianDigits(activeProduct.warrantyYears)} سال
                  </span>
                </div>
              </div>

              <p className="text-sm text-zinc-700 leading-relaxed">
                {activeProduct.shortDescription}
              </p>

              {/* Flat 3-col Hairline Spec Ledger */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 border border-zinc-200">
                  <span className="text-zinc-500 block text-[11px]">رده محصول:</span>
                  <span className="font-bold text-zinc-900 text-sm">
                    {activeProduct.budgetTier}
                  </span>
                </div>
                {activeProduct.acousticRating ? (
                  <div className="bg-white p-3 border border-zinc-200">
                    <span className="text-zinc-500 block text-[11px]">عایق صوتی:</span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {activeProduct.acousticRating}
                    </span>
                  </div>
                ) : (
                  <div className="bg-white p-3 border border-zinc-200">
                    <span className="text-zinc-500 block text-[11px]">واحد محاسبه:</span>
                    <span className="font-bold text-zinc-900 text-sm">
                      {activeProduct.priceUnit}
                    </span>
                  </div>
                )}
                {activeProduct.basePricePerSqmEstimated ? (
                  <div className="bg-white p-3 border border-zinc-200">
                    <span className="text-zinc-500 block text-[11px]">برآورد پایه ({activeProduct.priceUnit}):</span>
                    <span className="font-bold text-brass text-xs">
                      {formatTomanRange(
                        activeProduct.basePricePerSqmEstimated.min,
                        activeProduct.basePricePerSqmEstimated.max
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="bg-white p-3 border border-zinc-200">
                    <span className="text-zinc-500 block text-[11px]">کاربرد اصلی:</span>
                    <span className="font-bold text-zinc-900 line-clamp-1">
                      {activeProduct.idealUseCases[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {activeProduct.configuratorSystem ? (
                  <Link
                    href={`/configurator/?product=${activeProduct.configuratorSystem}`}
                    className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors"
                  >
                    <span>پیکربندی و برآورد قیمت</span>
                    <span className="ms-1.5 font-bold">←</span>
                  </Link>
                ) : (
                  <Link
                    href="/about/#contact"
                    className="inline-flex items-center justify-center px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-[2px] transition-colors"
                  >
                    <span>استعلام و مشاوره فنی ابعاد</span>
                    <span className="ms-1.5 font-bold">←</span>
                  </Link>
                )}

                <Link
                  href={`/products/${activeProduct.slug}/`}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-[2px] transition-colors"
                >
                  <span>صفحه اختصاصی و مشخصات فنی</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
