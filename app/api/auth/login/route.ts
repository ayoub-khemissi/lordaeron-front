import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSession, getSessionCookieOptions } from "@/lib/auth";
import { checkLogin } from "@/lib/login";
import { requestIp } from "@/lib/second-factor";

export async function POST(request: NextRequest) {
  try {
    const { username, password, code } = await request.json();

    const check = await checkLogin(
      username,
      password,
      code,
      requestIp(request.headers),
    );

    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }
    const { account } = check;

    const token = await createSession({
      id: account.id,
      username: account.username,
    });

    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions(token);

    cookieStore.set(cookieOptions);

    return NextResponse.json({
      success: true,
      user: {
        id: account.id,
        username: account.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
