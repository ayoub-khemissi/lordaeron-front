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

import { useDressingRoom } from "@/components/shop/dressing-room/dressing-room";

/* In-game tooltips of the realm's own items and spells (Wowhead does not know them).
   Data: public/data/experience-tooltips.<lang>.json (one per language of the 3.3.5 clients we have: English, French, German,
   Spanish, Russian), written by the generator's tools/site-tooltips.js. The page loads its own language's file only. */

export type TipLine = {
  left: string;
  right?: string;
  color?: string;
};
type TipText = { name: string; lines: TipLine[] };
/** The languages the tooltips exist in; the site's other languages show the English ones (as in game). */
export type TipLang = "fr" | "en" | "de" | "es" | "ru";
export const TIP_LANGS: readonly TipLang[] = ["fr", "en", "de", "es", "ru"];
export const tipLangOf = (lang: string): TipLang =>
  (TIP_LANGS as readonly string[]).includes(lang) ? (lang as TipLang) : "en";
export type TipEntry = {
  icon: string;
  quality?: number;
  // language-free facts of an item (a treasure mount's card)
  flying?: boolean;
  reqLevel?: number;
} & Partial<Record<TipLang | PageOnlyLang, TipText>>;
/** The site's languages with no 3.3.5 client: the generated tooltips show English there, the page's own ones (registerTips) their
    translation. */
type PageOnlyLang = "it" | "pl" | "pt";
type TipData = Record<string, TipEntry>;

// tooltips a page writes itself, for icons that are no item nor spell (the heroes' road): looked up when the generated files lack the id
const LOCAL: TipData = {};

export function registerTips(tips: TipData) {
  Object.assign(LOCAL, tips);
}

/** Item quality colours (0 poor … 6 artifact), as in the game. */
export const QUALITY = [
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

const cache: Partial<Record<TipLang, Promise<TipData>>> = {};
const loadTips = (lang: TipLang): Promise<TipData> => {
  // a language whose file is missing falls back to the English one
  cache[lang] ??= fetch(`/data/experience-tooltips.${lang}.json`)
    .then((r) => {
      if (r.ok) return r.json();

      return lang === "en" ? {} : loadTips("en");
    })
    .catch(() => (lang === "en" ? {} : loadTips("en")));

  return cache[lang];
};

type Shown = { id: string; x: number; y: number; pinned: boolean };
const TipContext = createContext<{
  lang: TipLang;
  show: (s: Shown) => void;
  hide: (id: string) => void;
} | null>(null);

export function TooltipProvider({
  lang,
  pageLang,
  children,
}: {
  lang: TipLang;
  // the page's own language, when the tooltips have none (Italian, Polish, Portuguese: the page's own tooltips are translated)
  pageLang?: string;
  children: ReactNode;
}) {
  const [data, setData] = useState<TipData>({});
  const [shown, setShown] = useState<Shown | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  useEffect(() => {
    // after the first paint: the page never waits for the tooltips
    const id = setTimeout(() => loadTips(lang).then(setData), 1500);

    return () => clearTimeout(id);
  }, [lang]);

  const show = useCallback(
    (s: Shown) => {
      loadTips(lang).then(setData);
      setShown(s);
    },
    [lang],
  );
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
  const entry = shown ? (data[shown.id] ?? LOCAL[shown.id]) : undefined;
  const text =
    (pageLang ? entry?.[pageLang as PageOnlyLang] : undefined) ??
    entry?.[lang] ??
    entry?.en;

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
  // the site's dressing room: Ctrl / Cmd + click on an item tries it on (Ayoub, 18/10/2026)
  const room = useDressingRoom();
  const entry = id?.startsWith("item:") ? Number(id.slice(5)) : 0;

  if (!id || !ctx) return <>{children}</>;

  return (
    <span
      data-tip
      className={clsx("cursor-help", className)}
      onClickCapture={(e) => {
        if (!room || !entry || !(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        e.stopPropagation();
        ctx.hide(id);
        room.tryEntry(entry);
      }}
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
    if (!id || !ctx) return;
    loadTips(ctx.lang).then((d) => setEntry(d[id]));
  }, [id, ctx]);

  return entry && ctx ? (entry[ctx.lang] ?? entry.en) : undefined;
}

/* The whole entry (icon, quality, texts), for cards built from the game data */
export function useTipEntry(id?: string) {
  const ctx = useContext(TipContext);
  const [entry, setEntry] = useState<TipEntry | undefined>();

  useEffect(() => {
    if (!id || !ctx) return;
    loadTips(ctx.lang).then((d) => setEntry(d[id]));
  }, [id, ctx]);

  return entry;
}
