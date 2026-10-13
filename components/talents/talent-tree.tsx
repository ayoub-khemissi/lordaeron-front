"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import {
  GameTooltipBox,
  zamimgIcon,
  type GameTooltipData,
} from "@/components/game-tooltip";
import {
  canAdd,
  tierOpen,
  treePoints,
  type BuildPoints,
  type ClassTalents,
  type TalentCell,
} from "@/lib/talent-build";

/*
 * One talent tree of the calculator (components/talents/talent-calculator.tsx), drawn like the game's: its client background, 4 columns
 * and 11 tiers, the prerequisites' arrows. A mouse adds a point with a click and takes one back with a right click (or shift + click),
 * hovering shows the talent's tooltip (its rank, the next one); a touch selects the talent (the calculator shows it with its buttons).
 * Everything is in units of a 100 x 80 cell (an svg of 400 x 880 scaled to the tree's width).
 */

const COLS = 4;
const TIERS = 11;
const CELL_W = 100;
const CELL_H = 80;
const ICON = 60;

const center = (t: TalentCell) => ({
  x: t.column * CELL_W + CELL_W / 2,
  y: t.tier * CELL_H + CELL_H / 2,
});

// the arrow from a prerequisite to its talent: down its column, sideways on its tier, or sideways then down
function arrowPath(from: TalentCell, to: TalentCell) {
  const a = center(from);
  const b = center(to);
  const h = ICON / 2;

  if (from.column === to.column)
    return {
      d: `M${a.x} ${a.y + h} V${b.y - h - 6}`,
      head: "down",
      end: { x: b.x, y: b.y - h },
    };
  const dir = to.column > from.column ? 1 : -1;

  if (from.tier === to.tier)
    return {
      d: `M${a.x + dir * h} ${a.y} H${b.x - dir * (h + 6)}`,
      head: dir > 0 ? "right" : "left",
      end: { x: b.x - dir * h, y: b.y },
    };

  return {
    d: `M${a.x + dir * h} ${a.y} H${b.x} V${b.y - h - 6}`,
    head: "down",
    end: { x: b.x, y: b.y - h },
  };
}

const HEADS: Record<string, (x: number, y: number) => string> = {
  down: (x, y) => `${x - 7},${y - 8} ${x + 7},${y - 8} ${x},${y}`,
  right: (x, y) => `${x - 8},${y - 7} ${x - 8},${y + 7} ${x},${y}`,
  left: (x, y) => `${x + 8},${y - 7} ${x + 8},${y + 7} ${x},${y}`,
};

export type TalentState = "maxed" | "partial" | "available" | "locked";

export function talentState(
  cls: ClassTalents,
  points: BuildPoints,
  tree: number,
  j: number,
  available: number,
): TalentState {
  const rank = points[tree][j];
  const max = cls.trees[tree].talents[j].ranks.length;

  if (rank >= max) return "maxed";
  if (rank > 0) return "partial";

  return canAdd(cls, points, tree, j, available) ? "available" : "locked";
}

// a talent's game tooltip: its rank, what the rank gives, the next rank, what it still needs
export function useTalentTip() {
  const t = useTranslations("talents");

  return (
    cls: ClassTalents,
    points: BuildPoints,
    tree: number,
    j: number,
  ): GameTooltipData => {
    const talent = cls.trees[tree].talents[j];
    const rank = points[tree][j];
    const max = talent.ranks.length;
    const lines: GameTooltipData["lines"] = [
      { left: t("rank", { rank, max }), color: "white" },
    ];
    const needs: string[] = [];

    if (!tierOpen(cls, points, tree, talent.tier))
      needs.push(
        t("needsTree", { points: talent.tier * 5, tree: cls.trees[tree].name }),
      );
    if (talent.prereq) {
      const pj = cls.trees[tree].talents.findIndex(
        (x) => x.id === talent.prereq!.talent,
      );
      const pre = cls.trees[tree].talents[pj];

      if (pre && points[tree][pj] < talent.prereq.rank)
        needs.push(
          t("needsTalent", { points: talent.prereq.rank, talent: pre.name }),
        );
    }
    for (const n of needs) lines.push({ left: n, color: "red" });
    if (rank > 0) lines.push(...talent.tips[rank - 1]);
    if (rank < max) {
      // the next rank: its description only (its "Passive", cost and cast lines are the current rank's)
      if (rank > 0)
        lines.push(
          { left: "" },
          { left: t("nextRank"), color: "white" },
          ...talent.tips[rank].filter((l) => l.color !== "white"),
        );
      else lines.push(...talent.tips[0]);
    }

    return { icon: talent.icon, name: talent.name, lines };
  };
}

