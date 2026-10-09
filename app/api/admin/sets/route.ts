import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession } from "@/lib/admin-auth";
import { getShopSets, createShopSet } from "@/lib/queries/shop-sets";
import { createAuditLog } from "@/lib/queries/shop-stats";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const sets = await getShopSets({ activeOnly: false });

    return NextResponse.json({ sets });
  } catch (error) {
    console.error("Admin sets fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (
      !body.name_en ||
      body.price === undefined ||
      !body.items ||
      body.items.length === 0
    ) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    const setId = await createShopSet(
      {
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
        class_ids: body.class_ids || null,
        realm_ids: body.realm_ids || null,
        faction: body.faction || "both",
        icon_url: body.icon_url || null,
        is_highlighted: body.is_highlighted || false,
        is_active: body.is_active !== false,
        min_level: body.min_level || 0,
        sort_order: body.sort_order || 0,
      },
      body.items,
    );

    await createAuditLog(session.id, "create_set", "shop_set", setId, {
      name: body.name_en,
      price: body.price,
      itemCount: body.items.length,
    });

    return NextResponse.json({ success: true, id: setId });
  } catch (error) {
    console.error("Admin set create error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
