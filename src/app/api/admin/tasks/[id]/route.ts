import { NextResponse } from "next/server";
import {
  hasPermission,
  requireAdminAccess,
  verifySameOrigin,
} from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";
import { getDb, type StaffTaskRow } from "@/lib/db";
import type { TaskCategory, TaskPriority } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set<TaskCategory>([
  "daily",
  "sales",
  "production",
  "warranty",
  "general",
]);

const ALLOWED_PRIORITIES = new Set<TaskPriority>(["normal", "high"]);

interface JoinedTaskRow extends StaffTaskRow {
  staff_username: string;
  staff_full_name: string;
  staff_job_title: string;
}

function serializeTask(row: JoinedTaskRow) {
  return {
    id: row.id,
    staffUserId: row.staff_user_id,
    staffUsername: row.staff_username,
    staffFullName: row.staff_full_name,
    staffJobTitle: row.staff_job_title,
    title: row.title,
    description: row.description,
    category: (ALLOWED_CATEGORIES.has(row.category as TaskCategory)
      ? row.category
      : "general") as TaskCategory,
    priority: (ALLOWED_PRIORITIES.has(row.priority as TaskPriority)
      ? row.priority
      : "normal") as TaskPriority,
    dueLabel: row.due_label,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at,
    completedByUsername: row.completed_by_username,
    assignedByUsername: row.assigned_by_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAccess();
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
      { ok: false, error: "شناسه وظیفه معتبر نیست." },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM staff_tasks WHERE id = ?")
    .get(numericId) as StaffTaskRow | undefined;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "وظیفه مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  const isManager = hasPermission(auth.session, "staff:manage");
  if (!isManager && existing.staff_user_id !== auth.session.userId) {
    return NextResponse.json(
      { ok: false, error: "شما مجاز به تغییر وضعیت وظایف دیگران نیستید." },
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

  const nowIso = new Date().toISOString();
  const nextCompleted =
    typeof body.isCompleted === "boolean"
      ? body.isCompleted
      : existing.is_completed === 1;

  let completedAt = existing.completed_at;
  let completedByUsername = existing.completed_by_username;

  if (typeof body.isCompleted === "boolean") {
    if (body.isCompleted) {
      completedAt = nowIso;
      completedByUsername = auth.session.username;
    } else {
      completedAt = null;
      completedByUsername = null;
    }
  }

  if (!isManager) {
    if (typeof body.isCompleted !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "ارسال وضعیت تکمیل (تیک انجام وظیفه) الزامی است." },
        { status: 400 }
      );
    }

    db.prepare(
      `UPDATE staff_tasks
       SET is_completed = @is_completed,
           completed_at = @completed_at,
           completed_by_username = @completed_by_username,
           updated_at = @updated_at
       WHERE id = @id`
    ).run({
      id: numericId,
      is_completed: nextCompleted ? 1 : 0,
      completed_at: completedAt,
      completed_by_username: completedByUsername,
      updated_at: nowIso,
    });
  } else {
    const nextStaffUserId =
      body.staffUserId !== undefined
        ? Number(body.staffUserId)
        : existing.staff_user_id;

    if (!Number.isInteger(nextStaffUserId) || nextStaffUserId <= 0) {
      return NextResponse.json(
        { ok: false, error: "شناسه کارمند مقصد معتبر نیست." },
        { status: 400 }
      );
    }

    if (nextStaffUserId !== existing.staff_user_id) {
      const targetExists = db
        .prepare("SELECT id FROM staff_users WHERE id = ?")
        .get(nextStaffUserId);
      if (!targetExists) {
        return NextResponse.json(
          { ok: false, error: "کارمند مقصد یافت نشد." },
          { status: 404 }
        );
      }
    }

    const nextTitle =
      typeof body.title === "string" ? body.title.trim() : existing.title;
    if (nextTitle.length < 3 || nextTitle.length > 160) {
      return NextResponse.json(
        { ok: false, error: "عنوان وظیفه باید بین ۳ تا ۱۶۰ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const nextDescription =
      body.description !== undefined
        ? typeof body.description === "string"
          ? body.description.trim() || null
          : null
        : existing.description;
    if (nextDescription && nextDescription.length > 1000) {
      return NextResponse.json(
        { ok: false, error: "توضیحات وظیفه نباید بیش از ۱۰۰۰ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const nextCategory =
      typeof body.category === "string" &&
      ALLOWED_CATEGORIES.has(body.category as TaskCategory)
        ? (body.category as TaskCategory)
        : existing.category;

    const nextPriority =
      typeof body.priority === "string" &&
      ALLOWED_PRIORITIES.has(body.priority as TaskPriority)
        ? (body.priority as TaskPriority)
        : existing.priority;

    const nextDueLabel =
      body.dueLabel !== undefined
        ? typeof body.dueLabel === "string"
          ? body.dueLabel.trim().slice(0, 80) || null
          : null
        : existing.due_label;

    db.prepare(
      `UPDATE staff_tasks
       SET staff_user_id = @staff_user_id,
           title = @title,
           description = @description,
           category = @category,
           priority = @priority,
           due_label = @due_label,
           is_completed = @is_completed,
           completed_at = @completed_at,
           completed_by_username = @completed_by_username,
           updated_at = @updated_at
       WHERE id = @id`
    ).run({
      id: numericId,
      staff_user_id: nextStaffUserId,
      title: nextTitle,
      description: nextDescription,
      category: nextCategory,
      priority: nextPriority,
      due_label: nextDueLabel,
      is_completed: nextCompleted ? 1 : 0,
      completed_at: completedAt,
      completed_by_username: completedByUsername,
      updated_at: nowIso,
    });
  }

  const updated = db
    .prepare(
      `SELECT
         st.*,
         su.username AS staff_username,
         su.full_name AS staff_full_name,
         su.job_title AS staff_job_title
       FROM staff_tasks st
       JOIN staff_users su ON su.id = st.staff_user_id
       WHERE st.id = ?`
    )
    .get(numericId) as JoinedTaskRow;

  const serialized = serializeTask(updated);
  const isPureToggle =
    typeof body.isCompleted === "boolean" &&
    (!isManager ||
      (body.title === undefined &&
        body.description === undefined &&
        body.category === undefined &&
        body.priority === undefined &&
        body.dueLabel === undefined &&
        body.staffUserId === undefined));

  recordAuditEvent({
    session: auth.session,
    action: isPureToggle ? "task.toggle" : "task.update",
    entityType: "task",
    entityId: String(serialized.id),
    summary: isPureToggle
      ? `${serialized.isCompleted ? "تکمیل" : "بازگردانی"} وظیفه «${serialized.title}» (${serialized.staffFullName})`
      : `ویرایش وظیفه «${serialized.title}» (${serialized.staffFullName})`,
    details: {
      taskId: serialized.id,
      staffUsername: serialized.staffUsername,
      before: {
        title: existing.title,
        isCompleted: existing.is_completed === 1,
        priority: existing.priority,
      },
      after: {
        title: serialized.title,
        isCompleted: serialized.isCompleted,
        priority: serialized.priority,
      },
    },
    request,
  });

  return NextResponse.json(
    { ok: true, task: serialized },
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
      { ok: false, error: "شناسه وظیفه معتبر نیست." },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db
    .prepare(
      `SELECT st.id, st.title, st.staff_user_id, su.username AS staff_username
       FROM staff_tasks st
       LEFT JOIN staff_users su ON su.id = st.staff_user_id
       WHERE st.id = ?`
    )
    .get(numericId) as
    | {
        id: number;
        title: string;
        staff_user_id: number;
        staff_username: string | null;
      }
    | undefined;

  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "وظیفه مورد نظر یافت نشد." },
      { status: 404 }
    );
  }

  db.prepare("DELETE FROM staff_tasks WHERE id = ?").run(numericId);

  recordAuditEvent({
    session: auth.session,
    action: "task.delete",
    entityType: "task",
    entityId: String(numericId),
    summary: `حذف وظیفه «${existing.title}»`,
    details: {
      taskId: numericId,
      staffUserId: existing.staff_user_id,
      staffUsername: existing.staff_username,
      title: existing.title,
    },
    request,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
