"use client";

import type { ArmorySearchResult } from "@/types/armory";

import NextLink from "next/link";
import { useTranslations } from "next-intl";

import {
  ALLIANCE_RACES,
  CLASS_COLORS,
  CLASS_NAMES,
  RACE_NAMES,
} from "@/lib/armory-constants";

/* A character in a list (the armory's search, a guild's members): online or not, its name in its class colour, level, race and class,
   its guild rank when given, its faction; a game master's (only a site administrator gets them) carries a GM badge. Opens its armory
   page. */
export function CharacterRow({
  character,
  href,
  rankName,
}: {
  character: ArmorySearchResult;
  href: string;
  rankName?: string | null;
}) {
  const t = useTranslations("armory");
  const isAlliance = ALLIANCE_RACES.includes(character.race);

  return (
    <NextLink className="group block" href={href}>
      <div className="glass flex items-center gap-3 rounded-xl border border-white/5 px-4 py-3 transition-all hover:border-wow-gold/30 active:scale-[0.99] sm:gap-4">
        <div
          className={`h-2 w-2 shrink-0 rounded-full ${character.online ? "bg-green-500" : "bg-gray-600"}`}
        />
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span
              className="text-base font-semibold transition-all group-hover:brightness-125"
              style={{ color: CLASS_COLORS[character.class] || "#FFFFFF" }}
            >
              {character.name}
            </span>
            {character.gm && (
              <span className="rounded border border-red-400/40 bg-red-500/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-red-300">
                {t("gm")}
              </span>
            )}
            <span className="text-sm text-gray-400">
              {t("level")} {character.level}{" "}
              {RACE_NAMES[character.race] || "Unknown"}{" "}
              {CLASS_NAMES[character.class] || "Unknown"}
            </span>
          </span>
          {rankName && (
            <span className="mt-0.5 block text-xs text-wow-gold/80">
              {rankName}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            isAlliance
              ? "bg-blue-500/20 text-blue-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isAlliance ? "Alliance" : "Horde"}
        </span>
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
