import type { RowDataPacket } from "mysql2";

import { REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";

/*
 * What a progressive realm's progress opens in its shop (lib/realms.ts `progressive`, Rimeheart):
 * - an item its phase keeps locked in the game (the world's wotlk_plus_phase, type 4: never looted nor sold outside its phase window) is not
 *   sold outside it either, so the shop never gets ahead of the realm; it shows by itself the day its phase opens (save SHOP_PHASE_EXEMPT);
 * - the consumables (the Vials of Insight, experience +50%) wait for every level 80 realm first of a race and of a class (Ayoub, 13/10/2026:
 *   they never weigh on the race for them).
 * Read from the realm's databases, kept a minute.
 */

const WORLDSTATE_PHASE = 20100; // game/Conditions/WotLKPlusPhase: the realm's phase
const CONTENT_ITEM = 4;
// sold in the shop whatever the phase (Ayoub, 20/10/2026: "make them available regardless of the phase"): the heirloom chests, which the
// game locks to phase 3 (patch 3.2, the Argent Tournament) but the core lets a player own and wear (its phase only gates loot, vendors
// and quest rewards)
const SHOP_PHASE_EXEMPT = new Set([48677, 48683, 48685, 48687, 48689, 48691]);

// Realm First! Level 80 <class> (458-467) and <race> (1404-1413), Blizzard's achievements
export const LEVEL_80_REALM_FIRSTS = [
  458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 1404, 1405, 1406, 1407,
  1408, 1409, 1410, 1411, 1412, 1413,
];
// the shop categories a realm's level 80 realm firsts open
export const REALM_FIRSTS_CATEGORIES = ["consumables"];

const TTL = 60_000;
const cache = new Map<string, { at: number; value: Promise<unknown> }>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);

  if (hit && Date.now() - hit.at < TTL) return hit.value as Promise<T>;
  const value = load();

  cache.set(key, { at: Date.now(), value });
  // a failed read is not kept
  value.catch(() => cache.delete(key));

  return value;
}

// the realm's phase, null for a realm without phases
export function realmPhase(slug: RealmSlug): Promise<number | null> {
  if (!REALMS[slug].progressive) return Promise.resolve(null);

  return cached(`phase:${slug}`, async () => {
    const [rows] = await realmCharactersDb(slug).query<RowDataPacket[]>(
      "SELECT value FROM worldstates WHERE entry = ?",
      [WORLDSTATE_PHASE],
    );

    return rows.length ? Number(rows[0].value) : 0;
  });
}

function phaseWindows(slug: RealmSlug) {
  return cached(`windows:${slug}`, async () => {
    const [rows] = await realmWorldDb(slug).query<RowDataPacket[]>(
      "SELECT Entry, PhaseMin, PhaseMax FROM wotlk_plus_phase WHERE Type = ? AND SubEntry = 0",
      [CONTENT_ITEM],
    );

    return new Map(
      rows.map((r) => [Number(r.Entry), [r.PhaseMin, r.PhaseMax] as const]),
    );
  });
}

// the items among `ids` the realm's phase keeps out of the game now
export async function phaseLockedItems(
  slug: RealmSlug,
  ids: number[],
): Promise<Set<number>> {
  const phase = await realmPhase(slug);

  if (phase === null || !ids.length) return new Set();
  const windows = await phaseWindows(slug);

  return new Set(
    ids.filter((id) => {
      const w = windows.get(id);

      return (
        !!w && !SHOP_PHASE_EXEMPT.has(id) && (phase < w[0] || phase > w[1])
      );
    }),
  );
}

// how many of the level 80 realm firsts the realm's players have earned (all of them on a realm without phases)
export function realmFirstsProgress(
  slug: RealmSlug,
): Promise<{ done: number; total: number }> {
  const total = LEVEL_80_REALM_FIRSTS.length;

  if (!REALMS[slug].progressive) return Promise.resolve({ done: total, total });

  return cached(`firsts:${slug}`, async () => {
    const [rows] = await realmCharactersDb(slug).query<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT achievement) AS done FROM character_achievement WHERE achievement IN (?)",
      [LEVEL_80_REALM_FIRSTS],
    );

    return { done: Number(rows[0]?.done ?? 0), total };
  });
}
