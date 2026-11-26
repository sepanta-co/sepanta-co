import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  DEFAULT_FORMULA_EXPRESSION,
  evaluateItemFormula,
  type FxRateHistoryRow,
  type FxSettingsRow,
  type PricingRuleRow,
} from "./pricing-calculator";
import type {
  StaffRole,
  TaskCategory,
  TaskPriority,
} from "./permissions";

export interface StaffUserRow {
  id: number;
  username: string;
  full_name: string;
  job_title: string;
  password_hash: string;
  role: StaffRole;
  permissions_json: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface StaffTaskRow {
  id: number;
  staff_user_id: number;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  due_label: string | null;
  is_completed: number;
  completed_at: string | null;
  completed_by_username: string | null;
  assigned_by_username: string;
  created_at: string;
  updated_at: string;
}

export type { FxRateHistoryRow, FxSettingsRow, PricingRuleRow };

const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "sepanta.db");

const DEFAULT_SEED_USD_IRR = 700000;

const globalForDb = globalThis as unknown as {
  __sepantaDb?: Database.Database;
};

interface TableColumnInfo {
  name: string;
}

const PRICING_RULE_COLUMNS: readonly { name: string; ddl: string }[] = [
  {
    name: "usd_units_per_sqm",
    ddl: "usd_units_per_sqm REAL NOT NULL DEFAULT 1.0",
  },
  {
    name: "formula_multiplier",
    ddl: "formula_multiplier REAL NOT NULL DEFAULT 1.0",
  },
  {
    name: "fixed_surcharge_irr",
    ddl: "fixed_surcharge_irr INTEGER NOT NULL DEFAULT 0",
  },
  {
    name: "rounding_step_irr",
    ddl: "rounding_step_irr INTEGER NOT NULL DEFAULT 10000",
  },
  {
    name: "computed_price_per_sqm",
    ddl: "computed_price_per_sqm INTEGER NOT NULL DEFAULT 0",
  },
  {
    name: "formula_expression",
    ddl: `formula_expression TEXT NOT NULL DEFAULT '${DEFAULT_FORMULA_EXPRESSION}'`,
  },
];

