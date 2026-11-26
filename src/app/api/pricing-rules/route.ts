import { NextResponse } from "next/server";
import { getDb, type PricingRuleRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rules = db
      .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
      .all() as PricingRuleRow[];

    return NextResponse.json(
      {
        ok: true,
        rules,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to load pricing rules",
      },
      { status: 500 }
    );
  }
}
