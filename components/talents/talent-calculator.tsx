"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Spinner } from "@heroui/spinner";
import clsx from "clsx";

import { TalentTree, talentState, useTalentTip } from "./talent-tree";

import { classIcon } from "@/components/character-identity";
import { CLASS_COLORS } from "@/lib/armory-constants";
import { zamimgIcon } from "@/components/game-tooltip";
import { lineColor } from "@/components/game-tooltip/store";
import { useRealm } from "@/lib/realm-context";
import {
  CLASS_IDS,
  MAX_LEVEL,
  buildTotal,
  canAdd,
  canRemove,
  decodeBuild,
  emptyBuild,
  encodeBuild,
  isValidBuild,
  levelForPoints,
  pointsAtLevel,
  pointsSummary,
  treePoints,
  type BuildPoints,
  type ClassKey,
  type ClassTalents,
} from "@/lib/talent-build";

/*
 * The talent calculator: a class's three trees from the realm's DBC (lib/talents.ts), the points of a level, the game's rules
 * (lib/talent-build.ts). The build lives in the address (?class=&build=&level=): copied, it opens the same trees for anyone. Phones show
 * one tree at a time (tabs) and a tapped talent in a panel with its buttons; wider screens the three side by side.
 */

export interface ClassOption {
  key: ClassKey;
  name: string;
}

type Selection = { tree: number; j: number } | null;

