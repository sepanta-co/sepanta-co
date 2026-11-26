import { NextResponse } from "next/server";
import {
  hasPermission,
  requireAdminAccess,
  verifySameOrigin,
} from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
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

interface JoinedTaskRow {
  id: number;
  staff_user_id: number;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  due_label: string | null;
  is_completed: number;
  completed_at: string | null;
  completed_by_username: string | null;
  assigned_by_username: string;
  created_at: string;
  updated_at: string;
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

export async function GET(request: Request) {
  const auth = await requireAdminAccess();
  if (!auth.ok) return auth.response;

  const isManager = hasPermission(auth.session, "staff:manage");
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status")?.trim() || "";
  const staffUserIdParam = url.searchParams.get("staffUserId")?.trim() || "";

  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (!isManager) {
    if (typeof auth.session.userId !== "number") {
      return NextResponse.json({ ok: true, tasks: [] }, { status: 200 });
    }
    conditions.push("st.staff_user_id = @ownUserId");
    params.ownUserId = auth.session.userId;
  } else if (staffUserIdParam && staffUserIdParam !== "all") {
    const parsedStaffId = Number(staffUserIdParam);
    if (Number.isInteger(parsedStaffId) && parsedStaffId > 0) {
      conditions.push("st.staff_user_id = @staffUserId");
      params.staffUserId = parsedStaffId;
    }
  }

  if (statusFilter === "open") {
    conditions.push("st.is_completed = 0");
  } else if (statusFilter === "completed") {
    conditions.push("st.is_completed = 1");
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT
         st.*,
         su.username AS staff_username,
         su.full_name AS staff_full_name,
         su.job_title AS staff_job_title
       FROM staff_tasks st
       JOIN staff_users su ON su.id = st.staff_user_id
       ${whereClause}
       ORDER BY st.is_completed ASC,
                CASE WHEN st.priority = 'high' THEN 0 ELSE 1 END ASC,
                st.id DESC`
    )
    .all(params) as JoinedTaskRow[];

  return NextResponse.json(
    {
      ok: true,
      tasks: rows.map(serializeTask),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

interface ParsedTaskInput {
  staffUserId: number;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  dueLabel: string | null;
}

function validateTaskInput(raw: Record<string, unknown>): {
  ok: true;
  data: ParsedTaskInput;
} | {
  ok: false;
  error: string;
} {
  const staffUserId = Number(raw.staffUserId);
  if (!Number.isInteger(staffUserId) || staffUserId <= 0) {
    return { ok: false, error: "انتخاب کارمند معتبر الزامی است." };
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (title.length < 3 || title.length > 160) {
    return {
      ok: false,
      error: "عنوان وظیفه باید بین ۳ تا ۱۶۰ کاراکتر باشد.",
    };
  }

  const descriptionRaw =
    typeof raw.description === "string" ? raw.description.trim() : "";
  if (descriptionRaw.length > 1000) {
    return {
      ok: false,
      error: "توضیحات وظیفه نباید بیش از ۱۰۰۰ کاراکتر باشد.",
    };
  }

  const rawCategory =
    typeof raw.category === "string" ? raw.category.trim() : "general";
  const category: TaskCategory = ALLOWED_CATEGORIES.has(
    rawCategory as TaskCategory
  )
    ? (rawCategory as TaskCategory)
    : "general";

  const rawPriority =
    typeof raw.priority === "string" ? raw.priority.trim() : "normal";
  const priority: TaskPriority = ALLOWED_PRIORITIES.has(
    rawPriority as TaskPriority
  )
    ? (rawPriority as TaskPriority)
    : "normal";

  const dueRaw = typeof raw.dueLabel === "string" ? raw.dueLabel.trim() : "";
  if (dueRaw.length > 80) {
    return {
      ok: false,
      error: "یادداشت زمان‌بندی نباید بیش از ۸۰ کاراکتر باشد.",
    };
  }

  return {
    ok: true,
    data: {
      staffUserId,
      title,
      description: descriptionRaw || null,
      category,
      priority,
      dueLabel: dueRaw || null,
    },
  };
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

  const rawList = Array.isArray(body.tasks) ? body.tasks : [body];
  if (rawList.length === 0 || rawList.length > 20) {
    return NextResponse.json(
      { ok: false, error: "تعداد وظایف در هر درخواست باید بین ۱ تا ۲۰ مورد باشد." },
      { status: 400 }
    );
  }

  const validatedTasks: ParsedTaskInput[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return NextResponse.json(
        { ok: false, error: "ساختار یکی از وظایف نامعتبر است." },
        { status: 400 }
      );
    }
    const check = validateTaskInput(item as Record<string, unknown>);
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
    }
    validatedTasks.push(check.data);
  }

  const db = getDb();
  const distinctStaffIds = Array.from(
    new Set(validatedTasks.map((t) => t.staffUserId))
  );
  const staffExistsStmt = db.prepare(
    "SELECT id FROM staff_users WHERE id = ?"
  );
  for (const sid of distinctStaffIds) {
    if (!staffExistsStmt.get(sid)) {
      return NextResponse.json(
        { ok: false, error: "کارمند انتخاب‌شده در سیستم یافت نشد." },
        { status: 404 }
      );
    }
  }

  const nowIso = new Date().toISOString();
  const insertStmt = db.prepare(
    `INSERT INTO staff_tasks (
       staff_user_id,
       title,
       description,
       category,
       priority,
       due_label,
       is_completed,
       completed_at,
       completed_by_username,
       assigned_by_username,
       created_at,
       updated_at
     ) VALUES (
       @staff_user_id,
       @title,
       @description,
       @category,
       @priority,
       @due_label,
       0,
       NULL,
       NULL,
       @assigned_by_username,
       @created_at,
       @updated_at
     )`
  );

  const selectJoinedStmt = db.prepare(
    `SELECT
       st.*,
       su.username AS staff_username,
       su.full_name AS staff_full_name,
       su.job_title AS staff_job_title
     FROM staff_tasks st
     JOIN staff_users su ON su.id = st.staff_user_id
     WHERE st.id = ?`
  );

  const createdTasks = db.transaction(() => {
    const out: ReturnType<typeof serializeTask>[] = [];
    for (const item of validatedTasks) {
      const info = insertStmt.run({
        staff_user_id: item.staffUserId,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        due_label: item.dueLabel,
        assigned_by_username: auth.session.username,
        created_at: nowIso,
        updated_at: nowIso,
      });
      const row = selectJoinedStmt.get(info.lastInsertRowid) as JoinedTaskRow;
      out.push(serializeTask(row));
    }
    return out;
  })();

  return NextResponse.json(
    {
      ok: true,
      task: createdTasks[0],
      tasks: createdTasks,
    },
    { status: 201 }
  );
}
