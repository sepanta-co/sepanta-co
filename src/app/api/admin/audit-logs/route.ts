import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  type AuditAction,
  type AuditEntityType,
} from "@/lib/audit-constants";
import { getDb, type AuditLogRow } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(raw: string | number | null | undefined): string {
  const str = raw === null || raw === undefined ? "" : String(raw);
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
}

function serializeAuditRow(row: AuditLogRow) {
  let details: Record<string, unknown> | null = null;
  if (row.details_json) {
    try {
      const parsed = JSON.parse(row.details_json);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        details = parsed as Record<string, unknown>;
      }
    } catch {
      details = null;
    }
  }

  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    actorUsername: row.actor_username,
    actorFullName: row.actor_full_name,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    detailsJson: row.details_json,
    details,
    ipAddress: row.ip_address,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdminAccess("audit:view");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const actor = url.searchParams.get("actor")?.trim() || "";
  const entityType = url.searchParams.get("entityType")?.trim() || "";
  const action = url.searchParams.get("action")?.trim() || "";
  const query = url.searchParams.get("q")?.trim() || "";
  const format = url.searchParams.get("format")?.trim().toLowerCase() || "";

  const rawPage = Number(url.searchParams.get("page") || "1");
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawLimit = Number(url.searchParams.get("limit") || "25");
  const limit = Number.isFinite(rawLimit)
    ? Math.max(10, Math.min(100, Math.round(rawLimit)))
    : 25;

  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (actor && actor !== "all") {
    conditions.push("actor_username = @actor");
    params.actor = actor;
  }

  if (entityType && entityType !== "all") {
    conditions.push("entity_type = @entityType");
    params.entityType = entityType;
  }

  if (action && action !== "all") {
    conditions.push("action = @action");
    params.action = action;
  }

  if (query) {
    conditions.push(
      "(summary LIKE @q OR entity_id LIKE @q OR actor_full_name LIKE @q OR actor_username LIKE @q)"
    );
    params.q = `%${query}%`;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const db = getDb();

  if (format === "csv") {
    const csvRows = db
      .prepare(
        `SELECT * FROM audit_logs ${whereClause} ORDER BY id DESC LIMIT 1000`
      )
      .all(params) as AuditLogRow[];

    const header = [
      "ID",
      "Timestamp",
      "ActorUsername",
      "ActorFullName",
      "ActorRole",
      "ActionCode",
      "ActionLabel",
      "EntityType",
      "EntityLabel",
      "EntityID",
      "Summary",
      "IPAddress",
      "DetailsJSON",
    ]
      .map(csvCell)
      .join(",");

    const lines = csvRows.map((row) => {
      const actionLabel =
        AUDIT_ACTION_LABELS[row.action as AuditAction] ?? row.action;
      const entityLabel =
        AUDIT_ENTITY_LABELS[row.entity_type as AuditEntityType] ??
        row.entity_type;
      return [
        row.id,
        row.created_at,
        row.actor_username,
        row.actor_full_name,
        row.actor_role,
        row.action,
        actionLabel,
        row.entity_type,
        entityLabel,
        row.entity_id ?? "",
        row.summary,
        row.ip_address,
        row.details_json ?? "",
      ]
        .map(csvCell)
        .join(",");
    });

    const csvBody = `\uFEFF${[header, ...lines].join("\r\n")}`;
    return new NextResponse(csvBody, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="sepanta-audit-log.csv"',
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  }

  const countRow = db
    .prepare(`SELECT COUNT(*) AS total FROM audit_logs ${whereClause}`)
    .get(params) as { total: number };
  const total = countRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;

  const rows = db
    .prepare(
      `SELECT * FROM audit_logs ${whereClause}
       ORDER BY id DESC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as AuditLogRow[];

  const actorRows = db
    .prepare(
      "SELECT DISTINCT actor_username FROM audit_logs ORDER BY actor_username ASC"
    )
    .all() as { actor_username: string }[];

  return NextResponse.json(
    {
      ok: true,
      logs: rows.map(serializeAuditRow),
      total,
      page: safePage,
      totalPages,
      actors: actorRows.map((r) => r.actor_username),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
