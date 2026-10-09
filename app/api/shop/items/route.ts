import type { ShopCategory } from "@/types";

import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getShopItems } from "@/lib/queries/shop-items";
import { localizeShopItem } from "@/lib/shop-utils";
import { ALLIANCE_RACES, HORDE_RACES } from "@/lib/shop-utils";
import { offeredOnRealm, requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as ShopCategory | null;
    const locale = searchParams.get("locale") || "en";
    const raceId = searchParams.get("race_id")
      ? parseInt(searchParams.get("race_id")!)
      : null;
    const classId = searchParams.get("class_id")
      ? parseInt(searchParams.get("class_id")!)
      : null;
    const level = searchParams.get("level")
      ? parseInt(searchParams.get("level")!)
      : null;
    const highlightedOnly = searchParams.get("highlighted") === "true";
    const realm = requestRealm(searchParams.get("realm"));
    const hasDiscount = searchParams.get("discount") === "true";
    const hasMaxLevel = searchParams.get("has_max_level") === "true";

    const items = await getShopItems({
      category: category || undefined,
      activeOnly: true,
      highlightedOnly: highlightedOnly || undefined,
      hasDiscount: hasDiscount || undefined,
    });

    // Mark each item with eligibility instead of filtering (the realm's own catalogue first)
    const localized = items
      .filter((item) => offeredOnRealm(item.realm_ids, realm))
      .map((item) => {
        const base = localizeShopItem(item, locale);
        let eligible = true;
        let restriction_reason: string | null = null;

        if (item.category === "heirlooms" && !hasMaxLevel) {
          eligible = false;
          restriction_reason = "heirloom_max_level";
        } else if (level && item.min_level > 0 && level < item.min_level) {
          eligible = false;
          restriction_reason = "level";
        } else if (
          classId &&
          item.class_ids &&
          !item.class_ids.includes(classId)
        ) {
          eligible = false;
          restriction_reason = "class";
        } else if (raceId && item.race_ids && !item.race_ids.includes(raceId)) {
          eligible = false;
          restriction_reason = "race";
        } else if (raceId && item.faction !== "both") {
          const isAlliance = ALLIANCE_RACES.includes(raceId);
          const isHorde = HORDE_RACES.includes(raceId);

          if (item.faction === "alliance" && !isAlliance) {
            eligible = false;
            restriction_reason = "faction";
          }
          if (item.faction === "horde" && !isHorde) {
            eligible = false;
            restriction_reason = "faction";
          }
        }

        return { ...base, eligible, restriction_reason };
      });

    return NextResponse.json({ items: localized });
  } catch (error) {
    console.error("Shop items fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
