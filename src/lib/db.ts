import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "sepanta.db");

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

const globalForDb = globalThis as unknown as {
  __sepantaDb?: Database.Database;
};

function initSchema(db: Database.Database): void {
  const runMigrations = db.transaction(() => {
    db.exec(`
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
    `);

    const nowIso = new Date().toISOString();

    const pricingCount = db
      .prepare("SELECT COUNT(*) as count FROM pricing_rules")
      .get() as { count: number };

    if (pricingCount.count === 0) {
      const insertPricing = db.prepare(`
        INSERT INTO pricing_rules (
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
          @updated_at
        )
      `);

      const seedPricing = [
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
          updated_at: nowIso,
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
          updated_at: nowIso,
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
          updated_at: nowIso,
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
          updated_at: nowIso,
        },
      ];

      for (const row of seedPricing) {
        insertPricing.run(row);
      }
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
