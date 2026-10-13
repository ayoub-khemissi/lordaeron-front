import type { RowDataPacket } from "mysql2";

import { websiteDb } from "@/lib/db";
import { LruCache } from "@/lib/tooltips/cache";
import { dbcStore } from "@/lib/tooltips/dbc";
import { itemIconName } from "@/lib/tooltips/item";
import { LOCALES, type TooltipLocale } from "@/lib/tooltips/locales";
import { offeredOnRealm, type RealmSlug } from "@/lib/realms";
import { realmServer, realmWorldDb } from "@/lib/realms-server";
import {
  CODEX_KINDS,
  CODEX_SOURCES,
  type CodexItem,
  type CodexKind,
  type CodexPrice,
  type CodexQuery,
  type CodexSource,
  type CodexSourceType,
} from "@/lib/codex-types";

/*
 * Server only. The codex of a realm (app/[locale]/[realm]/codex): what it has of its own, and where to get it.
 * - Its own items: the entries above Blizzard's last one (56806), but the WotLK+ next-quality copies of Blizzard items (300000-699999,
 *   the same item a quality higher): Rimeheart's crafts (80000+), heroic raid gear (82000+), custom items (900000+: mounts, companions,
 *   recipes, tabards, glyphs...) and transmog appearances (910000+). Lordaeron has none.
 * - Blizzard's collectibles on every realm: mounts, companions and tabards, those the realm gives (a source found).
 * - Where to get each: its vendors (and their price: gold, honor, arena points, items), the creatures, objects and containers it drops
 *   from (reference loot followed), the quests rewarding it, the profession crafting it (Spell.dbc + SkillLineAbility.dbc), an
 *   achievement, the black market (wotlk_plus_black_market), the site's shop. A progressive realm's phase (wotlk_plus_phase): the item's
 *   own, else its earliest source's.
 * The index (ids only) is built once per realm and kept 30 minutes; a page of results reads its names (the viewer's language) then.
 */

const BLIZZARD_LAST = 56806;
const UPGRADED = [300000, 699999] as const;
const OWN = `(i.entry > ${BLIZZARD_LAST} AND i.entry NOT BETWEEN ${UPGRADED[0]} AND ${UPGRADED[1]})`;
const COLLECTIBLE = `(i.entry <= ${BLIZZARD_LAST} AND ((i.class = 15 AND i.subclass IN (2, 5)) OR i.InventoryType = 19))`;
const SCOPE = `(${OWN} OR ${COLLECTIBLE})`;
// more creatures than this: a world drop
const WORLD_DROP = 25;
const SHOWN = 3;
const INDEX_MS = 30 * 60_000;

const CODEX_DBCS = [
  "ItemDisplayInfo",
  "Spell",
  "SkillLineAbility",
  "SkillLine",
  "ItemExtendedCost",
  "Achievement",
] as const;

type SourceRef =
  | { t: "vendor"; npc: number; cost: number; phase: number | null }
  | { t: "drop"; npc: number }
  | { t: "object"; go: number }
  | { t: "container"; item: number }
  | { t: "quest"; quest: number; phase: number | null }
  | {
      t: "craft";
      spell: number;
      skill: number;
      rank: number;
      phase: number | null;
    }
  | { t: "achievement"; id: number }
  | { t: "blackMarket"; price: number; phase: number }
  | { t: "shop"; price: number; category: string };

interface Entry {
  id: number;
  kind: CodexKind;
  quality: number;
  custom: boolean;
  displayId: number;
  buyPrice: number;
  // the English name and the localized ones (item_template_locale), lowercased without accents for the search
  name: string;
  names: Record<string, string>;
  search: string[];
  phase: number | null;
  sources: SourceRef[];
}

interface Index {
  entries: Entry[];
  byId: Map<number, Entry>;
  phases: boolean;
}

const fold = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function kindOf(r: RowDataPacket, custom: boolean): CodexKind {
  const cls = Number(r.class);
  const sub = Number(r.subclass);

  if (cls === 15 && sub === 5) return "mount";
  if (cls === 15 && sub === 2) return "companion";
  if (Number(r.InventoryType) === 19) return "tabard";
  if (cls === 9) return "recipe";
  if (cls === 16) return "glyph";
  if (custom && Number(r.entry) >= 910000) return "appearance";
  if (cls === 2 || cls === 4) return "gear";
  // an object used from the bags (a toy, a curiosity)
  if (cls === 15 && Number(r.spellid_1) > 0 && Number(r.spelltrigger_1) === 0)
    return "toy";

  return "item";
}

