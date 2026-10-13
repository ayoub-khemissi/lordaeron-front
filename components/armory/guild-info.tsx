"use client";

import type { ArmoryCharacter, GuildEmblem as Emblem } from "@/types/armory";

import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { GuildEmblem } from "@/components/guild-emblem";
import { useRealmHref } from "@/lib/realm-context";

interface GuildInfoProps {
  guildName: string | null;
  guildRankName: string | null;
  guildRole?: ArmoryCharacter["guildRole"];
  guildEmblem?: Emblem | null;
}

// the officer's label in the game's officer channel green (ChatTypeInfo OFFICER: 0.25, 0.75, 0.25), darker than the guild channel's;
// the guild master's in the site's gold
const ROLE_STYLE = {
  officer: "border-[#40bf40]/40 bg-[#40bf40]/10 text-[#40bf40]",
  master: "border-wow-gold/50 bg-wow-gold/10 text-wow-gold-light",
} as const;

/* A character's guild on its armory page: the guild's crest and name, which opens the guild's page, the character's rank (the guild's
   own name for it) and, for the guild master or an officer, a label saying so (Ayoub, 14/10/2026) */
export function GuildInfo({
  guildName,
  guildRankName,
  guildRole,
  guildEmblem,
}: GuildInfoProps) {
  const t = useTranslations("armory");
  const realmHref = useRealmHref();

  if (!guildName) return null;

  return (
    <div className="mt-1 flex items-center justify-center gap-3">
      {guildEmblem && <GuildEmblem emblem={guildEmblem} size={40} />}
      <div className="text-center">
        <NextLink
          className="font-semibold text-wow-gold underline-offset-4 transition-colors hover:text-wow-gold-light hover:underline"
          href={realmHref(`/guilds/${encodeURIComponent(guildName)}`)}
        >
          &lt;{guildName}&gt;
        </NextLink>
        {(guildRankName || guildRole) && (
          <p className="mt-0.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-gray-400">
            {guildRankName && <span>{guildRankName}</span>}
            {guildRole && (
              <span
                className={clsx(
                  "rounded-full border px-2 py-px text-[10px] font-semibold uppercase tracking-wider",
                  ROLE_STYLE[guildRole],
                )}
              >
                {t(guildRole === "master" ? "guildMaster" : "guildOfficer")}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
