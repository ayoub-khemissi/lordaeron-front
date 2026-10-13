import type { RowDataPacket } from "mysql2";
import type {
  ArenaSeasonInfo,
  ArenaTeamMember,
  PvpBoard,
  RankedArenaTeam,
  RankedCharacter,
} from "@/types/rankings";

import {
  GUILD_JOINS,
  characterColumns,
  factionOf,
  filterSql,
  type RankFilters,
} from "@/lib/queries/rankings";
import { PAGE_SIZE, gmColumn, hideGm } from "@/lib/queries/realm-search";
import { realmPhase } from "@/lib/realm-unlocks";
import { REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";

/*
 * The PvP ladder of a realm (Ayoub, 13/10/2026): the characters by honorable kills (lifetime, today, yesterday), current honor (3.3.5's
 * totalHonorPoints is the spendable honor, not a lifetime total: shown as such) and arena points; the arena teams of each size by rating (season games and wins, members with their personal rating); on a progressive realm
 * the WotLK+ battleground ranking of the current phase (characters table wotlkplus_bg_ranking, game/Battlegrounds/WotLKPlusPvP: a won
 * and a played battleground each, the 10 best of each faction with WotLKPlus.PvP.Ranking.MinGames games earn the Campaign Marshal /
 * Warlord title at the phase's end) and the arena season the phase runs.
 */

// worldserver.conf WotLKPlus.PvP.Ranking.MinGames: the games a character needs for the phase's battleground titles
export const BG_MIN_GAMES = 20;

const METRICS: Partial<Record<PvpBoard, string>> = {
  kills: "c.totalKills",
  today: "c.todayKills",
  yesterday: "c.yesterdayKills",
  honor: "c.totalHonorPoints",
  "arena-points": "c.arenaPoints",
};

export const ARENA_BOARDS: Partial<Record<PvpBoard, number>> = {
  arena2: 2,
  arena3: 3,
  arena5: 5,
};

function toRanked(r: RowDataPacket, rank: number): RankedCharacter {
  return {
    guid: Number(r.guid),
    name: r.name,
    race: Number(r.race),
    class: Number(r.class),
    level: Number(r.level),
    gender: Number(r.gender),
    online: Number(r.online),
    gm: r.gm === undefined ? undefined : !!Number(r.gm),
    guildName: r.guildName ?? null,
    rank,
    value: Number(r.value),
    ...(r.games !== undefined
      ? {
          games: Number(r.games),
          qualified: Number(r.games) >= BG_MIN_GAMES,
        }
      : {}),
  };
}

// a characters board: those with something on it, the most first
export async function pvpCharacters(
  realm: RealmSlug,
  board: PvpBoard,
  filters: RankFilters,
  showGm: boolean,
): Promise<{ characters: RankedCharacter[]; total: number }> {
  const db = realmCharactersDb(realm);
  const offset = (filters.page - 1) * PAGE_SIZE;
  let from: string;
  let order: string;
  const params: (string | number)[] = [];

  if (board === "battlegrounds") {
    const phase = await realmPhase(realm);

    if (phase === null) return { characters: [], total: 0 };
    from = `FROM wotlkplus_bg_ranking r JOIN characters c ON c.guid = r.guid ${GUILD_JOINS}
      WHERE r.phase = ? AND r.games > 0`;
    params.push(phase);
    // the qualified first (the titles' order: wins, then the fewest games)
    order = `r.games >= ${BG_MIN_GAMES} DESC, r.wins DESC, r.games ASC, c.name ASC`;
  } else {
    const metric = METRICS[board] ?? METRICS.kills!;

    from = `FROM characters c ${GUILD_JOINS} WHERE ${metric} > 0`;
    order = `${metric} DESC, c.name ASC`;
  }
  const where = `${from} ${filterSql(filters)} ${hideGm("c.account", showGm)}`;
  const [counted] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total ${where}`,
    params,
  );
  const total = Number(counted[0]?.total ?? 0);

  if (!total) return { characters: [], total };
  const value =
    board === "battlegrounds"
      ? "r.wins AS value, r.games"
      : `${METRICS[board] ?? METRICS.kills} AS value`;
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT ${characterColumns(showGm)}, ${value} ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, offset],
  );

  return {
    characters: rows.map((r, i) => toRanked(r, offset + i + 1)),
    total,
  };
}

// the arena teams of a size by rating (a team's faction: its captain's; the class filter keeps the teams with such a member)
export async function pvpArenaTeams(
  realm: RealmSlug,
  type: number,
  filters: RankFilters,
  showGm: boolean,
): Promise<{ teams: RankedArenaTeam[]; total: number }> {
  const db = realmCharactersDb(realm);
  const offset = (filters.page - 1) * PAGE_SIZE;
  const classFilter = filters.cls
    ? `AND EXISTS (SELECT 1 FROM arena_team_member fm JOIN characters fc ON fc.guid = fm.guid
        WHERE fm.arenaTeamId = t.arenaTeamId AND fc.class = ${filters.cls})`
    : "";
  const where = `FROM arena_team t JOIN characters cap ON cap.guid = t.captainGuid
    WHERE t.type = ? ${filterSql({ ...filters, cls: null }, "cap")} ${classFilter} ${hideGm("cap.account", showGm)}`;
  const [counted] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total ${where}`,
    [type],
  );
  const total = Number(counted[0]?.total ?? 0);

  if (!total) return { teams: [], total };
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT t.arenaTeamId AS id, t.name, t.type, t.rating, t.seasonGames AS games, t.seasonWins AS wins, cap.race AS captainRace
     ${where} ORDER BY t.rating DESC, t.seasonWins DESC, t.name ASC LIMIT ? OFFSET ?`,
    [type, PAGE_SIZE, offset],
  );
  const ids = rows.map((r) => Number(r.id));
  const [members] = await db.query<RowDataPacket[]>(
    `SELECT m.arenaTeamId AS team, c.guid, c.name, c.race, c.class, c.gender, c.level, m.personalRating
       ${showGm ? `, ${gmColumn("c.account")}` : ""}
     FROM arena_team_member m JOIN characters c ON c.guid = m.guid
     WHERE m.arenaTeamId IN (?) AND c.deleteDate IS NULL ${hideGm("c.account", showGm)}
     ORDER BY m.personalRating DESC, c.name ASC`,
    [ids],
  );
  const byTeam = new Map<number, ArenaTeamMember[]>();

  for (const m of members) {
    const list = byTeam.get(Number(m.team)) ?? [];

    list.push({
      guid: Number(m.guid),
      name: m.name,
      race: Number(m.race),
      class: Number(m.class),
      gender: Number(m.gender),
      level: Number(m.level),
      personalRating: Number(m.personalRating),
      gm: m.gm === undefined ? undefined : !!Number(m.gm),
    });
    byTeam.set(Number(m.team), list);
  }

  return {
    teams: rows.map((r, i) => ({
      rank: offset + i + 1,
      id: Number(r.id),
      name: r.name,
      type: Number(r.type),
      rating: Number(r.rating),
      games: Number(r.games),
      wins: Number(r.wins),
      faction: factionOf(Number(r.captainRace)),
      members: byTeam.get(Number(r.id)) ?? [],
    })),
    total,
  };
}

// a progressive realm's arena season: the season its phase runs (world wotlk_plus_phase type 20: from its PhaseMin) and whether it
// is in progress (characters active_arena_season); null on a realm without phases
export async function arenaSeason(
  realm: RealmSlug,
): Promise<ArenaSeasonInfo | null> {
  if (!REALMS[realm].progressive) return null;
  const phase = (await realmPhase(realm)) ?? 0;
  const [seasons] = await realmWorldDb(realm).query<RowDataPacket[]>(
    "SELECT Entry, PhaseMin FROM wotlk_plus_phase WHERE Type = 20 AND PhaseMin <= ? ORDER BY PhaseMin DESC LIMIT 1",
    [phase],
  );
  const season = seasons.length ? Number(seasons[0].Entry) : null;
  let running = false;

  if (season) {
    try {
      const [active] = await realmCharactersDb(realm).query<RowDataPacket[]>(
        "SELECT season_id, season_state FROM active_arena_season LIMIT 1",
      );

      running =
        !!active.length &&
        Number(active[0].season_id) === season &&
        Number(active[0].season_state) === 1;
    } catch {
      // no active_arena_season table: no season recorded as running
    }
  }

  return { phase, season, running };
}
