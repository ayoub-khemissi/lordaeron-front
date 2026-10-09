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

import {
  QUALITY_COLORS,
  lineColor,
  loadTooltip,
  peekTooltip,
  zamimgIcon,
  type GameTooltipData,
} from "./store";

import { useRealm } from "@/lib/realm-context";

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

/* The tooltip box, at the pointer, kept inside the screen (right of the pointer, left of it near the edge). */
export function GameTooltipBox({
  tip,
  x,
  y,
}: {
  tip: GameTooltipData;
  x: number;
  y: number;
}) {
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

  return createPortal(
    <div
      ref={box}
      className="pointer-events-none fixed z-[70] w-max max-w-[320px] rounded-md border border-[#5b6890]/70 bg-[#070c1f]/95 px-3 py-2.5 text-left text-[13px] font-normal leading-[1.35] shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-sm"
      role="tooltip"
      style={pos}
    >
      <p
        className="text-[15px] font-semibold"
        style={{
          color:
            tip.quality !== undefined ? QUALITY_COLORS[tip.quality] : "#ffffff",
        }}
      >
        {tip.name}
      </p>
      {tip.lines
        // the first line repeats the name
        .filter((l, i) => i > 0 || l.left !== tip.name)
        .map((l, i) => (
          <p
            key={i}
            className={clsx(
              "flex justify-between gap-6 whitespace-pre-line",
              !l.left && !l.right && "h-2",
            )}
            style={{ color: lineColor(l.color) }}
          >
            <span>{l.left}</span>
            {l.right && <span className="shrink-0">{l.right}</span>}
          </p>
        ))}
    </div>,
    document.body,
  );
}

type Shown = { x: number; y: number; pinned: boolean };

/* Wraps anything: hovering (mouse) or tapping (touch) it shows the tooltip of `refId` ("item:123" / "spell:456"). */
export function GameTip({
  refId,
  children,
  className,
  realm,
  locale,
  stopPropagation = false,
}: {
  refId?: string;
  children: ReactNode;
  className?: string;
  realm?: string;
  locale?: string;
  // keep clicks and taps from reaching a clickable parent (a card opening a modal)
  stopPropagation?: boolean;
}) {
  const id = useId();
  const el = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const tip = useGameTooltip(refId, { enabled: !!shown, realm, locale });

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
      {shown && tip && <GameTooltipBox tip={tip} x={shown.x} y={shown.y} />}
    </span>
  );
}

/*
 * Drop-in replacement of components/wowhead-link.tsx (same props): the realm's own tooltip on the children. `spellId` instead of
 * `itemId` for a spell.
 */
export function GameTipLink({
  itemId,
  spellId,
  children,
  className,
  realm,
  stopPropagation,
}: {
  itemId?: number | null;
  spellId?: number | null;
  children: ReactNode;
  className?: string;
  realm?: string;
  stopPropagation?: boolean;
}) {
  const refId = itemId
    ? `item:${itemId}`
    : spellId
      ? `spell:${spellId}`
      : undefined;

  return (
    <GameTip
      className={className}
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
}: {
  itemId: number;
  realm?: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
  stopPropagation?: boolean;
}) {
  const ref = `item:${itemId}`;
  const tip = useGameTooltip(ref, { realm });
  const src = tip
    ? zamimgIcon(tip.icon, size)
    : (fallbackSrc ?? zamimgIcon("inv_misc_questionmark", size));

  return (
    <GameTip
      className={clsx("inline-flex shrink-0", className)}
      realm={realm}
      refId={ref}
      stopPropagation={stopPropagation}
    >
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
