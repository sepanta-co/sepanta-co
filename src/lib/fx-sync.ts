import type Database from "better-sqlite3";
import { toLatinDigits } from "./persian-seo";
import {
  getDb,
  type FxRateHistoryRow,
  type FxSettingsRow,
  type PricingRuleRow,
} from "./db";
import {
  evaluateItemFormula,
  type FxMode,
  type PublicFxSummary,
} from "./pricing-calculator";

export const MIN_VALID_USD_IRR = 100_000;
export const MAX_VALID_USD_IRR = 50_000_000;
const FETCH_TIMEOUT_MS = 5000;

const DEFAULT_TGJU_URL = "https://call.tgju.org/ajax.json";
const DEFAULT_NOBITEX_URL =
  "https://apiv2.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls";
const DEFAULT_WALLEX_URL = "https://api.wallex.ir/v1/markets";
const DEFAULT_BITPIN_URL = "https://api.bitpin.org/v1/mkt/markets/";

export interface FxSyncResult {
  fx: FxSettingsRow;
  rules: PricingRuleRow[];
  updated: boolean;
}

let inFlightSync: Promise<FxSyncResult> | null = null;

function parseNumericToken(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const cleaned = toLatinDigits(raw).replace(/[٬,\s]/g, "").trim();
    if (!cleaned) return Number.NaN;
    return Number(cleaned);
  }
  return Number.NaN;
}

function isValidUsdIrr(rate: number): boolean {
  return (
    Number.isFinite(rate) &&
    rate > MIN_VALID_USD_IRR &&
    rate < MAX_VALID_USD_IRR
  );
}

function sanitizeErrorMessage(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown FX error";
  return raw.replace(/https?:\/\/\S+/gi, "[url]").slice(0, 220);
}

function extractUnitMultiplier(record: Record<string, unknown>): number {
  const unitHint = String(
    record.unit ?? record.currency ?? record.quoteAsset ?? ""
  ).toLowerCase();
  if (
    unitHint.includes("تومان") ||
    unitHint.includes("toman") ||
    unitHint === "irt" ||
    unitHint === "tmn"
  ) {
    return 10;
  }
  return 1;
}

function extractRateFromUnknownJson(
  payload: unknown,
  defaultMultiplier = 1
): number | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  // 1. Direct IRR fields
  for (const irrKey of ["usd_irr", "usdIrr", "active_usd_irr", "activeUsdIrr"]) {
    const val = parseNumericToken(obj[irrKey]);
    if (isValidUsdIrr(val)) return Math.round(val);
  }

  // 2. TGJU ajax.json format (current.price_dollar_rl.p or price_dollar_rl.p in IRR)
  const currentObj =
    obj.current && typeof obj.current === "object"
      ? (obj.current as Record<string, unknown>)
      : null;
  const tgjuDollar =
    (currentObj?.price_dollar_rl as Record<string, unknown> | undefined) ??
    (obj.price_dollar_rl as Record<string, unknown> | undefined);
  if (tgjuDollar && typeof tgjuDollar === "object") {
    const val = parseNumericToken(tgjuDollar.p ?? tgjuDollar.price);
    if (isValidUsdIrr(val)) return Math.round(val);
  }

  // 3. Nobitex stats format (usdt-rls in IRR)
  if (obj.stats && typeof obj.stats === "object") {
    const stats = obj.stats as Record<string, unknown>;
    const usdtRls = stats["usdt-rls"] as Record<string, unknown> | undefined;
    if (usdtRls && typeof usdtRls === "object") {
      const val = parseNumericToken(
        usdtRls.latest ?? usdtRls.mark ?? usdtRls.bestSell
      );
      if (isValidUsdIrr(val)) return Math.round(val);
    }
  }

  // 4. Wallex markets format (USDTTMN in Toman -> * 10)
  if (obj.result && typeof obj.result === "object") {
    const result = obj.result as Record<string, unknown>;
    if (result.symbols && typeof result.symbols === "object") {
      const symbols = result.symbols as Record<string, unknown>;
      const usdtTmn = symbols.USDTTMN as Record<string, unknown> | undefined;
      const stats = usdtTmn?.stats as Record<string, unknown> | undefined;
      if (stats) {
        const val = parseNumericToken(
          stats.lastPrice ?? stats.bidPrice ?? stats.askPrice
        );
        const irr = val * 10;
        if (isValidUsdIrr(irr)) return Math.round(irr);
      }
    }
  }

  // 5. Bitpin markets format (USDT_IRT in Toman -> * 10)
  if (Array.isArray(obj.results)) {
    for (const entry of obj.results) {
      if (
        entry &&
        typeof entry === "object" &&
        (entry as Record<string, unknown>).code === "USDT_IRT"
      ) {
        const priceInfo = (entry as Record<string, unknown>).price_info as
          | Record<string, unknown>
          | undefined;
        if (priceInfo) {
          const val = parseNumericToken(priceInfo.price);
          const irr = val * 10;
          if (isValidUsdIrr(irr)) return Math.round(irr);
        }
      }
    }
  }

  // 6. BrsApi array/object format
  if (Array.isArray(obj.currency)) {
    for (const item of obj.currency) {
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        const sym = String(rec.symbol ?? rec.name_en ?? "").toUpperCase();
        if (sym === "USD" || sym.includes("DOLLAR")) {
          const mult = extractUnitMultiplier(rec);
          const irr = parseNumericToken(rec.price) * mult;
          if (isValidUsdIrr(irr)) return Math.round(irr);
        }
      }
    }
  }

  // 7. Navasan format (usd_sell / usd in Toman -> * 10)
  for (const navKey of ["usd_sell", "usd"]) {
    const entry = obj[navKey];
    if (entry && typeof entry === "object") {
      const rec = entry as Record<string, unknown>;
      const val = parseNumericToken(rec.value ?? rec.price);
      const irr = val * 10;
      if (isValidUsdIrr(irr)) return Math.round(irr);
    }
  }

  // 8. Generic object fields (rate, price, usd)
  const mult = extractUnitMultiplier(obj) * defaultMultiplier;
  for (const key of ["price", "rate", "usd", "usd_toman"]) {
    const val = parseNumericToken(obj[key]);
    const effectiveMult = key === "usd_toman" ? 10 : mult;
    const irr = val * effectiveMult;
    if (isValidUsdIrr(irr)) return Math.round(irr);
  }

  return null;
}

