"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import {
  formatFxTimestamp,
  getFxSourceLabel,
  getPricingUnitLabel,
  resolveProductPricingKey,
} from "@/lib/fx-labels";
import {
  formatToman,
  resolveEffectiveBasePricePerSqm,
  type PricingRuleRow,
  type PublicFxSummary,
} from "@/lib/pricing-calculator";

export function ProductLivePriceCard({
  productSlug,
  configuratorEligible,
  configuratorKey,
}: {
  productSlug: string;
  configuratorEligible: boolean;
  configuratorKey: string | null;
}) {
  const [fx, setFx] = useState<PublicFxSummary | null>(null);
  const [rule, setRule] = useState<PricingRuleRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const targetKey = resolveProductPricingKey(productSlug);

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
        const matched = data.rules?.find((r) => r.system_key === targetKey);
        if (matched) setRule(matched);
      })
      .catch(() => {
        // Silent fallback if pricing API is temporarily unavailable
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productSlug]);

  if (loading) {
    return (
      <div className="mt-6 border border-border bg-surface p-4 text-xs text-ink-muted">
        در حال استعلام تعرفه روز کارخانه بر اساس نرخ لحظه‌ای ارز...
      </div>
    );
  }

  if (!rule) {
    return null;
  }

  const effectiveIrr = resolveEffectiveBasePricePerSqm(rule);
  const unitLabel = getPricingUnitLabel(rule.system_key);

  return (
    <div className="mt-6 border-s-2 border-s-bronze border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-ink-muted">
            تعرفه پایه روز کارخانه ({unitLabel})
          </p>
          <p className="tabular-nums mt-1 text-xl font-extrabold text-charcoal sm:text-2xl">
            {formatToman(effectiveIrr)}
          </p>
        </div>

        {configuratorEligible && configuratorKey && (
          <Link
            href={`/configurator/?product=${configuratorKey}`}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-charcoal bg-charcoal px-3.5 py-2 text-xs font-semibold text-canvas transition-colors hover:bg-charcoal-soft"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>محاسبه دقیق با ابعاد</span>
          </Link>
        )}
      </div>

      {fx && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-2.5 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1 font-bold text-ink">
            <RefreshCw className="h-3 w-3 text-bronze" aria-hidden="true" />
            <span>نرخ مبنای دلار: {formatToman(fx.activeUsdIrr)}</span>
          </span>
          <span>منبع: {getFxSourceLabel(fx.sourceUsed)}</span>
          <span>بروزرسانی: {formatFxTimestamp(fx.lastSyncedAt)}</span>
        </div>
      )}
    </div>
  );
}
