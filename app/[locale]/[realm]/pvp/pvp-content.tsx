"use client";

import type {
  ArenaSeasonInfo,
  PvpBoard,
  RankedArenaTeam,
  RankedCharacter,
} from "@/types/rankings";

import { useFormatter, useTranslations } from "next-intl";

import { ArenaTeamRow } from "@/components/rankings/arena-team-row";
import { RankFilters, RankTabs } from "@/components/rankings/rank-filters";
import { Metric, RankState, RankedRow } from "@/components/rankings/ranked-row";
import { useRanking } from "@/components/rankings/use-ranking";
import { Pager } from "@/components/search/pager";
import { useRealm, useRealmHref } from "@/lib/realm-context";

interface PvpPage {
  board: PvpBoard;
  characters?: RankedCharacter[];
  teams?: RankedArenaTeam[];
  total: number;
  page: number;
  pageSize: number;
  season: ArenaSeasonInfo | null;
}

// lib/queries/pvp.ts BG_MIN_GAMES (worldserver.conf WotLKPlus.PvP.Ranking.MinGames)
const BG_MIN_GAMES = 20;

// a board's message key and the unit of its value
const BOARDS: { board: PvpBoard; key: string; unit: string }[] = [
  { board: "kills", key: "kills", unit: "kills" },
  { board: "today", key: "today", unit: "kills" },
  { board: "yesterday", key: "yesterday", unit: "kills" },
  { board: "honor", key: "honor", unit: "honor" },
  { board: "arena-points", key: "arenaPoints", unit: "arenaPoints" },
  { board: "arena2", key: "arena2", unit: "rating" },
  { board: "arena3", key: "arena3", unit: "rating" },
  { board: "arena5", key: "arena5", unit: "rating" },
  { board: "battlegrounds", key: "battlegrounds", unit: "wins" },
];

/* The PvP ladder (app/api/pvp): a board (honorable kills of all time, today, yesterday; honor and arena points; the arena teams of
   each size; on a progressive realm the battleground ranking of the phase's campaign), the faction and class filters, 20 a page */
export function PvpContent() {
  const t = useTranslations("pvp");
  const tRank = useTranslations("rankings");
  const format = useFormatter();
  const realm = useRealm();
  const realmHref = useRealmHref();
  const { params, set, data, loading, failed } = useRanking<PvpPage>(
    "/api/pvp",
    {
      board: "kills",
      faction: "",
      class: "",
    },
  );
  const boards = BOARDS.filter(
    (b) => b.board !== "battlegrounds" || realm.progressive,
  );
  const current = boards.find((b) => b.board === params.board) ?? boards[0];
  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const shown =
    data && data.board === current.board
      ? (data.characters ?? data.teams ?? [])
      : [];

  return (
    <div className="space-y-5">
      {data?.season && <SeasonBanner season={data.season} />}
      <RankTabs
        label={t("boardsLabel")}
        options={boards.map((b) => ({
          value: b.board,
          label: t(`boards.${b.key}`),
        }))}
        value={current.board}
        onChange={(v) => set("board", v)}
      />
      <RankFilters
        cls={params.class}
        faction={params.faction}
        onClass={(v) => set("class", v)}
        onFaction={(v) => set("faction", v)}
      />
      {current.board === "battlegrounds" && (
        <p className="rounded-xl border border-wow-gold/20 bg-wow-gold/5 px-4 py-3 text-sm text-gray-300">
          {t("battlegroundsNote", { min: BG_MIN_GAMES })}
        </p>
      )}
      {data && !loading && !failed && (
        <p className="text-sm text-gray-500">
          {data.teams
            ? t("teamsCount", { count: data.total })
            : tRank("count", { count: data.total })}
        </p>
      )}
      <div className={loading && data ? "opacity-60 transition-opacity" : ""}>
        {!data && loading ? (
          <RankState>{tRank("loading")}</RankState>
        ) : failed || !data ? (
          <RankState>{tRank("error")}</RankState>
        ) : !shown.length ? (
          <RankState>
            {data.teams ? t("noTeams") : tRank("noResults")}
          </RankState>
        ) : (
          <ol className="space-y-2">
            {data.teams
              ? data.teams.map((team) => (
                  <li key={team.id}>
                    <ArenaTeamRow team={team} />
                  </li>
                ))
              : data.characters!.map((c) => (
                  <li key={c.guid}>
                    <RankedRow
                      character={c}
                      faded={c.qualified === false}
                      guildHref={
                        c.guildName
                          ? realmHref(
                              `/guilds/${encodeURIComponent(c.guildName)}`,
                            )
                          : undefined
                      }
                      guildName={c.guildName}
                      href={realmHref(`/armory/${encodeURIComponent(c.name)}`)}
                      metric={
                        <Metric
                          unit={
                            c.games !== undefined
                              ? t("gamesOf", { count: c.games })
                              : t(`units.${current.unit}`)
                          }
                          value={format.number(c.value)}
                        />
                      }
                      rank={c.rank}
                    />
                  </li>
                ))}
          </ol>
        )}
      </div>
      {data && (
        <Pager
          page={data.page}
          pages={pages}
          onPage={(p) => {
            set("page", String(p));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

// a progressive realm's arena season: the one its phase runs, in progress or not; none in phase 0
function SeasonBanner({ season }: { season: ArenaSeasonInfo }) {
  const t = useTranslations("pvp");

  return (
    <div className="glass flex items-center gap-3 rounded-xl border border-wow-blue-ice/20 px-4 py-3">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${season.season && season.running ? "bg-green-500" : "bg-gray-500"}`}
      />
      <p className="text-sm text-gray-200">
        {season.season === null
          ? t("season.none", { phase: season.phase })
          : season.running
            ? t("season.running", {
                season: season.season,
                phase: season.phase,
              })
            : t("season.idle", { season: season.season, phase: season.phase })}
      </p>
    </div>
  );
}
