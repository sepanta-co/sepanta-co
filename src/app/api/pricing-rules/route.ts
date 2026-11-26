import { NextResponse } from "next/server";
import { syncUsdRate, toPublicFxSummary } from "@/lib/fx-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { fx, rules } = await syncUsdRate();

    return NextResponse.json(
      {
        ok: true,
        fx: toPublicFxSummary(fx),
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to load pricing rules",
      },
      { status: 500 }
    );
  }
}
