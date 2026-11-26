import { NextResponse } from "next/server";
import { getAdminSession, toPublicUserProfile } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  return NextResponse.json(
    session
      ? { authenticated: true, user: toPublicUserProfile(session) }
      : { authenticated: false },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
