import type {
  ConfiguratorSystemKey,
  FrameFinishKey,
  GlassOptionKey,
} from "./configurator-rules";
import { toPersianDigits } from "./persian-seo";

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
  updated_at: string;
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

function roundToNearest10k(amount: number): number {
  return Math.round(amount / 10000) * 10000;
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

  const baseCostIrr = billableAreaSqm * rule.base_price_per_sqm;
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

  const subtotalIrr = baseCostIrr + glassCostIrr + colorSurchargeIrr + meshCostIrr;
  const installationIrr = subtotalIrr * (rule.installation_percent / 100);
  const unitRawIrr = subtotalIrr + installationIrr;

  const qty = Math.max(1, Math.round(item.quantity));
  const unitTotalIrr = roundToNearest10k(unitRawIrr);
  const totalIrr = roundToNearest10k(unitRawIrr * qty);
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
