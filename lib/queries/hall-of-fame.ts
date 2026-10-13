import type { RowDataPacket } from "mysql2";
import type { HallOfFameEntry } from "@/types/rankings";

import {
  GUILD_JOINS,
  characterColumns,
  filterSql,
  type RankFilters,
} from "@/lib/queries/rankings";
import { PAGE_SIZE, hideGm } from "@/lib/queries/realm-search";
import { type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import { dbcStore } from "@/lib/tooltips/dbc";

/*
 * The hall of fame of a realm (Ayoub, 13/10/2026): the characters by achievement points (each earned achievement's Points in the
 * realm's own Achievement.dbc, so the WotLK+ achievements count too) or by number of achievements earned; the filters and the game
 * masters' rule of the other rankings (lib/queries/rankings.ts).
 */

export type FameSort = "points" | "count";

export async function hallOfFame(
  realm: RealmSlug,
  sort: FameSort,
  filters: RankFilters,
  showGm: boolean,
): Promise<{ entries: HallOfFameEntry[]; total: number }> {
  const db = realmCharactersDb(realm);
  const where = `${filterSql(filters)} ${hideGm("c.account", showGm)}`;
  const [[characters], [earned], dbcs] = await Promise.all([
    db.query<RowDataPacket[]>(
      `SELECT ${characterColumns(showGm)} FROM characters c ${GUILD_JOINS} WHERE 1 = 1 ${where}`,
    ),
    db.query<RowDataPacket[]>(
      `SELECT a.guid, a.achievement FROM character_achievement a JOIN characters c ON c.guid = a.guid WHERE 1 = 1 ${where}`,
    ),
    dbcStore(realmServer(realm).dbcDir).load(["Achievement"]),
  ]);
  const achievements = dbcs("Achievement");
  const totals = new Map<number, { points: number; count: number }>();

  for (const r of earned) {
    const t = totals.get(Number(r.guid)) ?? { points: 0, count: 0 };

    t.points += achievements.rec(Number(r.achievement))?.get("Points") ?? 0;
    t.count += 1;
    totals.set(Number(r.guid), t);
  }

  const ranked = characters
    .filter((c) => totals.has(Number(c.guid)))
    .map((c) => ({ c, t: totals.get(Number(c.guid))! }))
    .sort((a, b) =>
      sort === "points"
        ? b.t.points - a.t.points ||
          b.t.count - a.t.count ||
          String(a.c.name).localeCompare(String(b.c.name))
        : b.t.count - a.t.count ||
          b.t.points - a.t.points ||
          String(a.c.name).localeCompare(String(b.c.name)),
    );
  const offset = (filters.page - 1) * PAGE_SIZE;

  return {
    entries: ranked.slice(offset, offset + PAGE_SIZE).map(({ c, t }, i) => ({
      guid: Number(c.guid),
      name: c.name,
      race: Number(c.race),
      class: Number(c.class),
      level: Number(c.level),
      gender: Number(c.gender),
      online: Number(c.online),
      gm: c.gm === undefined ? undefined : !!Number(c.gm),
      guildName: c.guildName ?? null,
      rank: offset + i + 1,
      points: t.points,
      achievements: t.count,
    })),
    total: ranked.length,
  };
}
