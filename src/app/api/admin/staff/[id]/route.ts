import { NextResponse } from "next/server";
import {
  hashPassword,
  requireAdminAccess,
  verifySameOrigin,
} from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";
import { getDb, type StaffUserRow } from "@/lib/db";
import {
  parsePermissionsJson,
  sanitizePermissions,
  type StaffRole,
} from "@/lib/permissions";

export const dynamic = "force-dynamic";

interface StaffAggregateRow {
  id: number;
  username: string;
  full_name: string;
  job_title: string;
  role: string;
  permissions_json: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  total_tasks: number;
  completed_tasks: number;
}

function serializeStaff(row: StaffAggregateRow) {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    jobTitle: row.job_title,
    role: (row.role === "manager" ? "manager" : "staff") as StaffRole,
    permissions: parsePermissionsJson(row.permissions_json),
    isActive: row.is_active === 1,
    totalTasks: row.total_tasks ?? 0,
    completedTasks: row.completed_tasks ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAccess("staff:manage");
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
      { ok: false, error: "شناسه کارمند معتبر نیست." },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM staff_users WHERE id = ?")
    .get(numericId) as StaffUserRow | undefined;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "کارمند مورد نظر یافت نشد." },
      { status: 404 }
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

  const fullName =
    typeof body.fullName === "string"
      ? body.fullName.trim()
      : existing.full_name;
  const jobTitle =
    typeof body.jobTitle === "string"
      ? body.jobTitle.trim()
      : existing.job_title;
  const role: StaffRole =
    body.role === "manager" || body.role === "staff"
      ? body.role
      : existing.role === "manager"
        ? "manager"
        : "staff";
  const permissions =
    body.permissions !== undefined
      ? sanitizePermissions(body.permissions)
      : parsePermissionsJson(existing.permissions_json);
  const isActive =
    typeof body.isActive === "boolean"
      ? body.isActive
      : existing.is_active === 1;

  if (fullName.length < 2 || fullName.length > 80) {
    return NextResponse.json(
      { ok: false, error: "نام و نام خانوادگی باید بین ۲ تا ۸۰ کاراکتر باشد." },
      { status: 400 }
    );
  }

  if (jobTitle.length < 2 || jobTitle.length > 80) {
    return NextResponse.json(
      { ok: false, error: "سمت شغلی باید بین ۲ تا ۸۰ کاراکتر باشد." },
      { status: 400 }
    );
  }

  // Prevent a non-root manager from accidentally locking themselves out
  if (auth.session.userId === numericId) {
    if (!isActive) {
      return NextResponse.json(
        { ok: false, error: "امکان غیرفعال‌سازی حساب کاربری فعلی خودتان وجود ندارد." },
        { status: 400 }
      );
    }
    if (!permissions.includes("staff:manage")) {
      return NextResponse.json(
        {
          ok: false,
          error: "امکان حذف دسترسی مدیریت کارکنان از حساب کاربری فعلی وجود ندارد.",
        },
        { status: 400 }
      );
    }
  }

  let nextPasswordHash = existing.password_hash;
  let passwordChanged = false;
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 8 || body.password.length > 128) {
      return NextResponse.json(
        { ok: false, error: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد." },
        { status: 400 }
      );
    }
    nextPasswordHash = hashPassword(body.password);
    passwordChanged = true;
  }

  const nowIso = new Date().toISOString();
  db.prepare(
    `UPDATE staff_users
     SET full_name = @full_name,
         job_title = @job_title,
         password_hash = @password_hash,
         role = @role,
         permissions_json = @permissions_json,
         is_active = @is_active,
         updated_at = @updated_at
     WHERE id = @id`
  ).run({
    id: numericId,
    full_name: fullName,
    job_title: jobTitle,
    password_hash: nextPasswordHash,
    role,
    permissions_json: JSON.stringify(permissions),
    is_active: isActive ? 1 : 0,
    updated_at: nowIso,
  });

  const updated = db
    .prepare(
      `SELECT
         su.id,
         su.username,
         su.full_name,
         su.job_title,
         su.role,
         su.permissions_json,
         su.is_active,
         su.created_at,
         su.updated_at,
         COUNT(st.id) AS total_tasks,
         COALESCE(SUM(CASE WHEN st.is_completed = 1 THEN 1 ELSE 0 END), 0) AS completed_tasks
       FROM staff_users su
       LEFT JOIN staff_tasks st ON st.staff_user_id = su.id
       WHERE su.id = ?
       GROUP BY su.id`
    )
    .get(numericId) as StaffAggregateRow;

  const serialized = serializeStaff(updated);
  const oldPerms = parsePermissionsJson(existing.permissions_json);
  recordAuditEvent({
    session: auth.session,
    action: "staff.update",
    entityType: "staff",
    entityId: existing.username,
    summary: `ویرایش مشخصات و دسترسی‌های کارمند «${serialized.fullName}» (${existing.username})`,
    details: {
      staffUserId: numericId,
      before: {
        fullName: existing.full_name,
        jobTitle: existing.job_title,
        role: existing.role,
        permissions: oldPerms,
        isActive: existing.is_active === 1,
      },
      after: {
        fullName: serialized.fullName,
        jobTitle: serialized.jobTitle,
        role: serialized.role,
        permissions: serialized.permissions,
        isActive: serialized.isActive,
      },
      ...(passwordChanged ? { passwordChanged: true } : {}),
    },
    request,
  });

  return NextResponse.json(
    { ok: true, staff: serialized },
    { status: 200 }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAccess("staff:manage");
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
      { ok: false, error: "شناسه کارمند معتبر نیست." },
      { status: 400 }
    );
  }

  if (auth.session.userId === numericId) {
    return NextResponse.json(
      { ok: false, error: "امکان حذف حساب کاربری فعلی خودتان وجود ندارد." },
      { status: 400 }
    );
  }

  const db = getDb();
  const target = db
    .prepare("SELECT id, username, full_name, job_title, role FROM staff_users WHERE id = ?")
    .get(numericId) as
    | {
        id: number;
        username: string;
        full_name: string;
        job_title: string;
        role: string;
      }
    | undefined;

  if (!target) {
    return NextResponse.json(
      { ok: false, error: "کارمند مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  db.prepare("DELETE FROM staff_users WHERE id = ?").run(numericId);

  recordAuditEvent({
    session: auth.session,
    action: "staff.delete",
    entityType: "staff",
    entityId: target.username,
    summary: `حذف حساب کارمند «${target.full_name}» (${target.username})`,
    details: {
      staffUserId: target.id,
      username: target.username,
      fullName: target.full_name,
      jobTitle: target.job_title,
      role: target.role,
    },
    request,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
