import type { RowDataPacket } from "mysql2";
import type { EquipmentSlot } from "@/types/armory";

import { promises as fsp } from "fs";
import path from "path";

import { type RealmSlug } from "@/lib/realms";
import {
  realmCharactersDb,
  realmServer,
  realmWorldDb,
} from "@/lib/realms-server";
import { dbcStore, type Dbc } from "@/lib/tooltips/dbc";

/*
 * What the armory's 3D viewer shows of a character (components/armory/model-viewer.tsx): its visible gear as [viewer slot, display]
 * pairs in WotLK Classic's numbering, the one of Wowhead's "wrath" data (wow.zamimg.com/modelviewer/wrath/), which renumbered part of
 * 3.3.5's displays (Ayoub, 13/10/2026: the armory drew nothing).
 * - the slot transmogs first (custom_character_slot_transmog: an item entry, the hidden slot, or the worn item);
 * - a Blizzard item: its WotLK Classic display (data/armory/wotlk-classic-item-displays.json, scripts/build-armory-displays.mjs);
 * - a realm's own item (WotLK+, Lordaeron's): the look it was made from: a Blizzard item with the same 3.3.5 display, else a Blizzard
 *   display with the same models and textures (the realm's ItemDisplayInfo.dbc), else the display itself when Wowhead has it. Nothing
 *   when no look is found: the slot stays bare rather than wrong.
 */

export type ModelItem = [slot: number, display: number];

const WRATH = "https://wow.zamimg.com/modelviewer/wrath/";
// the slot transmogs' sentinels (core: TransmogrificationDefines.h InvisibleEntry, NormalEntry)
const HIDDEN = 4294967295;
const WORN = 4294967294;
// 3.3.5's own items end at 56806; the realms' items start at 80000
const BLIZZARD_ITEM_MAX = 60000;
// the WotLK+ generator's own displays (contrib/wotlk-plus content/pilote3/ids.js ITEM_DISPLAY)
const CUSTOM_DISPLAY_MIN = 68900;
// the viewer's armor slots read meta/armor/<slot>/, the others meta/item/ (Wowhead's viewer.min.js)
const ARMOR_SLOTS = [1, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 20];

// the viewer's slot: the item's inventory type (WH.Wow.Item), the hands told apart; null for what is not drawn
export function viewerSlot(equipSlot: number, invType: number): number | null {
  switch (equipSlot) {
    case 0:
      return 1;
    case 2:
      return 3;
    case 3:
      return 4;
    case 4:
      return invType === 20 ? 20 : 5;
    case 5:
      return 6;
    case 6:
      return 7;
    case 7:
      return 8;
    case 8:
      return 9;
    case 9:
      return 10;
    case 14:
      return 16;
    case 18:
      return 19;
    // a two-hand weapon, else the main hand
    case 15:
      return invType === 17 ? 17 : 21;
    // a shield, an off-hand frill, else an off-hand weapon (a titan's grip two-hander included)
    case 16:
      return invType === 14 ? 14 : invType === 23 ? 23 : 22;
    // a bow, a thrown weapon, a gun, crossbow or wand; relics, idols, totems and sigils are not drawn
    case 17:
      return [15, 25, 26].includes(invType) ? invType : null;
    default:
      return null;
  }
}

let classicDisplays: Promise<Map<number, number>> | null = null;

function wotlkClassicDisplays() {
  if (!classicDisplays)
    classicDisplays = fsp
      .readFile(
        path.join(
          process.cwd(),
          "data/armory/wotlk-classic-item-displays.json",
        ),
        "utf8",
      )
      .then(
        (s) =>
          new Map(
            Object.entries(JSON.parse(s) as Record<string, number>).map(
              ([k, v]) => [Number(k), v],
            ),
          ),
      )
      .catch((e) => {
        classicDisplays = null;
        throw e;
      });

  return classicDisplays;
}

// Wowhead has this display for this slot (kept: the answer does not change)
const onWowhead = new Map<string, Promise<boolean>>();

function wowheadHas(slot: number, display: number) {
  const url = `${WRATH}meta/${ARMOR_SLOTS.includes(slot) ? `armor/${slot}` : "item"}/${display}.json`;
  let known = onWowhead.get(url);

  if (!known) {
    known = fetch(url, { method: "HEAD" })
      .then((r) => r.ok)
      .catch(() => false);
    onWowhead.set(url, known);
    if (onWowhead.size > 20000) onWowhead.clear();
  }

  return known;
}

