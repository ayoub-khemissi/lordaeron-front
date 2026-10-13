"use client";

import type { HallOfFameEntry } from "@/types/rankings";

import { useFormatter, useTranslations } from "next-intl";

import { RankFilters, RankTabs } from "@/components/rankings/rank-filters";
import { Metric, RankState, RankedRow } from "@/components/rankings/ranked-row";
import { useRanking } from "@/components/rankings/use-ranking";
import { Pager } from "@/components/search/pager";
import { useRealmHref } from "@/lib/realm-context";

interface HallOfFamePage {
  sort: "points" | "count";
  entries: HallOfFameEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/* The hall of fame (app/api/hall-of-fame): the characters by achievement points or by achievements earned, the faction and class
   filters, 20 a page */
export function HallOfFameContent() {
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
      <RankTabs
        label={t("sortLabel")}
        options={[
          { value: "points", label: t("byPoints") },
          { value: "count", label: t("byCount") },
        ]}
        value={sort}
        onChange={(v) => set("sort", v)}
      />
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
        {!data && loading ? (
          <RankState>{tRank("loading")}</RankState>
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
