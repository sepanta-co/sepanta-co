import type {
  ConfiguratorSystemKey,
  FrameFinishKey,
  GlassOptionKey,
} from "./configurator-rules";
import { toPersianDigits } from "./persian-seo";

export type FxMode = "auto" | "manual";

export interface FxSettingsRow {
  id: number;
  mode: FxMode;
  manual_usd_irr: number;
  active_usd_irr: number;
  source_used: string;
  last_synced_at: string | null;
  last_error: string | null;
  sync_interval_minutes: number;
  updated_at: string;
}

export interface FxRateHistoryRow {
  id: number;
  usd_irr: number;
  source: string;
  recorded_at: string;
}

export interface PublicFxSummary {
  mode: FxMode;
  activeUsdIrr: number;
  sourceUsed: string;
  lastSyncedAt: string | null;
  syncIntervalMinutes: number;
}

export interface PricingRuleRow {
  id: number;
  system_key: string;
  label: string;
  base_price_per_sqm: number;
  min_billable_sqm: number;
  glass_standard_per_sqm: number;
  glass_acoustic_per_sqm: number;
  glass_triple_per_sqm: number;
  glass_tempered_per_sqm: number;
  color_surcharge_percent: number;
  pleated_mesh_per_sqm: number;
  installation_percent: number;
  usd_units_per_sqm: number;
  formula_multiplier: number;
  fixed_surcharge_irr: number;
  rounding_step_irr: number;
  computed_price_per_sqm: number;
  formula_expression: string;
  updated_at: string;
}

export interface FormulaParams {
  usdIrr: number;
  usdUnitsPerSqm: number;
  formulaMultiplier: number;
  fixedSurchargeIrr: number;
  roundingStepIrr: number;
  fallbackBasePricePerSqm: number;
}

export interface PricableInquiryItem {
  locationName?: string;
  system: ConfiguratorSystemKey;
  widthCm: number;
  heightCm: number;
  panelCount?: number;
  openings?: string[];
  glassType: GlassOptionKey;
  finish: FrameFinishKey;
  includeMesh?: boolean;
  quantity: number;
}

export interface PricingBreakdown {
  realAreaSqm: number;
  billableAreaSqm: number;
  baseCostIrr: number;
  glassCostIrr: number;
  colorSurchargeIrr: number;
  meshCostIrr: number;
  subtotalIrr: number;
  installationIrr: number;
  unitTotalIrr: number;
  totalIrr: number;
  totalToman: number;
}

export type PricedInquiryItem<T extends PricableInquiryItem = PricableInquiryItem> =
  T & {
    breakdown: PricingBreakdown;
  };

export const DEFAULT_FORMULA_EXPRESSION =
  "(usd_irr * usd_units_per_sqm * formula_multiplier) + fixed_surcharge_irr";

export const CATALOG_PRICING_KEYS = [
  "upvc",
  "thermal-break",
  "balcony-glass",
  "pleated-mesh",
  "security-door",
  "wooden-door",
  "metal-frame",
] as const;

export type CatalogPricingKey = (typeof CATALOG_PRICING_KEYS)[number];

export function isValidPricingKey(
  value: string | null | undefined
): value is CatalogPricingKey {
  return (
    typeof value === "string" &&
    (CATALOG_PRICING_KEYS as readonly string[]).includes(value)
  );
}

export function roundToStep(amount: number, stepIrr = 10000): number {
  const safeStep =
    Number.isFinite(stepIrr) && stepIrr >= 1000 ? Math.round(stepIrr) : 1000;
  return Math.max(0, Math.round(amount / safeStep) * safeStep);
}

export function evaluateItemFormula(params: FormulaParams): number {
  const usdIrr =
    Number.isFinite(params.usdIrr) && params.usdIrr > 0 ? params.usdIrr : 0;
  const units = Number.isFinite(params.usdUnitsPerSqm)
    ? params.usdUnitsPerSqm
    : 0;
  const multiplier =
    Number.isFinite(params.formulaMultiplier) && params.formulaMultiplier >= 0
      ? params.formulaMultiplier
      : 1;
  const fixedSurcharge = Number.isFinite(params.fixedSurchargeIrr)
    ? params.fixedSurchargeIrr
    : 0;
  const fallbackBase =
    Number.isFinite(params.fallbackBasePricePerSqm) &&
    params.fallbackBasePricePerSqm >= 0
      ? params.fallbackBasePricePerSqm
      : 0;

  const rawIrr =
    units > 0 && usdIrr > 0
      ? usdIrr * units * multiplier + fixedSurcharge
      : fallbackBase * multiplier + fixedSurcharge;

  return roundToStep(Math.max(0, rawIrr), params.roundingStepIrr);
}

