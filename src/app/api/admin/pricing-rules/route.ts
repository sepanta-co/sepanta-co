import { NextResponse } from "next/server";
import { getAdminSession, verifySameOrigin } from "@/lib/admin-auth";
import { isValidSystemKey } from "@/lib/configurator-rules";
import { getDb, type PricingRuleRow } from "@/lib/db";
import { toLatinDigits } from "@/lib/persian-seo";

export const dynamic = "force-dynamic";

function parseNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return Number(toLatinDigits(val).trim());
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

  return NextResponse.json(
    { ok: true, rules },
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
  if (!isValidSystemKey(systemKey)) {
    return NextResponse.json(
      { ok: false, error: "کلید سیستم نامعتبر است." },
      { status: 400 }
    );
  }

  const basePricePerSqm = parseNumber(body.base_price_per_sqm);
  const minBillableSqm = parseNumber(body.min_billable_sqm);
  const glassStandard = parseNumber(body.glass_standard_per_sqm);
  const glassAcoustic = parseNumber(body.glass_acoustic_per_sqm);
  const glassTriple = parseNumber(body.glass_triple_per_sqm);
  const glassTempered = parseNumber(body.glass_tempered_per_sqm);
  const pleatedMesh = parseNumber(body.pleated_mesh_per_sqm);
  const colorSurcharge = parseNumber(body.color_surcharge_percent);
  const installationPercent = parseNumber(body.installation_percent);

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
    installationPercent > 100
  ) {
    return NextResponse.json(
      { ok: false, error: "مقادیر عددی تعرفه یا درصدها خارج از محدوده مجاز است." },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const db = getDb();
  const result = db
    .prepare(
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
         updated_at = @updated_at
       WHERE system_key = @system_key`
    )
    .run({
      system_key: systemKey,
      base_price_per_sqm: Math.round(basePricePerSqm),
      min_billable_sqm: Number(minBillableSqm.toFixed(2)),
      glass_standard_per_sqm: Math.round(glassStandard),
      glass_acoustic_per_sqm: Math.round(glassAcoustic),
      glass_triple_per_sqm: Math.round(glassTriple),
      glass_tempered_per_sqm: Math.round(glassTempered),
      pleated_mesh_per_sqm: Math.round(pleatedMesh),
      color_surcharge_percent: Number(colorSurcharge.toFixed(2)),
      installation_percent: Number(installationPercent.toFixed(2)),
      updated_at: nowIso,
    });

  if (result.changes === 0) {
    return NextResponse.json(
      { ok: false, error: "ردیف تعرفه برای این سیستم یافت نشد." },
      { status: 404 }
    );
  }

  const updated = db
    .prepare("SELECT * FROM pricing_rules WHERE system_key = ?")
    .get(systemKey) as PricingRuleRow;

  return NextResponse.json({ ok: true, rule: updated }, { status: 200 });
}
