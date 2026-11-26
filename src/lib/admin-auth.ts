import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "sepanta_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

interface AuthConfig {
  username: string;
  password: string;
  sessionSecret: string;
}

export interface AdminSession {
  authenticated: true;
  username: string;
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

export function createSessionToken(username: string): string | null {
  const config = getAuthConfig();
  if (!config) {
    return null;
  }

  const payload = {
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
    const parsed = JSON.parse(decoded) as { u?: unknown; exp?: unknown };

    if (
      typeof parsed.u !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const userStillValid = crypto.timingSafeEqual(
      sha256Digest(parsed.u),
      sha256Digest(config.username)
    );
    if (!userStillValid) {
      return null;
    }

    return {
      authenticated: true,
      username: parsed.u,
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
