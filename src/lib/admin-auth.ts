import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb, type StaffUserRow } from "./db";
import {
  ALL_PERMISSION_KEYS,
  parsePermissionsJson,
  type PermissionKey,
  type StaffRole,
} from "./permissions";

export const COOKIE_NAME = "sepanta_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

interface AuthConfig {
  username: string;
  password: string;
  sessionSecret: string;
}

export interface AdminUserProfile {
  userId: "root" | number;
  username: string;
  fullName: string;
  jobTitle: string;
  role: StaffRole;
  permissions: PermissionKey[];
}

export interface AdminSession extends AdminUserProfile {
  authenticated: true;
}

function getAuthConfig(): AuthConfig | null {
  const username = process.env.ADMIN_USERNAME?.trim() || "";
  const password = process.env.ADMIN_PASSWORD || "";
  const sessionSecret = process.env.SESSION_SECRET || "";

  if (!username || !password || sessionSecret.length < 32) {
    return null;
  }

  return { username, password, sessionSecret };
}

function sha256Digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(plain, salt, 64).toString("hex");
  return `scrypt$${salt}$${key}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  const [, salt, hexKey] = parts;
  if (!salt || !hexKey) {
    return false;
  }

  try {
    const expectedBuf = Buffer.from(hexKey, "hex");
    const actualBuf = crypto.scryptSync(plain, salt, expectedBuf.length);
    if (actualBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const config = getAuthConfig();
  if (!config) {
    return false;
  }

  const userMatch = crypto.timingSafeEqual(
    sha256Digest(username),
    sha256Digest(config.username)
  );
  const passMatch = crypto.timingSafeEqual(
    sha256Digest(password),
    sha256Digest(config.password)
  );

  return userMatch && passMatch;
}

export function authenticateUser(
  username: string,
  password: string
): AdminSession | null {
  const config = getAuthConfig();
  if (!config) {
    return null;
  }

  const trimmedUsername = username.trim();
  if (!trimmedUsername || !password) {
    return null;
  }

  // 1. Immutable root .env manager account
  if (verifyAdminCredentials(trimmedUsername, password)) {
    return {
      authenticated: true,
      userId: "root",
      username: config.username,
      fullName: "مدیر ارشد سامانه",
      jobTitle: "مدیرکل کارخانه",
      role: "manager",
      permissions: [...ALL_PERMISSION_KEYS],
    };
  }

  // 2. Database staff user account
  const normalizedUsername = trimmedUsername.toLowerCase();
  const db = getDb();
  const staffRow = db
    .prepare("SELECT * FROM staff_users WHERE username = ?")
    .get(normalizedUsername) as StaffUserRow | undefined;

  if (!staffRow || staffRow.is_active !== 1) {
    return null;
  }

  if (!verifyPassword(password, staffRow.password_hash)) {
    return null;
  }

  return {
    authenticated: true,
    userId: staffRow.id,
    username: staffRow.username,
    fullName: staffRow.full_name,
    jobTitle: staffRow.job_title,
    role: staffRow.role === "manager" ? "manager" : "staff",
    permissions: parsePermissionsJson(staffRow.permissions_json),
  };
}

export function createSessionToken(
  principal: string | { userId: "root" | number; username: string }
): string | null {
  const config = getAuthConfig();
  if (!config) {
    return null;
  }

  const userId = typeof principal === "string" ? "root" : principal.userId;
  const username =
    typeof principal === "string" ? principal : principal.username;

  const payload = {
    uid: userId,
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", config.sessionSecret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(
  token: string | undefined
): AdminSession | null {
  if (!token) {
    return null;
  }

  const config = getAuthConfig();
  if (!config) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) {
    return null;
  }

  const expectedSig = crypto
    .createHmac("sha256", config.sessionSecret)
    .update(encodedPayload)
    .digest("base64url");

  const sigMatch = crypto.timingSafeEqual(
    sha256Digest(providedSig),
    sha256Digest(expectedSig)
  );
  if (!sigMatch) {
    return null;
  }

  try {
    const decoded = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as {
      uid?: unknown;
      u?: unknown;
      exp?: unknown;
    };

    if (
      typeof parsed.u !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const uid = parsed.uid ?? "root";

    if (uid === "root") {
      const userStillValid = crypto.timingSafeEqual(
        sha256Digest(parsed.u),
        sha256Digest(config.username)
      );
      if (!userStillValid) {
        return null;
      }

      return {
        authenticated: true,
        userId: "root",
        username: config.username,
        fullName: "مدیر ارشد سامانه",
        jobTitle: "مدیرکل کارخانه",
        role: "manager",
        permissions: [...ALL_PERMISSION_KEYS],
      };
    }

    if (typeof uid !== "number" || !Number.isInteger(uid) || uid <= 0) {
      return null;
    }

    // Live SQLite lookup for immediate permission revocation & deactivation
    const db = getDb();
    const staffRow = db
      .prepare(
        `SELECT id, username, full_name, job_title, role, permissions_json, is_active
         FROM staff_users
         WHERE id = ?`
      )
      .get(uid) as Omit<StaffUserRow, "password_hash" | "created_at" | "updated_at"> | undefined;

    if (!staffRow || staffRow.is_active !== 1) {
      return null;
    }

    const usernameMatches = crypto.timingSafeEqual(
      sha256Digest(parsed.u.toLowerCase()),
      sha256Digest(staffRow.username.toLowerCase())
    );
    if (!usernameMatches) {
      return null;
    }

    return {
      authenticated: true,
      userId: staffRow.id,
      username: staffRow.username,
      fullName: staffRow.full_name,
      jobTitle: staffRow.job_title,
      role: staffRow.role === "manager" ? "manager" : "staff",
      permissions: parsePermissionsJson(staffRow.permissions_json),
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function hasPermission(
  session: Pick<AdminUserProfile, "permissions">,
  permission: PermissionKey
): boolean {
  return session.permissions.includes(permission);
}

export function toPublicUserProfile(session: AdminSession): AdminUserProfile {
  return {
    userId: session.userId,
    username: session.username,
    fullName: session.fullName,
    jobTitle: session.jobTitle,
    role: session.role,
    permissions: session.permissions,
  };
}

export async function requireAdminAccess(
  permission?: PermissionKey
): Promise<
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "دسترسی غیرمجاز" },
        { status: 401 }
      ),
    };
  }

  if (permission && !hasPermission(session, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "شما دسترسی مجاز به این بخش را ندارید." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, session };
}

export function getSessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.COOKIE_SECURE === "true",
  };
}

export function verifySameOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const rawHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!rawHost) {
    return false;
  }
  const requestHost = rawHost.split(",")[0].trim().toLowerCase();

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host.toLowerCase() === requestHost;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host.toLowerCase() === requestHost;
    } catch {
      return false;
    }
  }

  return false;
}
