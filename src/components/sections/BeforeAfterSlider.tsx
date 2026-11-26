"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

export interface BeforeAfterSliderProps {
  beforeSlot: ReactNode;
  afterSlot: ReactNode;
}

export function BeforeAfterSlider({
  beforeSlot,
  afterSlot,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState<number>(52);

  return (
    <div className="space-y-3">
      <div
        dir="ltr"
        className="relative aspect-[16/10] w-full overflow-hidden border border-border-strong bg-canvas select-none"
      >
        {/* Base Layer: Before (Old Window) */}
        <div className="absolute inset-0">{beforeSlot}</div>

        {/* Overlay Layer: After (Sepanta uPVC) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {afterSlot}
        </div>

        {/* Architectural Corner Captions */}
        <span
          dir="rtl"
          className="pointer-events-none absolute top-3 start-3 z-10 border border-charcoal bg-surface/95 px-3 py-1 text-xs font-bold text-charcoal"
        >
          پس از تعویض بدون تخریب — سپنتا
        </span>

        <span
          dir="rtl"
          className="pointer-events-none absolute top-3 end-3 z-10 border border-border-dark bg-charcoal/90 px-3 py-1 text-xs font-bold text-canvas"
        >
          قبل از تعویض — پنجره قدیمی
        </span>

        {/* Crisp Architectural Divider & Tactile Grip */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 w-[2px] -translate-x-1/2 bg-white"
          style={{ insetInlineStart: `${position}%` }}
        >
          <div className="absolute top-1/2 start-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[3px] border-2 border-white bg-bronze text-white">
            <MoveHorizontal className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
          </div>
        </div>

        {/* Accessible Range Slider */}
        <input
          type="range"
          min={10}
          max={90}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="مقایسه وضعیت قبل و بعد از تعویض بدون تخریب پنجره قدیمی"
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      <p className="text-center text-xs text-ink-muted">
        خط جداکننده را بکشید یا از کلیدهای جهت‌نما برای مقایسه آب‌بندی و نمای پنجره پیش و پس از نصب استفاده کنید.
      </p>
    </div>
  );
}
