import { NextResponse } from "next/server";
import { requireAdminAccess, verifySameOrigin } from "@/lib/admin-auth";
import {
  getFxSettings,
  getRecentFxHistory,
  MAX_VALID_USD_IRR,
  MIN_VALID_USD_IRR,
  syncUsdRate,
  updateManualFxSettings,
} from "@/lib/fx-sync";
import { toLatinDigits } from "@/lib/persian-seo";
import type { FxMode } from "@/lib/pricing-calculator";

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
  const auth = await requireAdminAccess("pricing:view");
  if (!auth.ok) return auth.response;

  const fx = getFxSettings();
  const history = getRecentFxHistory(20);

  return NextResponse.json(
    { ok: true, fx, history },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

async function handleFxUpdate(request: Request) {
  const auth = await requireAdminAccess("pricing:edit");
  if (!auth.ok) return auth.response;

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

  if (body.action === "sync_now") {
    const { fx, rules } = await syncUsdRate({ force: true });
    const history = getRecentFxHistory(20);
    return NextResponse.json(
      { ok: true, fx, history, rules },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const current = getFxSettings();
  const rawMode =
    typeof body.mode === "string" ? body.mode.trim() : current.mode;
  if (rawMode !== "auto" && rawMode !== "manual") {
    return NextResponse.json(
      { ok: false, error: "حالت نرخ ارز باید خودکار یا دستی باشد." },
      { status: 400 }
    );
  }
  const mode: FxMode = rawMode;

  const manualUsdIrr =
    body.manualUsdIrr !== undefined
      ? parseNumber(body.manualUsdIrr)
      : current.manual_usd_irr;

  if (
    !Number.isFinite(manualUsdIrr) ||
    manualUsdIrr <= MIN_VALID_USD_IRR ||
    manualUsdIrr >= MAX_VALID_USD_IRR
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "نرخ دلار دستی باید بین ۱۰۰٬۰۰۰ تا ۵۰٬۰۰۰٬۰۰۰ ریال باشد.",
      },
      { status: 400 }
    );
  }

  const syncIntervalMinutes =
    body.syncIntervalMinutes !== undefined
      ? parseNumber(body.syncIntervalMinutes)
      : current.sync_interval_minutes;

  if (
    !Number.isFinite(syncIntervalMinutes) ||
    syncIntervalMinutes < 1 ||
    syncIntervalMinutes > 1440
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "بازه همگام‌سازی باید بین ۱ تا ۱۴۴۰ دقیقه باشد.",
      },
      { status: 400 }
    );
  }

  const updated = updateManualFxSettings({
    mode,
    manualUsdIrr: Math.round(manualUsdIrr),
    syncIntervalMinutes: Math.round(syncIntervalMinutes),
  });

  if (mode === "auto") {
    const synced = await syncUsdRate({ force: true });
    const history = getRecentFxHistory(20);
    return NextResponse.json(
      { ok: true, fx: synced.fx, history, rules: synced.rules },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const history = getRecentFxHistory(20);
  return NextResponse.json(
    { ok: true, fx: updated.fx, history, rules: updated.rules },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: Request) {
  return handleFxUpdate(request);
}

export async function PUT(request: Request) {
  return handleFxUpdate(request);
}