async function rows(slug: RealmSlug, sql: string, params: unknown[] = []) {
  const [r] = await realmWorldDb(slug).query<RowDataPacket[]>(sql, params);

  return r;
}

// a query on a table only some realms have (the WotLK+ ones): none elsewhere
const optional = (p: Promise<RowDataPacket[]>) => p.catch(() => null);

async function buildIndex(slug: RealmSlug): Promise<Index> {
  const dbcs = await dbcStore(realmServer(slug).dbcDir).load(CODEX_DBCS);
  const [items, locales] = await Promise.all([
    rows(
      slug,
      `SELECT i.entry, i.name, i.class, i.subclass, i.Quality, i.InventoryType, i.displayid, i.BuyPrice, i.spellid_1, i.spelltrigger_1
       FROM item_template i WHERE ${SCOPE}`,
    ),
    rows(
      slug,
      `SELECT l.ID, l.locale, l.Name FROM item_template_locale l JOIN item_template i ON i.entry = l.ID
       WHERE ${SCOPE} AND l.Name <> ''`,
    ),
  ]);
  const byId = new Map<number, Entry>();

  for (const r of items) {
    const id = Number(r.entry);
    const custom = id > BLIZZARD_LAST;

    // a few appearance items without a name
    if (!String(r.name).trim()) continue;

    byId.set(id, {
      id,
      kind: kindOf(r, custom),
      quality: Number(r.Quality),
      custom,
      displayId: Number(r.displayid),
      buyPrice: Number(r.BuyPrice),
      name: String(r.name),
      names: {},
      search: [fold(String(r.name))],
      phase: null,
      sources: [],
    });
  }
  for (const r of locales) {
    const e = byId.get(Number(r.ID));

    if (e) {
      e.names[String(r.locale)] = String(r.Name);
      e.search.push(fold(String(r.Name)));
    }
  }
  const add = (item: number, s: SourceRef) => byId.get(item)?.sources.push(s);

  // the phases of a progressive realm: Type 4 an item, 5 a vendor row, 6 a quest, 7 a spell (lib: WotLKPlusPhase.h)
  const phaseRows = await optional(
    rows(
      slug,
      "SELECT Type, Entry, SubEntry, PhaseMin FROM wotlk_plus_phase WHERE Type IN (4, 5, 6, 7)",
    ),
  );
  const phaseOf = new Map<string, number>();

  for (const r of phaseRows ?? [])
    phaseOf.set(`${r.Type}:${r.Entry}:${r.SubEntry}`, Number(r.PhaseMin));
  const phase = (type: number, entry: number, sub = 0) =>
    phaseOf.get(`${type}:${entry}:${sub}`) ?? null;

  const [
    vendors,
    creatureLoot,
    lootOwners,
    refs,
    objectLoot,
    objects,
    containerLoot,
    quests,
    achievements,
    black,
    shop,
  ] = await Promise.all([
    rows(
      slug,
      `SELECT v.entry, v.item, v.ExtendedCost FROM npc_vendor v JOIN item_template i ON i.entry = v.item WHERE ${SCOPE}`,
    ),
    rows(
      slug,
      `SELECT l.Entry, l.Item, l.Reference FROM creature_loot_template l
         LEFT JOIN item_template i ON i.entry = l.Item WHERE l.Reference > 0 OR ${SCOPE}`,
    ),
    rows(slug, "SELECT entry, lootid FROM creature_template WHERE lootid > 0"),
    rows(slug, "SELECT Entry, Item, Reference FROM reference_loot_template"),
    rows(
      slug,
      `SELECT l.Entry, l.Item, l.Reference FROM gameobject_loot_template l
         LEFT JOIN item_template i ON i.entry = l.Item WHERE l.Reference > 0 OR ${SCOPE}`,
    ),
    rows(
      slug,
      "SELECT entry, Data1 FROM gameobject_template WHERE type IN (3, 25) AND Data1 > 0",
    ),
    rows(
      slug,
      `SELECT l.Entry, l.Item, l.Reference FROM item_loot_template l
         LEFT JOIN item_template i ON i.entry = l.Item WHERE l.Reference > 0 OR ${SCOPE}`,
    ),
    rows(
      slug,
      `SELECT ID, RewardItem1, RewardItem2, RewardItem3, RewardItem4, RewardChoiceItemID1, RewardChoiceItemID2,
           RewardChoiceItemID3, RewardChoiceItemID4, RewardChoiceItemID5, RewardChoiceItemID6 FROM quest_template
         WHERE RewardItem1 > 0 OR RewardChoiceItemID1 > 0`,
    ),
    rows(slug, "SELECT ID, ItemID FROM achievement_reward WHERE ItemID > 0"),
    optional(
      rows(slug, "SELECT item, price, phase FROM wotlk_plus_black_market"),
    ),
    websiteDb
      .query<RowDataPacket[]>(
        "SELECT item_id, category, price, discount_percentage, realm_ids FROM shop_items WHERE is_active = 1 AND item_id IS NOT NULL",
      )
      .then(([r]) => r)
      .catch(() => [] as RowDataPacket[]),
  ]);

  for (const r of vendors) {
    const npc = Number(r.entry);
    const item = Number(r.item);

    add(item, {
      t: "vendor",
      npc,
      cost: Number(r.ExtendedCost),
      phase: phase(5, npc, item),
    });
  }

  // a reference's items, its nested references followed
  const refItems = new Map<number, number[]>();
  const refNested = new Map<number, number[]>();

  for (const r of refs) {
    const list = Number(r.Reference) > 0 ? refNested : refItems;
    const key = Number(r.Entry);

    list.set(key, [
      ...(list.get(key) ?? []),
      Number(r.Reference) > 0 ? Number(r.Reference) : Number(r.Item),
    ]);
  }
  const resolved = new Map<number, Set<number>>();
  const itemsOfRef = (ref: number, seen = new Set<number>()): Set<number> => {
    const known = resolved.get(ref);

    if (known) return known;
    const out = new Set<number>(
      (refItems.get(ref) ?? []).filter((i) => byId.has(i)),
    );

    seen.add(ref);
    for (const n of refNested.get(ref) ?? [])
      if (!seen.has(n)) for (const i of itemsOfRef(n, seen)) out.add(i);
    resolved.set(ref, out);

    return out;
  };
  // loot rows (an id, its item or reference) -> the items each loot id gives
  const lootItems = (loot: RowDataPacket[]) => {
    const out = new Map<number, Set<number>>();

    for (const r of loot) {
      const id = Number(r.Entry);
      const set = out.get(id) ?? new Set<number>();

      if (Number(r.Reference) > 0)
        for (const i of itemsOfRef(Number(r.Reference))) set.add(i);
      else if (byId.has(Number(r.Item))) set.add(Number(r.Item));
      if (set.size) out.set(id, set);
    }

    return out;
  };

  const byCreatureLoot = lootItems(creatureLoot);

  for (const r of lootOwners)
    for (const item of byCreatureLoot.get(Number(r.lootid)) ?? [])
      add(item, { t: "drop", npc: Number(r.entry) });
  const byObjectLoot = lootItems(objectLoot);

  for (const r of objects)
    for (const item of byObjectLoot.get(Number(r.Data1)) ?? [])
      add(item, { t: "object", go: Number(r.entry) });
  for (const [container, set] of lootItems(containerLoot))
    for (const item of set) add(item, { t: "container", item: container });

  for (const r of quests) {
    const quest = Number(r.ID);
    const rewards = new Set(
      [1, 2, 3, 4]
        .map((n) => Number(r[`RewardItem${n}`]))
        .concat(
          [1, 2, 3, 4, 5, 6].map((n) => Number(r[`RewardChoiceItemID${n}`])),
        ),
    );

    for (const item of rewards)
      if (item > 0) add(item, { t: "quest", quest, phase: phase(6, quest) });
  }

  // the crafts: a spell creating the item (Effect 24), the profession teaching it
  const skillOf = new Map<number, { skill: number; rank: number }>();

  for (const r of dbcs("SkillLineAbility").records())
    skillOf.set(r.get("Spell"), {
      skill: r.get("SkillLine"),
      rank: r.get("MinSkillLineRank"),
    });
  for (const s of dbcs("Spell").records())
    for (let n = 1; n <= 3; ++n) {
      if (s.get(`Effect_${n}`) !== 24) continue;
      const item = s.get(`EffectItemType_${n}`);
      const skill = skillOf.get(s.id);

      if (skill && byId.has(item))
        add(item, {
          t: "craft",
          spell: s.id,
          skill: skill.skill,
          rank: skill.rank,
          phase: phase(7, s.id),
        });
    }

  for (const r of achievements)
    add(Number(r.ItemID), { t: "achievement", id: Number(r.ID) });
  for (const r of black ?? [])
    add(Number(r.item), {
      t: "blackMarket",
      price: Number(r.price),
      phase: Number(r.phase),
    });
  for (const r of shop) {
    const ids =
      typeof r.realm_ids === "string"
        ? (JSON.parse(r.realm_ids) as number[])
        : (r.realm_ids as number[] | null);

    if (offeredOnRealm(ids, slug))
      add(Number(r.item_id), {
        t: "shop",
        price: Math.floor(
          Number(r.price) * (1 - Number(r.discount_percentage) / 100),
        ),
        category: String(r.category),
      });
  }

  // Blizzard's collectibles the realm does not give (test items, removed ones) stay out
  const entries = [...byId.values()].filter(
    (e) => e.custom || e.sources.length,
  );

  for (const e of entries) {
    const own = phase(4, e.id);
    const from = e.sources
      .map((s) => ("phase" in s ? s.phase : null))
      .filter((p): p is number => p !== null);

    e.phase = phaseRows ? (own ?? (from.length ? Math.min(...from) : 0)) : null;
  }
  // its own content first, then by kind, quality and name
  const kindRank = new Map(CODEX_KINDS.map((k, i) => [k, i]));

  entries.sort(
    (a, b) =>
      Number(b.custom) - Number(a.custom) ||
      kindRank.get(a.kind)! - kindRank.get(b.kind)! ||
      b.quality - a.quality ||
      a.name.localeCompare(b.name),
  );

  return {
    entries,
    byId: new Map(entries.map((e) => [e.id, e])),
    phases: !!phaseRows,
  };
}

