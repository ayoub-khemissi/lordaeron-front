"use client";

import type { ReactNode } from "react";

import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { classColor, classIcon, raceIcon } from "@/lib/character-identity";

/* A character told apart at a glance in every tool (Ayoub, 13/10/2026): its race (by gender) and class icons, the class name in its class
   colour (the helpers: lib/character-identity.ts, also for the server pages). */

export { classColor, classIcon, raceIcon };

// the race and class icons side by side, their names as titles
export function RaceClassIcons({
  race,
  gender,
  cls,
  size = 22,
  className,
}: {
  race: number;
  gender?: number | null;
  cls: number;
  size?: number;
  className?: string;
}) {
  const tRace = useTranslations("rankings");
  const tClass = useTranslations("shop");
  const icons = [
    { src: raceIcon(race, gender ?? 0), title: tRace(`race_${race}`) },
    { src: classIcon(cls), title: tClass(`className_${cls}`) },
  ];

  return (
    <span
      className={clsx("inline-flex shrink-0 items-center gap-0.5", className)}
    >
      {icons.map(
        (icon) =>
          icon.src && (
            <img
              key={icon.src}
              alt={icon.title}
              className="rounded-[5px] border border-black/60 shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              height={size}
              loading="lazy"
              src={icon.src}
              style={{ width: size, height: size }}
              title={icon.title}
              width={size}
            />
          ),
      )}
    </span>
  );
}

// "Level 60 Draenei Paladin": the level, the race, the class in its colour; `separated`: "Level 60 · Draenei · Paladin", for one line
export function LevelRaceClass({
  level,
  race,
  cls,
  className,
  short = false,
  separated = false,
}: {
  level: number;
  race: number;
  cls: number;
  className?: string;
  // the number alone, without "Level"
  short?: boolean;
  separated?: boolean;
}) {
  const tArmory = useTranslations("armory");
  const tRace = useTranslations("rankings");
  const tClass = useTranslations("shop");
  const gap = separated ? " · " : " ";

  return (
    <span className={clsx("text-sm text-gray-400", className)}>
      {short ? level : `${tArmory("level")} ${level}`}
      {gap}
      {tRace(`race_${race}`)}
      {gap}
      <span style={{ color: classColor(cls) }}>
        {tClass(`className_${cls}`)}
      </span>
    </span>
  );
}

/* A character's portrait in the tools' lists (Ayoub, 18/10/2026: the rows laid out again): its race icon, its class icon set in the
   corner, and a dot for online (green) or offline (grey) when known */
export function CharacterPortrait({
  race,
  gender,
  cls,
  online,
  size = 40,
}: {
  race: number;
  gender?: number | null;
  cls: number;
  online?: boolean;
  size?: number;
}) {
  const tRace = useTranslations("rankings");
  const tClass = useTranslations("shop");
  const tArmory = useTranslations("armory");
  const race_ = raceIcon(race, gender ?? 0);
  const class_ = classIcon(cls);
  const badge = Math.round(size * 0.48);

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      {race_ && (
        <img
          alt={tRace(`race_${race}`)}
          className="h-full w-full rounded-lg border border-black/60 object-cover shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
          height={size}
          loading="lazy"
          src={race_}
          title={tRace(`race_${race}`)}
          width={size}
        />
      )}
      {class_ && (
        <img
          alt={tClass(`className_${cls}`)}
          className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#0b1020]"
          height={badge}
          loading="lazy"
          src={class_}
          style={{ width: badge, height: badge }}
          title={tClass(`className_${cls}`)}
          width={badge}
        />
      )}
      {online !== undefined && (
        <span
          aria-label={online ? tArmory("online") : tArmory("offline")}
          className={clsx(
            "absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0b1020]",
            online ? "bg-green-500" : "bg-gray-600",
          )}
          role="img"
          title={online ? tArmory("online") : tArmory("offline")}
        />
      )}
    </span>
  );
}

// a faction's crest (the game's honor icons), its name as title
export function FactionCrest({
  alliance,
  size = 22,
  className,
}: {
  alliance: boolean;
  size?: number;
  className?: string;
}) {
  const name = alliance ? "Alliance" : "Horde";

  return (
    <img
      alt={name}
      className={clsx("shrink-0 rounded-md border border-black/60", className)}
      height={size}
      loading="lazy"
      src={alliance ? "/img/factions/alliance.jpg" : "/img/factions/horde.jpg"}
      style={{ width: size, height: size }}
      title={name}
      width={size}
    />
  );
}

