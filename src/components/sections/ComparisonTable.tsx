"use client";

import { useState } from "react";
import { COMPARISON_ROWS } from "@/data/comparison";

type PriorityMode = "all" | "upvc" | "thermal";

const FILTER_OPTIONS: readonly {
  id: PriorityMode;
  label: string;
  highlightedMetrics: readonly string[];
}[] = [
  {
    id: "all",
    label: "نمایش کامل دفتر مقایسه",
    highlightedMetrics: [],
  },
  {
    id: "upvc",
    label: "اولویت: عایق صدا، حرارت و بودجه اقتصادی",
    highlightedMetrics: [
      "عایق حرارتی (ضریب انتقال حرارت Uw)",
      "عایق صوتی (کاهش تراز صدا dB)",
      "رده بودجه و توجیه اقتصادی",
    ],
  },
  {
    id: "thermal",
    label: "اولویت: دهانه بزرگ، شیشه سنگین و نمای مدرن",
    highlightedMetrics: [
      "تحمل ابعاد بزرگ و وزن شیشه‌های سنگین",
      "دوام و پایداری در اقلیم سرد و گرم ایران",
      "تنوع رنگ، بافت و ظاهر معماری",
    ],
  },
];

export function ComparisonTable() {
  const [mode, setMode] = useState<PriorityMode>("all");

  const activeFilter =
    FILTER_OPTIONS.find((item) => item.id === mode) ?? FILTER_OPTIONS[0];

  const isRowHighlighted = (metric: string) =>
    activeFilter.highlightedMetrics.includes(metric);

  return (
    <div className="space-y-6">
      {/* Priority Filter Buttons */}
      <div
        role="group"
        aria-label="فیلتر اولویت تصمیم‌گیری فنی"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTER_OPTIONS.map((option) => {
          const active = mode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              aria-pressed={active}
              className={`min-h-[40px] rounded-[3px] border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                active
                  ? "border-charcoal bg-charcoal text-canvas"
                  : "border-border-strong bg-surface text-ink hover:border-charcoal"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Desktop Engineering Specification Ledger */}
      <div className="hidden overflow-hidden border border-border bg-surface md:block">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border bg-surface-warm text-xs font-bold text-charcoal sm:text-sm">
              <th
                scope="col"
                className="w-[22%] border-e border-border px-5 py-4 text-start"
              >
                معیار مهندسی
              </th>
              <th
                scope="col"
                className={`w-[28%] border-e border-border px-5 py-4 text-start transition-colors ${
                  mode === "upvc" ? "bg-charcoal text-canvas" : ""
                }`}
              >
                پنجره دوجداره uPVC
              </th>
              <th
                scope="col"
                className={`w-[28%] border-e border-border px-5 py-4 text-start transition-colors ${
                  mode === "thermal" ? "bg-charcoal text-canvas" : ""
                }`}
              >
                آلومینیوم ترمال بریک
              </th>
              <th scope="col" className="w-[22%] px-5 py-4 text-start">
                جمع‌بندی انتخاب
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {COMPARISON_ROWS.map((row) => {
              const highlighted = isRowHighlighted(row.metric);
              return (
                <tr
                  key={row.metric}
                  className={`transition-colors ${
                    highlighted ? "bg-bronze-soft/55" : "hover:bg-canvas/70"
                  }`}
                >
                  <th
                    scope="row"
                    className="border-e border-border px-5 py-4 align-top text-start font-bold text-charcoal"
                  >
                    <span>{row.metric}</span>
                    {highlighted && (
                      <span className="mt-1.5 inline-block border border-bronze/30 bg-bronze-soft px-2 py-0.5 text-[11px] font-bold text-bronze-hover">
                        شاخص کلیدی اولویت شما
                      </span>
                    )}
                  </th>
                  <td
                    className={`border-e border-border px-5 py-4 align-top leading-7 text-ink-muted transition-colors ${
                      mode === "upvc"
                        ? "bg-surface-warm/60 font-semibold text-charcoal"
                        : ""
                    }`}
                  >
                    {row.upvc}
                  </td>
                  <td
                    className={`border-e border-border px-5 py-4 align-top leading-7 text-ink-muted transition-colors ${
                      mode === "thermal"
                        ? "bg-surface-warm/60 font-semibold text-charcoal"
                        : ""
                    }`}
                  >
                    {row.thermalBreak}
                  </td>
                  <td className="px-5 py-4 align-top text-xs leading-6 text-ink-muted">
                    {row.winnerNote}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Ledger Cards */}
      <div className="space-y-4 md:hidden">
        {COMPARISON_ROWS.map((row) => {
          const highlighted = isRowHighlighted(row.metric);
          return (
            <article
              key={row.metric}
              className={`border p-4 transition-colors ${
                highlighted
                  ? "border-bronze bg-bronze-soft/30"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-charcoal">
                  {row.metric}
                </h3>
                {highlighted && (
                  <span className="border border-bronze/30 bg-bronze-soft px-2 py-0.5 text-[11px] font-bold text-bronze-hover">
                    شاخص کلیدی شما
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2.5 text-xs leading-6">
                <div
                  className={`border p-3 ${
                    mode === "upvc"
                      ? "border-charcoal bg-surface-warm"
                      : "border-border bg-canvas"
                  }`}
                >
                  <p className="font-bold text-charcoal">پنجره دوجداره uPVC</p>
                  <p className="mt-1 text-ink-muted">{row.upvc}</p>
                </div>

                <div
                  className={`border p-3 ${
                    mode === "thermal"
                      ? "border-charcoal bg-surface-warm"
                      : "border-border bg-canvas"
                  }`}
                >
                  <p className="font-bold text-charcoal">
                    آلومینیوم ترمال بریک
                  </p>
                  <p className="mt-1 text-ink-muted">{row.thermalBreak}</p>
                </div>
              </div>

              <p className="mt-3 border-t border-border pt-2.5 text-xs leading-6 text-ink-muted">
                <span className="font-bold text-charcoal">جمع‌بندی: </span>
                {row.winnerNote}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
