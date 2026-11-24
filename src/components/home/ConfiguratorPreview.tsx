"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { WindowStudioSVG, type SystemType, type OpeningType } from "@/components/configurator/WindowStudioSVG";
import { toPersianDigits, formatTomanRange } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConfiguratorPreset {
  id: string;
  title: string;
  subtitle: string;
  system: SystemType;
  widthCm: number;
  heightCm: number;
  panes: number;
  openingType: OpeningType;
  baseEstimatedCost: number;
}

const PRESETS: ConfiguratorPreset[] = [
  {
    id: "residential-tilt-turn",
    title: "پنجره دوحالته مسکونی",
    subtitle: "ابعاد استاندارد ۱۸۰×۱۶۰ سانتیمتر با عایق‌بندی حداکثری",
    system: "upvc",
    widthCm: 180,
    heightCm: 160,
    panes: 2,
    openingType: "tilt-turn",
    baseEstimatedCost: 11200000,
  },
  {
    id: "villa-lift-slide",
    title: "لیفتانداسلاید ویلایی",
    subtitle: "دهانه شیشه‌ای وسیع ۳۲۰×۲۴۰ سانتیمتر با مقاومت سازه‌ای بالا",
    system: "thermal-break",
    widthCm: 320,
    heightCm: 240,
    panes: 2,
    openingType: "sliding",
    baseEstimatedCost: 65200000,
  },
  {
    id: "balcony-folding",
    title: "شیشه بالکنی تاشو",
    subtitle: "نمای چهارفصل ۳۰۰×۲۱۰ سانتیمتر با جمع‌شدن کامل در گوشه",
    system: "balcony-glass",
    widthCm: 300,
    heightCm: 210,
    panes: 4,
    openingType: "folding",
    baseEstimatedCost: 28350000,
  },
];

export function ConfiguratorPreview() {
  const [activePreset, setActivePreset] = useState<ConfiguratorPreset>(PRESETS[0]);

  const minPrice = Math.round((activePreset.baseEstimatedCost * 0.92) / 10000) * 10000;
  const maxPrice = Math.round((activePreset.baseEstimatedCost * 1.08) / 10000) * 10000;

  return (
    <section className="py-20 lg:py-28 bg-obsidian text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold text-brass block">
            محاسبه‌گر فنی سپنتا
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            ترسیم ابعادی دهانه و برآورد شفاف هزینه کارخانه
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed">
            الگوی مورد نظر خود را انتخاب کنید، مشخصات فنی مقطع را بررسی نمایید و با یک کلیک وارد استودیوی پیکربندی پیشرفته شوید.
          </p>
        </div>

        {/* 3 Clickable Presets on Obsidian */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === activePreset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActivePreset(preset)}
                className={cn(
                  "text-start p-5 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brass min-h-[44px]",
                  isSelected
                    ? "bg-zinc-900 border-brass shadow-md"
                    : "bg-zinc-950/80 border-white/10 hover:border-white/30 hover:bg-zinc-900/60"
                )}
              >
                <div className="flex items-center justify-between pb-2">
                  <span className="text-base font-bold text-white">
                    {preset.title}
                  </span>
                  {isSelected ? (
                    <span className="w-5 h-5 bg-brass text-white flex items-center justify-center rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 font-mono">
                      {toPersianDigits(preset.widthCm)}×{toPersianDigits(preset.heightCm)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {preset.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live CAD Drafting Panel (#FAFAFA) */}
        <div className="bg-[#FAFAFA] text-zinc-950 border border-zinc-300 p-6 sm:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* SVG Interactive Canvas */}
            <div className="lg:col-span-8 flex items-center justify-center">
              <WindowStudioSVG
                widthCm={activePreset.widthCm}
                heightCm={activePreset.heightCm}
                panes={activePreset.panes}
                hasTransom={false}
                transomHeightCm={45}
                system={activePreset.system}
                openingType={activePreset.openingType}
                frameColor="white"
              />
            </div>

            {/* Spec & Live Cost Breakdown */}
            <div className="lg:col-span-4 space-y-6 bg-white p-6 border border-zinc-200">
              <div className="border-b border-zinc-200 pb-4">
                <span className="text-xs font-bold text-brass block mb-1">
                  پیش‌نمایش ابعادی
                </span>
                <h3 className="text-xl font-bold text-zinc-950">
                  {activePreset.title}
                </h3>
                <p className="text-xs text-zinc-500 pt-0.5">
                  ابعاد: {toPersianDigits(activePreset.widthCm)} در {toPersianDigits(activePreset.heightCm)} سانتیمتر ({toPersianDigits(activePreset.panes)} لنگه)
                </p>
              </div>

              {/* Price Estimate Strip */}
              <div className="space-y-1.5 bg-amber-50/60 p-4 border border-amber-200/80">
                <span className="text-xs text-zinc-600 block">برآورد هزینه تمام‌شده کارخانه (±۸٪):</span>
                <div className="text-lg sm:text-xl font-extrabold text-brass tabular-nums">
                  {formatTomanRange(minPrice, maxPrice)}
                </div>
                <p className="text-[11px] text-zinc-500 pt-1">
                  شامل پروفیل، شیشه دوجداره استاندارد صنعتی، یراق‌آلات و لاستیک‌های آب‌بندی EPDM
                </p>
              </div>

              {/* Deep-link to Configurator */}
              <div>
                <Link
                  href={`/configurator/?product=${activePreset.system}&w=${activePreset.widthCm}&h=${activePreset.heightCm}&panes=${activePreset.panes}`}
                  className="w-full inline-flex items-center justify-center py-3.5 px-4 text-sm font-bold text-white bg-brass hover:bg-brass-hover rounded-[2px] transition-colors"
                >
                  <span>شخصی‌سازی این دهانه در محاسبه‌گر</span>
                  <ArrowLeft className="w-4 h-4 ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
