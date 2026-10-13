import type { RowDataPacket } from "mysql2";
import type { PopulationStats } from "@/types/rankings";

import { ALLIANCE_RACES } from "@/lib/armory-constants";
import { hideGm } from "@/lib/queries/realm-search";
import { type RealmSlug } from "@/lib/realms";
import { realmCharactersDb } from "@/lib/realms-server";

/*
 * The population of a realm (Ayoub, 13/10/2026): counts only, no name. The living characters (deleted ones aside, the game masters'
 * hidden from the public as elsewhere) by faction, class, race and level bracket, those online now, the accounts that play the realm,
 * and those accounts by the week they joined (the last 12 weeks: a 3.3.5 character keeps no creation date).
 */

// level brackets: 1-9, 10-19 ... 70-79, then the level cap alone
const BRACKETS = [
  [1, 9],
  [10, 19],
  [20, 29],
  [30, 39],
  [40, 49],
  [50, 59],
  [60, 69],
  [70, 79],
  [80, 80],
];

export async function realmPopulation(
  realm: RealmSlug,
  showGm: boolean,
): Promise<PopulationStats> {
  const db = realmCharactersDb(realm);
  const living = `c.deleteDate IS NULL ${hideGm("c.account", showGm)}`;
  const alliance = ALLIANCE_RACES.join(",");
  const [[totals], [classes], [races], [levels], [weeks]] = await Promise.all([
    db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total, SUM(c.online) AS online, COUNT(DISTINCT c.account) AS accounts,
         SUM(c.race IN (${alliance})) AS alliance
       FROM characters c WHERE ${living}`,
    ),
    db.query<RowDataPacket[]>(
      `SELECT c.class AS id, COUNT(*) AS count FROM characters c WHERE ${living} GROUP BY c.class ORDER BY count DESC`,
    ),
    db.query<RowDataPacket[]>(
      `SELECT c.race AS id, COUNT(*) AS count FROM characters c WHERE ${living} GROUP BY c.race ORDER BY count DESC`,
    ),
    db.query<RowDataPacket[]>(
      `SELECT c.level, COUNT(*) AS count FROM characters c WHERE ${living} GROUP BY c.level`,
    ),
    db.query<RowDataPacket[]>(
      `SELECT DATE_FORMAT(DATE_SUB(DATE(a.joindate), INTERVAL WEEKDAY(a.joindate) DAY), '%Y-%m-%d') AS start, COUNT(*) AS count
       FROM auth.account a
       WHERE a.joindate >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 11 WEEK)
         AND a.id IN (SELECT DISTINCT c.account FROM characters c WHERE ${living})
       GROUP BY start ORDER BY start`,
    ),
  ]);
  const total = Number(totals[0]?.total ?? 0);
  const allianceCount = Number(totals[0]?.alliance ?? 0);

  // the 12 weeks, the empty ones included (from Monday, the server's local dates like MySQL's)
  const counted = new Map(weeks.map((w) => [String(w.start), Number(w.count)]));
  const pad = (n: number) => String(n).padStart(2, "0");
  const monday = new Date();

  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekList = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(monday);

    d.setDate(d.getDate() - (11 - i) * 7);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    return { start: key, count: counted.get(key) ?? 0 };
  });

  return {
    total,
    online: Number(totals[0]?.online ?? 0),
    accounts: Number(totals[0]?.accounts ?? 0),
    factions: { alliance: allianceCount, horde: total - allianceCount },
    classes: classes.map((r) => ({ id: Number(r.id), count: Number(r.count) })),
    races: races.map((r) => ({ id: Number(r.id), count: Number(r.count) })),
    levels: BRACKETS.map(([from, to]) => ({
      from,
      to,
      count: levels
        .filter((l) => Number(l.level) >= from && Number(l.level) <= to)
        .reduce((n, l) => n + Number(l.count), 0),
    })),
    weeks: weekList,
  };
}
