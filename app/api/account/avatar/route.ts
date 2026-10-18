import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { isAvatarIcon } from "@/lib/avatars";
import { setAvatar } from "@/lib/queries/avatar";

export const dynamic = "force-dynamic";

/* The account's avatar (lib/avatars.ts): PUT {icon} one of the site's icons, {icon: null} back to the account's initial */
export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { icon } = await request.json();

    if (icon !== null && !isAvatarIcon(icon)) {
      return NextResponse.json({ error: "invalidIcon" }, { status: 400 });
    }
    await setAvatar(session.id, icon);

    return NextResponse.json({ success: true, icon });
  } catch (error) {
    console.error("Avatar error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
