"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import {
  QUALITY_COLORS,
  lineColor,
  loadTooltip,
  peekTooltip,
  zamimgIcon,
  type GameTooltipData,
  type GameTooltipLine,
} from "./store";

import { useRealm } from "@/lib/realm-context";
import {
  TryOnBadge,
  useDressingRoom,
} from "@/components/shop/dressing-room/dressing-room";

/*
 * In-game tooltips of a realm's items and spells, from the site's own tooltip service (app/api/tooltip): the realm's database and
 * DBCs, so custom content shows like Blizzard's. Hover (mouse, after a short delay) or tap (touch) shows it; a tap elsewhere or a
 * scroll closes a tapped one. Works without a provider: the realm and the language are the page's (useRealm, next-intl);
 * <GameTooltipProvider> overrides them for a subtree.
 */

type Scope = { realm: string; locale: string };
const ScopeContext = createContext<Partial<Scope> | null>(null);

export function GameTooltipProvider({
  realm,
  locale,
  children,
}: {
  realm?: string;
  locale?: string;
  children: ReactNode;
}) {
  return (
    <ScopeContext.Provider value={{ realm, locale }}>
      {children}
    </ScopeContext.Provider>
  );
}

function useScope(realm?: string, locale?: string): Scope {
  const ctx = useContext(ScopeContext);
  const pageRealm = useRealm().slug;
  const pageLocale = useLocale();

  return {
    realm: realm ?? ctx?.realm ?? pageRealm,
    locale: locale ?? ctx?.locale ?? pageLocale,
  };
}

/* The tooltip data of `ref` ("item:123" / "spell:456"): undefined while loading (or when `enabled` is false), null when unknown. */
export function useGameTooltip(
  ref: string | undefined,
  options: { enabled?: boolean; realm?: string; locale?: string } = {},
): GameTooltipData | null | undefined {
  const { realm, locale } = useScope(options.realm, options.locale);
  const enabled = options.enabled ?? true;
  const key = ref ? `${realm}|${locale}|${ref}` : "";
  const [state, setState] = useState<{
    key: string;
    tip: GameTooltipData | null | undefined;
  }>({ key: "", tip: undefined });

  useEffect(() => {
    if (!ref || !enabled || peekTooltip(realm, locale, ref) !== undefined)
      return;
    let live = true;

    loadTooltip(realm, locale, ref).then(
      (tip) => live && setState({ key, tip }),
    );

    return () => {
      live = false;
    };
  }, [key, ref, enabled, realm, locale]);

  if (!ref) return undefined;

  return state.key === key ? state.tip : peekTooltip(realm, locale, ref);
}

// one tooltip at a time: opening one closes the others
const OPEN_EVENT = "game-tip-open";

const SHOW_DELAY_MS = 120;

// an achievement's points, on its shield
function PointsShield({ points }: { points: number }) {
  return (
    <span className="relative inline-flex h-[34px] w-[30px] shrink-0 items-center justify-center">
      <svg aria-hidden className="absolute inset-0" viewBox="0 0 30 34">
        <path
          d="M15 1.5 28 5.5V15c0 9-6 15-13 17.5C8 30 2 24 2 15V5.5Z"
          fill="#3d2c0b"
          stroke="#e8b923"
          strokeWidth="2"
        />
      </svg>
      <span className="relative -mt-0.5 text-[12px] font-bold text-[#ffd100]">
        {points}
      </span>
    </span>
  );
}

/* An achievement's criteria: completed (the earner's, a guild's), each one checked and its progress bar full; else a plain list. Many
   short ones in two columns, as in game. */
