import type { TipLine } from "./format";

import {
  ACHIEVEMENT_DBCS,
  AchievementRenderer,
  type AchievementRewardRow,
  type RewardItem,
} from "./achievement";
import { LruCache } from "./cache";
import { dbcStore } from "./dbc";
import {
  ITEM_DBCS,
  ItemRenderer,
  itemIconName,
  itemSetPieces,
  type ItemLocaleRow,
  type ItemRow,
} from "./item";
import { LOCALES, type TooltipLocale } from "./locales";
import { SPELL_DBCS, SpellRenderer } from "./spell";

/*
 * The tooltip service: renders item, spell and achievement tooltips of a world (its database and its DBC folder), with an LRU of the results per
 * (world, ref, locale) for 10 minutes (1 minute for an unknown id), so a database or DBC change shows up without a restart. Read only.
 */

export type TooltipKind = "item" | "spell" | "achievement";
export interface TooltipRef {
  kind: TooltipKind;
  id: number;
}
export interface Tooltip {
  // the icon's file name on wow.zamimg.com (lowercase, no extension)
  icon: string;
  quality?: number;
  name: string;
  lines: TipLine[];
  // an achievement's points (its shield)
  points?: number;
  // an item the site's dressing room shows: gear worn on a character (a visible slot), a mount or a companion alone
  tryOn?: "gear" | "creature";
}

// the inventory types the dressing room draws on a character (no neck, finger, trinket, bag, ammo, relic)
const VISIBLE_SLOTS = [
  1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25, 26,
];

function tryOnOf(row: Record<string, unknown>): Tooltip["tryOn"] {
  const cls = Number(row.class);
  const sub = Number(row.subclass);

  if (cls === 15 && (sub === 2 || sub === 5)) return "creature";

  return VISIBLE_SLOTS.includes(Number(row.InventoryType)) ? "gear" : undefined;
}

// a mysql2 pool or connection (SELECT only)
export interface Queryable {
  query(sql: string, values?: unknown): Promise<[unknown, unknown]>;
}

export interface TooltipSource {
  // the cache namespace (the realm)
  key: string;
  db: Queryable;
  dbcDir: string;
}

const TTL_MS = 10 * 60_000;
const MISS_TTL_MS = 60_000;
const cache = new LruCache<Tooltip | null>(5000, TTL_MS);

export const MAX_ID = 2_147_483_647;

// "item:123" / "spell:456" / "achievement:789" -> a ref, null when malformed
export function parseRef(ref: unknown): TooltipRef | null {
  if (typeof ref !== "string") return null;
  const m = ref.match(/^(item|spell|achievement):(\d{1,10})$/);
  const id = m ? Number(m[2]) : 0;

  return m && id > 0 && id <= MAX_ID ? { kind: m[1] as TooltipKind, id } : null;
}

export const refKey = (r: TooltipRef) => `${r.kind}:${r.id}`;

async function rows<T>(db: Queryable, sql: string, values: unknown[]) {
  const [result] = await db.query(sql, values);

  return result as T[];
}

/*
 * The tooltips of `refs` in `locale`: a map "kind:id" -> tooltip, null for an id the world does not know. Database errors are thrown
 * (the caller answers 5xx); a rendering problem on one ref makes that ref null without failing the others.
 */