const indexes = new LruCache<Promise<Index>>(4, INDEX_MS);

function index(slug: RealmSlug): Promise<Index> {
  let p = indexes.get(slug);

  if (!p) {
    p = buildIndex(slug);
    indexes.set(slug, p);
    // a failed build is not kept: the next request tries again
    p.catch(() => indexes.set(slug, p!, 0));
  }

  return p;
}

const sourceTypes = (e: Entry) => new Set(e.sources.map((s) => s.t));

export interface CodexPage {
  items: CodexItem[];
  total: number;
  page: number;
  pageSize: number;
  // what the realm's filters offer
  kinds: CodexKind[];
  sources: CodexSourceType[];
  phases: boolean;
  custom: boolean;
}

export async function searchCodex(
  slug: RealmSlug,
  q: CodexQuery,
  locale: TooltipLocale,
): Promise<CodexPage> {
  const idx = await index(slug);
  const text = fold(q.text.trim());
  const found = idx.entries.filter(
    (e) =>
      (!q.kind || e.kind === q.kind) &&
      (!q.source || sourceTypes(e).has(q.source)) &&
      (q.phase === null || e.phase === q.phase) &&
      (!q.origin || e.custom === (q.origin === "custom")) &&
      (!text || e.search.some((s) => s.includes(text))),
  );
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(found.length / pageSize));
  const page = Math.min(q.page, pages);
  const shown = found.slice((page - 1) * pageSize, page * pageSize);

  return {
    items: await resolve(slug, shown, locale),
    total: found.length,
    page,
    pageSize,
    kinds: CODEX_KINDS.filter((k) => idx.entries.some((e) => e.kind === k)),
    sources: CODEX_SOURCES.filter((s) =>
      idx.entries.some((e) => e.sources.some((x) => x.t === s)),
    ),
    phases: idx.phases,
    custom: idx.entries.some((e) => e.custom),
  };
}