function initSchema(db: Database.Database): void {
  const runMigrations = db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS fx_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        mode TEXT NOT NULL DEFAULT 'auto',
        manual_usd_irr INTEGER NOT NULL DEFAULT 700000,
        active_usd_irr INTEGER NOT NULL DEFAULT 700000,
        source_used TEXT NOT NULL DEFAULT 'seed',
        last_synced_at TEXT,
        last_error TEXT,
        sync_interval_minutes INTEGER NOT NULL DEFAULT 10,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fx_rate_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usd_irr INTEGER NOT NULL,
        source TEXT NOT NULL,
        recorded_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pricing_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        system_key TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        base_price_per_sqm INTEGER NOT NULL,
        min_billable_sqm REAL NOT NULL DEFAULT 1.2,
        glass_standard_per_sqm INTEGER NOT NULL DEFAULT 0,
        glass_acoustic_per_sqm INTEGER NOT NULL DEFAULT 0,
        glass_triple_per_sqm INTEGER NOT NULL DEFAULT 0,
        glass_tempered_per_sqm INTEGER NOT NULL DEFAULT 0,
        color_surcharge_percent REAL NOT NULL DEFAULT 15,
        pleated_mesh_per_sqm INTEGER NOT NULL DEFAULT 0,
        installation_percent REAL NOT NULL DEFAULT 12,
        usd_units_per_sqm REAL NOT NULL DEFAULT 1.0,
        formula_multiplier REAL NOT NULL DEFAULT 1.0,
        fixed_surcharge_irr INTEGER NOT NULL DEFAULT 0,
        rounding_step_irr INTEGER NOT NULL DEFAULT 10000,
        computed_price_per_sqm INTEGER NOT NULL DEFAULT 0,
        formula_expression TEXT NOT NULL DEFAULT '${DEFAULT_FORMULA_EXPRESSION}',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        project_type TEXT NOT NULL,
        items_json TEXT NOT NULL,
        estimated_total_irr INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        attachment_path TEXT,
        attachment_original_name TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        admin_notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS warranties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serial_code TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        system_name TEXT NOT NULL,
        warranty_years INTEGER NOT NULL,
        issued_date TEXT NOT NULL,
        expires_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS warranty_service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        warranty_id INTEGER NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
        tracking_code TEXT UNIQUE NOT NULL,
        request_type TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS staff_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        job_title TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        permissions_json TEXT NOT NULL DEFAULT '[]',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS staff_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_user_id INTEGER NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'general',
        priority TEXT NOT NULL DEFAULT 'normal',
        due_label TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        completed_by_username TEXT,
        assigned_by_username TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    const nowIso = new Date().toISOString();

    db.prepare(
      `INSERT OR IGNORE INTO fx_settings (
         id,
         mode,
         manual_usd_irr,
         active_usd_irr,
         source_used,
         last_synced_at,
         last_error,
         sync_interval_minutes,
         updated_at
       ) VALUES (1, 'auto', ?, ?, 'seed', NULL, NULL, 10, ?)`
    ).run(DEFAULT_SEED_USD_IRR, DEFAULT_SEED_USD_IRR, nowIso);

    const existingCols = new Set(
      (
        db
          .prepare("PRAGMA table_info(pricing_rules)")
          .all() as TableColumnInfo[]
      ).map((col) => col.name)
    );

    let addedFormulaColumns = false;
    for (const col of PRICING_RULE_COLUMNS) {
      if (!existingCols.has(col.name)) {
        db.exec(`ALTER TABLE pricing_rules ADD COLUMN ${col.ddl}`);
        addedFormulaColumns = true;
      }
    }

    const fxRow = db
      .prepare("SELECT * FROM fx_settings WHERE id = 1")
      .get() as FxSettingsRow;
    const activeUsdIrr =
      fxRow.mode === "manual" ? fxRow.manual_usd_irr : fxRow.active_usd_irr;

    if (addedFormulaColumns) {
      const existingRows = db
        .prepare("SELECT * FROM pricing_rules ORDER BY id ASC")
        .all() as PricingRuleRow[];
      const backfillStmt = db.prepare(`
        UPDATE pricing_rules
        SET usd_units_per_sqm = @usd_units_per_sqm,
            formula_multiplier = @formula_multiplier,
            fixed_surcharge_irr = @fixed_surcharge_irr,
            rounding_step_irr = @rounding_step_irr,
            computed_price_per_sqm = @computed_price_per_sqm,
            formula_expression = @formula_expression,
            updated_at = @updated_at
        WHERE system_key = @system_key
      `);

      for (const row of existingRows) {
        const derivedUnits =
          row.base_price_per_sqm > 0 && activeUsdIrr > 0
            ? Number((row.base_price_per_sqm / activeUsdIrr).toFixed(2))
            : 1.0;
        const computed = evaluateItemFormula({
          usdIrr: activeUsdIrr,
          usdUnitsPerSqm: derivedUnits,
          formulaMultiplier: 1.0,
          fixedSurchargeIrr: 0,
          roundingStepIrr: 10000,
          fallbackBasePricePerSqm: row.base_price_per_sqm,
        });

        backfillStmt.run({
          system_key: row.system_key,
          usd_units_per_sqm: derivedUnits,
          formula_multiplier: 1.0,
          fixed_surcharge_irr: 0,
          rounding_step_irr: 10000,
          computed_price_per_sqm: computed,
          formula_expression: DEFAULT_FORMULA_EXPRESSION,
          updated_at: nowIso,
        });
      }
    }

    const insertPricing = db.prepare(`
      INSERT OR IGNORE INTO pricing_rules (
        system_key,
        label,
        base_price_per_sqm,
        min_billable_sqm,
        glass_standard_per_sqm,
        glass_acoustic_per_sqm,
        glass_triple_per_sqm,
        glass_tempered_per_sqm,
        color_surcharge_percent,
        pleated_mesh_per_sqm,
        installation_percent,
        usd_units_per_sqm,
        formula_multiplier,
        fixed_surcharge_irr,
        rounding_step_irr,
        computed_price_per_sqm,
        formula_expression,
        updated_at
      ) VALUES (
        @system_key,
        @label,
        @base_price_per_sqm,
        @min_billable_sqm,
        @glass_standard_per_sqm,
        @glass_acoustic_per_sqm,
        @glass_triple_per_sqm,
        @glass_tempered_per_sqm,
        @color_surcharge_percent,
        @pleated_mesh_per_sqm,
        @installation_percent,
        @usd_units_per_sqm,
        @formula_multiplier,
        @fixed_surcharge_irr,
        @rounding_step_irr,
        @computed_price_per_sqm,
        @formula_expression,
        @updated_at
      )
    `);

    const seedSpecs = [
      {
        system_key: "upvc",
        label: "پنجره دوجداره uPVC",
        base_price_per_sqm: 48000000,
        min_billable_sqm: 1.2,
        glass_standard_per_sqm: 12000000,
        glass_acoustic_per_sqm: 22000000,
        glass_triple_per_sqm: 26000000,
        glass_tempered_per_sqm: 18000000,
        color_surcharge_percent: 15,
        pleated_mesh_per_sqm: 7500000,
        installation_percent: 12,
        usd_units_per_sqm: 68.57,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 10000,
      },
      {
        system_key: "thermal-break",
        label: "پنجره آلومینیوم ترمال بریک",
        base_price_per_sqm: 82000000,
        min_billable_sqm: 1.2,
        glass_standard_per_sqm: 12000000,
        glass_acoustic_per_sqm: 22000000,
        glass_triple_per_sqm: 26000000,
        glass_tempered_per_sqm: 18000000,
        color_surcharge_percent: 18,
        pleated_mesh_per_sqm: 8500000,
        installation_percent: 12,
        usd_units_per_sqm: 117.14,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 10000,
      },
      {
        system_key: "balcony-glass",
        label: "شیشه بالکنی تاشو",
        base_price_per_sqm: 56000000,
        min_billable_sqm: 1.5,
        glass_standard_per_sqm: 0,
        glass_acoustic_per_sqm: 0,
        glass_triple_per_sqm: 0,
        glass_tempered_per_sqm: 15000000,
        color_surcharge_percent: 15,
        pleated_mesh_per_sqm: 0,
        installation_percent: 14,
        usd_units_per_sqm: 80,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 10000,
      },
      {
        system_key: "pleated-mesh",
        label: "توری کشویی و پلیسه",
        base_price_per_sqm: 14500000,
        min_billable_sqm: 1.0,
        glass_standard_per_sqm: 0,
        glass_acoustic_per_sqm: 0,
        glass_triple_per_sqm: 0,
        glass_tempered_per_sqm: 0,
        color_surcharge_percent: 12,
        pleated_mesh_per_sqm: 0,
        installation_percent: 10,
        usd_units_per_sqm: 20.71,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 10000,
      },
      {
        system_key: "security-door",
        label: "درب ضد سرقت آپارتمانی و ویلایی",
        base_price_per_sqm: 126000000,
        min_billable_sqm: 1.0,
        glass_standard_per_sqm: 0,
        glass_acoustic_per_sqm: 0,
        glass_triple_per_sqm: 0,
        glass_tempered_per_sqm: 0,
        color_surcharge_percent: 0,
        pleated_mesh_per_sqm: 0,
        installation_percent: 0,
        usd_units_per_sqm: 180,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 100000,
      },
      {
        system_key: "wooden-door",
        label: "درب چوبی ساختمانی",
        base_price_per_sqm: 59500000,
        min_billable_sqm: 1.0,
        glass_standard_per_sqm: 0,
        glass_acoustic_per_sqm: 0,
        glass_triple_per_sqm: 0,
        glass_tempered_per_sqm: 0,
        color_surcharge_percent: 0,
        pleated_mesh_per_sqm: 0,
        installation_percent: 0,
        usd_units_per_sqm: 85,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 100000,
      },
      {
        system_key: "metal-frame",
        label: "چهارچوب فلزی صنعتی",
        base_price_per_sqm: 31500000,
        min_billable_sqm: 1.0,
        glass_standard_per_sqm: 0,
        glass_acoustic_per_sqm: 0,
        glass_triple_per_sqm: 0,
        glass_tempered_per_sqm: 0,
        color_surcharge_percent: 0,
        pleated_mesh_per_sqm: 0,
        installation_percent: 0,
        usd_units_per_sqm: 45,
        formula_multiplier: 1.0,
        fixed_surcharge_irr: 0,
        rounding_step_irr: 50000,
      },
    ];

    for (const row of seedSpecs) {
      const computed = evaluateItemFormula({
        usdIrr: activeUsdIrr,
        usdUnitsPerSqm: row.usd_units_per_sqm,
        formulaMultiplier: row.formula_multiplier,
        fixedSurchargeIrr: row.fixed_surcharge_irr,
        roundingStepIrr: row.rounding_step_irr,
        fallbackBasePricePerSqm: row.base_price_per_sqm,
      });

      insertPricing.run({
        ...row,
        computed_price_per_sqm: computed,
        formula_expression: DEFAULT_FORMULA_EXPRESSION,
        updated_at: nowIso,
      });
    }

    const warrantyCount = db
      .prepare("SELECT COUNT(*) as count FROM warranties")
      .get() as { count: number };

    if (warrantyCount.count === 0) {
      const insertWarranty = db.prepare(`
        INSERT INTO warranties (
          serial_code,
          customer_name,
          phone,
          city,
          system_name,
          warranty_years,
          issued_date,
          expires_date,
          status,
          notes,
          created_at
        ) VALUES (
          @serial_code,
          @customer_name,
          @phone,
          @city,
          @system_name,
          @warranty_years,
          @issued_date,
          @expires_date,
          @status,
          @notes,
          @created_at
        )
      `);

      insertWarranty.run({
        serial_code: "SPN-W-1404-1001",
        customer_name: "پروژه مسکونی انقلاب زنجان",
        phone: "09120001001",
        city: "زنجان",
        system_name: "پنجره دوجداره uPVC سری ۷۰",
        warranty_years: 15,
        issued_date: "1404/03/15",
        expires_date: "1419/03/15",
        status: "active",
        notes: "شامل ضمانت پروفیل، گالوانیزه تقویتی و خدمات رگلاژ دوره‌ای",
        created_at: nowIso,
      });

      insertWarranty.run({
        serial_code: "SPN-W-1405-1002",
        customer_name: "ویلای مدرن شهرک گلشهر",
        phone: "09120001002",
        city: "زنجان",
        system_name: "آلومینیوم ترمال بریک لیفت اند اسلاید",
        warranty_years: 20,
        issued_date: "1405/01/20",
        expires_date: "1425/01/20",
        status: "active",
        notes: "ضمانت ثبات رنگ الکترواستاتیک و تیغه پلی‌آمید ۲۸ میلی‌متری",
        created_at: nowIso,
      });
    }
  });

  runMigrations();
}

export function getDb(): Database.Database {
  if (globalForDb.__sepantaDb) {
    return globalForDb.__sepantaDb;
  }

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);

  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  initSchema(db);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__sepantaDb = db;
  } else {
    globalForDb.__sepantaDb = db;
  }

  return db;
}