export function TalentTree({
  cls,
  points,
  tree,
  available,
  selected,
  onAdd,
  onRemove,
  onSelect,
  onReset,
}: {
  cls: ClassTalents;
  points: BuildPoints;
  tree: number;
  available: number;
  selected: number | null;
  onAdd: (j: number) => void;
  onRemove: (j: number) => void;
  onSelect: (j: number) => void;
  onReset: () => void;
}) {
  const t = useTranslations("talents");
  const tip = useTalentTip();
  const data = cls.trees[tree];
  const pointer = useRef("mouse");
  const [hover, setHover] = useState<{
    j: number;
    x: number;
    y: number;
  } | null>(null);
  const byId = new Map(data.talents.map((x) => [x.id, x]));

  return (
    <div className="glass overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-black/40 px-3 py-2">
        <img
          alt=""
          className="h-8 w-8 rounded-md border border-wow-gold/40"
          height={32}
          src={zamimgIcon(data.icon, 36)}
          width={32}
        />
        <span className="min-w-0 flex-1 truncate font-heading text-wow-gold-light">
          {data.name}
        </span>
        <span className="rounded-md bg-black/50 px-2 py-0.5 font-mono text-sm text-white">
          {treePoints(points[tree])}
        </span>
      </div>
      <div
        className="relative w-full bg-cover bg-top"
        style={{
          aspectRatio: `${COLS * CELL_W} / ${TIERS * CELL_H}`,
          backgroundImage: data.background
            ? `linear-gradient(rgba(5,8,16,0.35), rgba(5,8,16,0.55)), url(${data.background})`
            : undefined,
        }}
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${COLS * CELL_W} ${TIERS * CELL_H}`}
        >
          {data.talents.map((talent, j) => {
            if (!talent.prereq) return null;
            const from = byId.get(talent.prereq.talent);

            if (!from) return null;
            const arrow = arrowPath(from, talent);
            const lit =
              points[tree][j] > 0 || canAdd(cls, points, tree, j, available);
            const color = lit ? "#f0c540" : "#7a7a7a";

            return (
              <g key={talent.id}>
                <path
                  d={arrow.d}
                  fill="none"
                  stroke="#000"
                  strokeOpacity={0.7}
                  strokeWidth={9}
                />
                <path d={arrow.d} fill="none" stroke={color} strokeWidth={5} />
                <polygon
                  fill={color}
                  points={HEADS[arrow.head](arrow.end.x, arrow.end.y)}
                  stroke="#000"
                  strokeWidth={1.5}
                />
              </g>
            );
          })}
        </svg>
        {data.talents.map((talent, j) => {
          const state = talentState(cls, points, tree, j, available);
          const rank = points[tree][j];

          return (
            <button
              key={talent.id}
              aria-label={`${talent.name} ${t("rank", { rank, max: talent.ranks.length })}`}
              className="absolute flex items-center justify-center"
              style={{
                left: `${(talent.column * CELL_W * 100) / (COLS * CELL_W)}%`,
                top: `${(talent.tier * CELL_H * 100) / (TIERS * CELL_H)}%`,
                width: `${100 / COLS}%`,
                height: `${100 / TIERS}%`,
              }}
              type="button"
              onClick={(e) => {
                if (pointer.current !== "mouse") onSelect(j);
                else if (e.shiftKey) onRemove(j);
                else onAdd(j);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (pointer.current === "mouse") onRemove(j);
              }}
              onPointerDown={(e) => {
                pointer.current = e.pointerType;
              }}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse")
                  setHover({ j, x: e.clientX, y: e.clientY });
              }}
              onPointerLeave={() => setHover(null)}
              onPointerMove={(e) => {
                if (e.pointerType === "mouse")
                  setHover({ j, x: e.clientX, y: e.clientY });
              }}
            >
              <span
                className={clsx(
                  "relative block rounded-[6px] border-2 transition-[filter,box-shadow]",
                  state === "maxed" &&
                    "border-[#f0c540] shadow-[0_0_10px_rgba(240,197,64,0.55)]",
                  (state === "partial" || state === "available") &&
                    "border-[#3fd64f]",
                  state === "locked" &&
                    "border-[#555] grayscale brightness-[0.55]",
                  selected === j &&
                    "ring-2 ring-wow-blue-ice ring-offset-2 ring-offset-black",
                )}
                style={{ width: `${(ICON * 100) / CELL_W}%`, aspectRatio: "1" }}
              >
                <img
                  alt=""
                  className="h-full w-full rounded-[4px]"
                  draggable={false}
                  loading="lazy"
                  src={zamimgIcon(talent.icon, 56)}
                />
                <span
                  className={clsx(
                    "absolute -bottom-2 -right-2 rounded-[4px] border border-black/80 bg-black/90 px-1 font-mono text-[10px] leading-[14px] sm:text-[11px]",
                    state === "maxed"
                      ? "text-[#f0c540]"
                      : state === "locked"
                        ? "text-gray-400"
                        : "text-[#3fd64f]",
                  )}
                >
                  {rank}/{talent.ranks.length}
                </span>
              </span>
            </button>
          );
        })}
        {hover && (
          <GameTooltipBox
            tip={tip(cls, points, tree, hover.j)}
            x={hover.x}
            y={hover.y}
          />
        )}
      </div>
      <TreeFooter canReset={treePoints(points[tree]) > 0} onReset={onReset} />
    </div>
  );
}

function TreeFooter({
  canReset,
  onReset,
}: {
  canReset: boolean;
  onReset: () => void;
}) {
  const t = useTranslations("talents");

  return (
    <div className="flex justify-end border-t border-white/10 bg-black/40 px-3 py-1.5">
      <button
        className="text-xs text-gray-400 transition-colors hover:text-wow-gold disabled:opacity-40"
        disabled={!canReset}
        type="button"
        onClick={onReset}
      >
        {t("resetTree")}
      </button>
    </div>
  );
}
