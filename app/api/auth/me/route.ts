import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      // a cookie that no longer opens a session (expired, signed with an older secret) is dropped
      const response = NextResponse.json({ user: null }, { status: 401 });

      response.cookies.delete("lordaeron_session");

      return response;
    }

    return NextResponse.json({ user: session });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
