import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  getSessionCookieOptions,
  verifySameOrigin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "عدم تطابق مبدا درخواست." },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(COOKIE_NAME, "", getSessionCookieOptions(0));
  return response;
}