// a game master's character (shown to a site administrator only): its badge after the name
export function GmBadge() {
  const t = useTranslations("armory");

  return (
    <Chip
      className="h-5 shrink-0 text-[10px] font-bold uppercase"
      color="danger"
      size="sm"
      variant="flat"
    >
      {t("gm")}
    </Chip>
  );
}

/* A character's block, the same everywhere on the site (Ayoub, 20/10/2026): its portrait (race, class in the corner, the online dot
   when known), its name in its class colour with its badges (a GM chip), "Level · race · class" and, under it, what the place adds (a
   guild rank, a challenge). With `href` the whole block is the link to its armory page and hovering anywhere in it underlines the name;
   `stretch` spreads the link over its positioned row (a ranking: the whole row opens the page). In a row that is itself the link (a card),
   leave `href` out and give the row the class "group/char": hovering the row underlines the name. A deleted character has no page: no
   `href`. `compact`: the selectors' smaller lines. */
export function CharacterBlock({
  character,
  href,
  online,
  size = 36,
  badges,
  children,
  stretch = false,
  compact = false,
  className,
}: {
  character: {
    name: string;
    race: number;
    class: number;
    level: number;
    gender?: number | null;
  };
  href?: string;
  online?: boolean;
  size?: number;
  badges?: ReactNode;
  children?: ReactNode;
  stretch?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <CharacterPortrait
        cls={character.class}
        gender={character.gender}
        online={online}
        race={character.race}
        size={size}
      />
      <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={clsx(
              "truncate font-semibold decoration-1 underline-offset-2 transition-[filter] group-hover/char:underline group-hover/char:brightness-125",
              compact ? "text-sm" : "text-base",
            )}
            style={{ color: classColor(character.class) }}
          >
            {character.name}
          </span>
          {badges}
        </span>
        <LevelRaceClass
          separated
          className={clsx(
            "block truncate",
            compact ? "text-[11px]" : "mt-0.5 text-xs sm:text-sm",
          )}
          cls={character.class}
          level={character.level}
          race={character.race}
        />
        {children}
      </span>
    </>
  );
  const layout = clsx(
    "flex min-w-0 items-center",
    compact ? "gap-2.5" : "gap-3",
    className,
  );

  return href ? (
    <NextLink
      className={clsx(
        "group/char outline-none focus-visible:ring-2 focus-visible:ring-wow-gold/60",
        stretch
          ? "after:absolute after:inset-0 after:rounded-xl"
          : "rounded-lg",
        layout,
      )}
      href={href}
    >
      {body}
    </NextLink>
  ) : (
    <span className={layout}>{body}</span>
  );
}

/* A character in a list of names (an arena team's members, a realm first's earners): its race and class icons and its name in its class
   colour, the whole of it the link to its armory page (its name underlined on hover); a deleted character's without a link */
export function CharacterInline({
  character,
  href,
  badges,
  size = 16,
}: {
  character: {
    name: string;
    race: number;
    class: number;
    gender?: number | null;
  };
  href?: string;
  badges?: ReactNode;
  size?: number;
}) {
  const body = (
    <>
      <RaceClassIcons
        cls={character.class}
        gender={character.gender}
        race={character.race}
        size={size}
      />
      <span
        className="font-semibold decoration-1 underline-offset-2 group-hover/char:underline"
        style={{ color: classColor(character.class) }}
      >
        {character.name}
      </span>
      {badges}
    </>
  );

  return href ? (
    <NextLink
      className="group/char inline-flex items-center gap-1.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-wow-gold/60"
      href={href}
    >
      {body}
    </NextLink>
  ) : (
    <span className="inline-flex items-center gap-1.5">{body}</span>
  );
}

// a character on one line, no link (the shop's selector, a gift's recipient; Ayoub, 18/10/2026: icons and class colours, the race and
// class in the reader's language): the same block, smaller
export function CharacterLine({
  char,
  size = 30,
}: {
  char: {
    name: string;
    race: number;
    class: number;
    level: number;
    gender?: number | null;
  };
  size?: number;
}) {
  return <CharacterBlock compact character={char} size={size} />;
}
