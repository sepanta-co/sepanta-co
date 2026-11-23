"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { MoveHorizontal, Check } from "lucide-react";
import { StaticImage } from "@/components/ui/StaticImage";

export function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold text-brass block mb-2">
            نوسازی بدون بنایی
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
            تعویض پنجره آهنی و قدیمی بدون آسیب به گچ و نما
          </h2>
          <p className="text-zinc-600 text-base leading-relaxed pt-2">
            دیگر نیازی به کارهای بنایی، گردوخاک و آسیب به گچ‌بری و رنگ داخلی خانه نیست. با پروفیل‌های لبه‌دار بازسازی سپنتا، پنجره‌های قدیمی آهنی در یک روز کاری جایگزین می‌شوند.
          </p>
        </div>

        {/* Desktop lg:grid-cols-12: comparator FIRST (lg:col-span-7, right side in RTL), specs (lg:col-span-5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Comparator First (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative aspect-[4/3] w-full overflow-hidden select-none touch-none cursor-ew-resize bg-zinc-900 border border-zinc-300 shadow-md"
            >
              {/* Base Layer (LEFT): after-window.jpg */}
              <StaticImage
                src="/images/after-window.jpg"
                alt="بعد: پنجره دوجداره سپنتا"
                fill
                className="object-cover"
              />
              <span className="absolute left-4 bottom-4 z-10 pointer-events-none bg-obsidian/85 text-white text-xs font-medium px-3 py-1.5 backdrop-blur-sm border-s-2 border-s-eco-teal">
                بعد: پنجره دوجداره سپنتا
              </span>

              {/* Clipped Layer (RIGHT): before-window.jpg */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: `inset(0 0 0 ${sliderPos}%)`,
                }}
              >
                <StaticImage
                  src="/images/before-window.jpg"
                  alt="قبل: قاب آهنی قدیمی"
                  fill
                  className="object-cover"
                />
                <span className="absolute right-4 bottom-4 z-10 pointer-events-none bg-obsidian/85 text-white text-xs font-medium px-3 py-1.5 backdrop-blur-sm border-s-2 border-s-brass">
                  قبل: قاب آهنی قدیمی
                </span>
              </div>

              {/* Architectural Square Handle */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20 flex items-center justify-center"
                style={{
                  left: `${sliderPos}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="w-[2px] h-full bg-white shadow-sm" />
                <div className="absolute w-10 h-10 bg-obsidian text-white border border-white/80 shadow-lg flex items-center justify-center">
                  <MoveHorizontal className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Accessible Range Input */}
            <div dir="ltr" className="w-full px-1">
              <input
                type="range"
                min={5}
                max={95}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="تنظیم درصد مقایسه پنجره قبل و بعد"
                className="w-full accent-brass cursor-pointer"
              />
            </div>
          </div>

          {/* Technical Specs & Value Proposition (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              <div className="py-4 flex items-start gap-3">
                <span className="w-5 h-5 bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">حفظ ۱۰۰٪ گچ و نمای بیرونی</h4>
                  <p className="text-xs text-zinc-500 pt-0.5 leading-relaxed">
                    برش تمیز پنجره قدیمی از روی قاب و نصب فریم بازسازی عایق روی اسکلت قبلی بدون بنایی.
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <span className="w-5 h-5 bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">کاهش تا ۷۰٪ آلودگی صوتی</h4>
                  <p className="text-xs text-zinc-500 pt-0.5 leading-relaxed">
                    شیشه‌های صنعتی دوجداره تزریق آرگون با افت صوتی تا ۴۰ دسی‌بل در برابر صدای خیابان.
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <span className="w-5 h-5 bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">حذف سوز سرما و ریزگردها</h4>
                  <p className="text-xs text-zinc-500 pt-0.5 leading-relaxed">
                    لاستیک‌های آب‌بندی سه‌لایه EPDM مقاوم در برابر تغییرات اقلیمی زمستان‌های سرد زنجان.
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <span className="w-5 h-5 bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-950">گارانتی ۱۵ ساله تعویض و خدمات</h4>
                  <p className="text-xs text-zinc-500 pt-0.5 leading-relaxed">
                    تضمین عدم تغییر رنگ و دفرمگی به همراه سرویس دوره‌ای رگلاژ یراق‌آلات.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about/#contact"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-[2px] transition-colors"
              >
                <span>درخواست کارشناسی و بازدید در محل</span>
                <span className="ms-2 font-bold">←</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
