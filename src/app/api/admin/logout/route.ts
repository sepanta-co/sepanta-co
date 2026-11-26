import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  getAdminSession,
  getSessionCookieOptions,
  verifySameOrigin,
} from "@/lib/admin-auth";
import { recordAuditEvent } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "عدم تطابق مبدا درخواست." },
      { status: 403 }
    );
  }

  const session = await getAdminSession();
  if (session) {
    recordAuditEvent({
      session,
      action: "auth.logout",
      entityType: "auth",
      entityId: session.username,
      summary: `خروج امن ${session.fullName} (${session.username}) از پنل مدیریت`,
      request,
    });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(COOKIE_NAME, "", getSessionCookieOptions(0));
  return response;
}
