import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  return NextResponse.json(
    session
      ? { authenticated: true, username: session.username }
      : { authenticated: false },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
