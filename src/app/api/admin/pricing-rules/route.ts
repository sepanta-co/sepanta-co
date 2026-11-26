import { NextResponse } from "next/server";
import { getAdminSession, verifySameOrigin } from "@/lib/admin-auth";
import { getDb, type PricingRuleRow } from "@/lib/db";
import { getFxSettings } from "@/lib/fx-sync";
import { toLatinDigits } from "@/lib/persian-seo";
import {
  DEFAULT_FORMULA_EXPRESSION,
  evaluateItemFormula,
  isValidPricingKey,
} from "@/lib/pricing-calculator";

export const dynamic = "force-dynamic";

function parseNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = toLatinDigits(val).replace(/[٬,\s]/g, "").trim();
    if (!cleaned) return Number.NaN;
    return Number(cleaned);
  }
  return Number.NaN;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "دسترسی غیرمجاز" },
      { status: 401 }
    );
  }

  const db = getDb();
  const rules = db
    .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
    .all() as PricingRuleRow[];
  const fx = getFxSettings();

  return NextResponse.json(
    { ok: true, fx, rules },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "دسترسی غیرمجاز" },
      { status: 401 }
    );
  }

  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "عدم تطابق مبدا درخواست." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { ok: false, error: "ساختار درخواست نامعتبر است." },
        { status: 400 }
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "فرمت JSON نامعتبر است." },
      { status: 400 }
    );
  }

  const systemKey =
    typeof body.system_key === "string" ? body.system_key.trim() : "";
  if (!isValidPricingKey(systemKey)) {
    return NextResponse.json(
      { ok: false, error: "کلید سیستم یا محصول نامعتبر است." },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM pricing_rules WHERE system_key = ?")
    .get(systemKey) as PricingRuleRow | undefined;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "ردیف تعرفه برای این محصول یافت نشد." },
      { status: 404 }
    );
  }

  const basePricePerSqm =
    body.base_price_per_sqm !== undefined
      ? parseNumber(body.base_price_per_sqm)
      : existing.base_price_per_sqm;
  const minBillableSqm =
    body.min_billable_sqm !== undefined
      ? parseNumber(body.min_billable_sqm)
      : existing.min_billable_sqm;
  const glassStandard =
    body.glass_standard_per_sqm !== undefined
      ? parseNumber(body.glass_standard_per_sqm)
      : existing.glass_standard_per_sqm;
  const glassAcoustic =
    body.glass_acoustic_per_sqm !== undefined
      ? parseNumber(body.glass_acoustic_per_sqm)
      : existing.glass_acoustic_per_sqm;
  const glassTriple =
    body.glass_triple_per_sqm !== undefined
      ? parseNumber(body.glass_triple_per_sqm)
      : existing.glass_triple_per_sqm;
  const glassTempered =
    body.glass_tempered_per_sqm !== undefined
      ? parseNumber(body.glass_tempered_per_sqm)
      : existing.glass_tempered_per_sqm;
  const pleatedMesh =
    body.pleated_mesh_per_sqm !== undefined
      ? parseNumber(body.pleated_mesh_per_sqm)
      : existing.pleated_mesh_per_sqm;
  const colorSurcharge =
    body.color_surcharge_percent !== undefined
      ? parseNumber(body.color_surcharge_percent)
      : existing.color_surcharge_percent;
  const installationPercent =
    body.installation_percent !== undefined
      ? parseNumber(body.installation_percent)
      : existing.installation_percent;

  const usdUnitsPerSqm =
    body.usd_units_per_sqm !== undefined
      ? parseNumber(body.usd_units_per_sqm)
      : existing.usd_units_per_sqm;
  const formulaMultiplier =
    body.formula_multiplier !== undefined
      ? parseNumber(body.formula_multiplier)
      : existing.formula_multiplier;
  const fixedSurchargeIrr =
    body.fixed_surcharge_irr !== undefined
      ? parseNumber(body.fixed_surcharge_irr)
      : existing.fixed_surcharge_irr;
  const roundingStepIrr =
    body.rounding_step_irr !== undefined
      ? parseNumber(body.rounding_step_irr)
      : existing.rounding_step_irr;
  const formulaExpression =
    typeof body.formula_expression === "string" &&
    body.formula_expression.trim().length > 0
      ? body.formula_expression.trim().slice(0, 200)
      : existing.formula_expression || DEFAULT_FORMULA_EXPRESSION;

  if (
    !Number.isFinite(basePricePerSqm) ||
    basePricePerSqm < 0 ||
    !Number.isFinite(minBillableSqm) ||
    minBillableSqm < 0.1 ||
    minBillableSqm > 10 ||
    !Number.isFinite(glassStandard) ||
    glassStandard < 0 ||
    !Number.isFinite(glassAcoustic) ||
    glassAcoustic < 0 ||
    !Number.isFinite(glassTriple) ||
    glassTriple < 0 ||
    !Number.isFinite(glassTempered) ||
    glassTempered < 0 ||
    !Number.isFinite(pleatedMesh) ||
    pleatedMesh < 0 ||
    !Number.isFinite(colorSurcharge) ||
    colorSurcharge < 0 ||
    colorSurcharge > 100 ||
    !Number.isFinite(installationPercent) ||
    installationPercent < 0 ||
    installationPercent > 100 ||
    !Number.isFinite(usdUnitsPerSqm) ||
    usdUnitsPerSqm < 0 ||
    usdUnitsPerSqm > 100000 ||
    !Number.isFinite(formulaMultiplier) ||
    formulaMultiplier < 0 ||
    formulaMultiplier > 100 ||
    !Number.isFinite(fixedSurchargeIrr) ||
    fixedSurchargeIrr < -1_000_000_000 ||
    fixedSurchargeIrr > 1_000_000_000 ||
    !Number.isFinite(roundingStepIrr) ||
    roundingStepIrr < 1000 ||
    roundingStepIrr > 10_000_000
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "مقادیر عددی فرمول، تعرفه یا درصدها خارج از محدوده مجاز است.",
      },
      { status: 400 }
    );
  }

  const fx = getFxSettings();
  const activeUsdIrr =
    fx.mode === "manual" ? fx.manual_usd_irr : fx.active_usd_irr;

  const cleanUnits = Number(usdUnitsPerSqm.toFixed(4));
  const cleanMultiplier = Number(formulaMultiplier.toFixed(4));
  const cleanFixedSurcharge = Math.round(fixedSurchargeIrr);
  const cleanRoundingStep = Math.round(roundingStepIrr);
  const cleanFallbackBase = Math.round(basePricePerSqm);

  const computedPricePerSqm = evaluateItemFormula({
    usdIrr: activeUsdIrr,
    usdUnitsPerSqm: cleanUnits,
    formulaMultiplier: cleanMultiplier,
    fixedSurchargeIrr: cleanFixedSurcharge,
    roundingStepIrr: cleanRoundingStep,
    fallbackBasePricePerSqm: cleanFallbackBase,
  });

  const nowIso = new Date().toISOString();
  db.prepare(
    `UPDATE pricing_rules SET
       base_price_per_sqm = @base_price_per_sqm,
       min_billable_sqm = @min_billable_sqm,
       glass_standard_per_sqm = @glass_standard_per_sqm,
       glass_acoustic_per_sqm = @glass_acoustic_per_sqm,
       glass_triple_per_sqm = @glass_triple_per_sqm,
       glass_tempered_per_sqm = @glass_tempered_per_sqm,
       pleated_mesh_per_sqm = @pleated_mesh_per_sqm,
       color_surcharge_percent = @color_surcharge_percent,
       installation_percent = @installation_percent,
       usd_units_per_sqm = @usd_units_per_sqm,
       formula_multiplier = @formula_multiplier,
       fixed_surcharge_irr = @fixed_surcharge_irr,
       rounding_step_irr = @rounding_step_irr,
       computed_price_per_sqm = @computed_price_per_sqm,
       formula_expression = @formula_expression,
       updated_at = @updated_at
     WHERE system_key = @system_key`
  ).run({
    system_key: systemKey,
    base_price_per_sqm:
      cleanUnits > 0 ? computedPricePerSqm : cleanFallbackBase,
    min_billable_sqm: Number(minBillableSqm.toFixed(2)),
    glass_standard_per_sqm: Math.round(glassStandard),
    glass_acoustic_per_sqm: Math.round(glassAcoustic),
    glass_triple_per_sqm: Math.round(glassTriple),
    glass_tempered_per_sqm: Math.round(glassTempered),
    pleated_mesh_per_sqm: Math.round(pleatedMesh),
    color_surcharge_percent: Number(colorSurcharge.toFixed(2)),
    installation_percent: Number(installationPercent.toFixed(2)),
    usd_units_per_sqm: cleanUnits,
    formula_multiplier: cleanMultiplier,
    fixed_surcharge_irr: cleanFixedSurcharge,
    rounding_step_irr: cleanRoundingStep,
    computed_price_per_sqm: computedPricePerSqm,
    formula_expression: formulaExpression,
    updated_at: nowIso,
  });

  const updated = db
    .prepare("SELECT * FROM pricing_rules WHERE system_key = ?")
    .get(systemKey) as PricingRuleRow;
  const rules = db
    .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
    .all() as PricingRuleRow[];

  return NextResponse.json(
    { ok: true, rule: updated, rules },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
