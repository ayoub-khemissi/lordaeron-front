"use client";

import type { RankedArenaTeam } from "@/types/rankings";

import NextLink from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import clsx from "clsx";

import {
  FactionCrest,
  RaceClassIcons,
  classColor,
} from "@/components/character-identity";
import { useRealmHref } from "@/lib/realm-context";

/* An arena team of the PvP ladder: its place, name and faction, its rating, the season's wins and losses, its members (their armory
   pages) with their personal rating */
export function ArenaTeamRow({ team }: { team: RankedArenaTeam }) {
  const t = useTranslations("pvp");
  const tArmory = useTranslations("armory");
  const format = useFormatter();
  const realmHref = useRealmHref();
  const losses = Math.max(0, team.games - team.wins);

  return (
    <div className="glass rounded-xl border border-white/5 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className={clsx(
            "w-7 shrink-0 text-right font-heading text-lg tabular-nums",
            team.rank <= 3 ? "text-wow-gold" : "text-gray-500",
          )}
        >
          {team.rank}
        </span>
        <div className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <FactionCrest alliance={team.faction === "alliance"} size={20} />
            <span className="truncate text-base font-semibold text-white">
              {team.name}
            </span>
          </span>
          <span className="block truncate text-xs text-gray-400 sm:text-sm">
            {t("winsLosses", { wins: team.wins, losses })}
            {team.games > 0 &&
              ` · ${format.number(team.wins / team.games, { style: "percent" })}`}
          </span>
        </div>
        <div className="shrink-0 text-right">
          <span className="block font-heading text-lg leading-tight tabular-nums text-wow-gold-light">
            {format.number(team.rating)}
          </span>
          <span className="block text-[11px] uppercase tracking-wide text-gray-500">
            {t("units.rating")}
          </span>
        </div>
      </div>
      {team.members.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-10 sm:pl-11">
          {team.members.map((m) => (
            <li key={m.guid} className="flex items-center gap-1.5 text-sm">
              <RaceClassIcons
                cls={m.class}
                gender={m.gender}
                race={m.race}
                size={16}
              />
              <NextLink
                className="font-medium hover:underline"
                href={realmHref(`/armory/${encodeURIComponent(m.name)}`)}
                style={{ color: classColor(m.class) }}
              >
                {m.name}
              </NextLink>
              {m.gm && (
                <span className="ml-1 text-[10px] font-bold uppercase text-red-300">
                  {tArmory("gm")}
                </span>
              )}{" "}
              <span
                className="tabular-nums text-gray-500"
                title={t("personalRating")}
              >
                {format.number(m.personalRating)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
