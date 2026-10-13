"use client";

import type { GuildSummary } from "@/types/guild";

import { useTranslations } from "next-intl";

import { GuildRow } from "@/components/guilds/guild-row";
import { RealmSearch } from "@/components/search/realm-search";
import { useRealmHref } from "@/lib/realm-context";

/* The guilds' search (components/search/realm-search.tsx, shared with the armory): every guild, the most numerous first, until a name is typed */
export function GuildsContent() {
  const realmHref = useRealmHref();
  const t = useTranslations("guilds");

  return (
    <RealmSearch<GuildSummary>
      browse
      countLabel={(count) => t("resultsCount", { count })}
      endpoint="/api/guilds/search"
      itemKey={(g) => g.guildid}
      kind="guild"
      listKey="guilds"
      noResults={t("noResults")}
      placeholder={t("searchPlaceholder")}
      renderItem={(g) => (
        <GuildRow
          guild={g}
          href={realmHref(`/guilds/${encodeURIComponent(g.name)}`)}
        />
      )}
    />
  );
}
