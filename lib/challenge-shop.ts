import type { RowDataPacket } from "mysql2";

import { type RealmSlug, realmHasChallenges } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";

/*
 * What a character's WotLK+ challenge lets the shop give it (Ayoub, 18/10/2026: nothing sold that the challenge forbids or makes useless,
 * nor bought by a detour). The core's own rules (WotLKPlusChallenge.h Rule, EquipAllowed), read the way the core reads them: a character's
 * last challenge (characters wotlkplus_challenge, by id), its rules from the world's wotlk_plus_challenge. The site refuses the purchase
 * and the gift; the core refuses, in game, the shop's mail to Self-Made (WotLKPlusChallenge::RefusesMailItem) and a Vial to any challenger.
 *   - fallen (a one-life challenge's death: a ghost for good): no item;
 *   - Self-Made and the challenges with its rule (Lone Wolf, Iron Will, the Lich King's Wager): no item at all, "everything it owns is
 *     found or made";
 *   - Ragamuffin (white or grey gear), Handmade (its own handmade gear and bags), Au Naturel (no armor or jewelry): no gear they forbid;
 *   - any challenge in progress: no Vial of Insight (no experience bonus), no faction change with the Hardcore PvP (its enemies);
 *   - Grounded: a flying mount sells, with a warning (usable once the challenge is over).
 */

const RULE_NO_TRAVEL = 0x2;
const RULE_SELF_FOUND = 0x4;
const RULE_COMMON_GEAR = 0x8;
const RULE_CRAFTED_GEAR = 0x100;
const RULE_NO_ARMOR = 0x200;

// characters wotlkplus_challenge.state
const STATE_IN_PROGRESS = 0;
const STATE_FALLEN = 4;

// the Vials of Insight's spells (wotlk_plus_bonus.cpp spell_wotlk_plus_vial_of_insight)
const VIAL_SPELLS = [105810, 105811, 105812];

// InventoryType: shirt and tabard (cosmetic for every gear rule), bag, and Au Naturel's armor and jewelry slots
const INVTYPE_BODY = 4;
const INVTYPE_TABARD = 19;
const ARMOR_SLOTS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 23, 28];

export interface ShopChallenge {
  challenge: number;
  rules: number;
  fallen: boolean;
  pvp: boolean;
}

export interface ShopItemFacts {
  entry: number;
  itemClass: number;
  quality: number;
  inventoryType: number;
  flying: boolean;
  vial: boolean;
}

export type ChallengeBlock =
  | "challenge_fallen"
  | "challenge_self_made"
  | "challenge_gear"
  | "challenge_xp_bonus"
  | "challenge_faction";

// the characters' last challenge, in progress or fallen (none: the shop sells them anything)
export async function shopChallenges(
  slug: RealmSlug,
  guids: number[],
): Promise<Map<number, ShopChallenge>> {
  const found = new Map<number, ShopChallenge>();

  if (!realmHasChallenges(slug) || !guids.length) return found;
  const [rows] = await realmCharactersDb(slug).query<RowDataPacket[]>(
    `SELECT c.guid, c.challenge, c.state, c.pvp
     FROM wotlkplus_challenge c
     JOIN (SELECT guid, MAX(id) AS id FROM wotlkplus_challenge WHERE guid IN (?) GROUP BY guid) last ON last.id = c.id`,
    [guids],
  );
  const live = rows.filter(
    (r) =>
      Number(r.state) === STATE_IN_PROGRESS || Number(r.state) === STATE_FALLEN,
  );

  if (!live.length) return found;
  const [defs] = await realmWorldDb(slug).query<RowDataPacket[]>(
    "SELECT ID, Rules FROM wotlk_plus_challenge WHERE ID IN (?)",
    [[...new Set(live.map((r) => Number(r.challenge)))]],
  );
  const rules = new Map(defs.map((d) => [Number(d.ID), Number(d.Rules)]));

  for (const r of live)
    found.set(Number(r.guid), {
      challenge: Number(r.challenge),
      rules: rules.get(Number(r.challenge)) ?? 0,
      fallen: Number(r.state) === STATE_FALLEN,
      pvp: !!Number(r.pvp),
    });

  return found;
}

export async function shopChallenge(
  slug: RealmSlug,
  guid: number,
): Promise<ShopChallenge | null> {
  return (await shopChallenges(slug, [guid])).get(guid) ?? null;
}

