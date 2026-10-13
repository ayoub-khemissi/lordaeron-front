"use client";

import type { ArmorySearchResult } from "@/types/armory";

import { useTranslations } from "next-intl";

import { CharacterRow } from "@/components/armory/character-row";
import { RealmSearch } from "@/components/search/realm-search";
import { useRealmHref } from "@/lib/realm-context";

/* The armory's search (components/search/realm-search.tsx, shared with the guilds) */
export function ArmoryContent() {
  const realmHref = useRealmHref();
  const t = useTranslations("armory");

  return (
    <RealmSearch<ArmorySearchResult>
      countLabel={(count) => t("resultsCount", { count })}
      endpoint="/api/armory/search"
      itemKey={(c) => c.guid}
      kind="character"
      listKey="characters"
      noResults={t("noResults")}
      placeholder={t("searchPlaceholder")}
      renderItem={(c) => (
        <CharacterRow
          character={c}
          href={realmHref(`/armory/${encodeURIComponent(c.name)}`)}
        />
      )}
    />
  );
}
