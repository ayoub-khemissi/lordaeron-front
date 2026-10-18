"use client";

import type { ReactNode } from "react";
import type { ArmorySearchResult } from "@/types/armory";

import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { ALLIANCE_RACES } from "@/lib/armory-constants";
import {
  CharacterPortrait,
  FactionCrest,
  LevelRaceClass,
  classColor,
} from "@/components/character-identity";

/* A character of a ranking (the PvP ladder, the hall of fame): its place, online or not, its name in its class colour (its armory page:
   the whole row opens it), "level · race · class" on one line, its guild (its page, a link of its own above the row's), the ranked value,
   its faction's crest (laid out again on 18/10/2026: the portrait carries the class and the online dot). A game master's (an
   administrator's view only) carries a GM badge. */
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
  const tArmory = useTranslations("armory");
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
      <CharacterPortrait
        cls={character.class}
        gender={character.gender}
        online={!!character.online}
        race={character.race}
        size={36}
      />
      <div className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <NextLink
            className="truncate text-base font-semibold transition-all after:absolute after:inset-0 after:rounded-xl group-hover:brightness-125"
            href={href}
            style={{ color: classColor(character.class) }}
          >
            {character.name}
          </NextLink>
          {character.gm && (
            <Chip
              className="h-5 shrink-0 text-[10px] font-bold uppercase"
              color="danger"
              size="sm"
              variant="flat"
            >
              {tArmory("gm")}
            </Chip>
          )}
        </span>
        <LevelRaceClass
          separated
          className="block truncate text-xs sm:text-sm"
          cls={character.class}
          level={character.level}
          race={character.race}
        />
        {guildName && guildHref && (
          <NextLink
            className="relative z-10 mt-0.5 inline-block max-w-full truncate text-xs text-wow-gold/80 hover:text-wow-gold hover:underline"
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
