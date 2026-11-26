"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, RefreshCw, SlidersHorizontal } from "lucide-react";
import { PictureImage } from "@/components/ui/PictureImage";
import type { ProductLine } from "@/data/types";
import {
  formatFxTimestamp,
  getFxSourceLabel,
  getPricingUnitLabel,
  resolveProductPricingKey,
} from "@/lib/fx-labels";
import { toPersianDigits } from "@/lib/persian-seo";
import {
  formatToman,
  resolveEffectiveBasePricePerSqm,
  type PricingRuleRow,
  type PublicFxSummary,
} from "@/lib/pricing-calculator";

type CategoryFilter = "all" | ProductLine["category"];

const CATEGORY_TABS: readonly {
  id: CategoryFilter;
  label: string;
}[] = [
  { id: "all", label: "همه خطوط تولید" },
  { id: "پنجره و نما", label: "سیستم‌های پنجره" },
  { id: "جانبی و بازشو", label: "شیشه و توری" },
  { id: "درب ساختمانی", label: "درب و چهارچوب" },
];

export interface ProductCatalogGridProps {
  products: ProductLine[];
}

export function ProductCatalogGrid({ products }: ProductCatalogGridProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [fx, setFx] = useState<PublicFxSummary | null>(null);
  const [rulesMap, setRulesMap] = useState<Record<string, PricingRuleRow>>({});

  useEffect(() => {
    let active = true;

    fetch("/api/pricing-rules/", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok?: boolean;
          fx?: PublicFxSummary;
          rules?: PricingRuleRow[];
        };
        if (!active || !data.ok) return;
        if (data.fx) setFx(data.fx);
        if (Array.isArray(data.rules)) {
          setRulesMap(
            Object.fromEntries(data.rules.map((rule) => [rule.system_key, rule]))
          );
        }
      })
      .catch(() => {
        // Keep catalog functional even if pricing fetch fails
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((item) => item.category === selectedCategory);

  const countForCategory = (cat: CategoryFilter) =>
    cat === "all"
      ? products.length
      : products.filter((item) => item.category === cat).length;

  return (
    <div className="space-y-8">
      {/* Live FX Status Strip */}
      {fx && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-accent-soft/60 px-4 py-3 text-xs text-accent-hover sm:px-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-bold">
              تعرفه‌های پایه بر اساس نرخ روز دلار ({formatToman(fx.activeUsdIrr)})
              محاسبه شده‌اند
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>منبع: {getFxSourceLabel(fx.sourceUsed)}</span>
            <span>آخرین همگام‌سازی: {formatFxTimestamp(fx.lastSyncedAt)}</span>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div
        role="group"
        aria-label="فیلتر دسته‌بندی خطوط تولید"
        className="flex flex-wrap items-center gap-2.5"
      >
        {CATEGORY_TABS.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                active
                  ? "bg-surface-dark text-ink-inverse shadow-xs"
                  : "border border-border bg-surface text-ink-muted hover:bg-surface-subtle hover:text-ink"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`tabular-nums rounded-md px-1.5 py-0.5 text-[11px] ${
                  active
                    ? "bg-surface-elevated text-amber-400"
                    : "bg-surface-subtle text-ink-muted"
                }`}
              >
                {toPersianDigits(countForCategory(tab.id))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const pricingKey = resolveProductPricingKey(product.slug);
          const rule = rulesMap[pricingKey];
          const livePriceIrr = rule
            ? resolveEffectiveBasePricePerSqm(rule)
            : null;
          const unitLabel = getPricingUnitLabel(pricingKey);

          return (
            <article
              key={product.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                <PictureImage
                  imageKey={product.imageKey}
                  alt={product.name}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  fill
                  className="transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-ink-muted">
                      {product.category}
                    </span>
                    {product.configuratorEligible && (
                      <span className="rounded-md bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent-hover">
                        محاسبه آنلاین
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-ink">
                    {product.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
                    {product.summary}
                  </p>

                  {livePriceIrr !== null && livePriceIrr > 0 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-200 bg-accent-soft/50 px-3.5 py-2.5 text-xs">
                      <span className="font-medium text-accent-hover">
                        تعرفه پایه ({unitLabel}):
                      </span>
                      <strong className="tabular-nums text-sm font-extrabold text-ink">
                        {formatToman(livePriceIrr)}
                      </strong>
                    </div>
                  )}

                  <dl className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
                    {product.specs.slice(0, 2).map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-start justify-between gap-3"
                      >
                        <dt className="shrink-0 font-medium text-ink-muted">
                          {toPersianDigits(spec.label)}:
                        </dt>
                        <dd className="tabular-nums text-end font-semibold text-ink">
                          {toPersianDigits(spec.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <Link
                    href={`/products/${product.slug}/`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-accent"
                  >
                    <span>مشاهده مشخصات فنی</span>
                    <ArrowUpLeft
                      className="h-4 w-4 text-accent"
                      aria-hidden="true"
                    />
                  </Link>

                  {product.configuratorEligible && product.configuratorKey && (
                    <Link
                      href={`/configurator/?product=${product.configuratorKey}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-hover transition-colors hover:bg-amber-200/70"
                    >
                      <SlidersHorizontal
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      <span>محاسبه و برآورد</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
