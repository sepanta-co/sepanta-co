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
        <div className="flex flex-wrap items-center justify-between gap-3 border-s-2 border-s-bronze border border-border bg-surface-panel px-4 py-3 text-xs text-ink sm:px-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <RefreshCw className="h-4 w-4 shrink-0 text-bronze" aria-hidden="true" />
            <span className="font-bold">
              تعرفه‌های پایه بر اساس نرخ روز دلار ({formatToman(fx.activeUsdIrr)})
              محاسبه شده‌اند
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
            <span>منبع: {getFxSourceLabel(fx.sourceUsed)}</span>
            <span>آخرین همگام‌سازی: {formatFxTimestamp(fx.lastSyncedAt)}</span>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div
        role="group"
        aria-label="فیلتر دسته‌بندی خطوط تولید"
        className="inline-flex flex-wrap border-t border-s border-border bg-surface"
      >
        {CATEGORY_TABS.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 border-e border-b border-border px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                active
                  ? "bg-charcoal text-canvas"
                  : "bg-surface text-ink-muted hover:bg-surface-panel hover:text-charcoal"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`tabular-nums px-1.5 py-0.5 text-[11px] ${
                  active
                    ? "bg-charcoal-soft text-bronze"
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
      <div className="grid grid-cols-1 border-t border-s border-border md:grid-cols-2 lg:grid-cols-3">
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
              className="group flex flex-col border-e border-b border-border bg-surface transition-colors hover:bg-surface-panel/50"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-surface-subtle">
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
                    <span className="text-xs font-bold text-ink-muted">
                      {product.category}
                    </span>
                    {product.configuratorEligible && (
                      <span className="border border-border bg-surface-panel px-2 py-0.5 text-[11px] font-semibold text-charcoal">
                        محاسبه آنلاین
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2.5 text-lg font-extrabold text-charcoal">
                    {product.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-ink-muted sm:text-sm">
                    {product.summary}
                  </p>

                  {livePriceIrr !== null && livePriceIrr > 0 && (
                    <div className="mt-4 flex items-center justify-between border border-border bg-surface-subtle px-3.5 py-2.5 text-xs">
                      <span className="font-semibold text-ink-muted">
                        تعرفه پایه ({unitLabel}):
                      </span>
                      <strong className="tabular-nums text-sm font-extrabold text-charcoal">
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
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal transition-colors hover:text-bronze"
                  >
                    <span>مشاهده مشخصات فنی</span>
                    <ArrowUpLeft
                      className="h-4 w-4 text-bronze"
                      aria-hidden="true"
                    />
                  </Link>

                  {product.configuratorEligible && product.configuratorKey && (
                    <Link
                      href={`/configurator/?product=${product.configuratorKey}`}
                      className="inline-flex items-center gap-1.5 rounded-[3px] border border-border-strong bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-charcoal"
                    >
                      <SlidersHorizontal
                        className="h-3.5 w-3.5 text-bronze"
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