// what the shop's items are, from the realm's own item data
export async function shopItemFacts(
  slug: RealmSlug,
  ids: number[],
): Promise<Map<number, ShopItemFacts>> {
  const facts = new Map<number, ShopItemFacts>();

  if (!ids.length) return facts;
  const [rows] = await realmWorldDb(slug).query<RowDataPacket[]>(
    `SELECT entry, class, Quality, InventoryType, RequiredSkill, RequiredSkillRank, spellid_1, spellid_2, spellid_3, spellid_4, spellid_5
     FROM item_template WHERE entry IN (?)`,
    [[...new Set(ids)]],
  );

  for (const r of rows) {
    const spells = [
      r.spellid_1,
      r.spellid_2,
      r.spellid_3,
      r.spellid_4,
      r.spellid_5,
    ].map(Number);

    facts.set(Number(r.entry), {
      entry: Number(r.entry),
      itemClass: Number(r.class),
      quality: Number(r.Quality),
      inventoryType: Number(r.InventoryType),
      flying:
        Number(r.class) === 15 &&
        Number(r.RequiredSkill) === 762 &&
        Number(r.RequiredSkillRank) >= 225,
      vial: spells.some((s) => VIAL_SPELLS.includes(s)),
    });
  }

  return facts;
}

// why a character's challenge refuses these items (a set: all its pieces), null when it allows them
export function challengeBlocksItems(
  challenge: ShopChallenge | null | undefined,
  items: (ShopItemFacts | undefined)[],
): ChallengeBlock | null {
  if (!challenge) return null;
  if (challenge.fallen) return "challenge_fallen";
  if (challenge.rules & RULE_SELF_FOUND) return "challenge_self_made";
  if (items.some((i) => i?.vial)) return "challenge_xp_bonus";
  for (const item of items) {
    if (!item || !item.inventoryType) continue;
    const cosmetic =
      item.inventoryType === INVTYPE_BODY ||
      item.inventoryType === INVTYPE_TABARD;
    const bag = item.inventoryType === 18;

    if (cosmetic) continue;
    if (challenge.rules & RULE_COMMON_GEAR && !bag && item.quality > 1)
      return "challenge_gear";
    // nothing the shop sends is made by the character's own hands
    if (challenge.rules & RULE_CRAFTED_GEAR) return "challenge_gear";
    if (
      challenge.rules & RULE_NO_ARMOR &&
      ARMOR_SLOTS.includes(item.inventoryType)
    )
      return "challenge_gear";
  }

  return null;
}

// a service: the faction changed under the Hardcore PvP would change the challenger's enemies
export function challengeBlocksService(
  challenge: ShopChallenge | null | undefined,
  serviceType: string | null | undefined,
): ChallengeBlock | null {
  if (!challenge || challenge.fallen) return null;

  return serviceType === "faction_change" && challenge.pvp
    ? "challenge_faction"
    : null;
}

// sold, but not usable before the challenge is over: a flying mount under Grounded
export function challengeWarning(
  challenge: ShopChallenge | null | undefined,
  items: (ShopItemFacts | undefined)[],
): "challenge_grounded" | null {
  return challenge &&
    !challenge.fallen &&
    challenge.rules & RULE_NO_TRAVEL &&
    items.some((i) => i?.flying)
    ? "challenge_grounded"
    : null;
}

// the purchase API's error for a block (the gift's own when the recipient's challenge refuses it)
export function challengeError(block: ChallengeBlock, gift: boolean): string {
  const name = {
    challenge_fallen: "challengeFallen",
    challenge_self_made: "challengeSelfMade",
    challenge_gear: "challengeGear",
    challenge_xp_bonus: "challengeXpBonus",
    challenge_faction: "challengeFaction",
  }[block];

  return gift ? `giftRecipient${name[0].toUpperCase()}${name.slice(1)}` : name;
}

// the purchase's check: the challenge of the character the items or the service go to
export async function purchaseChallengeBlock(
  slug: RealmSlug,
  guid: number,
  itemIds: number[],
  serviceType: string | null,
): Promise<ChallengeBlock | null> {
  const challenge = await shopChallenge(slug, guid);

  if (!challenge) return null;
  if (!itemIds.length) return challengeBlocksService(challenge, serviceType);
  const facts = await shopItemFacts(slug, itemIds);

  return challengeBlocksItems(
    challenge,
    itemIds.map((id) => facts.get(id)),
  );
}
