"use client";

import type { ReactNode } from "react";
import type { ArmorySearchResult } from "@/types/armory";

import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { ALLIANCE_RACES, CLASS_COLORS } from "@/lib/armory-constants";

/* A character of a ranking (the PvP ladder, the hall of fame): its place, online or not, its name in its class colour (its armory page:
   the whole row opens it), level, race and class, its guild (its page, a link of its own above the row's), the ranked value, its faction
   (from a tablet up: on a phone the value takes its room). A game master's (an administrator's view only) carries a GM badge. */
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
  const t = useTranslations("rankings");
  const tShop = useTranslations("shop");
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
      <span
        className={clsx(
          "h-2 w-2 shrink-0 rounded-full",
          character.online ? "bg-green-500" : "bg-gray-600",
        )}
      />
      <div className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <NextLink
            className="truncate text-base font-semibold transition-all after:absolute after:inset-0 after:rounded-xl group-hover:brightness-125"
            href={href}
            style={{ color: CLASS_COLORS[character.class] || "#FFFFFF" }}
          >
            {character.name}
          </NextLink>
          {character.gm && (
            <span className="rounded border border-red-400/40 bg-red-500/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-red-300">
              {tArmory("gm")}
            </span>
          )}
          <span className="text-sm text-gray-400">
            {character.level} {t(`race_${character.race}`)}{" "}
            {tShop(`className_${character.class}`)}
          </span>
        </span>
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
      <span
        className={clsx(
          "hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline",
          isAlliance
            ? "bg-blue-500/20 text-blue-400"
            : "bg-red-500/20 text-red-400",
        )}
      >
        {isAlliance ? "Alliance" : "Horde"}
      </span>
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
