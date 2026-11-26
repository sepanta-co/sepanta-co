import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminAccess, verifySameOrigin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { toLatinDigits } from "@/lib/persian-seo";

export const dynamic = "force-dynamic";

const SERIAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateWarrantySerial(): string {
  const bytes = crypto.randomBytes(4);
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += SERIAL_ALPHABET[bytes[i] & 31];
  }
  return `SPN-W-${suffix}`;
}

export async function GET() {
  const auth = await requireAdminAccess("warranties:manage");
  if (!auth.ok) return auth.response;

  const db = getDb();
  const warranties = db
    .prepare("SELECT * FROM warranties ORDER BY id DESC")
    .all();

  const serviceRequests = db
    .prepare(
      `SELECT
         wsr.id,
         wsr.warranty_id,
         wsr.tracking_code,
         wsr.request_type,
         wsr.description,
         wsr.status,
         wsr.created_at,
         w.serial_code,
         w.customer_name,
         w.phone,
         w.city
       FROM warranty_service_requests wsr
       JOIN warranties w ON w.id = wsr.warranty_id
       ORDER BY wsr.id DESC`
    )
    .all();

  return NextResponse.json(
    { ok: true, warranties, serviceRequests },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: Request) {
  const auth = await requireAdminAccess("warranties:manage");
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
        { ok: false, error: "اطلاعات ارسالی نامعتبر است." },
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

  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phone = toLatinDigits(
    typeof body.phone === "string" ? body.phone : ""
  ).replace(/[\s\-()]/g, "");
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const systemName =
    typeof body.systemName === "string" ? body.systemName.trim() : "";
  const warrantyYears = Number(
    toLatinDigits(String(body.warrantyYears ?? ""))
  );
  const issuedDate =
    typeof body.issuedDate === "string" ? body.issuedDate.trim() : "";
  const expiresDate =
    typeof body.expiresDate === "string" ? body.expiresDate.trim() : "";
  const notes =
    typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "";
  const customSerial =
    typeof body.serialCode === "string"
      ? toLatinDigits(body.serialCode).trim().toUpperCase()
      : "";

  if (customerName.length < 2 || customerName.length > 100) {
    return NextResponse.json(
      { ok: false, error: "نام کارفرما یا پروژه معتبر نیست." },
      { status: 400 }
    );
  }
  if (!/^0[0-9]{10}$/.test(phone)) {
    return NextResponse.json(
      { ok: false, error: "شماره تماس ۱۱ رقمی معتبر وارد کنید." },
      { status: 400 }
    );
  }
  if (city.length < 2 || systemName.length < 2) {
    return NextResponse.json(
      { ok: false, error: "نام شهر و عنوان سیستم الزامی است." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(warrantyYears) || warrantyYears < 1 || warrantyYears > 30) {
    return NextResponse.json(
      { ok: false, error: "مدت ضمانت باید عدد صحیح بین ۱ تا ۳۰ سال باشد." },
      { status: 400 }
    );
  }
  if (!issuedDate || !expiresDate) {
    return NextResponse.json(
      { ok: false, error: "تاریخ صدور و انقضا الزامی است." },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const db = getDb();
  const insertStmt = db.prepare(`
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
      'active',
      @notes,
      @created_at
    )
  `);

  let serialCode = customSerial;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (!customSerial) {
      serialCode = generateWarrantySerial();
    }
    try {
      const info = insertStmt.run({
        serial_code: serialCode,
        customer_name: customerName,
        phone,
        city,
        system_name: systemName,
        warranty_years: warrantyYears,
        issued_date: issuedDate,
        expires_date: expiresDate,
        notes: notes || null,
        created_at: nowIso,
      });

      const created = db
        .prepare("SELECT * FROM warranties WHERE id = ?")
        .get(info.lastInsertRowid);

      return NextResponse.json({ ok: true, warranty: created }, { status: 201 });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed")
      ) {
        if (customSerial) {
          return NextResponse.json(
            { ok: false, error: "این شماره سریال قبلاً ثبت شده است." },
            { status: 400 }
          );
        }
        continue;
      }
      throw err;
    }
  }

  return NextResponse.json(
    { ok: false, error: "خطا در صدور شماره سریال؛ دوباره تلاش کنید." },
    { status: 500 }
  );
}
