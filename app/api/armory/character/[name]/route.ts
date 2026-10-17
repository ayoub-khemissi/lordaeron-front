import { NextRequest, NextResponse } from "next/server";

import {
  getArmoryCharacter,
  getCharacterStats,
  getCharacterProfessions,
  getCharacterArenaTeams,
  getCharacterAchievementCount,
  getItemDisplayIds,
  getEquippedItems,
  parseEquipmentCache,
} from "@/lib/queries/armory";
import { getCharacterChallenge } from "@/lib/queries/challenges";
import { realmHasChallenges, requestRealm } from "@/lib/realms";
import { armoryModel } from "@/lib/armory-model";
import { characterItemTooltips } from "@/lib/tooltips/instance";
import { isTooltipLocale } from "@/lib/tooltips";
import { viewerSeesGm } from "@/lib/queries/realm-search";
import { characterSpecs } from "@/lib/talents";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    // the realm being browsed (?realm=<slug>), Lordaeron's by default; the tooltips' language (?locale=)
    const params2 = new URL(request.url).searchParams;
    const realm = requestRealm(params2.get("realm"));
    const locale = params2.get("locale");

    // a site administrator also opens the game masters' characters (lib/queries/realm-search.ts)
    const character = await getArmoryCharacter(
      name,
      realm,
      await viewerSeesGm(),
    );

    if (!character) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const [stats, professions, arenaTeams, achievementCount, specs, challenge] =
      await Promise.all([
        getCharacterStats(character.guid, realm),
        getCharacterProfessions(character.guid, realm),
        getCharacterArenaTeams(character.guid, realm),
        getCharacterAchievementCount(character.guid, realm),
        // its specializations, from the realm's talent trees (lib/talents.ts)
        characterSpecs(
          realm,
          character.guid,
          character.class,
          isTooltipLocale(locale) ? locale : "en",
        ).catch((e) => {
          console.error("Armory specs:", e);

          return null;
        }),
        // its WotLK+ challenge, on a realm whose challenges are open on the site (lib/realms.ts RealmInfo.challenges; no query otherwise)
        realmHasChallenges(realm)
          ? getCharacterChallenge(realm, character.guid, locale ?? "en")
          : null,
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

    // the gear without its transmogs, for the armory's toggle (Ayoub, 13/10/2026): only when a transmog changes something
    const worn = await getEquippedItems(character.guid, realm).catch(() => []);
    const transmogged = worn.some((w) => {
      const shown = equipment.find((e) => e.slot === w.slot);

      return !shown || shown.itemEntry !== w.itemEntry;
    });
    const modelBase = transmogged
      ? await armoryModel(character.guid, worn, realm, false).catch((e) => {
          console.error("Armory model (no transmog):", e);

          return null;
        })
      : null;

    // the character's own items: their enchantments, gems, suffixes and the set pieces worn
    const tooltips = await characterItemTooltips(
      realm,
      character.guid,
      isTooltipLocale(locale) ? locale : "en",
    ).catch((e) => {
      console.error("Armory tooltips:", e);

      return {};
    });

    return NextResponse.json({
      character,
      stats,
      professions,
      arenaTeams,
      achievementCount,
      specs,
      challenge,
      equipment,
      model,
      modelBase,
      tooltips,
    });
  } catch (error) {
    console.error("Armory character error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
