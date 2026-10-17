"use client";

import type { ReactNode } from "react";
import type { HallOfFameEntry } from "@/types/rankings";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { ChallengeBoard } from "@/components/challenges/challenge-board";
import { RankFilters, RankTabs } from "@/components/rankings/rank-filters";
import { Metric, RankState, RankedRow } from "@/components/rankings/ranked-row";
import { RankedRowsSkeleton } from "@/components/rankings/ranking-skeleton";
import { useRanking } from "@/components/rankings/use-ranking";
import { Pager } from "@/components/search/pager";
import { useRealm, useRealmHref } from "@/lib/realm-context";

interface HallOfFamePage {
  sort: "points" | "count";
  entries: HallOfFameEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export type HallOfFameTab = "ranking" | "challenges";

// the boards' row: the two sorts of the ranking, and the challenges on a realm whose challenges are open (lib/realms.ts)
type Tabs = (value: string, onSort: (sort: string) => void) => ReactNode;

/* The hall of fame (app/api/hall-of-fame): the characters by achievement points or by achievements earned, the faction and class
   filters, 20 a page */
function FameRanking({ tabs }: { tabs: Tabs }) {
  const t = useTranslations("hallOfFame");
  const tRank = useTranslations("rankings");
  const format = useFormatter();
  const realmHref = useRealmHref();
  const { params, set, data, loading, failed } = useRanking<HallOfFamePage>(
    "/api/hall-of-fame",
    { sort: "points", faction: "", class: "" },
  );
  const sort = params.sort === "count" ? "count" : "points";
  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="space-y-5">
      {tabs(sort, (v) => set("sort", v))}
      <RankFilters
        cls={params.class}
        faction={params.faction}
        onClass={(v) => set("class", v)}
        onFaction={(v) => set("faction", v)}
      />
      {data && !loading && !failed && (
        <p className="text-sm text-gray-500">
          {tRank("count", { count: data.total })}
        </p>
      )}
      <div className={loading && data ? "opacity-60 transition-opacity" : ""}>
        {loading && !data?.entries.length ? (
          <RankedRowsSkeleton />
        ) : failed || !data ? (
          <RankState>{tRank("error")}</RankState>
        ) : !data.entries.length ? (
          <RankState>{tRank("noResults")}</RankState>
        ) : (
          <ol className="space-y-2">
            {data.entries.map((e) => (
              <li key={e.guid}>
                <RankedRow
                  character={e}
                  guildHref={
                    e.guildName
                      ? realmHref(`/guilds/${encodeURIComponent(e.guildName)}`)
                      : undefined
                  }
                  guildName={e.guildName}
                  href={realmHref(`/armory/${encodeURIComponent(e.name)}`)}
                  metric={
                    data.sort === "count" ? (
                      <Metric
                        unit={t("pointsOf", {
                          points: format.number(e.points),
                        })}
                        value={format.number(e.achievements)}
                      />
                    ) : (
                      <Metric
                        unit={t("achievementsOf", { count: e.achievements })}
                        value={format.number(e.points)}
                      />
                    )
                  }
                  rank={e.rank}
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

/* The hall of fame: its ranking and, on a realm whose WotLK+ challenges are open, its Challenges tab (?tab=challenges, the armory's
   challenge badges link to it) */
export function HallOfFameContent({
  initialTab = "ranking",
}: {
  initialTab?: HallOfFameTab;
}) {
  const t = useTranslations("hallOfFame");
  const tChallenges = useTranslations("challenges");
  const realm = useRealm();
  const [tab, setTab] = useState<HallOfFameTab>(initialTab);
  const challenges = !!realm.challenges && tab === "challenges";

  // a board chosen: the challenges, or a sort of the ranking (from the challenges, the ranking opens on it: it reads the address)
  const tabs: Tabs = (value, onSort) => (
    <RankTabs
      label={t("sortLabel")}
      options={[
        { value: "points", label: t("byPoints") },
        { value: "count", label: t("byCount") },
        ...(realm.challenges
          ? [{ value: "challenges", label: tChallenges("tab") }]
          : []),
      ]}
      value={challenges ? "challenges" : value}
      onChange={(v) => {
        const url = new URL(window.location.href);

        if (v === "challenges") {
          url.searchParams.set("tab", "challenges");
          window.history.replaceState(null, "", url);
          setTab("challenges");
        } else if (challenges) {
          url.searchParams.delete("tab");
          url.searchParams.delete("page");
          if (v === "points") url.searchParams.delete("sort");
          else url.searchParams.set("sort", v);
          window.history.replaceState(null, "", url);
          setTab("ranking");
        } else onSort(v);
      }}
    />
  );

  return challenges ? (
    <div className="space-y-5">
      {tabs("", () => {})}
      <ChallengeBoard />
    </div>
  ) : (
    <FameRanking tabs={tabs} />
  );
}
