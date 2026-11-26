import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  type AuditAction,
  type AuditEntityType,
} from "./audit-constants";
import { getDb } from "./db";
import type { StaffRole } from "./permissions";
import { getClientIp } from "./rate-limit";

export { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS };
export type { AuditAction, AuditEntityType };

const FORBIDDEN_KEY_FRAGMENTS = [
  "password",
  "passwordhash",
  "password_hash",
  "token",
  "cookie",
  "secret",
  "apikey",
  "api_key",
];

function isForbiddenKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return FORBIDDEN_KEY_FRAGMENTS.some((frag) => normalized.includes(frag));
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[depth-limit]";
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    if (value.startsWith("scrypt$")) return "[REDACTED]";
    return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isForbiddenKey(k)) continue;
      out[k] = sanitizeValue(v, depth + 1);
    }
    return out;
  }

  return String(value);
}

function serializeSanitizedDetails(
  details: Record<string, unknown> | null | undefined
): string | null {
  if (!details) return null;
  const sanitized = sanitizeValue(details);
  const rawJson = JSON.stringify(sanitized);
  if (rawJson.length <= 4000) {
    return rawJson;
  }
  return JSON.stringify({
    truncated: true,
    preview: rawJson.slice(0, 3800),
  });
}

export interface AuditActor {
  userId: "root" | number;
  username: string;
  fullName: string;
  role: StaffRole;
}

export interface RecordAuditParams {
  session: AuditActor;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown> | null;
  request?: Request;
}

export function recordAuditEvent(params: RecordAuditParams): void {
  try {
    const db = getDb();
    const ipAddress = params.request ? getClientIp(params.request) : "system";
    const detailsJson = serializeSanitizedDetails(params.details);
    const nowIso = new Date().toISOString();

    db.prepare(
      `INSERT INTO audit_logs (
         actor_user_id,
         actor_username,
         actor_full_name,
         actor_role,
         action,
         entity_type,
         entity_id,
         summary,
         details_json,
         ip_address,
         created_at
       ) VALUES (
         @actor_user_id,
         @actor_username,
         @actor_full_name,
         @actor_role,
         @action,
         @entity_type,
         @entity_id,
         @summary,
         @details_json,
         @ip_address,
         @created_at
       )`
    ).run({
      actor_user_id: String(params.session.userId),
      actor_username: params.session.username,
      actor_full_name: params.session.fullName,
      actor_role: params.session.role,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ? String(params.entityId).slice(0, 120) : null,
      summary: params.summary.trim().slice(0, 300),
      details_json: detailsJson,
      ip_address: ipAddress.slice(0, 64),
      created_at: nowIso,
    });
  } catch (err) {
    console.error("[AUDIT:ERROR]", err);
  }
}
