import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { getAllBans, createBan } from "@/lib/queries/shop-bans";
import { createAuditLog } from "@/lib/queries/shop-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const bans = await getAllBans();

    return NextResponse.json({ bans });
  } catch (error) {
    console.error("Admin bans fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { account_id, reason, expires_at } = await request.json();

    if (!account_id || !reason) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    const banId = await createBan(
      account_id,
      reason,
      session.id,
      expires_at || null,
    );

    await createAuditLog(session.id, "create_ban", "shop_ban", banId, {
      account_id,
      reason,
      expires_at,
    });

    return NextResponse.json({ success: true, id: banId });
  } catch (error) {
    console.error("Admin ban create error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
