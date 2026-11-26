import { NextResponse } from "next/server";
import {
  authenticateUser,
  COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  toPublicUserProfile,
  verifySameOrigin,
} from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "درخواست نامعتبر است (عدم تطابق مبدا)." },
      { status: 403 }
    );
  }

  const clientIp = getClientIp(request);
  const rate = checkRateLimit(`admin-login:${clientIp}`, 5, 15 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "تعداد تلاش‌های ناموفق بیش از حد مجاز است؛ لطفاً ۱۵ دقیقه دیگر تلاش کنید.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSec),
        },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { ok: false, error: "اطلاعات ورود نامعتبر است." },
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
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const session =
    username && password ? authenticateUser(username, password) : null;
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "نام کاربری یا رمز عبور اشتباه است یا حساب غیرفعال است." },
      { status: 401 }
    );
  }

  const token = createSessionToken({
    userId: session.userId,
    username: session.username,
  });
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "پیکربندی احراز هویت سرور کامل نیست." },
      { status: 500 }
    );
  }

  const user = toPublicUserProfile(session);
  recordAuditEvent({
    session,
    action: "auth.login",
    entityType: "auth",
    entityId: user.username,
    summary: `ورود موفق ${user.fullName} (${user.username}) به پنل مدیریت`,
    details: {
      role: user.role,
      jobTitle: user.jobTitle,
    },
    request,
  });

  const response = NextResponse.json(
    { ok: true, username: user.username, user },
    { status: 200 }
  );
  response.cookies.set(COOKIE_NAME, token, getSessionCookieOptions());
  return response;
}
