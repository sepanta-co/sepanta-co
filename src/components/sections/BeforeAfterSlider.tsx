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
        className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle select-none shadow-sm"
      >
        {/* Base Layer: Before (Old Window) */}
        <div className="absolute inset-0">{beforeSlot}</div>

        {/* Overlay Layer: After (Sepanta uPVC) clipped from the end (right) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {afterSlot}
        </div>

        {/* Labels (explicit RTL inside LTR canvas) */}
        <span
          dir="rtl"
          className="pointer-events-none absolute top-3 start-3 z-10 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
        >
          پس از تعویض بدون تخریب — سپنتا
        </span>

        <span
          dir="rtl"
          className="pointer-events-none absolute top-3 end-3 z-10 rounded-lg bg-surface-dark/85 px-3 py-1.5 text-xs font-semibold text-ink-inverse backdrop-blur-xs"
        >
          قبل از تعویض — پنجره قدیمی
        </span>

        {/* Architectural Divider Line & Handle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(15,23,42,0.5)]"
          style={{ insetInlineStart: `${position}%` }}
        >
          <div className="absolute top-1/2 start-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-accent text-white shadow-lg">
            <MoveHorizontal className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        {/* Accessible Range Input for Pointer, Touch & Keyboard */}
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
        دستگیره مقایسه را بکشید یا از کلیدهای جهت‌نما برای مشاهده تغییر پنجره بدون تخریب نما استفاده کنید.
      </p>
    </div>
  );
}
