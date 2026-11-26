import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { toLatinDigits } from "@/lib/persian-seo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendWarrantyServiceNotification } from "@/lib/sms";
import { doesPhoneVerify } from "@/lib/tracking";

export const dynamic = "force-dynamic";

const ALLOWED_REQUEST_TYPES = new Set([
  "adjustment",
  "inspection",
  "hardware",
]);

const TRACKING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateServiceCode(): string {
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += TRACKING_ALPHABET[bytes[i] & 31];
  }
  return `SRV-${suffix}`;
}

interface WarrantyOwnerRow {
  id: number;
  serial_code: string;
  customer_name: string;
  phone: string;
  city: string;
  status: string;
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(
    `warranty-service-post:${clientIp}`,
    3,
    30 * 60 * 1000
  );

  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "تعداد درخواست‌های خدمات ثبت‌شده بیش از حد مجاز است؛ لطفاً بعداً دوباره تلاش کنید.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSec),
        },
      }
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
      { ok: false, error: "فرمت JSON درخواست نامعتبر است." },
      { status: 400 }
    );
  }

  const serialCode =
    typeof body.serialCode === "string"
      ? toLatinDigits(body.serialCode).trim().toUpperCase()
      : "";
  const phoneVerify =
    typeof body.phoneVerify === "string" ? body.phoneVerify.trim() : "";
  const requestType =
    typeof body.requestType === "string" ? body.requestType.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
    return NextResponse.json(
      { ok: false, error: "نوع خدمات انتخاب‌شده معتبر نیست." },
      { status: 400 }
    );
  }

  if (description.length < 10 || description.length > 1000) {
    return NextResponse.json(
      {
        ok: false,
        error: "شرح درخواست خدمات باید بین ۱۰ تا ۱۰۰۰ کاراکتر باشد.",
      },
      { status: 400 }
    );
  }

  const db = getDb();
  const warranty = db
    .prepare(
      `SELECT id, serial_code, customer_name, phone, city, status
       FROM warranties
       WHERE UPPER(serial_code) = ?`
    )
    .get(serialCode) as WarrantyOwnerRow | undefined;

  if (!warranty || !doesPhoneVerify(warranty.phone, phoneVerify)) {
    return NextResponse.json(
      {
        ok: false,
        error: "ضمانت‌نامه‌ای با این شماره سریال و شماره تماس یافت نشد.",
      },
      { status: 404 }
    );
  }

  if (warranty.status !== "active") {
    return NextResponse.json(
      {
        ok: false,
        error: "این ضمانت‌نامه در حال حاضر فعال نیست.",
      },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const insertStmt = db.prepare(`
    INSERT INTO warranty_service_requests (
      warranty_id,
      tracking_code,
      request_type,
      description,
      status,
      created_at
    ) VALUES (
      @warranty_id,
      @tracking_code,
      @request_type,
      @description,
      'open',
      @created_at
    )
  `);

  let serviceTrackingCode = "";
  let inserted = false;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    serviceTrackingCode = generateServiceCode();
    try {
      insertStmt.run({
        warranty_id: warranty.id,
        tracking_code: serviceTrackingCode,
        request_type: requestType,
        description,
        created_at: nowIso,
      });
      inserted = true;
      break;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed")
      ) {
        continue;
      }
      throw err;
    }
  }

  if (!inserted) {
    return NextResponse.json(
      { ok: false, error: "خطا در ثبت درخواست خدمات؛ لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }

  await sendWarrantyServiceNotification({
    serviceTrackingCode,
    serialCode: warranty.serial_code,
    customerName: warranty.customer_name,
    phone: warranty.phone,
    city: warranty.city,
    requestType,
    description,
  });

  return NextResponse.json(
    {
      ok: true,
      serviceTrackingCode,
      createdAt: nowIso,
    },
    { status: 201 }
  );
}
