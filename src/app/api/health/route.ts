import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const row = db.prepare("SELECT 1 as alive").get() as { alive: number };
    const mode = db.pragma("journal_mode", { simple: true }) as string;

    if (row?.alive !== 1) {
      throw new Error("SQLite health query failed");
    }

    return NextResponse.json(
      {
        ok: true,
        db: mode,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
