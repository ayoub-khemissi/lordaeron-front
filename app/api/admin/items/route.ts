import type { ShopCategory } from "@/types";

import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession, adminUnauthorized } from "@/lib/admin-auth";
import { getShopItems, createShopItem } from "@/lib/queries/shop-items";
import { createAuditLog } from "@/lib/queries/shop-stats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as ShopCategory | null;

    const items = await getShopItems({
      category: category || undefined,
      activeOnly: false,
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Admin items fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return adminUnauthorized();
    }

    const body = await request.json();

    if (!body.name_en || !body.category || body.price === undefined) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    // Enforce category constraints: service_type only for "services", item_id only for non-"services"
    const isService = body.category === "services";
    const sanitizedServiceType = isService ? body.service_type || null : null;
    const sanitizedItemId = isService ? null : body.item_id || null;

    const itemId = await createShopItem({
      category: body.category,
      service_type: sanitizedServiceType,
      item_id: sanitizedItemId,
      name_en: body.name_en,
      name_fr: body.name_fr || "",
      name_es: body.name_es || "",
      name_de: body.name_de || "",
      name_it: body.name_it || "",
      description_en: body.description_en || null,
      description_fr: body.description_fr || null,
      description_es: body.description_es || null,
      description_de: body.description_de || null,
      description_it: body.description_it || null,
      price: body.price,
      discount_percentage: body.discount_percentage || 0,
      realm_ids: body.realm_ids || null,
      race_ids: body.race_ids || null,
      class_ids: body.class_ids || null,
      faction: body.faction || "both",
      icon_url: body.icon_url || null,
      quality: body.quality ?? null,
      is_highlighted: body.is_highlighted || false,
      is_active: body.is_active !== false,
      is_refundable: body.is_refundable !== false,
      min_level: body.min_level || 0,
      sort_order: body.sort_order || 0,
    });

    await createAuditLog(session.id, "create_item", "shop_item", itemId, {
      name: body.name_en,
      category: body.category,
      price: body.price,
    });

    return NextResponse.json({ success: true, id: itemId });
  } catch (error) {
    console.error("Admin item create error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
