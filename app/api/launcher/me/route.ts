import { NextRequest, NextResponse } from "next/server";

import { findDevice, securityLevel, touchDevice } from "@/lib/launcher-devices";
import { findAccountById } from "@/lib/queries/account";
import { requestIp } from "@/lib/second-factor";

// The launcher, as it opens: is its sign-in still good, and for which account and level (the team's realms).
// POST { token } -> { username, security }; 401 when the device was signed out
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const device = await findDevice(token);
    const account = device ? await findAccountById(device.accountId) : null;

    if (!device || !account) {
      return NextResponse.json({ error: "signedOut" }, { status: 401 });
    }
    await touchDevice(device.id, requestIp(request.headers));

    return NextResponse.json({
      username: account.username,
      security: await securityLevel(account.id),
    });
  } catch (error) {
    console.error("Launcher me error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
