"use client";

import type { GuildEmblem as Emblem } from "@/types/armory";

import NextLink from "next/link";

import { GuildEmblem } from "@/components/guild-emblem";
import { useRealmHref } from "@/lib/realm-context";

interface GuildInfoProps {
  guildName: string | null;
  guildRankName: string | null;
  guildEmblem?: Emblem | null;
}

/* A character's guild on its armory page: the guild's crest and name, which opens the guild's page, and the character's rank */
export function GuildInfo({
  guildName,
  guildRankName,
  guildEmblem,
}: GuildInfoProps) {
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
        {guildRankName && (
          <p className="text-xs text-gray-400">{guildRankName}</p>
        )}
      </div>
    </div>
  );
}