function Criteria({
  list,
  completed,
}: {
  list: GameTooltipData["lines"];
  completed?: boolean;
}) {
  // a progress bar alone (no text) shows only with a known progress
  const shown = list.filter((c) => c.left || (completed && c.criterion?.max));

  if (!shown.length) return null;
  const columns = shown.length > 4 && shown.every((c) => !c.criterion?.max);

  return (
    <ul
      className={clsx(
        "mt-2 grid gap-x-4 gap-y-0.5 text-[12px] leading-snug",
        columns && "grid-cols-2",
      )}
    >
      {shown.map((c, i) => {
        const max = c.criterion?.max;

        return (
          <li key={i} style={{ color: completed ? "#ffffff" : "#b4b4b4" }}>
            {c.left && (
              <span className="flex items-start gap-1.5">
                <span
                  aria-hidden
                  className={completed ? "text-[#1eff00]" : "text-gray-500"}
                >
                  {completed ? "✓" : "•"}
                </span>
                <span>{c.left}</span>
              </span>
            )}
            {completed && max && (
              <span className="relative mt-0.5 block h-[15px] overflow-hidden rounded-sm border border-black/70 bg-[#13240c]">
                <span className="absolute inset-0 bg-[#2a7d1a]" />
                <span className="relative block text-center text-[10px] leading-[13px] text-white">
                  {max} / {max}
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* The tooltip box, at the pointer, kept inside the screen (right of the pointer, left of it near the edge). An achievement's (its
   points given) shows its icon, its shield and its criteria; `completed` when the one it is shown for earned it. */
export function GameTooltipBox({
  tip,
  x,
  y,
  completed,
  tryHint = false,
}: {
  tip: GameTooltipData;
  x: number;
  y: number;
  completed?: boolean;
  // the item can be tried on in the site's dressing room: the way told (Ctrl + click), not on a touch screen (its icon's magnifier there)
  tryHint?: boolean;
}) {
  const tShop = useTranslations("shop");
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useLayoutEffect(() => {
    const el = box.current;

    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    let left = x + 18;
    let top = y + 18;

    if (left + width > window.innerWidth - 8)
      left = Math.max(8, x - width - 18);
    if (top + height > window.innerHeight - 8)
      top = Math.max(8, window.innerHeight - height - 8);
    setPos({ left, top });
  }, [x, y, tip]);

  const achievement = tip.points !== undefined;
  // the first line repeats the name; an achievement's criteria go together
  const blocks: (GameTooltipLine | GameTooltipLine[])[] = [];

  for (const l of tip.lines.filter((l, i) => i > 0 || l.left !== tip.name)) {
    const last = blocks[blocks.length - 1];

    if (!l.criterion) blocks.push(l);
    else if (Array.isArray(last)) last.push(l);
    else blocks.push([l]);
  }

  return createPortal(
    <div
      ref={box}
      className={clsx(
        "pointer-events-none fixed z-[70] w-max rounded-md border border-[#5b6890]/70 bg-[#070c1f]/95 px-3 py-2.5 text-left text-[13px] font-normal leading-[1.35] shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-sm",
        achievement ? "max-w-[min(400px,calc(100vw-16px))]" : "max-w-[320px]",
      )}
      role="tooltip"
      style={pos}
    >
      {achievement ? (
        <div className="mb-1 flex items-start gap-2.5">
          <img
            alt=""
            className="h-9 w-9 shrink-0 rounded-[4px] border border-[#5b6890]/70"
            height={36}
            src={zamimgIcon(tip.icon, 36)}
            width={36}
          />
          <p className="min-w-0 flex-1 self-center text-[15px] font-semibold text-white">
            {tip.name}
          </p>
          {!!tip.points && <PointsShield points={tip.points} />}
        </div>
      ) : (
        <p
          className="text-[15px] font-semibold"
          style={{
            color:
              tip.quality !== undefined
                ? QUALITY_COLORS[tip.quality]
                : "#ffffff",
          }}
        >
          {tip.name}
        </p>
      )}
      {blocks.map((l, i) =>
        Array.isArray(l) ? (
          <Criteria key={i} completed={completed} list={l} />
        ) : (
          <p
            key={i}
            className={clsx(
              "flex justify-between gap-6 whitespace-pre-line",
              !l.left && !l.right && "h-2",
            )}
            style={{ color: lineColor(l.color) }}
          >
            <span>
              {l.icon && (
                <img
                  alt=""
                  className="mr-1.5 inline-block h-[14px] w-[14px] -translate-y-px rounded-[2px] align-middle"
                  height={14}
                  src={zamimgIcon(l.icon, 18)}
                  width={14}
                />
              )}
              {l.left}
            </span>
            {l.right && <span className="shrink-0">{l.right}</span>}
          </p>
        ),
      )}
      {tryHint && (
        <p className="mt-1.5 border-t border-white/10 pt-1.5 text-[11px] text-wow-gold-light/80 [@media(hover:none)]:hidden">
          {tShop("tryHint")}
        </p>
      )}
    </div>,
    document.body,
  );
}

type Shown = { x: number; y: number; pinned: boolean };

/* Wraps anything: hovering (mouse) or tapping (touch) it shows the tooltip of `refId` ("item:123" / "spell:456" / "achievement:789"). */
export function GameTip({
  refId,
  data,
  children,
  className,
  realm,
  locale,
  stopPropagation = false,
  completed,
}: {
  refId?: string;
  // the tooltip itself, already known (the armory's character items): no request
  data?: GameTooltipData;
  children: ReactNode;
  className?: string;
  realm?: string;
  locale?: string;
  // keep clicks and taps from reaching a clickable parent (a card opening a modal)
  stopPropagation?: boolean;
  // an achievement earned by the one it is shown for: its criteria checked
  completed?: boolean;
}) {
  const id = useId();
  const el = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const fetched = useGameTooltip(data ? undefined : refId, {
    enabled: !!shown,
    realm,
    locale,
  });
  const tip = data ?? fetched;
  // the site's dressing room: Ctrl / Cmd + click on an item tries it on (Ayoub, 18/10/2026: wherever an item is shown)
  const room = useDressingRoom();
  const entry = refId?.startsWith("item:") ? Number(refId.slice(5)) : 0;

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const open = (s: Shown) => {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    setShown(s);
  };

  // another tooltip opened; a tap elsewhere or a scroll closes a tapped one
  useEffect(() => {
    const other = (e: Event) => {
      if ((e as CustomEvent).detail !== id) setShown(null);
    };

    window.addEventListener(OPEN_EVENT, other);

    return () => {
      window.removeEventListener(OPEN_EVENT, other);
      clearTimer();
    };
  }, [id]);
  useEffect(() => {
    if (!shown?.pinned) return;
    const close = () => setShown(null);
    const tap = (e: PointerEvent) => {
      if (!el.current?.contains(e.target as Node)) close();
    };

    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("pointerdown", tap);

    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("pointerdown", tap);
    };
  }, [shown?.pinned]);

  // a native listener: React's own click reaches a clickable parent otherwise
  useEffect(() => {
    const node = el.current;

    if (!stopPropagation || !node) return;
    const stop = (e: Event) => e.stopPropagation();

    node.addEventListener("click", stop);

    return () => node.removeEventListener("click", stop);
  }, [stopPropagation, refId]);

  if (!refId) return <>{children}</>;

  return (
    <span
      ref={el}
      className={clsx("cursor-help", className)}
      data-game-tip={refId}
      onClickCapture={(e) => {
        if (!room || !entry || !(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        e.stopPropagation();
        setShown(null);
        room.tryEntry(entry);
      }}
      onPointerDown={(e) => {
        if (stopPropagation) e.stopPropagation();
        if (e.pointerType === "mouse") return;
        if (shown?.pinned) setShown(null);
        else open({ x: e.clientX, y: e.clientY, pinned: true });
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        const { clientX: x, clientY: y } = e;

        clearTimer();
        timer.current = setTimeout(
          () => open({ x, y, pinned: false }),
          SHOW_DELAY_MS,
        );
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimer();
        setShown((s) => (s?.pinned ? s : null));
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const { clientX: x, clientY: y } = e;

        setShown((s) => (s && !s.pinned ? { x, y, pinned: false } : s));
      }}
    >
      {children}
      {shown && tip && (
        <GameTooltipBox
          completed={completed}
          tip={tip}
          tryHint={!!room && !!tip.tryOn}
          x={shown.x}
          y={shown.y}
        />
      )}
    </span>
  );
}

/*
 * Drop-in replacement of components/wowhead-link.tsx (same props): the realm's own tooltip on the children. `spellId` instead of
 * `itemId` for a spell, `achievementId` for an achievement (`completed` when the one it is shown for earned it).
 */
export function GameTipLink({
  itemId,
  spellId,
  achievementId,
  completed,
  children,
  className,
  realm,
  stopPropagation,
}: {
  itemId?: number | null;
  spellId?: number | null;
  achievementId?: number | null;
  completed?: boolean;
  children: ReactNode;
  className?: string;
  realm?: string;
  stopPropagation?: boolean;
}) {
  const refId = itemId
    ? `item:${itemId}`
    : spellId
      ? `spell:${spellId}`
      : achievementId
        ? `achievement:${achievementId}`
        : undefined;

  return (
    <GameTip
      className={className}
      completed={completed}
      realm={realm}
      refId={refId}
      stopPropagation={stopPropagation}
    >
      {children}
    </GameTip>
  );
}

/*
 * An item's icon (wow.zamimg.com, the icon of the realm's own data) with its tooltip, framed in its quality color. `fallbackSrc`: the
 * image shown until the realm's data arrives (or when the realm does not know the item).
 */
export function WowItemIcon({
  itemId,
  realm,
  size = 36,
  className,
  fallbackSrc,
  stopPropagation,
  tip: given,
}: {
  itemId: number;
  realm?: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
  stopPropagation?: boolean;
  // the tooltip, already known (a character's own item: its enchantments, gems...): shown instead of the item's generic one
  tip?: GameTooltipData;
}) {
  const ref = `item:${itemId}`;
  const fetched = useGameTooltip(given ? undefined : ref, { realm });
  const tip = given ?? fetched;
  const room = useDressingRoom();
  const tShop = useTranslations("shop");
  const src = tip
    ? zamimgIcon(tip.icon, size)
    : (fallbackSrc ?? zamimgIcon("inv_misc_questionmark", size));

  return (
    <GameTip
      className={clsx("group/try relative inline-flex shrink-0", className)}
      data={given}
      realm={realm}
      refId={ref}
      stopPropagation={stopPropagation}
    >
      {/* the dressing room's magnifier, for an item it shows */}
      {room && tip?.tryOn && (
        <TryOnBadge
          label={tShop("tryOn")}
          onPress={() => room.tryEntry(itemId)}
        />
      )}
      {}
      <img
        alt={tip?.name ?? ""}
        className="rounded-[4px] border"
        height={size}
        src={src}
        style={{
          borderColor:
            tip?.quality !== undefined
              ? QUALITY_COLORS[tip.quality]
              : "rgba(91,104,144,0.7)",
          width: size,
          height: size,
        }}
        width={size}
      />
    </GameTip>
  );
}
