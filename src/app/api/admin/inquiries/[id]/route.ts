import { NextResponse } from "next/server";
import { requireAdminAccess, verifySameOrigin } from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";
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
  const auth = await requireAdminAccess("inquiries:edit");
  if (!auth.ok) return auth.response;

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
  const existing = db
    .prepare("SELECT id, tracking_code, status, admin_notes FROM inquiries WHERE id = ?")
    .get(numericId) as
    | {
        id: number;
        tracking_code: string;
        status: string;
        admin_notes: string | null;
      }
    | undefined;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "پرونده مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  db.prepare(
    `UPDATE inquiries
     SET status = @status, admin_notes = @admin_notes, updated_at = @updated_at
     WHERE id = @id`
  ).run({
    id: numericId,
    status,
    admin_notes: adminNotes || null,
    updated_at: nowIso,
  });

  const updated = db
    .prepare("SELECT * FROM inquiries WHERE id = ?")
    .get(numericId);

  const notesChanged = (existing.admin_notes ?? "") !== adminNotes;
  recordAuditEvent({
    session: auth.session,
    action: "inquiry.update",
    entityType: "inquiry",
    entityId: existing.tracking_code,
    summary: `تغییر وضعیت استعلام ${existing.tracking_code} از «${existing.status}» به «${status}»`,
    details: {
      inquiryId: numericId,
      before: { status: existing.status },
      after: { status },
      adminNotesChanged: notesChanged,
    },
    request,
  });

  return NextResponse.json({ ok: true, inquiry: updated }, { status: 200 });
}
