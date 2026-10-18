"use client";

import type { GuildSummary } from "@/types/guild";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { GuildEmblem } from "@/components/guild-emblem";
import { FactionCounts } from "@/components/guilds/faction-counts";

/* A guild in the search: its crest, name and, on a progressive realm, its level, its members and leader on one line, its members by
   faction (the factions' crests). Opens its page. Laid out again on 18/10/2026 (Ayoub: the tools' rows, HeroUI's Card). */
export function GuildRow({
  guild,
  href,
}: {
  guild: GuildSummary;
  href: string;
}) {
  const t = useTranslations("guilds");

  return (
    <Card
      isPressable
      as={NextLink}
      className="glass group w-full border border-white/5 bg-transparent shadow-none data-[hover=true]:border-wow-gold/30"
      href={href}
      radius="lg"
    >
      <CardBody className="flex flex-row items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4">
        <GuildEmblem emblem={guild.emblem} size={44} />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-wow-gold transition-colors group-hover:text-wow-gold-light">
              {guild.name}
            </span>
            {guild.level && (
              <Chip
                className="h-5 shrink-0 border-wow-blue-ice/40 text-[11px] font-semibold text-wow-blue-ice"
                size="sm"
                variant="bordered"
              >
                {t("levelShort", { level: guild.level.level })}
              </Chip>
            )}
          </div>
          <span className="block truncate text-xs text-gray-400">
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
        <svg
          aria-hidden
          className="h-4 w-4 shrink-0 text-gray-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-wow-gold"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </CardBody>
    </Card>
  );
}
