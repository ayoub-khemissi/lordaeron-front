import type { RowDataPacket } from "mysql2";

import { promises as fsp } from "fs";

import { armoryModel, type ModelItem } from "@/lib/armory-model";
import { getEquippedItems } from "@/lib/queries/armory";
import { type RealmSlug } from "@/lib/realms";
import {
  realmCharactersDb,
  realmServer,
  realmWorldDb,
} from "@/lib/realms-server";
import { dbcStore } from "@/lib/tooltips/dbc";
import { DEFAULT_OUTFIT } from "@/lib/armory-constants";

/*
 * The shop's dressing room (Ayoub, 18/10/2026: the game's own, on the site): the player's character as the armory draws it
 * (lib/armory-model.ts: its looks, its visible gear with its transmogs, the helm and cloak it hides), the shop's gear tried on it, a mount
 * or a companion drawn alone. Wowhead's viewer draws them from our own mirror of its WotLK data (nginx /modelviewer/: each file fetched
 * once, then served from our disk).
 */

// where nginx finds the viewer's files (/etc/nginx/conf.d/lordaeron.conf): our own creatures first (scripts/modelviewer-custom.py), then
// its mirror of Wowhead's data
const CUSTOM = "/var/www/lordaeron-modelviewer/modelviewer/wrath/";
const MIRROR = "/var/cache/lordaeron-modelviewer/modelviewer/wrath/";
const ORIGIN = "https://wow.zamimg.com/modelviewer/wrath/";

// an item's equipment slot from its inventory type (what the viewer draws only: no neck, finger, trinket, bag, ammo)
export function equipSlotOf(invType: number): number | null {
  const slots: Record<number, number> = {
    1: 0,
    3: 2,
    4: 3,
    5: 4,
    20: 4,
    6: 5,
    7: 6,
    8: 7,
    9: 8,
    10: 9,
    16: 14,
    19: 18,
    13: 15,
    17: 15,
    21: 15,
    14: 16,
    22: 16,
    23: 16,
    15: 17,
    25: 17,
    26: 17,
  };

  return slots[invType] ?? null;
}

// the character's own playerFlags: its helm and cloak hidden (PLAYER_FLAGS_HIDE_HELM, _HIDE_CLOAK)
const HIDE_HELM = 0x400;
const HIDE_CLOAK = 0x800;

export interface DressingCharacter {
  name: string;
  race: number;
  gender: number;
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  items: ModelItem[];
}

// one of the account's characters, as the viewer dresses it; null when it is not the account's
export async function dressingCharacter(
  realm: RealmSlug,
  guid: number,
  accountId: number,
): Promise<DressingCharacter | null> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT name, race, gender, skin, face, hairStyle, hairColor, facialStyle, playerFlags
     FROM characters WHERE guid = ? AND account = ? AND deleteInfos_Name IS NULL`,
    [guid, accountId],
  );
  const c = rows[0];

  if (!c) return null;
  const worn = await getEquippedItems(guid, realm).catch(() => []);
  const flags = Number(c.playerFlags) || 0;
  const shown = worn.filter(
    (w) =>
      !(w.slot === 0 && flags & HIDE_HELM) &&
      !(w.slot === 14 && flags & HIDE_CLOAK),
  );
  const model = await armoryModel(guid, shown, realm).catch(() => null);

  return {
    name: String(c.name),
    race: Number(c.race),
    gender: Number(c.gender),
    skin: Number(c.skin),
    face: Number(c.face),
    hairStyle: Number(c.hairStyle),
    hairColor: Number(c.hairColor),
    facialStyle: Number(c.facialStyle),
    items: model?.items ?? [],
  };
}

export type TryOn =
  | { kind: "gear"; items: ModelItem[]; missing: number }
  // a mount (the character may ride it) or a companion
  | { kind: "creature"; display: number; mount: boolean }
  | { kind: "none" };

// a creature display the viewer has: our mirror, else Wowhead (fetched through our own nginx, which keeps it)
const known = new Map<number, Promise<boolean>>();

function npcDrawable(display: number) {
  let k = known.get(display);

  if (!k) {
    const file = `meta/npc/${display}.json`;

    k = fsp
      .access(`${CUSTOM}${file}`)
      .catch(() => fsp.access(`${MIRROR}${file}`))
      .then(() => true)
      .catch(() =>
        fetch(`${ORIGIN}${file}`, { method: "HEAD" })
          .then((r) => r.ok)
          .catch(() => false),
      );
    // a creature without its look is asked again later (our own converted since)
    k.then((ok) => !ok && known.delete(display));
    known.set(display, k);
    if (known.size > 5000) known.clear();
  }

  return k;
}

// a mount's or a companion's creature: its item's spell (the mount's aura, 78, or the companion's summon, effect 28) names it
async function creatureOf(
  realm: RealmSlug,
  spells: number[],
): Promise<number | null> {
  const dbc = await dbcStore(realmServer(realm).dbcDir).load(["Spell"]);
  const spell = dbc("Spell");

  for (const id of spells) {
    const r = id > 0 ? spell.rec(id) : null;

    if (!r) continue;
    for (const i of [1, 2, 3]) {
      const effect = r.get(`Effect_${i}`);
      const aura = r.get(`EffectApplyAuraName_${i}`);

      if ((effect === 6 && aura === 78) || effect === 28) {
        const entry = r.get(`EffectMiscValue_${i}`);

        if (entry > 0) return entry;
      }
    }
  }

  return null;
}

// the shop's items tried on: their gear on the character (what the viewer cannot draw counted as missing), or a mount or companion alone
export async function tryOn(
  realm: RealmSlug,
  entries: number[],
): Promise<TryOn> {
  if (!entries.length) return { kind: "none" };
  const [rows] = await realmWorldDb(realm).query<RowDataPacket[]>(
    "SELECT entry, class, subclass, InventoryType, spellid_1, spellid_2, spellid_3 FROM item_template WHERE entry IN (?)",
    [entries],
  );

  // a mount (15/5) or a companion (15/2): the creature alone
  const pet = rows.find(
    (r) => Number(r.class) === 15 && [2, 5].includes(Number(r.subclass)),
  );

  if (pet) {
    const entry = await creatureOf(
      realm,
      [pet.spellid_1, pet.spellid_2, pet.spellid_3].map(Number),
    );

    if (!entry) return { kind: "none" };
    const [creatures] = await realmWorldDb(realm).query<RowDataPacket[]>(
      "SELECT modelid1, modelid2, modelid3, modelid4 FROM creature_template WHERE entry = ?",
      [entry],
    );
    const c = creatures[0];
    const display = c
      ? [c.modelid1, c.modelid2, c.modelid3, c.modelid4]
          .map(Number)
          .find((d) => d > 0)
      : undefined;

    return display && (await npcDrawable(display))
      ? { kind: "creature", display, mount: Number(pet.subclass) === 5 }
      : { kind: "none" };
  }

  const gear = rows.flatMap((r) => {
    const slot = equipSlotOf(Number(r.InventoryType));

    return slot === null
      ? []
      : [{ slot, itemEntry: Number(r.entry), displayId: 0, enchant: 0 }];
  });

  if (!gear.length) return { kind: "none" };
  const model = await armoryModel(0, gear, realm, false);
  // a look the viewer lacks wears the default attire in the armory: here, it is simply not tried
  const fallback = new Set(model.defaulted.map((s) => DEFAULT_OUTFIT[s]?.[0]));
  const items = model.items.filter((i) => !fallback.has(i[0]));

  return items.length
    ? {
        kind: "gear",
        items,
        missing: model.defaulted.length + model.missing.length,
      }
    : { kind: "none" };
}
