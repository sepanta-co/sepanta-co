import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminCredentials,
  verifySameOrigin,
} from "@/lib/admin-auth";
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

  if (!username || !password || !verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, error: "نام کاربری یا رمز عبور اشتباه است." },
      { status: 401 }
    );
  }

  const token = createSessionToken(username);
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "پیکربندی احراز هویت سرور کامل نیست." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true, username }, { status: 200 });
  response.cookies.set(COOKIE_NAME, token, getSessionCookieOptions());
  return response;
}
