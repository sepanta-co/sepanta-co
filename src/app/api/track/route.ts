import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { toLatinDigits } from "@/lib/persian-seo";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { doesPhoneVerify, maskPhone } from "@/lib/tracking";

export const dynamic = "force-dynamic";

interface InquiryDbRow {
  tracking_code: string;
  customer_name: string;
  phone: string;
  city: string;
  project_type: string;
  items_json: string;
  estimated_total_irr: number;
  attachment_path: string | null;
  attachment_original_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`track-post:${clientIp}`, 15, 15 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "تعداد درخواست‌های پیگیری بیش از حد مجاز است؛ لطفاً دقایقی دیگر تلاش کنید.",
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

  const trackingCode =
    typeof body.trackingCode === "string"
      ? toLatinDigits(body.trackingCode).trim().toUpperCase()
      : "";
  const phoneVerify =
    typeof body.phoneVerify === "string" ? body.phoneVerify.trim() : "";

  if (!/^SPN-[A-Z0-9]{6}$/.test(trackingCode) || !phoneVerify) {
    return NextResponse.json(
      { ok: false, error: "درخواستی با این کد رهگیری و شماره تماس یافت نشد." },
      { status: 404 }
    );
  }

  const db = getDb();
  const row = db
    .prepare(
      `SELECT tracking_code, customer_name, phone, city, project_type, items_json,
              estimated_total_irr, attachment_path, attachment_original_name,
              status, created_at, updated_at
       FROM inquiries
       WHERE tracking_code = ?`
    )
    .get(trackingCode) as InquiryDbRow | undefined;

  if (!row || !doesPhoneVerify(row.phone, phoneVerify)) {
    return NextResponse.json(
      { ok: false, error: "درخواستی با این کد رهگیری و شماره تماس یافت نشد." },
      { status: 404 }
    );
  }

  let items: unknown[] = [];
  try {
    const parsedItems = JSON.parse(row.items_json);
    if (Array.isArray(parsedItems)) {
      items = parsedItems;
    }
  } catch {
    items = [];
  }

  return NextResponse.json(
    {
      ok: true,
      inquiry: {
        trackingCode: row.tracking_code,
        customerName: row.customer_name,
        maskedPhone: maskPhone(row.phone),
        city: row.city,
        projectType: row.project_type,
        status: row.status,
        items,
        estimatedTotalIrr: row.estimated_total_irr,
        hasAttachment: Boolean(row.attachment_path),
        attachmentName: row.attachment_original_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    },
    { status: 200 }
  );
}
