import type { RowDataPacket } from "mysql2";

import { nextRaidReset } from "@/lib/realm-config";
import { REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

/*
 * Zar'haam's black market (Ayoub, 13/10/2026: the Tools page /<realm>/black-market), read as the core sells it
 * (game/Entities/Creature/WotLKPlusBlackMarket.cpp on feature/wotlk-plus):
 * - the showcase is the realm's: the delivery's items (wotlk_plus_black_market_stock), renewed at each raid reset after the last delivery
 *   (wotlk_plus_black_market_meta delivered_at);
 * - the stock is each player's: one copy of each item per delivery (wotlk_plus_black_market_bought), none of what the character already
 *   owns (a unique item in its bags or bank, a mount or companion it has learned);
 * - a price never above 90 % of the auction house's lowest unit buyout (to the gold above 1 gold);
 * - its customers: the characters who finished "Time to Settle Accounts" (quest 110311).
 */

const MEMBER_QUEST = 110311;
const LEARNING_SPELL = 55884; // an item teaching its second spell (mounts, companions)
const JACKPOT_SLOT = 8;
const GOLD = 10000;
const BELOW_AUCTION = 0.9;

export interface BlackMarketShelf {
  item: number;
  slot: number;
  // copper, the auction house's undercut applied
  price: number;
  // the stack sold
  quantity: number;
  jackpot: boolean;
}

export interface BlackMarketShowcase {
  // the realm runs a black market (a progressive realm whose worldserver delivered once)
  open: boolean;
  shelves: BlackMarketShelf[];
  deliveredAt: number | null;
  nextDelivery: number | null;
  quest: { id: number; title: string };
}

export type ShelfState = "available" | "bought" | "owned";

export interface BlackMarketCharacter {
  guid: number;
  name: string;
  race: number;
  class: number;
  level: number;
}

export interface BlackMarketView {
  character: BlackMarketCharacter;
  member: boolean;
  states: Record<number, ShelfState>;
}

const ids = (rows: RowDataPacket[], key = "item") =>
  rows.map((r) => Number(r[key]));

// the price the game asks now: the delivery's, below the auction house's lowest offer (GetPrice)
async function prices(slug: RealmSlug, shelves: { item: number }[]) {
  const lowest = new Map<number, number>();

  if (!shelves.length) return lowest;
  const [rows] = await realmCharactersDb(slug).query<RowDataPacket[]>(
    `SELECT ii.itemEntry AS item, MIN(ah.buyoutprice / GREATEST(ii.count, 1)) AS unit
     FROM auctionhouse ah JOIN item_instance ii ON ii.guid = ah.itemguid
     WHERE ah.buyoutprice > 0 AND ii.itemEntry IN (?) GROUP BY ii.itemEntry`,
    [shelves.map((s) => s.item)],
  );

  for (const r of rows) lowest.set(Number(r.item), Math.floor(Number(r.unit)));

  return lowest;
}

async function questTitle(slug: RealmSlug, locale: string) {
  const itemLocale = isTooltipLocale(locale)
    ? LOCALES[locale].itemLocale
    : null;
  const [rows] = await realmWorldDb(slug).query<RowDataPacket[]>(
    `SELECT q.LogTitle AS title, l.Title AS localized FROM quest_template q
     LEFT JOIN quest_template_locale l ON l.ID = q.ID AND l.locale = ?
     WHERE q.ID = ?`,
    [itemLocale ?? "enUS", MEMBER_QUEST],
  );

  return String(rows[0]?.localized || rows[0]?.title || "");
}

export async function getBlackMarket(
  slug: RealmSlug,
  locale: string,
): Promise<BlackMarketShowcase> {
  const closed: BlackMarketShowcase = {
    open: false,
    shelves: [],
    deliveredAt: null,
    nextDelivery: null,
    quest: { id: MEMBER_QUEST, title: "" },
  };

  if (!REALMS[slug].progressive) return closed;
  const db = realmCharactersDb(slug);
  // the worldserver creates its tables on its first start: none yet, no black market
  const [stock, meta] = await Promise.all([
    db
      .query<RowDataPacket[]>(
        "SELECT item, slot, price, quantity FROM wotlk_plus_black_market_stock ORDER BY slot, item",
      )
      .then(([rows]) => rows)
      .catch(() => null),
    db
      .query<RowDataPacket[]>(
        "SELECT value FROM wotlk_plus_black_market_meta WHERE name = 'delivered_at'",
      )
      .then(([rows]) => rows)
      .catch(() => null),
  ]);

  if (!stock || !meta) return closed;
  const deliveredAt = meta.length ? Number(meta[0].value) : 0;
  const now = Math.floor(Date.now() / 1000);
  let nextDelivery = deliveredAt ? await nextRaidReset(slug, deliveredAt) : 0;

  // a delivery missed while the worldserver was down happens at its next start; the one after follows the raid resets
  if (nextDelivery && nextDelivery <= now)
    nextDelivery = await nextRaidReset(slug, now);
  const [lowest, title] = await Promise.all([
    prices(slug, stock as { item: number }[]),
    questTitle(slug, locale),
  ]);

  return {
    open: deliveredAt > 0,
    deliveredAt: deliveredAt || null,
    nextDelivery: nextDelivery || null,
    quest: { id: MEMBER_QUEST, title },
    shelves: stock.map((r) => {
      const item = Number(r.item);
      const shelf = Number(r.price);
      const auction = lowest.get(item);
      let price = shelf;

      if (auction !== undefined) {
        let below = Math.floor(auction * BELOW_AUCTION);

        if (below >= GOLD) below = Math.floor(below / GOLD) * GOLD;
        price = Math.min(shelf, Math.max(1, below));
      }

      return {
        item,
        slot: Number(r.slot),
        price,
        quantity: Number(r.quantity),
        jackpot: Number(r.slot) === JACKPOT_SLOT,
      };
    }),
  };
}

// the account's characters on the realm (the black market's picker)
export async function getAccountCharacters(
  slug: RealmSlug,
  accountId: number,
): Promise<BlackMarketCharacter[]> {
  const [rows] = await realmCharactersDb(slug).query<RowDataPacket[]>(
    `SELECT guid, name, race, class, level FROM characters
     WHERE account = ? AND deleteInfos_Name IS NULL ORDER BY level DESC, name`,
    [accountId],
  );

  return rows.map((r) => ({
    guid: Number(r.guid),
    name: String(r.name),
    race: Number(r.race),
    class: Number(r.class),
    level: Number(r.level),
  }));
}

// what one of the account's characters may buy from the showcase (GetStock), null when the character is not the account's
export async function getBlackMarketView(
  slug: RealmSlug,
  accountId: number,
  guid: number,
  items: number[],
): Promise<BlackMarketView | null> {
  const db = realmCharactersDb(slug);
  const [chars] = await db.query<RowDataPacket[]>(
    `SELECT guid, name, race, class, level FROM characters
     WHERE guid = ? AND account = ? AND deleteInfos_Name IS NULL`,
    [guid, accountId],
  );

  if (!chars.length) return null;
  const c = chars[0];
  const character = {
    guid: Number(c.guid),
    name: String(c.name),
    race: Number(c.race),
    class: Number(c.class),
    level: Number(c.level),
  };
  const [[member], [bought], templates] = await Promise.all([
    db.query<RowDataPacket[]>(
      "SELECT 1 FROM character_queststatus_rewarded WHERE guid = ? AND quest = ?",
      [guid, MEMBER_QUEST],
    ),
    db.query<RowDataPacket[]>(
      "SELECT item FROM wotlk_plus_black_market_bought WHERE guid = ?",
      [guid],
    ),
    items.length
      ? realmWorldDb(slug)
          .query<RowDataPacket[]>(
            "SELECT entry, maxcount, spellid_1, spellid_2 FROM item_template WHERE entry IN (?)",
            [items],
          )
          .then(([rows]) => rows)
      : Promise.resolve([] as RowDataPacket[]),
  ]);
  const unique = templates
    .filter((t) => Number(t.maxcount) === 1)
    .map((t) => Number(t.entry));
  const teaches = new Map(
    templates
      .filter(
        (t) => Number(t.spellid_1) === LEARNING_SPELL && Number(t.spellid_2),
      )
      .map((t) => [Number(t.spellid_2), Number(t.entry)]),
  );
  const [[held], [learned]] = await Promise.all([
    unique.length
      ? db.query<RowDataPacket[]>(
          `SELECT DISTINCT ii.itemEntry AS item FROM character_inventory ci
           JOIN item_instance ii ON ii.guid = ci.item
           WHERE ci.guid = ? AND ii.itemEntry IN (?)`,
          [guid, unique],
        )
      : [[] as RowDataPacket[]],
    teaches.size
      ? db.query<RowDataPacket[]>(
          "SELECT spell FROM character_spell WHERE guid = ? AND spell IN (?)",
          [guid, [...teaches.keys()]],
        )
      : [[] as RowDataPacket[]],
  ]);
  const boughtSet = new Set(ids(bought));
  const owned = new Set([
    ...ids(held),
    ...ids(learned, "spell").map((s) => teaches.get(s) ?? 0),
  ]);

  return {
    character,
    member: member.length > 0,
    states: Object.fromEntries(
      items.map((item) => [
        item,
        boughtSet.has(item)
          ? "bought"
          : owned.has(item)
            ? "owned"
            : "available",
      ]),
    ),
  };
}
