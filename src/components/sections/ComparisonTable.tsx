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
    label: "نمایش کامل",
    highlightedMetrics: [],
  },
  {
    id: "upvc",
    label: "اولویت: عایق صدا و بودجه اقتصادی",
    highlightedMetrics: [
      "عایق حرارتی (ضریب انتقال حرارت Uw)",
      "عایق صوتی (کاهش تراز صدا dB)",
      "رده بودجه و توجیه اقتصادی",
    ],
  },
  {
    id: "thermal",
    label: "اولویت: دهانه بزرگ و نمای مدرن",
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
      {/* Compact 3-button Decision Filter */}
      <div
        role="group"
        aria-label="فیلتر اولویت تصمیم‌گیری فنی"
        className="flex flex-wrap items-center gap-2.5"
      >
        {FILTER_OPTIONS.map((option) => {
          const active = mode === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              aria-pressed={active}
              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                active
                  ? "bg-surface-dark text-ink-inverse shadow-xs"
                  : "border border-border bg-surface text-ink-muted hover:bg-surface-subtle hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Desktop Structured Table (md+) */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-xs font-bold text-ink sm:text-sm">
              <th scope="col" className="w-[22%] px-5 py-4 text-start">
                معیار مهندسی
              </th>
              <th
                scope="col"
                className={`w-[28%] px-5 py-4 text-start transition-colors ${
                  mode === "upvc" ? "bg-accent-soft text-accent-hover" : ""
                }`}
              >
                پنجره دوجداره uPVC
              </th>
              <th
                scope="col"
                className={`w-[28%] px-5 py-4 text-start transition-colors ${
                  mode === "thermal" ? "bg-accent-soft text-accent-hover" : ""
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
                    highlighted ? "bg-amber-50/40" : "hover:bg-surface-subtle/60"
                  }`}
                >
                  <th
                    scope="row"
                    className="px-5 py-4 align-top text-start font-bold text-ink"
                  >
                    <span>{row.metric}</span>
                    {highlighted && (
                      <span className="mt-1.5 inline-block rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-hover">
                        معیار کلیدی اولویت شما
                      </span>
                    )}
                  </th>
                  <td
                    className={`px-5 py-4 align-top leading-7 text-ink-muted transition-colors ${
                      mode === "upvc"
                        ? "bg-accent-soft/35 font-medium text-ink"
                        : ""
                    }`}
                  >
                    {row.upvc}
                  </td>
                  <td
                    className={`px-5 py-4 align-top leading-7 text-ink-muted transition-colors ${
                      mode === "thermal"
                        ? "bg-accent-soft/35 font-medium text-ink"
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

      {/* Mobile Stacked Comparison Cards (< md) */}
      <div className="space-y-4 md:hidden">
        {COMPARISON_ROWS.map((row) => {
          const highlighted = isRowHighlighted(row.metric);
          return (
            <article
              key={row.metric}
              className={`rounded-2xl border p-4 transition-colors ${
                highlighted
                  ? "border-accent bg-amber-50/35"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-ink">{row.metric}</h3>
                {highlighted && (
                  <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-hover">
                    اولویت انتخاب‌شده
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2.5 text-xs leading-6">
                <div
                  className={`rounded-xl border p-3 ${
                    mode === "upvc"
                      ? "border-accent/40 bg-accent-soft/45"
                      : "border-border bg-surface-subtle"
                  }`}
                >
                  <p className="font-bold text-ink">پنجره دوجداره uPVC</p>
                  <p className="mt-1 text-ink-muted">{row.upvc}</p>
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    mode === "thermal"
                      ? "border-accent/40 bg-accent-soft/45"
                      : "border-border bg-surface-subtle"
                  }`}
                >
                  <p className="font-bold text-ink">آلومینیوم ترمال بریک</p>
                  <p className="mt-1 text-ink-muted">{row.thermalBreak}</p>
                </div>
              </div>

              <p className="mt-3 border-t border-border pt-2.5 text-xs leading-6 text-ink-muted">
                <span className="font-semibold text-ink">جمع‌بندی: </span>
                {row.winnerNote}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
