"use client";

import type {
  GuildAchievement,
  GuildMember,
  GuildSummary,
} from "@/types/guild";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";

import { CharacterRow } from "@/components/armory/character-row";
import { GameTipLink } from "@/components/game-tooltip";
import { GuildEmblem } from "@/components/guild-emblem";
import { FactionCounts } from "@/components/guilds/faction-counts";
import {
  GuildMembersSkeleton,
  GuildSkeleton,
} from "@/components/guilds/guild-skeleton";
import { Pager } from "@/components/search/pager";
import { useRealm, useRealmHref } from "@/lib/realm-context";

interface GuildData {
  guild: GuildSummary;
  members: GuildMember[];
  total: number;
  page: number;
  pageSize: number;
  achievements: GuildAchievement[];
}

/* A guild's page (Ayoub, 13/10/2026): its crest, factions, founder and members by rank; on a progressive realm its renown level and
   its WotLK+ achievements (app/api/guilds/[name]). */
export function GuildProfile({ name }: { name: string }) {
  const t = useTranslations("guilds");
  const locale = useLocale();
  const realm = useRealm();
  const realmHref = useRealmHref();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<GuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetch(
      `/api/guilds/${encodeURIComponent(name)}?realm=${realm.slug}&page=${page}&locale=${locale}`,
    )
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);

          return;
        }
        setData(await res.json());
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [name, realm.slug, page, locale]);

  if (notFound)
    return (
      <div className="container mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-gray-400">{t("notFound")}</p>
        <NextLink
          className="mt-4 inline-block text-wow-gold underline-offset-4 hover:underline"
          href={realmHref("/guilds")}
        >
          ← {t("title")}
        </NextLink>
      </div>
    );

  if (!data) return <GuildSkeleton />;

  const { guild, members, total, pageSize, achievements } = data;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const founded = guild.createdate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        guild.createdate * 1000,
      )
    : null;

  return (
    <div className="container mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-12">
      {/* the head: the crest beside the name */}
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
        <GuildEmblem emblem={guild.emblem} size={128} />
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl leading-tight text-wow-gold sm:text-4xl">
            &lt;{guild.name}&gt;
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {t("membersCount", { count: guild.members })}
            {founded && (
              <>
                {" · "}
                {t("foundedOn", { date: founded })}
              </>
            )}
          </p>
          {guild.leaderName && (
            <p className="mt-1 text-sm text-gray-400">
              {t("leader")}{" "}
              <NextLink
                className="font-semibold text-gray-200 underline decoration-wow-gold/40 underline-offset-4 hover:text-wow-gold"
                href={realmHref(
                  `/armory/${encodeURIComponent(guild.leaderName)}`,
                )}
              >
                {guild.leaderName}
              </NextLink>
            </p>
          )}
        </div>
        <FactionCounts alliance={guild.alliance} horde={guild.horde} />
      </div>

      {/* a progressive realm's renown level */}
      {guild.level && (
        <div className="glass mt-8 rounded-xl border border-wow-blue-ice/25 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-xl text-wow-blue-ice">
              {t("levelOf", {
                level: guild.level.level,
                max: guild.level.max,
              })}
            </p>
            <p className="text-sm text-gray-400">
              {t("renown", {
                renown: new Intl.NumberFormat(locale).format(
                  guild.level.renown,
                ),
              })}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-wow-blue-ice/60 to-wow-blue-ice"
              style={{ width: `${guild.level.pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {guild.level.next === null
              ? t("maxLevel")
              : t("toNext", {
                  pct: guild.level.pct,
                  level: guild.level.level + 1,
                  renown: new Intl.NumberFormat(locale).format(
                    guild.level.next,
                  ),
                })}
          </p>
        </div>
      )}

      {/* its WotLK+ achievements */}
      {achievements.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-heading text-xl text-white">
            {t("achievements")}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <li
                key={a.id}
                className="glass flex items-start gap-3 rounded-xl border border-white/5 p-3"
              >
                {/* the achievement's game tooltip (its criteria, its reward) on its icon and its name */}
                {a.icon && (
                  <GameTipLink
                    completed
                    achievementId={a.id}
                    className="flex shrink-0"
                  >
                    <img
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md border border-wow-gold/40"
                      loading="lazy"
                      src={`https://wow.zamimg.com/images/wow/icons/large/${a.icon}.jpg`}
                      onError={(e) =>
                        (e.currentTarget.style.visibility = "hidden")
                      }
                    />
                  </GameTipLink>
                )}
                <span className="min-w-0">
                  <GameTipLink
                    completed
                    achievementId={a.id}
                    className="block font-semibold text-wow-gold-light"
                  >
                    {a.title}
                  </GameTipLink>
                  <span className="block text-xs text-gray-400">
                    {a.description}
                  </span>
                  {a.date > 0 && (
                    <span className="mt-1 block text-[11px] text-gray-500">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                      }).format(a.date * 1000)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* its members, by rank */}
      <section className="mt-8">
        <h2 className="mb-3 font-heading text-xl text-white">{t("members")}</h2>
        {loading ? (
          <GuildMembersSkeleton count={members.length || 10} />
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <CharacterRow
                key={m.guid}
                character={m}
                href={realmHref(`/armory/${encodeURIComponent(m.name)}`)}
                rankName={m.rankName}
              />
            ))}
          </div>
        )}
        <div className="mt-4">
          <Pager page={page} pages={pages} onPage={setPage} />
        </div>
      </section>
    </div>
  );
}
