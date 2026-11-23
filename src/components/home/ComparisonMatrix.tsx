"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ComparisonRow {
  feature: string;
  upvc: string;
  thermal: string;
  isDifferent: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: "عایق‌بندی صوتی (کاهش سر و صدا)",
    upvc: "بسیار بالا (تا ۴۰ دسی‌بل) به دلیل ذات غیرفلزی uPVC",
    thermal: "بسیار بالا (تا ۴۴ دسی‌بل) با شیشه لمینت آکوستیک",
    isDifferent: false,
  },
  {
    feature: "استحکام در دهانه‌های غول‌پیکر (ارتفاع > ۳ متر)",
    upvc: "محدود به ابعاد استاندارد؛ نیاز به کتیبه در ارتفاع بالا",
    thermal: "فوق‌العاده بالا؛ امکان لنگه‌های لیفت‌اند‌اسلاید ۴۰۰ کیلویی",
    isDifferent: true,
  },
  {
    feature: "عایق حرارتی و قطع پل سرما",
    upvc: "ذاتاً نارسانا با پروفیل‌های ۵ کاناله داخلی",
    thermal: "دوخت مکانیکی تیغه‌های پلی‌آمید عایق ۲۵٪ الیاف شیشه",
    isDifferent: false,
  },
  {
    feature: "ظرافت بصری فریم (دید بیشتر شیشه)",
    upvc: "ضخامت دید متوسط (۷۰ میلی‌متر استاندارد)",
    thermal: "فوق‌العاده ظریف و مینیمال (سیستم‌های لنگه مخفی)",
    isDifferent: true,
  },
  {
    feature: "تنوع فینیش و رنگ",
    upvc: "سفید براق، آنتراسیت مات و لمینت‌های طرح چوب",
    thermal: "آنادایز نقرهای، سمباده‌ای، شامپاینی و پودری نامحدود",
    isDifferent: true,
  },
  {
    feature: "طول عمر و مقاومت در اقلیم سخت",
    upvc: "بیش از ۳۰ سال، بدون زنگ‌زدگی و پوسیدگی",
    thermal: "بیش از ۵۰ سال، بدون تغییر شکل در آفتاب شدید",
    isDifferent: true,
  },
  {
    feature: "رده بودجه و هزینه تمام‌شده",
    upvc: "کاملاً اقتصادی با بالاترین نسبت ارزش به قیمت",
    thermal: "سرمایه‌گذاری لوکس و مهندسی برای پروژه‌های شاخص",
    isDifferent: true,
  },
  {
    feature: "کاربرد ایده‌آل",
    upvc: "تعویض پنجره مسکونی، بازسازی و انبوه‌سازی",
    thermal: "نماهای مدرن، ویلاها و برج‌های بلندمرتبه",
    isDifferent: true,
  },
];

export function ComparisonMatrix() {
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const rows = onlyDifferences
    ? COMPARISON_DATA.filter((r) => r.isDifferent)
    : COMPARISON_DATA;

  return (
    <section className="py-20 lg:py-28 bg-zinc-50 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with difference toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-brass block">
              مقایسه فنی مقاطع
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              انتخاب میان دوجداره uPVC و آلومینیوم ترمال بریک
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed pt-1">
              تحلیل شفاف تفاوت‌های فنی، صلبیت سازه‌ای و هزینه سرمایه‌گذاری برای تصمیم‌گیری آگاهانه کارفرمایان و معماران.
            </p>
          </div>

          {/* Clean Toggle */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setOnlyDifferences(!onlyDifferences)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border rounded-[2px] transition-colors focus:outline-none min-h-[44px]",
                onlyDifferences
                  ? "bg-zinc-950 text-white border-zinc-950"
                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
              )}
            >
              <span>{onlyDifferences ? "نمایش همه موارد" : "نمایش فقط تفاوتها"}</span>
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  onlyDifferences ? "bg-brass" : "bg-zinc-400"
                )}
              />
            </button>
          </div>
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto bg-white border border-zinc-200 shadow-xs">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100/70 text-xs sm:text-sm font-bold text-zinc-900">
                <th className="py-4 px-5 sm:px-6 text-start w-1/3">معیار مقایسه</th>
                <th className="py-4 px-5 sm:px-6 text-start w-1/3 border-s border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span>پنجره دوجداره uPVC سپنتا</span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5">
                      اقتصادی
                    </span>
                  </div>
                </th>
                <th className="py-4 px-5 sm:px-6 text-start w-1/3 border-s border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span>آلومینیوم ترمال بریک سپنتا</span>
                    <span className="text-[11px] font-medium text-brass bg-amber-50 px-2 py-0.5">
                      لوکس
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs sm:text-sm text-zinc-700">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-4 px-5 sm:px-6 font-bold text-zinc-950 align-top">
                    {row.feature}
                  </td>
                  <td className="py-4 px-5 sm:px-6 border-s border-zinc-200 align-top leading-relaxed">
                    {row.upvc}
                  </td>
                  <td className="py-4 px-5 sm:px-6 border-s border-zinc-200 align-top leading-relaxed text-zinc-900">
                    {row.thermal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards (md:hidden space-y-4) */}
        <div className="md:hidden space-y-4">
          {rows.map((row, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 p-4 space-y-3">
              <h3 className="text-sm font-bold text-zinc-950 border-b border-zinc-100 pb-2">
                {row.feature}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="bg-zinc-50 p-2.5 rounded-[2px]">
                  <span className="font-bold text-zinc-900 block mb-1">uPVC سپنتا:</span>
                  <p className="text-zinc-600 leading-relaxed">{row.upvc}</p>
                </div>
                <div className="bg-amber-50/50 p-2.5 rounded-[2px] border border-amber-100/60">
                  <span className="font-bold text-brass block mb-1">ترمال بریک سپنتا:</span>
                  <p className="text-zinc-700 leading-relaxed">{row.thermal}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
