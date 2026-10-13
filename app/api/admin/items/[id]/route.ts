import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import {
  getShopItemById,
  updateShopItem,
  deactivateShopItem,
} from "@/lib/queries/shop-items";
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
    const item = await getShopItemById(parseInt(id));

    if (!item) {
      return NextResponse.json({ error: "itemNotFound" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Admin item detail error:", error);

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
    const itemId = parseInt(id);
    const body = await request.json();

    const existing = await getShopItemById(itemId);

    if (!existing) {
      return NextResponse.json({ error: "itemNotFound" }, { status: 404 });
    }

    // Enforce category constraints: service_type only for "services", item_id only for non-"services"
    const category = body.category ?? existing.category;
    const isService = category === "services";

    if ("service_type" in body || "category" in body) {
      body.service_type = isService
        ? (body.service_type ?? existing.service_type)
        : null;
    }
    if ("item_id" in body || "category" in body) {
      body.item_id = isService ? null : (body.item_id ?? existing.item_id);
    }

    const updated = await updateShopItem(itemId, body);

    await createAuditLog(session.id, "update_item", "shop_item", itemId, {
      changes: body,
    });

    return NextResponse.json({ success: updated });
  } catch (error) {
    console.error("Admin item update error:", error);

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
    const itemId = parseInt(id);

    const deactivated = await deactivateShopItem(itemId);

    await createAuditLog(
      session.id,
      "deactivate_item",
      "shop_item",
      itemId,
      null,
    );

    return NextResponse.json({ success: deactivated });
  } catch (error) {
    console.error("Admin item deactivate error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
