import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import {
  getShopSetById,
  updateShopSet,
  deactivateShopSet,
} from "@/lib/queries/shop-sets";
import { createAuditLog } from "@/lib/queries/shop-stats";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { id } = await params;
    const set = await getShopSetById(parseInt(id));

    if (!set) {
      return NextResponse.json({ error: "setNotFound" }, { status: 404 });
    }

    return NextResponse.json({ set });
  } catch (error) {
    console.error("Admin set detail error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

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
    const setId = parseInt(id);
    const body = await request.json();

    const existing = await getShopSetById(setId);

    if (!existing) {
      return NextResponse.json({ error: "setNotFound" }, { status: 404 });
    }

    await updateShopSet(setId, body, body.items);

    await createAuditLog(session.id, "update_set", "shop_set", setId, {
      changes: Object.keys(body),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin set update error:", error);

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
    const setId = parseInt(id);

    const deactivated = await deactivateShopSet(setId);

    await createAuditLog(session.id, "deactivate_set", "shop_set", setId, null);

    return NextResponse.json({ success: deactivated });
  } catch (error) {
    console.error("Admin set deactivate error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
