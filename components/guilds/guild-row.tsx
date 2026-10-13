"use client";

import type { GuildSummary } from "@/types/guild";

import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { GuildEmblem } from "@/components/guild-emblem";
import { FactionCounts } from "@/components/guilds/faction-counts";

/* A guild in the search: its crest, name, members by faction, its leader and, on a progressive realm, its level. Opens its page. */
export function GuildRow({
  guild,
  href,
}: {
  guild: GuildSummary;
  href: string;
}) {
  const t = useTranslations("guilds");

  return (
    <NextLink className="group block" href={href}>
      <div className="glass flex items-center gap-3 rounded-xl border border-white/5 px-3 py-2.5 transition-all hover:border-wow-gold/30 active:scale-[0.99] sm:gap-4 sm:px-4">
        <GuildEmblem emblem={guild.emblem} size={44} />
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="font-semibold text-wow-gold transition-colors group-hover:text-wow-gold-light">
              {guild.name}
            </span>
            {guild.level && (
              <span className="rounded-full border border-wow-blue-ice/40 bg-wow-blue-ice/10 px-2 py-px text-[11px] font-semibold text-wow-blue-ice">
                {t("levelShort", { level: guild.level.level })}
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-gray-400">
            {t("membersCount", { count: guild.members })}
            {guild.leaderName && (
              <>
                {" · "}
                {t("leaderIs", { name: guild.leaderName })}
              </>
            )}
          </span>
        </div>
        <FactionCounts alliance={guild.alliance} horde={guild.horde} />
        <span
          aria-hidden
          className="text-lg leading-none text-gray-500 transition-colors group-hover:text-wow-gold"
        >
          ›
        </span>
      </div>
    </NextLink>
  );
}
