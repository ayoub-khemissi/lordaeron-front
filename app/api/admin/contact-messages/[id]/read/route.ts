import { NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { markContactMessageAsRead } from "@/lib/queries/admin-contact";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { id } = await params;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return NextResponse.json({ error: "invalidId" }, { status: 400 });
    }

    await markContactMessageAsRead(messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin mark message as read error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