// a page of entries in the viewer's language: the names of their sources, their prices
async function resolve(
  slug: RealmSlug,
  shown: Entry[],
  locale: TooltipLocale,
): Promise<CodexItem[]> {
  const lc = LOCALES[locale];
  const dbcs = await dbcStore(realmServer(slug).dbcDir).load(CODEX_DBCS);
  const npcs = new Set<number>();
  const objects = new Set<number>();
  const quests = new Set<number>();
  const items = new Set<number>();

  for (const e of shown)
    for (const s of e.sources) {
      if (s.t === "vendor" || s.t === "drop") npcs.add(s.npc);
      if (s.t === "object") objects.add(s.go);
      if (s.t === "quest") quests.add(s.quest);
      if (s.t === "container") items.add(s.item);
      if (s.t === "vendor" && s.cost)
        for (let n = 1; n <= 5; ++n) {
          const id = dbcs("ItemExtendedCost").rec(s.cost)?.get(`ItemID_${n}`);

          if (id) items.add(id);
        }
    }
  const loc = lc.itemLocale;
  const named = async (sql: string, locSql: string, ids: Set<number>) => {
    const out = new Map<number, { name: string; sub?: string }>();

    if (!ids.size) return out;
    const list = [...ids];

    for (const r of await rows(slug, sql, [list]))
      out.set(Number(r.id), {
        name: String(r.name),
        sub: r.sub ? String(r.sub) : undefined,
      });
    if (loc)
      for (const r of await rows(slug, locSql, [list, loc])) {
        const known = out.get(Number(r.id));

        if (known && r.name)
          out.set(Number(r.id), {
            name: String(r.name),
            sub: r.sub ? String(r.sub) : known.sub,
          });
      }

    return out;
  };
  const [npcNames, objectNames, questNames, itemRows] = await Promise.all([
    named(
      "SELECT entry AS id, name, subname AS sub FROM creature_template WHERE entry IN (?)",
      "SELECT entry AS id, Name AS name, Title AS sub FROM creature_template_locale WHERE entry IN (?) AND locale = ?",
      npcs,
    ),
    named(
      "SELECT entry AS id, name FROM gameobject_template WHERE entry IN (?)",
      "SELECT entry AS id, name FROM gameobject_template_locale WHERE entry IN (?) AND locale = ?",
      objects,
    ),
    named(
      "SELECT ID AS id, LogTitle AS name FROM quest_template WHERE ID IN (?)",
      "SELECT ID AS id, Title AS name FROM quest_template_locale WHERE ID IN (?) AND locale = ?",
      quests,
    ),
    items.size
      ? rows(
          slug,
          "SELECT entry, name, displayid FROM item_template WHERE entry IN (?)",
          [[...items]],
        )
      : Promise.resolve([] as RowDataPacket[]),
  ]);
  const itemNames = new Map<number, { name: string; icon: string }>(
    itemRows.map((r) => [
      Number(r.entry),
      { name: String(r.name), icon: itemIconName(dbcs, Number(r.displayid)) },
    ]),
  );

  if (loc && items.size)
    for (const r of await rows(
      slug,
      "SELECT ID, Name FROM item_template_locale WHERE ID IN (?) AND locale = ? AND Name <> ''",
      [[...items], loc],
    )) {
      const known = itemNames.get(Number(r.ID));

      if (known) known.name = String(r.Name);
    }

  const price = (copper: number, cost: number): CodexPrice | null => {
    const c = cost ? dbcs("ItemExtendedCost").rec(cost) : null;
    const out: CodexPrice = {};

    if (copper > 0) out.copper = copper;
    if (c) {
      if (c.get("HonorPoints")) out.honor = c.get("HonorPoints");
      if (c.get("ArenaPoints")) out.arena = c.get("ArenaPoints");
      if (c.get("RequiredArenaRating"))
        out.rating = c.get("RequiredArenaRating");
      const costItems = [1, 2, 3, 4, 5]
        .map((n) => ({
          id: c.get(`ItemID_${n}`),
          count: c.get(`ItemCount_${n}`),
        }))
        .filter((x) => x.id > 0)
        .map((x) => ({
          ...x,
          name: itemNames.get(x.id)?.name ?? `#${x.id}`,
          icon: itemNames.get(x.id)?.icon ?? "inv_misc_questionmark",
        }));

      if (costItems.length) out.items = costItems;
    }

    return Object.keys(out).length ? out : null;
  };
  // names without the heroic templates' duplicates ("Boss (1)")
  const uniqueNames = (ids: number[], names: Map<number, { name: string }>) => [
    ...new Set(
      ids
        .map((id) => names.get(id)?.name.replace(/\s*\(\d\)$/, ""))
        .filter((n): n is string => !!n),
    ),
  ];
  const listed = (all: string[]) => ({
    names: all.slice(0, SHOWN),
    more: Math.max(0, all.length - SHOWN),
  });

  return shown.map((e) => {
    const sources: CodexSource[] = [];
    const of = <T extends SourceRef["t"]>(t: T) =>
      e.sources.filter((s): s is Extract<SourceRef, { t: T }> => s.t === t);

    // vendors, by price
    const byCost = new Map<number, number[]>();

    for (const s of of("vendor"))
      byCost.set(s.cost, [...(byCost.get(s.cost) ?? []), s.npc]);
    for (const [cost, ids] of byCost) {
      const names = ids
        .map((id) => npcNames.get(id))
        .filter((n): n is { name: string; sub?: string } => !!n);

      // vendors sharing a title ("<Lost Recipes & Rare Materials>"): the title once, after their names
      const titles = new Set(names.map((n) => n.sub ?? ""));
      const shared = titles.size === 1 ? [...titles][0] : "";

      sources.push({
        type: "vendor",
        ...listed([
          ...new Set(
            names.map((n) =>
              n.sub && !shared ? `${n.name} <${n.sub}>` : n.name,
            ),
          ),
        ]),
        ...(shared ? { title: shared } : {}),
        price: price(e.buyPrice, cost),
      });
    }
    const drops = of("drop").map((s) => s.npc);

    if (drops.length) {
      const names = uniqueNames(drops, npcNames);

      sources.push(
        names.length > WORLD_DROP
          ? { type: "drop", names: [], more: 0, world: true }
          : { type: "drop", ...listed(names) },
      );
    }
    const objectIds = of("object").map((s) => s.go);

    if (objectIds.length)
      sources.push({
        type: "object",
        ...listed(uniqueNames(objectIds, objectNames)),
      });
    const containers = of("container").map((s) => s.item);

    if (containers.length)
      sources.push({
        type: "container",
        ...listed([
          ...new Set(
            containers
              .map((id) => itemNames.get(id)?.name)
              .filter((n): n is string => !!n),
          ),
        ]),
      });
    const questIds = of("quest").map((s) => s.quest);

    if (questIds.length)
      sources.push({
        type: "quest",
        ...listed(uniqueNames(questIds, questNames)),
      });
    for (const s of of("craft").slice(0, 2))
      sources.push({
        type: "craft",
        names: [
          dbcs("SkillLine").rec(s.skill)?.loc("DisplayName", lc.slot) ?? "",
        ],
        more: 0,
        rank: s.rank,
        spell: s.spell,
      });
    for (const s of of("achievement").slice(0, 2))
      sources.push({
        type: "achievement",
        names: [
          dbcs("Achievement").rec(s.id)?.loc("Title", lc.slot) ?? `#${s.id}`,
        ],
        more: 0,
      });
    for (const s of of("blackMarket").slice(0, 1))
      sources.push({
        type: "blackMarket",
        names: [],
        more: 0,
        price: { copper: s.price },
      });
    for (const s of of("shop").slice(0, 1))
      sources.push({
        type: "shop",
        names: [],
        more: 0,
        shards: s.price,
        category: s.category,
      });

    return {
      id: e.id,
      name: (lc.itemLocale && e.names[lc.itemLocale]) || e.name,
      quality: e.quality,
      icon: itemIconName(dbcs, e.displayId),
      kind: e.kind,
      custom: e.custom,
      phase: e.phase,
      sources,
    };
  });
}
