"use client";

import type { ArmorySearchResult } from "@/types/armory";

import { useEffect, useState } from "react";
import { Switch } from "@heroui/switch";
import { useTranslations } from "next-intl";

import { CharacterRow } from "@/components/armory/character-row";
import { RankFilters } from "@/components/rankings/rank-filters";
import { RealmSearch } from "@/components/search/realm-search";
import { ToolSelect } from "@/components/tools/tool-select";
import { useRealmHref } from "@/lib/realm-context";

const SORTS = ["level", "recent", "name"] as const;

type Sort = (typeof SORTS)[number];

/* The armory (components/search/realm-search.tsx, shared with the guilds): the realm's characters from the start, the online first and
   the highest level (Ayoub, 18/10/2026: "la page est vide quand tu arrives"), a name search, and filters: faction, class, online only,
   the order; all of them kept in the address. */
export function ArmoryContent() {
  const realmHref = useRealmHref();
  const t = useTranslations("armory");
  const [faction, setFaction] = useState("");
  const [cls, setCls] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("level");

  // the address's filters, once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("faction");
    const s = params.get("sort") as Sort;

    if (f === "alliance" || f === "horde") setFaction(f);
    setCls(params.get("class") ?? "");
    setOnlineOnly(params.get("online") === "1");
    if (SORTS.includes(s)) setSort(s);
  }, []);

  return (
    <RealmSearch<ArmorySearchResult>
      browse
      countLabel={(count) => t("resultsCount", { count })}
      endpoint="/api/armory/search"
      itemKey={(c) => c.guid}
      kind="character"
      listKey="characters"
      noResults={t("noResults")}
      params={{
        faction,
        class: cls,
        online: onlineOnly ? "1" : "",
        sort: sort === "level" ? "" : sort,
      }}
      placeholder={t("searchPlaceholder")}
      renderItem={(c) => (
        <CharacterRow
          character={c}
          href={realmHref(`/armory/${encodeURIComponent(c.name)}`)}
        />
      )}
      toolbar={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <RankFilters
            cls={cls}
            faction={faction}
            onClass={setCls}
            onFaction={setFaction}
          />
          <Switch
            classNames={{
              label: "text-sm text-gray-300",
              wrapper: "group-data-[selected=true]:bg-green-500/80",
            }}
            isSelected={onlineOnly}
            size="sm"
            onValueChange={setOnlineOnly}
          >
            {t("onlineOnly")}
          </Switch>
          <ToolSelect
            className="sm:ml-auto sm:w-48"
            label={t("sortLabel")}
            options={[
              { value: "level", label: t("sortLevel") },
              { value: "recent", label: t("sortRecent") },
              { value: "name", label: t("sortName") },
            ]}
            value={sort}
            onChange={(v) => setSort(v as Sort)}
          />
        </div>
      }
    />
  );
}
