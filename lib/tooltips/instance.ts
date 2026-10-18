import type { RowDataPacket } from "mysql2";
import type { Tooltip } from "./service";

import { dbcStore } from "./dbc";
import {
  ITEM_DBCS,
  ItemRenderer,
  itemIconName,
  itemSetPieces,
  type ItemInstanceContext,
  type ItemLocaleRow,
  type ItemRow,
} from "./item";
import { LOCALES, type TooltipLocale } from "./locales";

import { type RealmSlug } from "@/lib/realms";
import {
  realmCharactersDb,
  realmServer,
  realmWorldDb,
} from "@/lib/realms-server";

/*
 * Server only. The tooltips of the items a character wears (the armory, Ayoub 13/10/2026: the character's item, not the generic one):
 * each item instance's random enchantment and name suffix, its permanent and temporary enchantments, its gems with the socket bonus
 * and the meta gem's requirements counted over the whole equipment, its prismatic socket, its durability, the item set pieces the
 * character wears with the bonuses they activate, and its heirlooms at its level. Read from the realm's characters and world
 * databases and its DBCs; equipment slot -> tooltip. Not cached: an armory page asks once.
 */

const EQUIPMENT_SLOTS = 19;
const SOCKET_SLOTS = [2, 3, 4];

export async function characterItemTooltips(
  realm: RealmSlug,
  guid: number,
  // the character's level (its heirlooms' values)
  level: number,
  locale: TooltipLocale,
): Promise<Record<number, Tooltip>> {
  const lc = LOCALES[locale];
  const world = realmWorldDb(realm);
  const [instances] = await realmCharactersDb(realm).query<RowDataPacket[]>(
    `SELECT ci.slot, ii.itemEntry, ii.enchantments, ii.randomPropertyId, ii.durability
     FROM character_inventory ci JOIN item_instance ii ON ii.guid = ci.item
     WHERE ci.guid = ? AND ci.bag = 0 AND ci.slot < ?`,
    [guid, EQUIPMENT_SLOTS],
  );

  if (!instances.length) return {};

  const dbcs = await dbcStore(realmServer(realm).dbcDir).load(ITEM_DBCS);
  const enchants = dbcs("SpellItemEnchantment");
  const entries = [...new Set(instances.map((i) => Number(i.itemEntry)))];
  const [templateRows] = await world.query<RowDataPacket[]>(
    "SELECT * FROM item_template WHERE entry IN (?)",
    [entries],
  );
  const templates = new Map(
    templateRows.map((r) => [Number(r.entry), r as ItemRow]),
  );
  const locs = new Map<number, ItemLocaleRow>();

  if (lc.itemLocale) {
    const [rows] = await world.query<RowDataPacket[]>(
      "SELECT ID, Name, Description FROM item_template_locale WHERE locale = ? AND ID IN (?)",
      [lc.itemLocale, entries],
    );

    for (const r of rows) locs.set(Number(r.ID), r as ItemLocaleRow);
  }

  // the enchantments of each instance, by slot: "id duration charges" x 12
  const parsed = instances.map((i) => {
    const v = String(i.enchantments ?? "")
      .trim()
      .split(/\s+/)
      .map(Number);

    return {
      slot: Number(i.slot),
      entry: Number(i.itemEntry),
      random: Number(i.randomPropertyId) || 0,
      durability: Number(i.durability) || 0,
      enchants: Array.from({ length: 12 }, (_, k) => ({
        id: v[k * 3] || 0,
        duration: v[k * 3 + 1] || 0,
      })),
    };
  });

  // the socketed gems: their items (names, icons) and colors
  const gemOf = (enchantId: number) =>
    enchantId ? enchants.rec(enchantId)?.get("Src_itemID") || 0 : 0;
  const gemEntries = [
    ...new Set(
      parsed.flatMap((p) =>
        SOCKET_SLOTS.map((s) => gemOf(p.enchants[s].id)).filter(Boolean),
      ),
    ),
  ];
  const gems = new Map<
    number,
    { name: string; icon: string; colors: number }
  >();

  if (gemEntries.length) {
    const [rows] = await world.query<RowDataPacket[]>(
      `SELECT t.entry, t.name, t.displayid, t.GemProperties, l.Name AS loc
       FROM item_template t LEFT JOIN item_template_locale l ON l.ID = t.entry AND l.locale = ?
       WHERE t.entry IN (?)`,
      [lc.itemLocale ?? "enUS", gemEntries],
    );

    for (const r of rows)
      gems.set(Number(r.entry), {
        name: r.loc || r.name,
        icon: itemIconName(dbcs, Number(r.displayid)),
        colors:
          dbcs("GemProperties").rec(Number(r.GemProperties))?.get("Type") ?? 0,
      });
  }

  // the gem colors over the equipment, as the core counts them for the meta gems (Player::EnchantmentFitsRequirements: the items with
  // a socket in their template, each gem once per color it has)
  const gemCounts = [0, 0, 0, 0];

  for (const p of parsed) {
    if (!Number(templates.get(p.entry)?.socketColor_1)) continue;
    for (const s of SOCKET_SLOTS) {
      const colors = gems.get(gemOf(p.enchants[s].id))?.colors ?? 0;

      for (let b = 0; b < 4; ++b) if (colors & (1 << b)) gemCounts[b]++;
    }
  }

  // the names of the item sets' pieces
  const pieces = new Set<number>();

  for (const r of templates.values())
    if (Number(r.itemset))
      for (const p of itemSetPieces(dbcs, Number(r.itemset))) pieces.add(p);
  const pieceNames = new Map<number, string>();

  if (pieces.size) {
    const [rows] = await world.query<RowDataPacket[]>(
      "SELECT t.entry, t.name, l.Name AS loc FROM item_template t LEFT JOIN item_template_locale l ON l.ID = t.entry AND l.locale = ? WHERE t.entry IN (?)",
      [lc.itemLocale ?? "enUS", [...pieces]],
    );

    for (const r of rows) pieceNames.set(Number(r.entry), r.loc || r.name);
  }

  const worn = new Set(parsed.map((p) => p.entry));
  const renderer = new ItemRenderer(dbcs, lc);
  const out: Record<number, Tooltip> = {};

  for (const p of parsed) {
    const row = templates.get(p.entry);

    if (!row) continue;
    const inst: ItemInstanceContext = {
      randomPropertyId: p.random,
      enchants: p.enchants,
      durability: p.durability,
      worn,
      gemCounts,
      gems,
      level,
    };

    try {
      out[p.slot] = {
        icon: itemIconName(dbcs, Number(row.displayid)),
        quality: Number(row.Quality) || 0,
        ...renderer.tooltip(row, locs.get(p.entry), pieceNames, inst),
      };
    } catch (e) {
      console.error(`character tooltip ${realm} ${guid} slot ${p.slot}:`, e);
    }
  }

  return out;
}
