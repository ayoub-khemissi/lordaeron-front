import { NextRequest, NextResponse } from "next/server";

import {
  getArmoryCharacter,
  getCharacterStats,
  getCharacterProfessions,
  getCharacterArenaTeams,
  getCharacterAchievementCount,
  getItemDisplayIds,
  parseEquipmentCache,
} from "@/lib/queries/armory";
import { requestRealm } from "@/lib/realms";
import { armoryModel } from "@/lib/armory-model";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    // the realm being browsed (?realm=<slug>), Lordaeron's by default
    const realm = requestRealm(new URL(request.url).searchParams.get("realm"));

    const character = await getArmoryCharacter(name, realm);

    if (!character) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const [stats, professions, arenaTeams, achievementCount] =
      await Promise.all([
        getCharacterStats(character.guid, realm),
        getCharacterProfessions(character.guid, realm),
        getCharacterArenaTeams(character.guid, realm),
        getCharacterAchievementCount(character.guid, realm),
      ]);

    const equipment = parseEquipmentCache(character.equipmentCache || "");

    // Fetch real displayIds from item_template (worldDb)
    const itemEntries = equipment.map((e) => e.itemEntry);
    const displayIdMap = await getItemDisplayIds(itemEntries, realm);

    // Enrich equipment with real displayIds
    for (const item of equipment) {
      const realDisplayId = displayIdMap.get(item.itemEntry);

      if (realDisplayId) {
        item.displayId = realDisplayId;
      }
    }

    // the gear the 3D viewer draws, in Wowhead's WotLK Classic numbering (transmogs, the realm's own items and the weapons' glows
    // resolved, the slots it cannot draw listed); on a failure, the whole outfit in default attire (the page says so)
    const model = await armoryModel(character.guid, equipment, realm).catch(
      (e) => {
        console.error("Armory model:", e);

        return {
          items: [],
          defaulted: [] as number[],
          missing: [] as number[],
          failed: true,
        };
      },
    );

    return NextResponse.json({
      character,
      stats,
      professions,
      arenaTeams,
      achievementCount,
      equipment,
      model,
    });
  } catch (error) {
    console.error("Armory character error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
