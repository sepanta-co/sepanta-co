import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  FRAME_FINISHES,
  isValidSystemKey,
  SYSTEM_RULES,
  validateConfiguration,
  type FrameFinishKey,
  type GlassOptionKey,
  type OpeningType,
} from "@/lib/configurator-rules";
import { getDb, type PricingRuleRow } from "@/lib/db";
import { toLatinDigits } from "@/lib/persian-seo";
import {
  calculateInquiryTotals,
  type PricableInquiryItem,
} from "@/lib/pricing-calculator";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendInquiryNotifications } from "@/lib/sms";
import {
  deleteUploadedFile,
  saveValidatedDrawing,
  UploadValidationError,
} from "@/lib/uploads";

export const dynamic = "force-dynamic";

const TRACKING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateTrackingCode(): string {
  const bytes = crypto.randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += TRACKING_ALPHABET[bytes[i] & 31];
  }
  return `SPN-${suffix}`;
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rate = checkRateLimit(
    `inquiries-post:${clientIp}`,
    5,
    15 * 60 * 1000
  );

  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "تعداد درخواست‌های شما بیش از حد مجاز است؛ لطفاً چند دقیقه دیگر دوباره تلاش کنید.",
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
  let attachmentFile: File | null = null;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const rawPayload = formData.get("payload");
      if (typeof rawPayload !== "string") {
        return badRequest("بخش اطلاعات فرم (payload) یافت نشد.");
      }
      const parsed = JSON.parse(rawPayload);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return badRequest("ساختار اطلاعات ارسالی معتبر نیست.");
      }
      body = parsed as Record<string, unknown>;

      const rawAttachment = formData.get("attachment");
      if (rawAttachment instanceof File && rawAttachment.size > 0) {
        attachmentFile = rawAttachment;
      }
    } catch {
      return badRequest("فرمت داده‌های ارسالی نامعتبر است.");
    }
  } else {
    try {
      const parsed = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return badRequest("ساختار اطلاعات ارسالی معتبر نیست.");
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return badRequest("فرمت JSON درخواست نامعتبر است.");
    }
  }

  // Honeypot field check: silently accept without saving or sending SMS
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  if (customerName.length < 2 || customerName.length > 100) {
    return badRequest("نام و نام خانوادگی باید بین ۲ تا ۱۰۰ کاراکتر باشد.");
  }

  const rawPhone = typeof body.phone === "string" ? body.phone : "";
  const phone = toLatinDigits(rawPhone).replace(/[\s\-()]/g, "");
  if (!/^0[0-9]{10}$/.test(phone)) {
    return badRequest(
      "شماره تماس معتبر نیست؛ شماره ۱۱ رقمی با پیش‌شماره (مثلاً 0912 یا 024) وارد کنید."
    );
  }

  const city = typeof body.city === "string" ? body.city.trim() : "";
  if (city.length < 2 || city.length > 60) {
    return badRequest("نام شهر باید بین ۲ تا ۶۰ کاراکتر باشد.");
  }

  const projectType =
    typeof body.projectType === "string" ? body.projectType.trim() : "";
  if (!projectType || projectType.length > 120) {
    return badRequest("نوع پروژه یا نیاز درخواست‌شده معتبر نیست.");
  }

  const notes =
    typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "";
  if (typeof body.notes === "string" && body.notes.trim().length > 1000) {
    return badRequest("توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد.");
  }

  // Validate configurator items BEFORE touching disk for attachment
  const validatedItems: PricableInquiryItem[] = [];
  if (body.items !== undefined) {
    if (!Array.isArray(body.items)) {
      return badRequest("فهرست اقلام باید به‌صورت آرایه ارسال شود.");
    }
    if (body.items.length > 30) {
      return badRequest("حداکثر ۳۰ قلم در هر استعلام قابل ثبت است.");
    }

    for (let i = 0; i < body.items.length; i += 1) {
      const rawItem = body.items[i] as Record<string, unknown> | null;
      if (!rawItem || typeof rawItem !== "object") {
        return badRequest(`ساختار ردیف ${i + 1} نامعتبر است.`);
      }

      const sysRaw = typeof rawItem.system === "string" ? rawItem.system : "";
      if (!isValidSystemKey(sysRaw)) {
        return badRequest(`نوع سیستم در ردیف ${i + 1} معتبر نیست.`);
      }
      const rule = SYSTEM_RULES[sysRaw];

      const widthCm = Number(toLatinDigits(String(rawItem.widthCm ?? "")));
      const heightCm = Number(toLatinDigits(String(rawItem.heightCm ?? "")));
      const panelCount = Number(
        toLatinDigits(String(rawItem.panelCount ?? rule.defaultPanels))
      );
      const quantity = Number(toLatinDigits(String(rawItem.quantity ?? 1)));

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return badRequest(
          `تعداد در ردیف ${i + 1} باید عدد صحیح بین ۱ تا ۱۰۰ باشد.`
        );
      }

      const rawGlass =
        typeof rawItem.glassType === "string"
          ? rawItem.glassType
          : typeof rawItem.glass === "string"
            ? rawItem.glass
            : rule.defaultGlass;

      if (!rule.allowedGlasses.includes(rawGlass as GlassOptionKey)) {
        return badRequest(
          `نوع شیشه در ردیف ${i + 1} برای این سیستم مجاز نیست.`
        );
      }
      const glassType = rawGlass as GlassOptionKey;

      const rawFinish =
        typeof rawItem.finish === "string" ? rawItem.finish : "white";
      if (!(rawFinish in FRAME_FINISHES)) {
        return badRequest(`رنگ پروفیل در ردیف ${i + 1} معتبر نیست.`);
      }
      const finish = rawFinish as FrameFinishKey;

      const openings: OpeningType[] = Array.isArray(rawItem.openings)
        ? rawItem.openings.map((op) =>
            typeof op === "string" &&
            rule.allowedOpenings.includes(op as OpeningType)
              ? (op as OpeningType)
              : rule.defaultOpening
          )
        : Array.from({ length: panelCount }, () => rule.defaultOpening);

      const includeMesh = Boolean(rawItem.includeMesh) && rule.supportsMesh;

      const validation = validateConfiguration({
        system: sysRaw,
        widthCm,
        heightCm,
        panelCount,
        openings,
        glass: glassType,
        finish,
        includeMesh,
      });

      if (!validation.isValid) {
        return badRequest(
          validation.errors[0] ||
            `ابعاد ردیف ${i + 1} خارج از محدوده مجاز است.`
        );
      }

      const locationName =
        typeof rawItem.locationName === "string" &&
        rawItem.locationName.trim().length > 0
          ? rawItem.locationName.trim().slice(0, 80)
          : `ردیف ${i + 1}`;

      validatedItems.push({
        locationName,
        system: sysRaw,
        widthCm,
        heightCm,
        panelCount,
        openings: openings.slice(0, panelCount),
        glassType,
        finish,
        includeMesh,
        quantity,
      });
    }
  }

  // Validate & persist attachment after input validation passes
  let attachmentPath: string | null = null;
  let attachmentOriginalName: string | null = null;

  if (attachmentFile) {
    try {
      const saved = await saveValidatedDrawing(attachmentFile);
      attachmentPath = saved.storedFilename;
      attachmentOriginalName = saved.originalName;
    } catch (err) {
      if (err instanceof UploadValidationError) {
        return badRequest(err.message);
      }
      return badRequest("خطا در پردازش فایل پیوست.");
    }
  }

  // Server-authoritative price calculation from SQLite pricing_rules
  const db = getDb();
  const pricingRows = db
    .prepare("SELECT * FROM pricing_rules")
    .all() as PricingRuleRow[];
  const rulesMap = Object.fromEntries(
    pricingRows.map((row) => [row.system_key, row])
  );

  let estimatedTotalIrr = 0;
  let estimatedTotalToman = 0;
  let persistedItemsJson = "[]";

  if (validatedItems.length > 0) {
    const calculated = calculateInquiryTotals(validatedItems, rulesMap);
    estimatedTotalIrr = calculated.totalIrr;
    estimatedTotalToman = calculated.totalToman;
    persistedItemsJson = JSON.stringify(calculated.items);
  }

  const nowIso = new Date().toISOString();
  const insertStmt = db.prepare(`
    INSERT INTO inquiries (
      tracking_code,
      customer_name,
      phone,
      city,
      project_type,
      items_json,
      estimated_total_irr,
      notes,
      attachment_path,
      attachment_original_name,
      status,
      created_at,
      updated_at
    ) VALUES (
      @tracking_code,
      @customer_name,
      @phone,
      @city,
      @project_type,
      @items_json,
      @estimated_total_irr,
      @notes,
      @attachment_path,
      @attachment_original_name,
      'new',
      @created_at,
      @updated_at
    )
  `);

  let trackingCode = "";
  let inserted = false;

  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      trackingCode = generateTrackingCode();
      try {
        insertStmt.run({
          tracking_code: trackingCode,
          customer_name: customerName,
          phone,
          city,
          project_type: projectType,
          items_json: persistedItemsJson,
          estimated_total_irr: estimatedTotalIrr,
          notes: notes || null,
          attachment_path: attachmentPath,
          attachment_original_name: attachmentOriginalName,
          created_at: nowIso,
          updated_at: nowIso,
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
  } catch (err) {
    deleteUploadedFile(attachmentPath);
    throw err;
  }

  if (!inserted) {
    deleteUploadedFile(attachmentPath);
    return NextResponse.json(
      { ok: false, error: "خطا در تولید کد رهگیری؛ لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }

  await sendInquiryNotifications({
    trackingCode,
    customerName,
    phone,
    city,
    estimatedTotalIrr,
  });

  const itemCount = validatedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return NextResponse.json(
    {
      ok: true,
      trackingCode,
      estimatedTotalIrr,
      estimatedTotalToman,
      itemCount,
      hasAttachment: Boolean(attachmentPath),
      attachmentName: attachmentOriginalName,
      createdAt: nowIso,
    },
    { status: 201 }
  );
}
