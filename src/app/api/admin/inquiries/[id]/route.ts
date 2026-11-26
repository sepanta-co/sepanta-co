import { NextResponse } from "next/server";
import { getAdminSession, verifySameOrigin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "measured",
  "quoted",
  "in_production",
  "installed",
  "cancelled",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "دسترسی غیرمجاز" },
      { status: 401 }
    );
  }

  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "عدم تطابق مبدا درخواست." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json(
      { ok: false, error: "شناسه استعلام معتبر نیست." },
      { status: 400 }
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

  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json(
      { ok: false, error: "وضعیت انتخاب‌شده معتبر نیست." },
      { status: 400 }
    );
  }

  const adminNotes =
    typeof body.adminNotes === "string" ? body.adminNotes.trim() : "";
  if (adminNotes.length > 2000) {
    return NextResponse.json(
      { ok: false, error: "یادداشت کارشناس نباید بیش از ۲۰۰۰ کاراکتر باشد." },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE inquiries
       SET status = @status, admin_notes = @admin_notes, updated_at = @updated_at
       WHERE id = @id`
    )
    .run({
      id: numericId,
      status,
      admin_notes: adminNotes || null,
      updated_at: nowIso,
    });

  if (result.changes === 0) {
    return NextResponse.json(
      { ok: false, error: "پرونده مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  const updated = db
    .prepare("SELECT * FROM inquiries WHERE id = ?")
    .get(numericId);

  return NextResponse.json({ ok: true, inquiry: updated }, { status: 200 });
}
