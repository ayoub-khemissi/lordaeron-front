"use client";

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

// a character on one line (the shop's selector, a gift's recipient; Ayoub, 18/10/2026: icons and class colours, the race and class in the
// reader's language): its
// portrait (race, class in the corner), its name in its class colour, "Level · race · class"
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
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <CharacterPortrait
        cls={char.class}
        gender={char.gender}
        race={char.race}
        size={size}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className="truncate text-sm font-semibold"
          style={{ color: classColor(char.class) }}
        >
          {char.name}
        </span>
        <LevelRaceClass
          separated
          className="truncate text-[11px]"
          cls={char.class}
          level={char.level}
          race={char.race}
        />
      </span>
    </span>
  );
}
