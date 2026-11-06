import { NextRequest, NextResponse } from "next/server";

import { createDevice, securityLevel } from "@/lib/launcher-devices";
import { checkLogin } from "@/lib/login";
import { requestIp } from "@/lib/second-factor";

// The launcher's sign-in: the website's own checks (lib/login.ts: password, lockouts, authenticator code), then a device
// token for this launcher instead of the website's cookie. POST { username, password, code?, device? } -> { token, username }
export async function POST(request: NextRequest) {
  try {
    const { username, password, code, device } = await request.json();
    const ip = requestIp(request.headers);
    const check = await checkLogin(username, password, code, ip);

    if (!check.ok) {
      return NextResponse.json(
        { error: check.error },
        { status: check.status },
      );
    }
    const token = await createDevice(
      check.account.id,
      typeof device === "string" ? device : "",
      ip,
    );

    return NextResponse.json({
      token,
      username: check.account.username,
      security: await securityLevel(check.account.id),
    });
  } catch (error) {
    console.error("Launcher login error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
