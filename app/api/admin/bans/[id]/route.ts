import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { updateBan, deleteBan } from "@/lib/queries/shop-bans";
import { createAuditLog } from "@/lib/queries/shop-stats";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { id } = await params;
    const banId = parseInt(id);
    const body = await request.json();

    const updated = await updateBan(banId, body);

    await createAuditLog(session.id, "update_ban", "shop_ban", banId, {
      changes: body,
    });

    return NextResponse.json({ success: updated });
  } catch (error) {
    console.error("Admin ban update error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { id } = await params;
    const banId = parseInt(id);

    const removed = await deleteBan(banId);

    await createAuditLog(session.id, "delete_ban", "shop_ban", banId, null);

    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error("Admin ban delete error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
