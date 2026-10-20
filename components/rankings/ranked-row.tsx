"use client";

import type { ReactNode } from "react";
import type { ArmorySearchResult } from "@/types/armory";

import NextLink from "next/link";
import clsx from "clsx";

import { ALLIANCE_RACES } from "@/lib/armory-constants";
import {
  CharacterBlock,
  FactionCrest,
  GmBadge,
} from "@/components/character-identity";

/* A character of a ranking (the PvP ladder, the hall of fame): its place, the site's character block (its armory page: the whole row
   opens it, its name underlined on hover), its guild (its page, a link of its own above the row's), the ranked value, its faction's
   crest. A game master's (an administrator's view only) carries a GM badge. */
export function RankedRow({
  rank,
  character,
  href,
  guildName,
  guildHref,
  metric,
  faded,
}: {
  rank: number;
  character: ArmorySearchResult;
  href: string;
  guildName?: string | null;
  guildHref?: string;
  metric: ReactNode;
  faded?: boolean;
}) {
  const isAlliance = ALLIANCE_RACES.includes(character.race);

  return (
    <div
      className={clsx(
        "glass group relative flex items-center gap-3 rounded-xl border border-white/5 px-3 py-3 transition-all hover:border-wow-gold/30 active:scale-[0.99] sm:gap-4 sm:px-4",
        faded && "opacity-60",
      )}
    >
      <span
        className={clsx(
          "w-7 shrink-0 text-right font-heading text-lg tabular-nums",
          rank <= 3 ? "text-wow-gold" : "text-gray-500",
        )}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <CharacterBlock
          stretch
          badges={character.gm && <GmBadge />}
          character={character}
          href={href}
          online={!!character.online}
        />
        {guildName && guildHref && (
          <NextLink
            className="relative z-10 ml-12 mt-0.5 inline-block max-w-[calc(100%-3rem)] truncate text-xs text-wow-gold/80 hover:text-wow-gold hover:underline"
            href={guildHref}
          >
            &lt;{guildName}&gt;
          </NextLink>
        )}
      </div>
      <div className="shrink-0 text-right">{metric}</div>
      <FactionCrest alliance={isAlliance} />
    </div>
  );
}

// a ranked value: the number, its unit under it
export function Metric({ value, unit }: { value: ReactNode; unit: ReactNode }) {
  return (
    <>
      <span className="block font-heading text-lg leading-tight tabular-nums text-wow-gold-light">
        {value}
      </span>
      <span className="block text-[11px] uppercase tracking-wide text-gray-500">
        {unit}
      </span>
    </>
  );
}

// the state of a ranking's list: loading, failed, empty
export function RankState({ children }: { children: ReactNode }) {
  return (
    <p className="glass rounded-xl border border-white/5 px-4 py-10 text-center text-sm text-gray-400">
      {children}
    </p>
  );
}
