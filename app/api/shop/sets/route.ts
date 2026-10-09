import type { ShopSetWithItems } from "@/types";

import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getShopSets } from "@/lib/queries/shop-sets";
import { getShopSetItems } from "@/lib/queries/shop-sets";
import { localizeShopSet, ALLIANCE_RACES, HORDE_RACES } from "@/lib/shop-utils";
import { offeredOnRealm, requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";
    const classId = searchParams.get("class_id")
      ? parseInt(searchParams.get("class_id")!)
      : null;
    const raceId = searchParams.get("race_id")
      ? parseInt(searchParams.get("race_id")!)
      : null;
    const level = searchParams.get("level")
      ? parseInt(searchParams.get("level")!)
      : null;

    const realm = requestRealm(searchParams.get("realm"));
    // the realm's own sets
    const sets = (await getShopSets({ activeOnly: true })).filter((set) =>
      offeredOnRealm(set.realm_ids, realm),
    );

    // Fetch items for each set
    const setsWithItems: ShopSetWithItems[] = await Promise.all(
      sets.map(async (set) => {
        const items = await getShopSetItems(set.id);

        return { ...set, items };
      }),
    );

    // Mark each set with eligibility instead of filtering
    const localized = setsWithItems.map((s) => {
      const base = localizeShopSet(s, locale);
      let eligible = true;
      let restriction_reason: string | null = null;

      if (level && s.min_level > 0 && level < s.min_level) {
        eligible = false;
        restriction_reason = "level";
      } else if (classId && s.class_ids && !s.class_ids.includes(classId)) {
        eligible = false;
        restriction_reason = "class";
      } else if (raceId && s.faction !== "both") {
        const isAlliance = ALLIANCE_RACES.includes(raceId);
        const isHorde = HORDE_RACES.includes(raceId);

        if (s.faction === "alliance" && !isAlliance) {
          eligible = false;
          restriction_reason = "faction";
        }
        if (s.faction === "horde" && !isHorde) {
          eligible = false;
          restriction_reason = "faction";
        }
      }

      return { ...base, eligible, restriction_reason };
    });

    return NextResponse.json({ sets: localized });
  } catch (error) {
    console.error("Shop sets fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
