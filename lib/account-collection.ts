import type { RowDataPacket } from "mysql2";

import { type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";

/*
 * An account's mounts and companions on a realm (Ayoub, 09/11/2026): the game shares them between the account's characters on the realm
 * through the realm's characters database, `account_collection` (account, spell, time; lordaeron-core AccountCollection.cpp, created by
 * the worldserver as it starts). The shop marks the mounts and companions the account already has there, so nobody buys one twice: the
 * spell its item teaches (item_template spellid_N with spelltrigger_N 6), or the other faction's half of a pair
 * (player_factionchange_spells), which the game gives a character of the other faction in its place.
 * A realm without the table yet (its worldserver not restarted since): nothing owned, no error.
 */

// ITEM_SPELLTRIGGER_LEARN_SPELL_ID
const LEARN_SPELL = 6;
const SLOTS = [1, 2, 3, 4, 5];

// the shop categories the game shares by account
export const COLLECTION_CATEGORIES = ["mounts", "pets"];

// the item ids (of `itemIds`) whose mount or companion is already in the account's collection on the realm: three queries per call, not
// one per item
export async function ownedCollectionItems(
  realm: RealmSlug,
  accountId: number,
  itemIds: number[],
): Promise<Set<number>> {
  const owned = new Set<number>();

  if (!accountId || !itemIds.length) return owned;
  try {
    // each item's taught spells
    const [items] = await realmWorldDb(realm).query<RowDataPacket[]>(
      `SELECT entry, ${SLOTS.map((n) => `spellid_${n}, spelltrigger_${n}`).join(", ")} FROM item_template WHERE entry IN (?)`,
      [itemIds],
    );
    const spellsOf = new Map<number, number[]>();

    for (const row of items) {
      const spells = SLOTS.filter(
        (n) =>
          Number(row[`spelltrigger_${n}`]) === LEARN_SPELL &&
          Number(row[`spellid_${n}`]) > 0,
      ).map((n) => Number(row[`spellid_${n}`]));

      if (spells.length) spellsOf.set(Number(row.entry), spells);
    }
    if (!spellsOf.size) return owned;

    // a faction pair's other half counts too
    const taught = [...new Set([...spellsOf.values()].flat())];
    const [pairs] = await realmWorldDb(realm).query<RowDataPacket[]>(
      "SELECT alliance_id, horde_id FROM player_factionchange_spells WHERE alliance_id IN (?) OR horde_id IN (?)",
      [taught, taught],
    );
    const counterparts = new Map<number, number[]>();
    const link = (a: number, b: number) =>
      counterparts.set(a, [...(counterparts.get(a) ?? []), b]);

    for (const p of pairs) {
      link(Number(p.alliance_id), Number(p.horde_id));
      link(Number(p.horde_id), Number(p.alliance_id));
    }
    const wanted = [
      ...new Set(taught.flatMap((s) => [s, ...(counterparts.get(s) ?? [])])),
    ];

    // the account's collection among them
    const [rows] = await realmCharactersDb(realm).query<RowDataPacket[]>(
      "SELECT spell FROM account_collection WHERE account = ? AND spell IN (?)",
      [accountId, wanted],
    );
    const has = new Set(rows.map((r) => Number(r.spell)));

    for (const [entry, spells] of spellsOf)
      if (
        spells.some(
          (s) =>
            has.has(s) || (counterparts.get(s) ?? []).some((c) => has.has(c)),
        )
      )
        owned.add(entry);
  } catch (error) {
    // the table not created yet on this realm: nothing owned. Anything else is logged; the shop works without the mark
    if ((error as { code?: string }).code !== "ER_NO_SUCH_TABLE")
      console.error("Account collection:", error);
  }

  return owned;
}