export function resolveEffectiveBasePricePerSqm(rule: PricingRuleRow): number {
  if (
    typeof rule.computed_price_per_sqm === "number" &&
    Number.isFinite(rule.computed_price_per_sqm) &&
    rule.computed_price_per_sqm > 0
  ) {
    return rule.computed_price_per_sqm;
  }
  return rule.base_price_per_sqm;
}

function resolveGlassPricePerSqm(
  glassType: GlassOptionKey,
  rule: PricingRuleRow
): number {
  switch (glassType) {
    case "double-standard":
      return rule.glass_standard_per_sqm;
    case "double-acoustic":
      return rule.glass_acoustic_per_sqm;
    case "triple-thermal":
      return rule.glass_triple_per_sqm;
    case "tempered-8mm":
      return rule.glass_tempered_per_sqm;
    case "none":
    default:
      return 0;
  }
}

export function calculateItemPrice(
  item: PricableInquiryItem,
  rule: PricingRuleRow
): PricingBreakdown {
  const realAreaSqm = Number(
    ((item.widthCm * item.heightCm) / 10000).toFixed(4)
  );
  const billableAreaSqm = Number(
    Math.max(realAreaSqm, rule.min_billable_sqm).toFixed(4)
  );

  const effectiveBasePerSqm = resolveEffectiveBasePricePerSqm(rule);
  const baseCostIrr = billableAreaSqm * effectiveBasePerSqm;
  const glassPerSqm = resolveGlassPricePerSqm(item.glassType, rule);
  const glassCostIrr = billableAreaSqm * glassPerSqm;
  const colorSurchargeIrr =
    item.finish !== "white"
      ? (baseCostIrr * rule.color_surcharge_percent) / 100
      : 0;
  const meshCostIrr =
    item.includeMesh && item.system !== "pleated-mesh"
      ? billableAreaSqm * rule.pleated_mesh_per_sqm
      : 0;

  const subtotalIrr =
    baseCostIrr + glassCostIrr + colorSurchargeIrr + meshCostIrr;
  const installationIrr = subtotalIrr * (rule.installation_percent / 100);
  const unitRawIrr = subtotalIrr + installationIrr;

  const qty = Math.max(1, Math.round(item.quantity));
  const roundingStep =
    Number.isFinite(rule.rounding_step_irr) && rule.rounding_step_irr >= 1000
      ? rule.rounding_step_irr
      : 10000;
  const unitTotalIrr = roundToStep(unitRawIrr, roundingStep);
  const totalIrr = roundToStep(unitRawIrr * qty, roundingStep);
  const totalToman = Math.round(totalIrr / 10);

  return {
    realAreaSqm,
    billableAreaSqm,
    baseCostIrr: Math.round(baseCostIrr),
    glassCostIrr: Math.round(glassCostIrr),
    colorSurchargeIrr: Math.round(colorSurchargeIrr),
    meshCostIrr: Math.round(meshCostIrr),
    subtotalIrr: Math.round(subtotalIrr),
    installationIrr: Math.round(installationIrr),
    unitTotalIrr,
    totalIrr,
    totalToman,
  };
}

export function calculateInquiryTotals<T extends PricableInquiryItem>(
  items: T[],
  rulesMap: Record<string, PricingRuleRow>
): {
  items: PricedInquiryItem<T>[];
  totalIrr: number;
  totalToman: number;
} {
  let totalIrr = 0;

  const pricedItems = items.map((item) => {
    const rule = rulesMap[item.system];
    if (!rule) {
      throw new Error(`Missing pricing rule for system: ${item.system}`);
    }
    const breakdown = calculateItemPrice(item, rule);
    totalIrr += breakdown.totalIrr;
    return {
      ...item,
      breakdown,
    };
  });

  return {
    items: pricedItems,
    totalIrr,
    totalToman: Math.round(totalIrr / 10),
  };
}

export function formatToman(irrAmount: number): string {
  const toman = Math.round(irrAmount / 10);
  const formatted = toman.toLocaleString("en-US").replace(/,/g, "٬");
  return `${toPersianDigits(formatted)} تومان`;
}

export function formatIrr(irrAmount: number): string {
  const formatted = Math.round(irrAmount)
    .toLocaleString("en-US")
    .replace(/,/g, "٬");
  return `${toPersianDigits(formatted)} ریال`;
}
