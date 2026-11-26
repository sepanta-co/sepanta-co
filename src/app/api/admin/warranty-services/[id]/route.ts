import { NextResponse } from "next/server";
import { requireAdminAccess, verifySameOrigin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_SERVICE_STATUSES = new Set(["open", "in_progress", "resolved"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAccess("warranties:manage");
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
      { ok: false, error: "شناسه درخواست خدمات معتبر نیست." },
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
  if (!ALLOWED_SERVICE_STATUSES.has(status)) {
    return NextResponse.json(
      { ok: false, error: "وضعیت انتخاب‌شده معتبر نیست." },
      { status: 400 }
    );
  }

  const db = getDb();
  const result = db
    .prepare(
      "UPDATE warranty_service_requests SET status = ? WHERE id = ?"
    )
    .run(status, numericId);

  if (result.changes === 0) {
    return NextResponse.json(
      { ok: false, error: "درخواست خدمات مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  const updated = db
    .prepare("SELECT * FROM warranty_service_requests WHERE id = ?")
    .get(numericId);

  return NextResponse.json(
    { ok: true, serviceRequest: updated },
    { status: 200 }
  );
}
