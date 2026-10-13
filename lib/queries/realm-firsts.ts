import type { RowDataPacket } from "mysql2";

import { REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import {
  LEVEL_80_REALM_FIRSTS,
  realmFirstsProgress,
} from "@/lib/realm-unlocks";
import { gmColumn } from "@/lib/queries/realm-search";
import { dbcStore } from "@/lib/tooltips/dbc";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

/*
 * A realm's realm firsts (Ayoub, 13/10/2026: the Tools page /<realm>/realm-firsts): every achievement of its Achievement.dbc flagged
 * realm first (0x100 the first character, 0x300 the first group: Blizzard's, and the WotLK+ ones of content/firsts.js on a progressive
 * realm), who earned it and when (character_achievement). The game masters' characters only for a site administrator: a first one of
 * them earned stays earned (the core counts it), its name hidden.
 */

const REALM_FIRST = 0x100;
const REALM_FIRST_KILL = 0x200;

// the achievement criteria kinds that sort them
const CRITERIA_REACH_LEVEL = 5;
const CRITERIA_REACH_SKILL = 7;

// WotLK+ realm firsts (content/firsts.js, 5500-5599): the professions' masteries, the Sewer Tournament and the campaigns, the world bosses' meta
const WOTLK_PROFESSIONS = [5507, 5520];
const WOTLK_PVP = [5521, 5526];
const WOTLK_BOSSES = [5538];
// the server-side credits of content/firsts.js (a guild's level...): realm firsts flagged "group", not boss kills
const CREDIT_SPELLS = [103750, 103769];
const CRITERIA_SPELL_TARGET = 28;

export type RealmFirstGroup =
  | "level"
  | "classes"
  | "races"
  | "bosses"
  | "professions"
  | "pvp"
  | "feats";

export interface RealmFirstEarner {
  guid: number;
  name: string;
  race: number;
  class: number;
  guild: string | null;
  deleted: boolean;
  gm?: boolean;
}

export interface RealmFirst {
  id: number;
  title: string;
  // a level 80 first of a class or a race: its name alone (the compact tiles)
  label?: string;
  description: string;
  icon: string | null;
  group: RealmFirstGroup;
  // -1 both factions, 0 Horde, 1 Alliance
  faction: number;
  // when it was earned (null: not yet)
  date: number | null;
  earners: RealmFirstEarner[];
}

export interface RealmFirsts {
  firsts: RealmFirst[];
  // a progressive realm's level 80 firsts of a race and a class: the experience bonuses wait for all of them (lib/realm-unlocks.ts)
  unlocks: { done: number; total: number } | null;
}

// the class and the race of each level 80 realm first (Achievement 458-467, 1404-1413)
const LEVEL_80_CLASS: Record<number, number> = {
  458: 4,
  459: 1,
  460: 8,
  461: 6,
  462: 3,
  463: 9,
  464: 5,
  465: 2,
  466: 11,
  467: 7,
};
const LEVEL_80_RACE: Record<number, number> = {
  1404: 7,
  1405: 10,
  1406: 11,
  1407: 3,
  1408: 1,
  1409: 4,
  1410: 2,
  1411: 6,
  1412: 8,
  1413: 5,
};

const within = (id: number, [a, b]: number[]) => id >= a && id <= b;

function groupOf(
  id: number,
  flags: number,
  criteria: { type: number; asset: number } | undefined,
): RealmFirstGroup {
  if (criteria?.type === CRITERIA_REACH_LEVEL) {
    const at = LEVEL_80_REALM_FIRSTS.indexOf(id);

    return at < 0 ? "level" : at < 10 ? "classes" : "races";
  }
  if (criteria?.type === CRITERIA_REACH_SKILL || within(id, WOTLK_PROFESSIONS))
    return "professions";
  if (within(id, WOTLK_PVP)) return "pvp";
  if (WOTLK_BOSSES.includes(id)) return "bosses";
  if (
    flags & REALM_FIRST_KILL &&
    !(
      criteria?.type === CRITERIA_SPELL_TARGET &&
      within(criteria.asset, CREDIT_SPELLS)
    )
  )
    return "bosses";

  return "feats";
}

export async function getRealmFirsts(
  slug: RealmSlug,
  locale: string,
  showGm: boolean,
): Promise<RealmFirsts> {
  const dbcs = await dbcStore(realmServer(slug).dbcDir).load([
    "Achievement",
    "Achievement_Criteria",
    "SpellIcon",
    "ChrClasses",
    "ChrRaces",
  ]);
  const icons = dbcs("SpellIcon");
  const slot = LOCALES[isTooltipLocale(locale) ? locale : "en"].slot;
  const firstCriteria = new Map<number, { type: number; asset: number }>();

  for (const c of dbcs("Achievement_Criteria").records()) {
    const a = c.get("Achievement_Id");

    if (!firstCriteria.has(a))
      firstCriteria.set(a, { type: c.get("Type"), asset: c.get("Asset_Id") });
  }
  const firsts: RealmFirst[] = [];

  for (const a of dbcs("Achievement").records()) {
    const flags = a.get("Flags");

    if (!(flags & (REALM_FIRST | REALM_FIRST_KILL))) continue;
    const texture = icons
      .rec(a.get("IconID"))
      ?.str("Texture")
      .split("\\")
      .pop()
      ?.toLowerCase();

    firsts.push({
      id: a.id,
      title: a.loc("Title", slot),
      description: a.loc("Description", slot),
      icon: texture || null,
      group: groupOf(a.id, flags, firstCriteria.get(a.id)),
      label: LEVEL_80_CLASS[a.id]
        ? dbcs("ChrClasses").rec(LEVEL_80_CLASS[a.id])?.loc("Name", slot)
        : LEVEL_80_RACE[a.id]
          ? dbcs("ChrRaces").rec(LEVEL_80_RACE[a.id])?.loc("Name", slot)
          : undefined,
      faction: a.get("Faction"),
      date: null,
      earners: [],
    });
  }

  if (firsts.length) {
    const [rows] = await realmCharactersDb(slug).query<RowDataPacket[]>(
      `SELECT ca.achievement, ca.date, c.guid, c.race, c.class,
         COALESCE(c.deleteInfos_Name, c.name) AS name, c.deleteInfos_Name IS NOT NULL AS deleted,
         g.name AS guild, ${gmColumn("c.account")}
       FROM character_achievement ca
       JOIN characters c ON c.guid = ca.guid
       LEFT JOIN guild_member gm ON gm.guid = c.guid
       LEFT JOIN guild g ON g.guildid = gm.guildid
       WHERE ca.achievement IN (?)
       ORDER BY ca.date, c.name`,
      [firsts.map((f) => f.id)],
    );
    const byId = new Map(firsts.map((f) => [f.id, f]));

    for (const r of rows) {
      const f = byId.get(Number(r.achievement));

      if (!f) continue;
      f.date = f.date === null ? Number(r.date) : Math.min(f.date, r.date);
      if (r.gm && !showGm) continue;
      f.earners.push({
        guid: Number(r.guid),
        name: String(r.name),
        race: Number(r.race),
        class: Number(r.class),
        guild: r.guild ?? null,
        deleted: !!r.deleted,
        ...(showGm ? { gm: !!r.gm } : {}),
      });
    }
  }

  return {
    firsts,
    unlocks: REALMS[slug].progressive ? await realmFirstsProgress(slug) : null,
  };
}