async function fetchJsonWithTimeout(
  url: string,
  headers: Record<string, string> = {}
): Promise<unknown> {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "SepantaIndustrialGroup/2.0",
      ...headers,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

interface FxCandidateResult {
  usdIrr: number;
  source: string;
}

async function fetchFromProviders(): Promise<{
  result: FxCandidateResult | null;
  errors: string[];
}> {
  const errors: string[] = [];
  const primaryUrl = process.env.FX_PRIMARY_API_URL?.trim();
  const primaryKey = process.env.FX_PRIMARY_API_KEY?.trim();
  const primaryUnitMultiplier =
    process.env.FX_PRIMARY_UNIT?.trim().toLowerCase() === "toman" ? 10 : 1;
  const customFallbackUrl = process.env.FX_FALLBACK_API_URL?.trim();

  // 1. Primary provider (configured env endpoint, else live TGJU free-market USD)
  if (primaryUrl) {
    try {
      const resolvedUrl = primaryKey
        ? primaryUrl.replace(/\{API_KEY\}/g, encodeURIComponent(primaryKey))
        : primaryUrl;
      const headers: Record<string, string> = {};
      if (primaryKey && !primaryUrl.includes("{API_KEY}")) {
        headers.Authorization = `Bearer ${primaryKey}`;
        headers["X-API-KEY"] = primaryKey;
      }
      const data = await fetchJsonWithTimeout(resolvedUrl, headers);
      const rate = extractRateFromUnknownJson(data, primaryUnitMultiplier);
      if (rate !== null) {
        return { result: { usdIrr: rate, source: "primary-api" }, errors };
      }
      errors.push("primary-api: invalid payload");
    } catch (err) {
      errors.push(`primary-api: ${sanitizeErrorMessage(err)}`);
    }
  } else {
    try {
      const data = await fetchJsonWithTimeout(DEFAULT_TGJU_URL);
      const rate = extractRateFromUnknownJson(data);
      if (rate !== null) {
        return { result: { usdIrr: rate, source: "tgju-usd" }, errors };
      }
      errors.push("tgju-usd: invalid payload");
    } catch (err) {
      errors.push(`tgju-usd: ${sanitizeErrorMessage(err)}`);
    }
  }

  // 2. Fallback provider (configured FX_FALLBACK_API_URL or Nobitex USDT-RLS)
  const fallbackUrl = customFallbackUrl || DEFAULT_NOBITEX_URL;
  try {
    const data = await fetchJsonWithTimeout(fallbackUrl);
    const rate = extractRateFromUnknownJson(data);
    if (rate !== null) {
      return { result: { usdIrr: rate, source: "fallback-usdt" }, errors };
    }
    errors.push("fallback-usdt: invalid payload");
  } catch (err) {
    errors.push(`fallback-usdt: ${sanitizeErrorMessage(err)}`);
  }

  // 3. Secondary & tertiary public Iranian exchange fallbacks (when no custom override locked)
  if (!customFallbackUrl) {
    for (const extra of [
      { url: DEFAULT_WALLEX_URL, source: "fallback-wallex" },
      { url: DEFAULT_BITPIN_URL, source: "fallback-bitpin" },
    ]) {
      try {
        const data = await fetchJsonWithTimeout(extra.url);
        const rate = extractRateFromUnknownJson(data);
        if (rate !== null) {
          return { result: { usdIrr: rate, source: extra.source }, errors };
        }
        errors.push(`${extra.source}: invalid payload`);
      } catch (err) {
        errors.push(`${extra.source}: ${sanitizeErrorMessage(err)}`);
      }
    }
  }

  return { result: null, errors };
}

export function recalculateAllProductPrices(
  dbOverride?: Database.Database
): PricingRuleRow[] {
  const db = dbOverride ?? getDb();

  const runRecalc = db.transaction(() => {
    const fx = db
      .prepare("SELECT * FROM fx_settings WHERE id = 1")
      .get() as FxSettingsRow;
    const usdIrr =
      fx.mode === "manual" ? fx.manual_usd_irr : fx.active_usd_irr;

    const rules = db
      .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
      .all() as PricingRuleRow[];
    const nowIso = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE pricing_rules
      SET computed_price_per_sqm = @computed_price_per_sqm,
          base_price_per_sqm = @base_price_per_sqm,
          updated_at = @updated_at
      WHERE system_key = @system_key
    `);

    for (const rule of rules) {
      const computed = evaluateItemFormula({
        usdIrr,
        usdUnitsPerSqm: rule.usd_units_per_sqm,
        formulaMultiplier: rule.formula_multiplier,
        fixedSurchargeIrr: rule.fixed_surcharge_irr,
        roundingStepIrr: rule.rounding_step_irr,
        fallbackBasePricePerSqm: rule.base_price_per_sqm,
      });

      updateStmt.run({
        system_key: rule.system_key,
        computed_price_per_sqm: computed,
        base_price_per_sqm:
          rule.usd_units_per_sqm > 0 ? computed : rule.base_price_per_sqm,
        updated_at: nowIso,
      });
    }

    return db
      .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
      .all() as PricingRuleRow[];
  });

  return runRecalc();
}

export function getFxSettings(): FxSettingsRow {
  const db = getDb();
  return db
    .prepare("SELECT * FROM fx_settings WHERE id = 1")
    .get() as FxSettingsRow;
}

export function getRecentFxHistory(limit = 20): FxRateHistoryRow[] {
  const db = getDb();
  const safeLimit = Math.max(1, Math.min(100, Math.round(limit)));
  return db
    .prepare("SELECT * FROM fx_rate_history ORDER BY id DESC LIMIT ?")
    .all(safeLimit) as FxRateHistoryRow[];
}

export function toPublicFxSummary(fx: FxSettingsRow): PublicFxSummary {
  return {
    mode: fx.mode,
    activeUsdIrr: fx.active_usd_irr,
    sourceUsed: fx.source_used,
    lastSyncedAt: fx.last_synced_at,
    syncIntervalMinutes: fx.sync_interval_minutes,
  };
}

export function updateManualFxSettings(params: {
  mode: FxMode;
  manualUsdIrr: number;
  syncIntervalMinutes: number;
}): { fx: FxSettingsRow; rules: PricingRuleRow[] } {
  const db = getDb();
  const nowIso = new Date().toISOString();

  const tx = db.transaction(() => {
    const current = db
      .prepare("SELECT * FROM fx_settings WHERE id = 1")
      .get() as FxSettingsRow;

    if (params.mode === "manual") {
      db.prepare(
        `UPDATE fx_settings
         SET mode = 'manual',
             manual_usd_irr = @manual_usd_irr,
             active_usd_irr = @active_usd_irr,
             source_used = 'manual',
             last_error = NULL,
             sync_interval_minutes = @sync_interval_minutes,
             updated_at = @updated_at
         WHERE id = 1`
      ).run({
        manual_usd_irr: params.manualUsdIrr,
        active_usd_irr: params.manualUsdIrr,
        sync_interval_minutes: params.syncIntervalMinutes,
        updated_at: nowIso,
      });

      if (
        current.active_usd_irr !== params.manualUsdIrr ||
        current.source_used !== "manual"
      ) {
        db.prepare(
          `INSERT INTO fx_rate_history (usd_irr, source, recorded_at)
           VALUES (?, 'manual', ?)`
        ).run(params.manualUsdIrr, nowIso);
      }
    } else {
      db.prepare(
        `UPDATE fx_settings
         SET mode = 'auto',
             manual_usd_irr = @manual_usd_irr,
             sync_interval_minutes = @sync_interval_minutes,
             updated_at = @updated_at
         WHERE id = 1`
      ).run({
        manual_usd_irr: params.manualUsdIrr,
        sync_interval_minutes: params.syncIntervalMinutes,
        updated_at: nowIso,
      });
    }

    const rules = recalculateAllProductPrices(db);
    const fx = db
      .prepare("SELECT * FROM fx_settings WHERE id = 1")
      .get() as FxSettingsRow;

    return { fx, rules };
  });

  return tx();
}

async function performSyncUsdRate(options?: {
  force?: boolean;
}): Promise<FxSyncResult> {
  const db = getDb();
  const current = db
    .prepare("SELECT * FROM fx_settings WHERE id = 1")
    .get() as FxSettingsRow;

  if (current.mode === "manual") {
    const nowIso = new Date().toISOString();
    const needsCorrection =
      current.active_usd_irr !== current.manual_usd_irr ||
      current.source_used !== "manual";

    if (needsCorrection) {
      db.prepare(
        `UPDATE fx_settings
         SET active_usd_irr = manual_usd_irr,
             source_used = 'manual',
             last_error = NULL,
             updated_at = ?
         WHERE id = 1`
      ).run(nowIso);
    }

    const rules = needsCorrection
      ? recalculateAllProductPrices(db)
      : (db
          .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
          .all() as PricingRuleRow[]);
    const fx = db
      .prepare("SELECT * FROM fx_settings WHERE id = 1")
      .get() as FxSettingsRow;

    return { fx, rules, updated: needsCorrection };
  }

  // Auto mode: check TTL cache unless force=true
  if (!options?.force && current.last_synced_at) {
    const lastMs = Date.parse(current.last_synced_at);
    const ttlMs = Math.max(1, current.sync_interval_minutes) * 60 * 1000;
    if (Number.isFinite(lastMs) && Date.now() - lastMs < ttlMs) {
      const rules = db
        .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
        .all() as PricingRuleRow[];
      return { fx: current, rules, updated: false };
    }
  }

  const { result, errors } = await fetchFromProviders();
  const nowIso = new Date().toISOString();

  if (result) {
    const commitSuccess = db.transaction(() => {
      const latest = db
        .prepare("SELECT * FROM fx_settings WHERE id = 1")
        .get() as FxSettingsRow;
      if (latest.mode === "manual") {
        const rules = db
          .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
          .all() as PricingRuleRow[];
        return { fx: latest, rules, updated: false };
      }

      db.prepare(
        `UPDATE fx_settings
         SET active_usd_irr = @active_usd_irr,
             source_used = @source_used,
             last_synced_at = @last_synced_at,
             last_error = NULL,
             updated_at = @updated_at
         WHERE id = 1`
      ).run({
        active_usd_irr: result.usdIrr,
        source_used: result.source,
        last_synced_at: nowIso,
        updated_at: nowIso,
      });

      const rateChanged = latest.active_usd_irr !== result.usdIrr;
      if (
        rateChanged ||
        latest.source_used === "seed" ||
        latest.source_used === "cached" ||
        options?.force
      ) {
        db.prepare(
          `INSERT INTO fx_rate_history (usd_irr, source, recorded_at)
           VALUES (?, ?, ?)`
        ).run(result.usdIrr, result.source, nowIso);
      }

      const rules = recalculateAllProductPrices(db);
      const fx = db
        .prepare("SELECT * FROM fx_settings WHERE id = 1")
        .get() as FxSettingsRow;

      return { fx, rules, updated: rateChanged || latest.source_used !== result.source };
    });

    return commitSuccess();
  }

  // All external providers failed: keep cached active_usd_irr and record error concisely
  const conciseError =
    errors.length > 0
      ? errors.join(" | ").slice(0, 240)
      : "عدم دسترسی به سرویس‌های نرخ ارز";

  db.prepare(
    `UPDATE fx_settings
     SET source_used = 'cached',
         last_error = ?,
         updated_at = ?
     WHERE id = 1`
  ).run(conciseError, nowIso);

  const fx = db
    .prepare("SELECT * FROM fx_settings WHERE id = 1")
    .get() as FxSettingsRow;
  const rules = db
    .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
    .all() as PricingRuleRow[];

  return { fx, rules, updated: false };
}

export async function syncUsdRate(options?: {
  force?: boolean;
}): Promise<FxSyncResult> {
  if (inFlightSync && !options?.force) {
    return inFlightSync;
  }

  const run = performSyncUsdRate(options).finally(() => {
    if (inFlightSync === run) {
      inFlightSync = null;
    }
  });

  inFlightSync = run;
  return run;
}
