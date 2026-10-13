import type { RowDataPacket } from "mysql2";

import { LruCache } from "@/lib/tooltips/cache";
import { dbcStore, type Dbcs } from "@/lib/tooltips/dbc";
import { LOCALES, type TooltipLocale } from "@/lib/tooltips/locales";
import { SPELL_DBCS, SpellRenderer, spellIconName } from "@/lib/tooltips/spell";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import { type RealmSlug } from "@/lib/realms";
import {
  CLASS_KEYS,
  encodeBuild,
  pointsSummary,
  type BuildPoints,
  type ClassKey,
  type ClassTalents,
  type TalentCell,
  type TalentTree,
} from "@/lib/talent-build";

/*
 * Server only. A realm's talent trees, from its own DBC (Talent, TalentTab, Spell...: Rimeheart's WotLK+ talents are cells of its trees
 * like Blizzard's): the talent calculator (app/[locale]/[realm]/talents) and a character's specializations on the armory, which turns
 * its character_talent rows into a build of the calculator. The hunter pets' trees are left out (no class owns them).
 */

const TALENT_DBCS = [
  ...SPELL_DBCS,
  "Talent",
  "TalentTab",
  "ChrClasses",
] as const;
// a class's trees in a language, kept 10 minutes (a DBC deploy shows after that)
const cache = new LruCache<ClassTalents | null>(128, 10 * 60_000);

const load = (slug: RealmSlug): Promise<Dbcs> =>
  dbcStore(realmServer(slug).dbcDir).load(TALENT_DBCS);

export interface ClassChoice {
  key: ClassKey;
  name: string;
}

// the classes of the picker, in the game's order, their names in `locale`
export async function talentClasses(
  slug: RealmSlug,
  locale: TooltipLocale,
): Promise<ClassChoice[]> {
  const dbcs = await load(slug);
  const slot = LOCALES[locale].slot;

  return Object.entries(CLASS_KEYS).map(([id, key]) => ({
    key,
    name: dbcs("ChrClasses").rec(Number(id))?.loc("Name", slot) || key,
  }));
}

function build(
  dbcs: Dbcs,
  classId: number,
  locale: TooltipLocale,
): ClassTalents | null {
  const key = CLASS_KEYS[classId as keyof typeof CLASS_KEYS];

  if (!key) return null;
  const lc = LOCALES[locale];
  const spells = new SpellRenderer(dbcs, lc);
  const mask = 1 << (classId - 1);
  const tabs = [...dbcs("TalentTab").records()]
    .filter((t) => t.get("ClassMask") & mask && !t.get("PetTalentMask"))
    .sort((a, b) => a.get("OrderIndex") - b.get("OrderIndex"));
  const talents = [...dbcs("Talent").records()];

  const trees: TalentTree[] = tabs.map((tab) => {
    const own = talents.filter((t) => t.get("TabID") === tab.id);
    const ids = new Set(own.map((t) => t.id));
    const cells: TalentCell[] = own
      .map((t) => {
        const ranks = Array.from({ length: 9 }, (_, i) =>
          t.get(`SpellRank_${i + 1}`),
        ).filter((s) => s > 0);
        const first = spells.rec(ranks[0]);
        // a prerequisite missing from the tree (two Blizzard leftovers: Sanctified Retribution, Improved Icy Talons) asks nothing, as
        // in the game
        const prereq = ids.has(t.get("PrereqTalent_1"))
          ? t.get("PrereqTalent_1")
          : 0;

        return {
          id: t.id,
          tier: t.get("TierID"),
          column: t.get("ColumnIndex"),
          ranks,
          ...(prereq > 0
            ? { prereq: { talent: prereq, rank: t.get("PrereqRank_1") + 1 } }
            : {}),
          icon: first
            ? spellIconName(dbcs, first.get("SpellIconID"))
            : "inv_misc_questionmark",
          name: first?.loc("Name", lc.slot) ?? `#${t.id}`,
          // each rank's tooltip without its name line (the calculator shows the name and the rank itself)
          tips: ranks.map((s) => spells.tooltip(s)?.lines.slice(1) ?? []),
        };
      })
      .filter((c) => c.ranks.length)
      .sort((a, b) => a.tier - b.tier || a.column - b.column);
    const background = tab.str("BackgroundFile").toLowerCase();

    return {
      id: tab.id,
      name: tab.loc("Name", lc.slot),
      icon: spellIconName(dbcs, tab.get("SpellIconID")),
      background: background ? `/img/talents/${background}.jpg` : null,
      talents: cells,
    };
  });

  return {
    classId,
    key,
    name: dbcs("ChrClasses").rec(classId)?.loc("Name", lc.slot) || key,
    trees,
  };
}

export async function classTalents(
  slug: RealmSlug,
  classId: number,
  locale: TooltipLocale,
): Promise<ClassTalents | null> {
  const k = `${slug}|${locale}|${classId}`;
  const hit = cache.get(k);

  if (hit !== undefined) return hit;
  const value = build(await load(slug), classId, locale);

  cache.set(k, value);

  return value;
}

export interface CharacterSpec {
  group: number;
  active: boolean;
  // "0/53/18"
  points: string;
  total: number;
  // the tree with the most points (none without a point)
  main: { name: string; icon: string } | null;
  // the calculator's build (lib/talent-build.ts)
  build: string;
}

// a character's specializations (character_talent: the spell of the rank it has, by talent group; its second one once bought), in the
// game's order
export async function characterSpecs(
  slug: RealmSlug,
  guid: number,
  classId: number,
  locale: TooltipLocale,
): Promise<{ classKey: ClassKey; specs: CharacterSpec[] } | null> {
  const cls = await classTalents(slug, classId, locale);

  if (!cls) return null;
  const db = realmCharactersDb(slug);
  const [[owner], [rows]] = await Promise.all([
    db.query<RowDataPacket[]>(
      "SELECT activeTalentGroup, talentGroupsCount FROM characters WHERE guid = ?",
      [guid],
    ),
    db.query<RowDataPacket[]>(
      "SELECT spell, talentGroup FROM character_talent WHERE guid = ?",
      [guid],
    ),
  ]);
  const activeGroup = Number(owner[0]?.activeTalentGroup ?? 0);
  const groups = Number(owner[0]?.talentGroupsCount ?? 1);
  // the rank spell -> its tree, talent and rank
  const bySpell = new Map<number, [number, number, number]>();

  cls.trees.forEach((tree, i) =>
    tree.talents.forEach((t, j) =>
      t.ranks.forEach((s, r) => bySpell.set(s, [i, j, r + 1])),
    ),
  );
  const count = Math.max(1, Math.min(2, groups || 1));
  const specs = Array.from({ length: count }, (_, group) => {
    const points: BuildPoints = cls.trees.map((t) => t.talents.map(() => 0));

    for (const row of rows) {
      const at =
        Number(row.talentGroup) === group
          ? bySpell.get(Number(row.spell))
          : undefined;

      if (at) points[at[0]][at[1]] = Math.max(points[at[0]][at[1]], at[2]);
    }
    const sums = points.map((t) => t.reduce((a, b) => a + b, 0));
    const total = sums.reduce((a, b) => a + b, 0);
    const best = sums.indexOf(Math.max(...sums));

    return {
      group,
      active: group === activeGroup,
      points: pointsSummary(points),
      total,
      main: total
        ? { name: cls.trees[best].name, icon: cls.trees[best].icon }
        : null,
      build: encodeBuild(points),
    };
  });

  return { classKey: cls.key, specs };
}
