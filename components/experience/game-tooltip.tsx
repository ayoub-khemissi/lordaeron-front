"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import clsx from "clsx";

/* In-game tooltips of the realm's own items and spells (Wowhead does not know them).
   Data: public/data/experience-tooltips.json, written by the generator's tools/site-tooltips.js. */

export type TipLine = {
  left: string;
  right?: string;
  color?: string;
};
type TipText = { name: string; lines: TipLine[] };
export type TipEntry = {
  icon: string;
  quality?: number;
  fr: TipText;
  en: TipText;
};
type TipData = Record<string, TipEntry>;

const QUALITY = [
  "#9d9d9d",
  "#ffffff",
  "#1eff00",
  "#0070dd",
  "#a335ee",
  "#ff8000",
  "#e6cc80",
  "#e6cc80",
];
const COLOR: Record<string, string> = {
  white: "#ffffff",
  gray: "#9d9d9d",
  green: "#1eff00",
  yellow: "#ffd100",
  gold: "#ffd100",
  red: "#ff2020",
  blue: "#71d5ff",
};

const colorOf = (c?: string) =>
  c
    ? ((c.startsWith("q") ? QUALITY[Number(c.slice(1))] : COLOR[c]) ??
      "#ffffff")
    : "#ffffff";

let cache: Promise<TipData> | null = null;
const loadTips = () => {
  cache ??= fetch("/data/experience-tooltips.json")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));

  return cache;
};

type Shown = { id: string; x: number; y: number; pinned: boolean };
const TipContext = createContext<{
  lang: "fr" | "en";
  show: (s: Shown) => void;
  hide: (id: string) => void;
} | null>(null);

export function TooltipProvider({
  lang,
  children,
}: {
  lang: "fr" | "en";
  children: ReactNode;
}) {
  const [data, setData] = useState<TipData>({});
  const [shown, setShown] = useState<Shown | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useEffect(() => {
    // after the first paint: the page never waits for the tooltips
    const id = setTimeout(() => loadTips().then(setData), 1500);

    return () => clearTimeout(id);
  }, []);

  const show = useCallback((s: Shown) => {
    loadTips().then(setData);
    setShown(s);
  }, []);
  const hide = useCallback(
    (id: string) => setShown((s) => (s && s.id === id && !s.pinned ? null : s)),
    [],
  );

  // a tap elsewhere closes a pinned (touch) tooltip; scrolling closes any
  useEffect(() => {
    if (!shown) return;
    const close = () => setShown(null);
    const tap = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-tip]")) close();
    };

    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("pointerdown", tap);

    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("pointerdown", tap);
    };
  }, [shown]);

  // keep the box inside the screen, right of the pointer (left of it near the edge)
  useEffect(() => {
    const el = box.current;

    if (!shown || !el) return;
    const { width, height } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = shown.x + 18;
    let top = shown.y + 18;

    if (left + width > vw - 8) left = Math.max(8, shown.x - width - 18);
    if (top + height > vh - 8) top = Math.max(8, vh - height - 8);
    setPos({ left, top });
  }, [shown, data]);

  const value = useMemo(() => ({ lang, show, hide }), [lang, show, hide]);
  const entry = shown ? data[shown.id] : undefined;
  const text = entry?.[lang] ?? entry?.en;

  return (
    <TipContext.Provider value={value}>
      {children}
      {shown && entry && text && (
        <div
          ref={box}
          className="pointer-events-none fixed z-[70] w-max max-w-[320px] rounded-md border border-[#5b6890]/70 bg-[#070c1f]/95 px-3 py-2.5 text-[13px] leading-[1.35] shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-sm"
          role="tooltip"
          style={pos}
        >
          <div className="flex items-start gap-2.5">
            <div className="min-w-0 flex-1">
              <p
                className="text-[15px] font-semibold"
                style={{
                  color:
                    entry.quality !== undefined
                      ? QUALITY[entry.quality]
                      : "#ffffff",
                }}
              >
                {text.name}
              </p>
              {text.lines
                // the data repeats the name as its first line
                .filter((l, i) => i > 0 || l.left !== text.name)
                .map((l, i) => (
                  <p
                    key={i}
                    className={clsx(
                      "flex justify-between gap-6",
                      !l.left && !l.right && "h-2",
                    )}
                    style={{ color: colorOf(l.color) }}
                  >
                    <span>{l.left}</span>
                    {l.right && <span className="shrink-0">{l.right}</span>}
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </TipContext.Provider>
  );
}

/* Wraps anything: hover (mouse) or tap (touch) shows the tooltip of `id` ("item:123" / "spell:456"). */
export function Tip({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TipContext);

  if (!id || !ctx) return <>{children}</>;

  return (
    <span
      data-tip
      className={clsx("cursor-help", className)}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse")
          ctx.show({ id, x: e.clientX, y: e.clientY, pinned: true });
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse")
          ctx.show({ id, x: e.clientX, y: e.clientY, pinned: false });
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") ctx.hide(id);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse")
          ctx.show({ id, x: e.clientX, y: e.clientY, pinned: false });
      }}
    >
      {children}
    </span>
  );
}

/* The tooltip text itself, for places that print a spell's effect (class spells on phones) */
export function useTipText(id?: string) {
  const ctx = useContext(TipContext);
  const [entry, setEntry] = useState<TipEntry | undefined>();

  useEffect(() => {
    if (!id) return;
    loadTips().then((d) => setEntry(d[id]));
  }, [id]);

  return entry && ctx ? (entry[ctx.lang] ?? entry.en) : undefined;
}

/* The whole entry (icon, quality, texts), for cards built from the game data */
export function useTipEntry(id?: string) {
  const [entry, setEntry] = useState<TipEntry | undefined>();

  useEffect(() => {
    if (!id) return;
    loadTips().then((d) => setEntry(d[id]));
  }, [id]);

  return entry;
}
