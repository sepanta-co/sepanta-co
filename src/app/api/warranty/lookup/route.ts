import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { toLatinDigits } from "@/lib/persian-seo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { doesPhoneVerify, maskPhone } from "@/lib/tracking";

export const dynamic = "force-dynamic";

interface WarrantyDbRow {
  id: number;
  serial_code: string;
  customer_name: string;
  phone: string;
  city: string;
  system_name: string;
  warranty_years: number;
  issued_date: string;
  expires_date: string;
  status: string;
}

interface ServiceRequestDbRow {
  tracking_code: string;
  request_type: string;
  description: string;
  status: string;
  created_at: string;
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(
    `warranty-lookup-post:${clientIp}`,
    15,
    15 * 60 * 1000
  );

  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "تعداد درخواست‌های استعلام گارانتی بیش از حد مجاز است؛ لطفاً دقایقی دیگر تلاش کنید.",
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

  if (!serialCode || !phoneVerify) {
    return NextResponse.json(
      {
        ok: false,
        error: "ضمانت‌نامه‌ای با این شماره سریال و شماره تماس یافت نشد.",
      },
      { status: 404 }
    );
  }

  const db = getDb();
  const warranty = db
    .prepare(
      `SELECT id, serial_code, customer_name, phone, city, system_name,
              warranty_years, issued_date, expires_date, status
       FROM warranties
       WHERE UPPER(serial_code) = ?`
    )
    .get(serialCode) as WarrantyDbRow | undefined;

  if (!warranty || !doesPhoneVerify(warranty.phone, phoneVerify)) {
    return NextResponse.json(
      {
        ok: false,
        error: "ضمانت‌نامه‌ای با این شماره سریال و شماره تماس یافت نشد.",
      },
      { status: 404 }
    );
  }

  const serviceRequests = db
    .prepare(
      `SELECT tracking_code, request_type, description, status, created_at
       FROM warranty_service_requests
       WHERE warranty_id = ?
       ORDER BY id DESC`
    )
    .all(warranty.id) as ServiceRequestDbRow[];

  return NextResponse.json(
    {
      ok: true,
      warranty: {
        serialCode: warranty.serial_code,
        customerName: warranty.customer_name,
        maskedPhone: maskPhone(warranty.phone),
        city: warranty.city,
        systemName: warranty.system_name,
        warrantyYears: warranty.warranty_years,
        issuedDate: warranty.issued_date,
        expiresDate: warranty.expires_date,
        status: warranty.status,
      },
      serviceRequests: serviceRequests.map((req) => ({
        trackingCode: req.tracking_code,
        requestType: req.request_type,
        description: req.description,
        status: req.status,
        createdAt: req.created_at,
      })),
    },
    { status: 200 }
  );
}
