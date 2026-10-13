import { ALLIANCE_RACES } from "@/lib/armory-constants";
import { gmColumn, pageParam } from "@/lib/queries/realm-search";

/*
 * What the realm's rankings share (Ayoub, 13/10/2026: a PvP ladder and a hall of fame beside the armory): the filters read from a
 * request (?faction=alliance|horde, ?class=<id>, ?page=) and their SQL on a characters table aliased `c` (deleted characters left out).
 * The game masters' characters stay hidden from the public (lib/queries/realm-search.ts hideGm), shown to a verified administrator.
 */

export type Faction = "alliance" | "horde";

export interface RankFilters {
  faction: Faction | null;
  cls: number | null;
  page: number;
}

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];

export function rankFilters(params: URLSearchParams): RankFilters {
  const faction = params.get("faction");
  const cls = Number(params.get("class"));

  return {
    faction: faction === "alliance" || faction === "horde" ? faction : null,
    cls: CLASSES.includes(cls) ? cls : null,
    page: pageParam(params.get("page")),
  };
}

// the character conditions of the filters (`AND ...`, or nothing)
export function filterSql(filters: RankFilters, alias = "c"): string {
  const races = ALLIANCE_RACES.join(",");

  return [
    `AND ${alias}.deleteDate IS NULL`,
    filters.faction === "alliance" ? `AND ${alias}.race IN (${races})` : "",
    filters.faction === "horde" ? `AND ${alias}.race NOT IN (${races})` : "",
    filters.cls ? `AND ${alias}.class = ${filters.cls}` : "",
  ].join(" ");
}

// the faction of a race
export const factionOf = (race: number): Faction =>
  ALLIANCE_RACES.includes(race) ? "alliance" : "horde";

// a ranked character's columns (its guild through GUILD_JOINS; the GM flag for an administrator)
export const characterColumns = (showGm: boolean) =>
  `c.guid, c.name, c.race, c.class, c.level, c.gender, c.online, g.name AS guildName${showGm ? `, ${gmColumn("c.account")}` : ""}`;

export const GUILD_JOINS =
  "LEFT JOIN guild_member gm ON gm.guid = c.guid LEFT JOIN guild g ON g.guildid = gm.guildid";
