"use client";

import type {
  ChallengeBoard as ChallengeBoardData,
  ChallengeInfo,
  ChallengeList,
  ChallengeRun,
} from "@/types/challenges";
import type { ReactNode } from "react";

import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { ChallengeLabel, ChallengeTags } from "./challenge-parts";

import {
  LevelRaceClass,
  RaceClassIcons,
  classColor,
} from "@/components/character-identity";
import { RankState } from "@/components/rankings/ranked-row";
import { RankedRowsSkeleton } from "@/components/rankings/ranking-skeleton";
import { Day } from "@/components/tools/time";
import { useToolData } from "@/components/tools/use-tool-data";
import { useRealmHref } from "@/lib/realm-context";

type ListKey = "inProgress" | "completed" | "fallen";

const LISTS: { key: ListKey; id: string; empty: string; text: string }[] = [
  {
    key: "inProgress",
    id: "challenges-in-progress",
    empty: "emptyInProgress",
    text: "inProgressText",
  },
  {
    key: "completed",
    id: "challenges-completed",
    empty: "emptyCompleted",
    text: "completedText",
  },
  {
    key: "fallen",
    id: "challenges-fallen",
    empty: "emptyFallen",
    text: "fallenText",
  },
];

// the deaths whose sentence names the killer (a creature, a grey one, an elite, a player, a guard)
const NAMED_KILLER = [0, 1, 2, 3, 4];

// a challenger: its race and class, its name in its class colour (its armory page; a deleted character's name alone), its level
function Challenger({ run, online }: { run: ChallengeRun; online?: boolean }) {
  const tArmory = useTranslations("armory");
  const realmHref = useRealmHref();

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {online !== undefined && (
        <span
          className={clsx(
            "h-2 w-2 shrink-0 rounded-full",
            online ? "bg-green-500" : "bg-gray-600",
          )}
        />
      )}
      <RaceClassIcons cls={run.class} gender={run.gender} race={run.race} />
      <div className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {run.deleted ? (
            <span
              className="truncate text-base font-semibold"
              style={{ color: classColor(run.class) }}
            >
              {run.name}
            </span>
          ) : (
            <NextLink
              className="truncate text-base font-semibold transition-all hover:brightness-125 hover:underline"
              href={realmHref(`/armory/${encodeURIComponent(run.name)}`)}
              style={{ color: classColor(run.class) }}
            >
              {run.name}
            </NextLink>
          )}
          {run.gm && (
            <span className="rounded border border-red-400/40 bg-red-500/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-red-300">
              {tArmory("gm")}
            </span>
          )}
        </span>
        <LevelRaceClass
          className="block text-xs"
          cls={run.class}
          level={run.level}
          race={run.race}
        />
      </div>
    </div>
  );
}

// how a fallen challenger died: the sentence of its death (the killer's name in it), where, when
function Death({ run }: { run: ChallengeRun }) {
  const t = useTranslations("challenges");
  const type = run.causeType ?? 12;
  const named = NAMED_KILLER.includes(type) && !!run.cause;
  const gender = run.gender === 1 ? "female" : "male";

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
      <span className="text-red-300/90">
        {named
          ? t(`death_${type}`, { killer: run.cause!, gender })
          : t(`death_${type >= 5 && type <= 12 ? type : 12}`, { gender })}
      </span>
      {run.zone && <span className="text-gray-400">· {run.zone}</span>}
      {run.ended > 0 && (
        <span className="text-gray-500">
          · <Day at={run.ended} />
        </span>
      )}
    </p>
  );
}

function RunRow({
  list,
  run,
  challenge,
}: {
  list: ListKey;
  run: ChallengeRun;
  challenge: ChallengeInfo | undefined;
}) {
  return (
    <li
      className={clsx(
        "glass rounded-xl border px-3 py-3 sm:px-4",
        list === "fallen" ? "border-red-500/15" : "border-white/5",
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
        <Challenger
          online={list === "inProgress" ? !!run.online : undefined}
          run={run}
        />
        {challenge && (
          <div className="min-w-0 sm:w-[45%] sm:shrink-0">
            <ChallengeLabel challenge={challenge} done={list === "completed"}>
              <ChallengeTags
                authentic={run.authentic}
                lives={
                  list === "inProgress" && challenge.lives > 0
                    ? run.lives
                    : null
                }
                pvp={list !== "completed" && run.pvp}
              />
              {list === "completed" && run.ended > 0 && (
                <Day
                  at={run.ended}
                  className="text-[11px] text-gray-500 sm:hidden"
                />
              )}
            </ChallengeLabel>
          </div>
        )}
        {list === "completed" && run.ended > 0 && (
          <Day
            at={run.ended}
            className="hidden shrink-0 text-right text-xs text-gray-500 sm:block"
          />
        )}
      </div>
      {list === "fallen" && (
        <div className="mt-2 border-t border-white/5 pt-2">
          <Death run={run} />
        </div>
      )}
    </li>
  );
}

function Section({
  id,
  title,
  text,
  list,
  empty,
  children,
}: {
  id: string;
  title: string;
  text: string;
  list: ChallengeList;
  empty: string;
  children: ReactNode;
}) {
  const t = useTranslations("challenges");

  return (
    <section className="scroll-mt-20" id={id}>
      <div className="mb-3">
        <h2 className="flex flex-wrap items-baseline gap-x-3 font-heading text-xl text-white">
          {title}
          <span className="font-sans text-sm text-gray-500">
            {t("count", { count: list.total })}
          </span>
        </h2>
        <p className="text-sm text-gray-400">{text}</p>
      </div>
      {list.runs.length ? (
        <>
          <ol className="space-y-2">{children}</ol>
          {list.total > list.runs.length && (
            <p className="mt-2 text-center text-xs text-gray-500">
              {t("shownOf", { shown: list.runs.length, total: list.total })}
            </p>
          )}
        </>
      ) : (
        <RankState>{empty}</RankState>
      )}
    </section>
  );
}

/* The Hall of Fame's Challenges tab (app/api/hall-of-fame/challenges): the challenges in progress (highest level first), the completed
   ones and the Wall of the Fallen (newest first). Shown only on a realm whose challenges are open (lib/realms.ts RealmInfo.challenges). */
export function ChallengeBoard() {
  const t = useTranslations("challenges");
  const tRank = useTranslations("rankings");
  const { data, error } = useToolData<ChallengeBoardData>(
    "/api/hall-of-fame/challenges",
  );

  if (!data)
    return error ? (
      <RankState>{tRank("error")}</RankState>
    ) : (
      <RankedRowsSkeleton />
    );

  return (
    <div className="space-y-10">
      {/* the three lists, a tap away on a phone */}
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {LISTS.map((l) => (
          <a
            key={l.key}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 hover:border-white/25"
            href={`#${l.id}`}
          >
            {t(l.key)} · {data[l.key].total}
          </a>
        ))}
      </nav>
      {LISTS.map((l) => (
        <Section
          key={l.key}
          empty={t(l.empty)}
          id={l.id}
          list={data[l.key]}
          text={t(l.text)}
          title={t(l.key)}
        >
          {data[l.key].runs.map((run) => (
            <RunRow
              key={run.id}
              challenge={data.challenges[run.challenge]}
              list={l.key}
              run={run}
            />
          ))}
        </Section>
      ))}
    </div>
  );
}
