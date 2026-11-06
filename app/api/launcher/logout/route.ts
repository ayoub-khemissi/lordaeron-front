import { NextRequest, NextResponse } from "next/server";

import { revokeDevice } from "@/lib/launcher-devices";

// The launcher's sign-out: its device token is refused from now on. POST { token }
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    await revokeDevice(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Launcher logout error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
