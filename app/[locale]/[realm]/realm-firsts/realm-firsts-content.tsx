"use client";

import type {
  RealmFirst,
  RealmFirstGroup,
  RealmFirsts,
} from "@/lib/queries/realm-firsts";

import { useState } from "react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";

import { RealmFirstsSkeleton } from "./realm-firsts-skeleton";

import { GameTipLink } from "@/components/game-tooltip";
import { Day } from "@/components/tools/time";
import { GameIcon, ToolError } from "@/components/tools/tool-page";
import { useToolData } from "@/components/tools/use-tool-data";
import { RaceClassIcons, classColor } from "@/components/character-identity";
import { useRealmHref } from "@/lib/realm-context";

const GROUPS: RealmFirstGroup[] = [
  "level",
  "classes",
  "races",
  "bosses",
  "professions",
  "pvp",
  "feats",
];
// the names shown of a group realm first (a raid): the others counted
const SHOWN = 5;

function Earners({ first }: { first: RealmFirst }) {
  const t = useTranslations("realmFirsts");
  const realmHref = useRealmHref();
  const [all, setAll] = useState(false);
  const shown = all ? first.earners : first.earners.slice(0, SHOWN);

  return (
    <span className="block text-sm leading-relaxed">
      {shown.map((e, i) => (
        <span key={e.guid} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-gray-600">, </span>}
          <RaceClassIcons
            cls={e.class}
            gender={e.gender}
            race={e.race}
            size={16}
          />
          {e.deleted ? (
            <span style={{ color: classColor(e.class) }}>{e.name}</span>
          ) : (
            <NextLink
              className="font-semibold hover:underline"
              href={realmHref(`/armory/${encodeURIComponent(e.name)}`)}
              style={{ color: classColor(e.class) }}
            >
              {e.name}
            </NextLink>
          )}
          {e.gm && (
            <span className="ml-1 rounded border border-red-400/40 bg-red-500/15 px-1 text-[9px] font-bold uppercase text-red-300">
              GM
            </span>
          )}
          {first.earners.length === 1 && e.guild && (
            <span className="text-gray-400"> &lt;{e.guild}&gt;</span>
          )}
        </span>
      ))}
      {!all && first.earners.length > SHOWN && (
        <button
          className="ml-1 text-xs text-wow-gold/80 hover:text-wow-gold"
          type="button"
          onClick={() => setAll(true)}
        >
          {t("more", { n: first.earners.length - SHOWN })}
        </button>
      )}
    </span>
  );
}

function FirstCard({ first }: { first: RealmFirst }) {
  const t = useTranslations("realmFirsts");
  const earned = first.date !== null;
  // a level 80 first of a class or a race: a compact tile, its name alone
  const compact = !!first.label;

  return (
    <li
      className={`glass flex rounded-xl border ${compact ? "gap-2 p-2.5" : "gap-3 p-3"} ${earned ? "border-wow-gold/25" : "border-white/5"}`}
    >
      {/* the achievement's game tooltip (its criteria, its reward) on its icon and its name */}
      <GameTipLink
        achievementId={first.id}
        className="flex shrink-0 self-start"
        completed={earned}
      >
        <GameIcon dim={!earned} icon={first.icon} size={compact ? 32 : 40} />
      </GameTipLink>
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold leading-snug ${compact ? "truncate text-sm" : ""} ${earned ? "text-wow-gold-light" : "text-gray-300"}`}
        >
          <GameTipLink achievementId={first.id} completed={earned}>
            {first.label ?? first.title}
          </GameTipLink>
        </p>
        {earned ? (
          <>
            <Earners first={first} />
            <Day at={first.date!} className="block text-[11px] text-gray-500" />
          </>
        ) : (
          <p className="truncate text-xs text-gray-500">{t("notYet")}</p>
        )}
      </div>
    </li>
  );
}

/* The realm's realm firsts (app/api/realm-firsts): who earned each and when, by kind; on a progressive realm, the level 80 firsts of a
   race and a class the experience bonuses wait for. */
export function RealmFirstsContent() {
  const t = useTranslations("realmFirsts");
  const tt = useTranslations("tools");
  const [open, setOpen] = useState(false);
  const { data, error } = useToolData<RealmFirsts>("/api/realm-firsts");

  if (!data)
    return error ? (
      <ToolError message={tt("error")} />
    ) : (
      <RealmFirstsSkeleton />
    );
  const earned = data.firsts.filter((f) => f.date !== null).length;
  const groups = GROUPS.map((g) => ({
    group: g,
    firsts: data.firsts.filter(
      (f) => f.group === g && (!open || f.date === null),
    ),
  })).filter((g) => g.firsts.length);
  const unlocks = data.unlocks;

  return (
    <div className="space-y-8">
      {unlocks && (
        <section className="glass rounded-2xl border border-wow-blue-ice/30 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-xl text-wow-blue-ice">
              {t("unlocksTitle", { done: unlocks.done, total: unlocks.total })}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-wow-blue-ice/60 to-wow-blue-ice"
              style={{
                width: `${Math.round((unlocks.done / unlocks.total) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {unlocks.done >= unlocks.total
              ? t("unlocksDone")
              : t("unlocksText")}
          </p>
        </section>
      )}

      {/* the kinds, and the still-open ones alone */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition ${
            open
              ? "border-wow-gold/70 bg-wow-gold/15 text-wow-gold-light"
              : "border-white/10 bg-white/5 text-gray-300"
          }`}
          type="button"
          onClick={() => setOpen(!open)}
        >
          {t("openOnly")}
        </button>
        {groups.map((g) => (
          <a
            key={g.group}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 hover:border-white/25"
            href={`#${g.group}`}
          >
            {t(`groups.${g.group}`)}
          </a>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400">
        {t("summary", { earned, total: data.firsts.length })}
      </p>

      {groups.map((g) => (
        <section key={g.group} className="scroll-mt-16" id={g.group}>
          <h2 className="mb-3 font-heading text-xl text-white">
            {t(`groups.${g.group}`)}
          </h2>
          <ul
            className={`grid gap-2 ${
              g.group === "classes" || g.group === "races"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
                : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {g.firsts.map((f) => (
              <FirstCard key={f.id} first={f} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
