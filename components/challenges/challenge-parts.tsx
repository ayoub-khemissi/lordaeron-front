"use client";

import type { ChallengeInfo, CharacterChallenge } from "@/types/challenges";

import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { GameTip } from "@/components/game-tooltip";
import { GameIcon } from "@/components/tools/tool-page";

/* The pieces of a WotLK+ character challenge (the Hall of Fame's Challenges tab, the armory's badge): its difficulty in stars, the
   authentic (x1) and Hardcore PvP marks, the lives left, and the challenge itself (its icon, its name, its stars). */

// its difficulty: 1 to 5 stars out of 5
export function ChallengeStars({
  stars,
  className,
}: {
  stars: number;
  className?: string;
}) {
  const t = useTranslations("challenges");
  const label = t("stars", { count: stars });

  return (
    <span
      aria-label={label}
      className={clsx("inline-flex shrink-0 text-xs leading-none", className)}
      role="img"
      title={label}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden
          className={i <= stars ? "text-wow-gold" : "text-white/15"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

const TAG =
  "inline-flex shrink-0 items-center rounded border px-1.5 py-px text-[10px] font-bold uppercase leading-4 tracking-wider";

// the marks of a challenger's run: its authentic version (experience at x1), its Hardcore PvP, the lives it has left
export function ChallengeTags({
  authentic,
  pvp,
  lives,
}: {
  authentic?: boolean;
  pvp?: boolean;
  lives?: number | null;
}) {
  const t = useTranslations("challenges");

  return (
    <>
      {authentic && (
        <span
          className={clsx(
            TAG,
            "border-wow-blue-ice/40 bg-wow-blue-ice/10 normal-case text-wow-blue-ice",
          )}
          title={t("authenticTitle")}
        >
          {t("authentic")}
        </span>
      )}
      {pvp && (
        <span
          className={clsx(TAG, "border-red-400/40 bg-red-500/15 text-red-300")}
          title={t("pvpTitle")}
        >
          {t("pvp")}
        </span>
      )}
      {lives != null && (
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-rose-300">
          <span aria-hidden>♥</span>
          {t("lives", { count: lives })}
        </span>
      )}
    </>
  );
}

// a challenge's icon (its completion's once done) with the tooltip of its aura (what it asks) or of its completion's (what it gave, Ayoub
// 20/10/2026: the icons alone said nothing)
export function ChallengeIcon({
  challenge,
  done = false,
  size = 36,
}: {
  challenge: ChallengeInfo;
  done?: boolean;
  size?: number;
}) {
  const spell = (done && challenge.doneAura) || challenge.aura;
  const icon = (
    <GameIcon
      icon={(done && challenge.doneIcon) || challenge.icon}
      size={size}
    />
  );

  return spell ? (
    <GameTip className="shrink-0" refId={`spell:${spell}`}>
      {icon}
    </GameTip>
  ) : (
    icon
  );
}

// the armory's badge (Ayoub, 17/10/2026): the challenge a character is in, or the one it completed (its completion's icon), linking to
// the Hall of Fame's Challenges tab
export function ChallengeBadge({
  challenge,
  href,
}: {
  challenge: CharacterChallenge;
  href: string;
}) {
  const t = useTranslations("challenges");
  const { challenge: info, completed } = challenge;

  return (
    <NextLink
      className="glass inline-flex max-w-full items-center gap-2.5 rounded-xl border border-wow-gold/25 px-3 py-2 text-left transition-colors hover:border-wow-gold/50"
      href={href}
      title={t("seeAll")}
    >
      <ChallengeIcon challenge={info} done={completed} size={32} />
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-wider text-gray-500">
          {completed ? t("armoryCompleted") : t("armoryInProgress")}
        </span>
        <span className="block truncate text-sm font-semibold leading-snug text-wow-gold-light">
          {info.name}
        </span>
      </span>
      <ChallengeStars stars={info.stars} />
      <ChallengeTags
        authentic={challenge.authentic}
        pvp={!completed && challenge.pvp}
      />
    </NextLink>
  );
}

// a challenge: its icon (its completion's once done), its name, its stars; `children`: the run's marks after the stars
export function ChallengeLabel({
  challenge,
  done = false,
  size = 36,
  children,
}: {
  challenge: ChallengeInfo;
  done?: boolean;
  size?: number;
  children?: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <ChallengeIcon challenge={challenge} done={done} size={size} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-snug text-wow-gold-light">
          {challenge.name}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <ChallengeStars stars={challenge.stars} />
          {children}
        </span>
      </span>
    </span>
  );
}
