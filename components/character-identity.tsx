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

// "Level 60 Draenei Paladin": the level, the race, the class in its colour
export function LevelRaceClass({
  level,
  race,
  cls,
  className,
  short = false,
}: {
  level: number;
  race: number;
  cls: number;
  className?: string;
  // the number alone, without "Level"
  short?: boolean;
}) {
  const tArmory = useTranslations("armory");
  const tRace = useTranslations("rankings");
  const tClass = useTranslations("shop");

  return (
    <span className={clsx("text-sm text-gray-400", className)}>
      {short ? level : `${tArmory("level")} ${level}`} {tRace(`race_${race}`)}{" "}
      <span style={{ color: classColor(cls) }}>
        {tClass(`className_${cls}`)}
      </span>
    </span>
  );
}
