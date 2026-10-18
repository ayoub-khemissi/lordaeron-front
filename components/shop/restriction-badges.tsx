"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";

import {
  FactionCrest,
  classColor,
  classIcon,
  raceIcon,
} from "@/components/character-identity";

/* The shop's restrictions drawn with the game's icons (Ayoub, 18/10/2026: "Class restriction: Priest, Mage, Warlock" ran out of its chip):
   the classes in their colour, the races, the faction's crest. In a window, the icon and the name, one row per kind; on a card, where room
   is short, the icons alone (their names as titles). */

type Faction = "alliance" | "horde" | "both";

function Icon({
  src,
  title,
  size,
  className,
}: {
  src: string | null;
  title: string;
  size: number;
  className?: string;
}) {
  if (!src) return null;

  return (
    <img
      alt={title}
      className={clsx(
        "shrink-0 rounded-[4px] border border-black/60 shadow-[0_1px_3px_rgba(0,0,0,0.6)]",
        className,
      )}
      height={size}
      loading="lazy"
      src={src}
      style={{ width: size, height: size }}
      title={title}
      width={size}
    />
  );
}

// a card's restrictions: the faction's crest, then the classes' and races' icons, in one wrapping row
export function RestrictionIcons({
  classIds,
  raceIds,
  faction = "both",
  size = 18,
  className,
}: {
  classIds?: number[] | null;
  raceIds?: number[] | null;
  faction?: Faction;
  size?: number;
  className?: string;
}) {
  const tClass = useTranslations("shop");
  const tRace = useTranslations("rankings");

  if (!classIds?.length && !raceIds?.length && faction === "both") return null;

  return (
    <span
      className={clsx("inline-flex flex-wrap items-center gap-1", className)}
    >
      {faction !== "both" && (
        <FactionCrest alliance={faction === "alliance"} size={size} />
      )}
      {raceIds?.map((id) => (
        <Icon
          key={`r${id}`}
          size={size}
          src={raceIcon(id, 0)}
          title={tRace(`race_${id}`)}
        />
      ))}
      {classIds?.map((id) => (
        <Icon
          key={`c${id}`}
          size={size}
          src={classIcon(id)}
          title={tClass(`className_${id}`)}
        />
      ))}
    </span>
  );
}

// a window's restrictions: a row per kind (its label, then each entry's icon and name), wrapping on a phone
export function RestrictionList({
  classIds,
  raceIds,
  faction = "both",
}: {
  classIds?: number[] | null;
  raceIds?: number[] | null;
  faction?: Faction;
}) {
  const t = useTranslations("shop");
  const tRace = useTranslations("rankings");
  const tHome = useTranslations("home");

  if (!classIds?.length && !raceIds?.length && faction === "both") return null;
  const pill =
    "inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-black/30 py-0.5 pl-0.5 pr-2 text-xs font-medium";

  return (
    <div className="rounded-lg bg-[#161b22] p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-gray-400">
        {t("restrictions")}
      </p>
      <dl className="space-y-2.5">
        {faction !== "both" && (
          <Row label={t("factionLabel")}>
            <span
              className={clsx(
                pill,
                faction === "alliance" ? "text-blue-300" : "text-red-300",
              )}
            >
              <FactionCrest alliance={faction === "alliance"} size={20} />
              {faction === "alliance" ? tHome("alliance") : tHome("horde")}
            </span>
          </Row>
        )}
        {!!raceIds?.length && (
          <Row label={t("racesLabel")}>
            {raceIds.map((id) => (
              <span key={id} className={clsx(pill, "text-gray-200")}>
                <Icon
                  size={20}
                  src={raceIcon(id, 0)}
                  title={tRace(`race_${id}`)}
                />
                {tRace(`race_${id}`)}
              </span>
            ))}
          </Row>
        )}
        {!!classIds?.length && (
          <Row label={t("classesLabel")}>
            {classIds.map((id) => (
              <span key={id} className={pill} style={{ color: classColor(id) }}>
                <Icon
                  size={20}
                  src={classIcon(id)}
                  title={t(`className_${id}`)}
                />
                {t(`className_${id}`)}
              </span>
            ))}
          </Row>
        )}
      </dl>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
      <dt className="shrink-0 pt-1 text-[11px] uppercase tracking-wider text-gray-500 sm:w-16">
        {label}
      </dt>
      <dd className="flex min-w-0 flex-wrap gap-1.5">{children}</dd>
    </div>
  );
}