export async function renderTooltips(
  source: TooltipSource,
  refs: readonly TooltipRef[],
  locale: TooltipLocale,
  // collects the renderers' notes on odd data (unknown tokens...), for tests
  warnings?: string[],
): Promise<Map<string, Tooltip | null>> {
  const lc = LOCALES[locale];
  const out = new Map<string, Tooltip | null>();
  const cacheKey = (r: TooltipRef) => `${source.key}|${refKey(r)}|${locale}`;
  const todo: TooltipRef[] = [];

  for (const r of refs) {
    if (out.has(refKey(r))) continue;
    const hit = cache.get(cacheKey(r));

    if (hit !== undefined) out.set(refKey(r), hit);
    else {
      out.set(refKey(r), null);
      todo.push(r);
    }
  }
  if (!todo.length) return out;

  const itemIds = todo.filter((r) => r.kind === "item").map((r) => r.id);
  const achievementIds = todo
    .filter((r) => r.kind === "achievement")
    .map((r) => r.id);
  const dbcs = await dbcStore(source.dbcDir).load([
    ...new Set([
      ...(itemIds.length ? ITEM_DBCS : SPELL_DBCS),
      ...(achievementIds.length ? ACHIEVEMENT_DBCS : []),
    ]),
  ]);
  const items = new Map<number, ItemRow>();
  const locs = new Map<number, ItemLocaleRow>();
  const pieceNames = new Map<number, string>();

  if (itemIds.length) {
    for (const r of await rows<ItemRow>(
      source.db,
      "SELECT * FROM item_template WHERE entry IN (?)",
      [itemIds],
    ))
      items.set(Number(r.entry), r);
    if (lc.itemLocale && items.size)
      for (const r of await rows<ItemLocaleRow & { ID: number }>(
        source.db,
        "SELECT ID, Name, Description FROM item_template_locale WHERE locale = ? AND ID IN (?)",
        [lc.itemLocale, [...items.keys()]],
      ))
        locs.set(Number(r.ID), r);
    // the names of the pieces of the item sets
    const pieces = new Set<number>();

    for (const r of items.values())
      if (Number(r.itemset))
        for (const p of itemSetPieces(dbcs, Number(r.itemset))) pieces.add(p);
    if (pieces.size)
      for (const r of await rows<{
        entry: number;
        name: string;
        loc: string | null;
      }>(
        source.db,
        "SELECT t.entry, t.name, l.Name AS loc FROM item_template t LEFT JOIN item_template_locale l ON l.ID = t.entry AND l.locale = ? WHERE t.entry IN (?)",
        [lc.itemLocale ?? "enUS", [...pieces]],
      ))
        pieceNames.set(Number(r.entry), r.loc || r.name);
  }

  // the achievements' rewards: their titles and items (the items' names in the reader's language)
  const rewards = new Map<number, AchievementRewardRow>();
  const rewardItems = new Map<number, RewardItem>();

  if (achievementIds.length) {
    for (const r of await rows<AchievementRewardRow>(
      source.db,
      "SELECT ID, TitleA, TitleH, ItemID FROM achievement_reward WHERE ID IN (?)",
      [achievementIds],
    ))
      rewards.set(Number(r.ID), r);
    const ids = [...rewards.values()]
      .map((r) => Number(r.ItemID))
      .filter((id) => id > 0);

    if (ids.length)
      for (const r of await rows<{
        entry: number;
        name: string;
        loc: string | null;
        displayid: number;
      }>(
        source.db,
        "SELECT t.entry, t.name, t.displayid, l.Name AS loc FROM item_template t LEFT JOIN item_template_locale l ON l.ID = t.entry AND l.locale = ? WHERE t.entry IN (?)",
        [lc.itemLocale ?? "enUS", ids],
      ))
        rewardItems.set(Number(r.entry), {
          name: r.loc || r.name,
          icon: itemIconName(dbcs, Number(r.displayid)),
        });
  }

  const itemRenderer = new ItemRenderer(dbcs, lc);
  const spellRenderer = new SpellRenderer(dbcs, lc);
  const achievementRenderer = achievementIds.length
    ? new AchievementRenderer(dbcs, lc)
    : null;

  for (const r of todo) {
    let tip: Tooltip | null = null;

    try {
      if (r.kind === "item") {
        const row = items.get(r.id);

        if (row) {
          const t = itemRenderer.tooltip(row, locs.get(r.id), pieceNames);

          tip = {
            icon: itemIconName(dbcs, Number(row.displayid)),
            quality: Number(row.Quality) || 0,
            ...t,
            ...(tryOnOf(row) ? { tryOn: tryOnOf(row) } : {}),
          };
        }
      } else if (r.kind === "achievement") {
        const reward = rewards.get(r.id);
        const t = achievementRenderer?.tooltip(
          r.id,
          reward,
          rewardItems.get(Number(reward?.ItemID)),
        );

        if (t) tip = { icon: achievementRenderer!.icon(r.id), ...t };
      } else {
        const t = spellRenderer.tooltip(r.id);

        if (t) tip = { icon: spellRenderer.icon(r.id), ...t };
      }
    } catch (e) {
      console.error(`tooltip ${source.key} ${refKey(r)} ${locale}:`, e);
    }
    out.set(refKey(r), tip);
    cache.set(cacheKey(r), tip, tip ? TTL_MS : MISS_TTL_MS);
  }

  warnings?.push(...itemRenderer.warnings, ...spellRenderer.warnings);

  return out;
}

export async function renderTooltip(
  source: TooltipSource,
  ref: TooltipRef,
  locale: TooltipLocale,
): Promise<Tooltip | null> {
  return (await renderTooltips(source, [ref], locale)).get(refKey(ref)) ?? null;
}