export function TalentCalculator({
  classes,
  initial,
  initialBuild,
  initialLevel,
}: {
  classes: ClassOption[];
  initial: ClassTalents;
  initialBuild: string | null;
  initialLevel: number;
}) {
  const t = useTranslations("talents");
  const locale = useLocale();
  const realm = useRealm().slug;
  const [cls, setCls] = useState(initial);
  // the address's build, an empty one when it breaks the rules
  const [points, setPoints] = useState<BuildPoints>(() => {
    const build = decodeBuild(initial, initialBuild);

    return isValidBuild(initial, build) ? build : emptyBuild(initial);
  });
  const [level, setLevel] = useState(() =>
    Math.max(initialLevel, levelForPoints(buildTotal(points))),
  );
  const [loading, setLoading] = useState<ClassKey | null>(null);
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<Selection>(null);
  const [copied, setCopied] = useState(false);
  const request = useRef(0);

  const available = pointsAtLevel(level);
  const total = buildTotal(points);
  const build = encodeBuild(points);

  // the build in the address, without a navigation (the page stays as it is)
  useEffect(() => {
    const url = new URL(window.location.href);

    url.searchParams.set("class", cls.key);
    if (build) url.searchParams.set("build", build);
    else url.searchParams.delete("build");
    if (level < MAX_LEVEL) url.searchParams.set("level", String(level));
    else url.searchParams.delete("level");
    window.history.replaceState(window.history.state, "", url);
  }, [cls.key, build, level]);

  const pickClass = async (key: ClassKey) => {
    if (key === cls.key) return;
    const id = ++request.current;

    setLoading(key);
    try {
      const r = await fetch(
        `/api/talents?realm=${realm}&class=${key}&locale=${encodeURIComponent(locale)}`,
      );

      if (!r.ok) throw new Error(String(r.status));
      const { talents } = (await r.json()) as { talents: ClassTalents };

      if (id !== request.current) return;
      setCls(talents);
      setPoints(emptyBuild(talents));
      setSelected(null);
      setTab(0);
    } catch {
      // the picker stays on the class shown
    } finally {
      if (id === request.current) setLoading(null);
    }
  };

  const change = (tree: number, j: number, delta: 1 | -1) =>
    setPoints((p) => {
      if (
        delta > 0
          ? !canAdd(cls, p, tree, j, available)
          : !canRemove(cls, p, tree, j)
      )
        return p;
      const next = p.map((x) => x.slice());

      next[tree][j] += delta;

      return next;
    });

  const resetTree = (tree: number) =>
    setPoints((p) => p.map((x, i) => (i === tree ? x.map(() => 0) : x)));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no clipboard (an insecure context): nothing to say
    }
  };

  const levels = useMemo(() => {
    const from = Math.max(10, levelForPoints(total));

    return Array.from(
      { length: MAX_LEVEL - from + 1 },
      (_, i) => MAX_LEVEL - i,
    );
  }, [total]);

  const color = CLASS_COLORS[CLASS_IDS[cls.key]] ?? "#ffffff";

  return (
    // room under the trees for a tapped talent's panel
    <div className={clsx("space-y-5", selected && "pb-72 lg:pb-0")}>
      {/* the classes; room around them for the chosen one, grown and glowing (a scrolling row clips what overflows it) */}
      <div className="-mx-4 -my-2 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-2">
        <div className="mx-auto flex w-max gap-2 sm:flex-wrap sm:justify-center">
          {classes.map((c) => (
            <button
              key={c.key}
              aria-label={c.name}
              aria-pressed={c.key === cls.key}
              className={clsx(
                "relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 transition-all sm:h-12 sm:w-12",
                c.key === cls.key
                  ? "scale-110 shadow-[0_0_14px_rgba(255,255,255,0.25)]"
                  : "border-white/10 opacity-60 hover:opacity-100",
              )}
              style={
                c.key === cls.key
                  ? { borderColor: CLASS_COLORS[CLASS_IDS[c.key]] }
                  : undefined
              }
              title={c.name}
              type="button"
              onClick={() => pickClass(c.key)}
            >
              {/* the game's square class icon filling the round (the round framed icons were cut at the top and the bottom) */}
              <img
                alt=""
                className="h-full w-full scale-[1.12] object-cover"
                src={classIcon(CLASS_IDS[c.key]) ?? ""}
              />
              {loading === c.key && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Spinner color="warning" size="sm" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* the build's summary and its tools */}
      <div className="glass flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-white/10 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-xl" style={{ color }}>
            {cls.name}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-mono text-white">
              {pointsSummary(points)}
            </span>
            {" · "}
            {t("pointsLeft", { count: available - total })}
            {total > 0 && (
              <>
                {" · "}
                {t("requiredLevel", { level: levelForPoints(total) })}
              </>
            )}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          {t("level")}
          <select
            className="rounded-md border border-white/15 bg-black/60 px-2 py-1 text-white"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-gray-200 transition-colors hover:border-wow-gold/50 hover:text-wow-gold disabled:opacity-40"
            disabled={!total}
            type="button"
            onClick={() => {
              setPoints(emptyBuild(cls));
              setSelected(null);
            }}
          >
            {t("reset")}
          </button>
          <button
            className="rounded-md border border-wow-gold/40 bg-wow-gold/10 px-3 py-1.5 text-sm text-wow-gold-light transition-colors hover:bg-wow-gold/20"
            type="button"
            onClick={copy}
          >
            {copied ? t("copied") : t("copyLink")}
          </button>
        </div>
      </div>

      <p className="hidden text-center text-xs text-gray-500 lg:block">
        {t("helpMouse")}
      </p>
      <p className="text-center text-xs text-gray-500 lg:hidden">
        {t("helpTouch")}
      </p>

      {/* phones: one tree at a time */}
      <div className="grid grid-cols-3 gap-1.5 lg:hidden">
        {cls.trees.map((tree, i) => (
          <button
            key={tree.id}
            className={clsx(
              "flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1.5 py-1.5 text-center transition-colors",
              tab === i
                ? "border-wow-gold/50 bg-wow-gold/10"
                : "border-white/10 bg-black/30",
            )}
            type="button"
            onClick={() => {
              setTab(i);
              setSelected(null);
            }}
          >
            {/* the icon and the points, the name under them (two lines at most: "Combat farouche") */}
            <span className="flex items-center gap-1.5">
              <img
                alt=""
                className="h-6 w-6 shrink-0 rounded"
                src={zamimgIcon(tree.icon, 18)}
              />
              <span className="font-mono text-xs text-white">
                {treePoints(points[i])}
              </span>
            </span>
            <span className="line-clamp-2 w-full break-words text-[11px] leading-tight text-gray-200">
              {tree.name}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {cls.trees.map((tree, i) => (
          <div
            key={tree.id}
            className={clsx(
              "mx-auto w-full max-w-[380px]",
              tab !== i && "hidden lg:block",
            )}
          >
            <TalentTree
              available={available}
              cls={cls}
              points={points}
              selected={selected?.tree === i ? selected.j : null}
              tree={i}
              onAdd={(j) => change(i, j, 1)}
              onRemove={(j) => change(i, j, -1)}
              onReset={() => resetTree(i)}
              onSelect={(j) => setSelected({ tree: i, j })}
            />
          </div>
        ))}
      </div>

      {selected && (
        <TalentSheet
          available={available}
          cls={cls}
          points={points}
          selection={selected}
          onAdd={() => change(selected.tree, selected.j, 1)}
          onClose={() => setSelected(null)}
          onRemove={() => change(selected.tree, selected.j, -1)}
        />
      )}
    </div>
  );
}

// a tapped talent (touch screens): its tooltip and its buttons, at the bottom of the screen
function TalentSheet({
  cls,
  points,
  selection,
  available,
  onAdd,
  onRemove,
  onClose,
}: {
  cls: ClassTalents;
  points: BuildPoints;
  selection: { tree: number; j: number };
  available: number;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("talents");
  const tip = useTalentTip()(cls, points, selection.tree, selection.j);
  const state = talentState(
    cls,
    points,
    selection.tree,
    selection.j,
    available,
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-wow-gold/30 bg-[#070c1f]/97 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] backdrop-blur">
      <div className="mx-auto max-w-lg">
        <div className="flex items-start gap-3">
          <img
            alt=""
            className="h-10 w-10 shrink-0 rounded-md border border-white/20"
            src={zamimgIcon(tip.icon, 56)}
          />
          <p className="min-w-0 flex-1 pt-1 font-semibold text-white">
            {tip.name}
          </p>
          <button
            aria-label={t("close")}
            className="-mr-1 px-2 text-2xl leading-none text-gray-400 hover:text-white"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="mt-2 max-h-[38vh] overflow-y-auto text-[13px] leading-snug">
          {tip.lines.map((l, i) => (
            <p
              key={i}
              className={clsx(
                "flex justify-between gap-4 whitespace-pre-line",
                !l.left && !l.right && "h-2",
              )}
              style={{ color: lineColor(l.color) }}
            >
              <span>{l.left}</span>
              {l.right && <span className="shrink-0">{l.right}</span>}
            </p>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="rounded-lg border border-white/15 py-2.5 text-lg text-gray-100 disabled:opacity-30"
            disabled={!canRemove(cls, points, selection.tree, selection.j)}
            type="button"
            onClick={onRemove}
          >
            −
          </button>
          <button
            className="rounded-lg border border-[#3fd64f]/50 bg-[#3fd64f]/10 py-2.5 text-lg text-[#7dff8a] disabled:opacity-30"
            disabled={
              state === "maxed" ||
              !canAdd(cls, points, selection.tree, selection.j, available)
            }
            type="button"
            onClick={onAdd}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