// a display's look (models, textures, geosets): the realm's own displays are copies of Blizzard's (an icon or a sound changed)
function look(dbc: Dbc, id: number): string | null {
  const r = dbc.rec(id);

  if (!r) return null;
  const parts = [
    r.str("ModelName_1"),
    r.str("ModelName_2"),
    r.str("ModelTexture_1"),
    r.str("ModelTexture_2"),
    ...[1, 2, 3].map((i) => String(r.get(`GeosetGroup_${i}`))),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => r.str(`Texture_${i}`)),
  ];

  return parts.every((p) => !p || p === "0")
    ? null
    : parts.join("|").toLowerCase();
}

// the Blizzard displays of each look, per DBC file (rebuilt when the realm's DBC changes)
const looks = new WeakMap<Dbc, Map<string, number[]>>();

function blizzardDisplaysLike(dbc: Dbc, id: number): number[] {
  let index = looks.get(dbc);

  if (!index) {
    index = new Map();
    const count = dbc.buf.readUInt32LE(4);
    const size = dbc.buf.readUInt32LE(12);

    for (let i = 0; i < count; ++i) {
      const other = dbc.buf.readUInt32LE(20 + i * size);

      if (other >= CUSTOM_DISPLAY_MIN) continue;
      const key = look(dbc, other);

      if (key) index.set(key, [...(index.get(key) ?? []), other]);
    }
    looks.set(dbc, index);
  }
  const key = look(dbc, id);

  return (key && index.get(key)?.filter((d) => d !== id)) || [];
}

async function blizzardItemsOf(realm: RealmSlug, displays: number[]) {
  const byDisplay = new Map<number, number[]>();

  if (!displays.length) return byDisplay;
  const [rows] = await realmWorldDb(realm).query<RowDataPacket[]>(
    "SELECT entry, displayid FROM item_template WHERE displayid IN (?) AND entry < ? ORDER BY entry",
    [displays, BLIZZARD_ITEM_MAX],
  );

  for (const r of rows)
    byDisplay.set(r.displayid, [
      ...(byDisplay.get(r.displayid) ?? []),
      r.entry,
    ]);

  return byDisplay;
}

export async function armoryModelItems(
  guid: number,
  equipment: EquipmentSlot[],
  realm: RealmSlug,
): Promise<ModelItem[]> {
  // the slot transmogs (absent on a realm without them)
  const transmog = new Map<number, number>();

  try {
    const [rows] = await realmCharactersDb(realm).query<RowDataPacket[]>(
      "SELECT slot, transmog_entry FROM custom_character_slot_transmog WHERE guid = ?",
      [guid],
    );

    for (const r of rows) transmog.set(r.slot, Number(r.transmog_entry));
  } catch {
    // no transmog table on this realm
  }

  const shown = equipment.flatMap((e) => {
    const t = transmog.get(e.slot);

    if (t === HIDDEN) return [];

    return [{ slot: e.slot, entry: t && t !== WORN ? t : e.itemEntry }];
  });

  if (!shown.length) return [];

  const [rows] = await realmWorldDb(realm).query<RowDataPacket[]>(
    "SELECT entry, displayid, InventoryType FROM item_template WHERE entry IN (?)",
    [shown.map((s) => s.entry)],
  );
  const templates = new Map(
    rows.map((r) => [
      r.entry as number,
      { display: r.displayid as number, invType: r.InventoryType as number },
    ]),
  );
  const classic = await wotlkClassicDisplays();
  const items: ModelItem[] = [];
  const unresolved: { slot: number; display: number }[] = [];

  for (const s of shown) {
    const t = templates.get(s.entry);
    const slot = t && viewerSlot(s.slot, t.invType);

    if (!t || !slot || !t.display) continue;
    const display =
      s.entry < BLIZZARD_ITEM_MAX ? classic.get(s.entry) : undefined;

    if (display) items.push([slot, display]);
    else unresolved.push({ slot, display: t.display });
  }

  if (unresolved.length) {
    // a realm's own item: the Blizzard looks it shares, nearest first (the same display, then the same models and textures)
    const dbc = await dbcStore(realmServer(realm).dbcDir)
      .load(["ItemDisplayInfo"])
      .then((d) => d("ItemDisplayInfo"))
      .catch(() => null);
    const candidates = unresolved.map((u) => [
      u.display,
      ...(dbc ? blizzardDisplaysLike(dbc, u.display) : []),
    ]);
    const items335 = await blizzardItemsOf(realm, [
      ...new Set(candidates.flat()),
    ]);

    await Promise.all(
      unresolved.map(async (u, i) => {
        for (const d of candidates[i]) {
          const viaItem = (items335.get(d) ?? [])
            .map((entry) => classic.get(entry))
            .find(Boolean);

          if (viaItem) return items.push([u.slot, viaItem]);
          if (d < CUSTOM_DISPLAY_MIN && (await wowheadHas(u.slot, d)))
            return items.push([u.slot, d]);
        }
      }),
    );
  }

  return items.sort((a, b) => a[0] - b[0]);
}
