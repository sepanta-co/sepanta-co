import { NextResponse } from "next/server";
import {
  hashPassword,
  requireAdminAccess,
  verifySameOrigin,
} from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";
import { getDb } from "@/lib/db";
import {
  parsePermissionsJson,
  sanitizePermissions,
  type StaffRole,
} from "@/lib/permissions";

export const dynamic = "force-dynamic";

const USERNAME_REGEX = /^[a-z0-9._-]{3,32}$/;

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

export async function GET() {
  const auth = await requireAdminAccess("staff:manage");
  if (!auth.ok) return auth.response;

  const db = getDb();
  const rows = db
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
       GROUP BY su.id
       ORDER BY su.id DESC`
    )
    .all() as StaffAggregateRow[];

  return NextResponse.json(
    {
      ok: true,
      staff: rows.map(serializeStaff),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: Request) {
  const auth = await requireAdminAccess("staff:manage");
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

  const username =
    typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const jobTitle =
    typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role: StaffRole = body.role === "manager" ? "manager" : "staff";
  const permissions = sanitizePermissions(body.permissions);

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "نام کاربری باید بین ۳ تا ۳۲ کاراکتر و شامل حروف انگلیسی کوچک، عدد، نقطه، خط تیره یا زیرخط باشد.",
      },
      { status: 400 }
    );
  }

  const rootUsername = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
  if (rootUsername && username === rootUsername) {
    return NextResponse.json(
      { ok: false, error: "این نام کاربری برای مدیر ارشد سیستم رزرو شده است." },
      { status: 400 }
    );
  }

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

  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { ok: false, error: "رمز عبور کارمند باید حداقل ۸ کاراکتر باشد." },
      { status: 400 }
    );
  }

  const passwordHash = hashPassword(password);
  const nowIso = new Date().toISOString();
  const db = getDb();

  try {
    const info = db
      .prepare(
        `INSERT INTO staff_users (
           username,
           full_name,
           job_title,
           password_hash,
           role,
           permissions_json,
           is_active,
           created_at,
           updated_at
         ) VALUES (
           @username,
           @full_name,
           @job_title,
           @password_hash,
           @role,
           @permissions_json,
           1,
           @created_at,
           @updated_at
         )`
      )
      .run({
        username,
        full_name: fullName,
        job_title: jobTitle,
        password_hash: passwordHash,
        role,
        permissions_json: JSON.stringify(permissions),
        created_at: nowIso,
        updated_at: nowIso,
      });

    const created = db
      .prepare(
        `SELECT
           id, username, full_name, job_title, role, permissions_json,
           is_active, created_at, updated_at,
           0 AS total_tasks, 0 AS completed_tasks
         FROM staff_users
         WHERE id = ?`
      )
      .get(info.lastInsertRowid) as StaffAggregateRow;

    const serialized = serializeStaff(created);
    recordAuditEvent({
      session: auth.session,
      action: "staff.create",
      entityType: "staff",
      entityId: serialized.username,
      summary: `ایجاد حساب کارمند «${serialized.fullName}» (${serialized.username}) با نقش ${serialized.role}`,
      details: {
        staffUserId: serialized.id,
        username: serialized.username,
        fullName: serialized.fullName,
        jobTitle: serialized.jobTitle,
        role: serialized.role,
        permissions: serialized.permissions,
      },
      request,
    });

    return NextResponse.json(
      { ok: true, staff: serialized },
      { status: 201 }
    );
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { ok: false, error: "این نام کاربری قبلاً ثبت شده است." },
        { status: 400 }
      );
    }
    throw err;
  }
}
