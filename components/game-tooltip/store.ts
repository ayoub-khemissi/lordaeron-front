/*
 * Client side of the tooltip service (app/api/tooltip): each tooltip is fetched once per page life (per realm and locale) and kept.
 * Requests made in the same few milliseconds are grouped: one ref goes through the GET route (HTTP cached), several through the batch
 * route (at most 100 per request). A failed request is forgotten so a later hover retries.
 */

export type GameTooltipLine = { left: string; right?: string; color?: string };
export type GameTooltipData = {
  icon: string;
  quality?: number;
  name: string;
  lines: GameTooltipLine[];
};

type Waiter = (tip: GameTooltipData | null | undefined) => void;

const BATCH_MAX = 100;
const GROUP_MS = 15;

const promises = new Map<string, Promise<GameTooltipData | null>>();
const resolved = new Map<string, GameTooltipData | null>();
const queues = new Map<string, Map<string, Waiter[]>>();
let timer: ReturnType<typeof setTimeout> | null = null;

const keyOf = (realm: string, locale: string, ref: string) =>
  `${realm}|${locale}|${ref}`;

// the tooltip when already loaded: data, null (unknown id) or undefined (not loaded yet)
export function peekTooltip(realm: string, locale: string, ref: string) {
  return resolved.get(keyOf(realm, locale, ref));
}

async function fetchGroup(realm: string, locale: string, refs: string[]) {
  const enc = encodeURIComponent;

  if (refs.length === 1) {
    const [kind, id] = refs[0].split(":");
    const r = await fetch(
      `/api/tooltip/${enc(realm)}/${kind}/${id}?locale=${enc(locale)}`,
    );

    if (r.status === 404) return { [refs[0]]: null };
    if (!r.ok) throw new Error(`tooltip ${r.status}`);

    return { [refs[0]]: (await r.json()) as GameTooltipData };
  }
  const r = await fetch(`/api/tooltip/${enc(realm)}/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refs, locale }),
  });

  if (!r.ok) throw new Error(`tooltip batch ${r.status}`);

  return (
    (await r.json()) as {
      tooltips: Record<string, GameTooltipData | null>;
    }
  ).tooltips;
}

function flush() {
  timer = null;
  const groups = [...queues.entries()];

  queues.clear();
  for (const [group, waiting] of groups) {
    const [realm, locale] = group.split("|");
    const refs = [...waiting.keys()];

    for (let i = 0; i < refs.length; i += BATCH_MAX) {
      const chunk = refs.slice(i, i + BATCH_MAX);

      fetchGroup(realm, locale, chunk)
        .then((tips) => {
          for (const ref of chunk)
            for (const done of waiting.get(ref) ?? []) done(tips[ref] ?? null);
        })
        .catch(() => {
          for (const ref of chunk)
            for (const done of waiting.get(ref) ?? []) done(undefined);
        });
    }
  }
}

// the tooltip of `ref` ("item:123" / "spell:456"): null when the realm does not know it (or the service is unreachable)
export function loadTooltip(
  realm: string,
  locale: string,
  ref: string,
): Promise<GameTooltipData | null> {
  const key = keyOf(realm, locale, ref);
  let p = promises.get(key);

  if (p) return p;
  p = new Promise<GameTooltipData | null>((resolve) => {
    const group = `${realm}|${locale}`;
    let waiting = queues.get(group);

    if (!waiting) {
      waiting = new Map();
      queues.set(group, waiting);
    }
    const list = waiting.get(ref) ?? [];

    list.push((tip) => {
      if (tip === undefined) {
        // a network or server error: retried on the next hover
        promises.delete(key);
        resolve(null);
      } else {
        resolved.set(key, tip);
        resolve(tip);
      }
    });
    waiting.set(ref, list);
    timer ??= setTimeout(flush, GROUP_MS);
  });
  promises.set(key, p);

  return p;
}

export const QUALITY_COLORS = [
  "#9d9d9d",
  "#ffffff",
  "#1eff00",
  "#0070dd",
  "#a335ee",
  "#ff8000",
  "#e6cc80",
  "#e6cc80",
];

const LINE_COLORS: Record<string, string> = {
  white: "#ffffff",
  gray: "#9d9d9d",
  green: "#1eff00",
  yellow: "#ffd100",
  gold: "#ffd100",
  red: "#ff2020",
  blue: "#71d5ff",
};

export const lineColor = (c?: string) =>
  c
    ? ((c.startsWith("q")
        ? QUALITY_COLORS[Number(c.slice(1))]
        : LINE_COLORS[c]) ?? "#ffffff")
    : "#ffffff";

// an icon on wow.zamimg.com: small 18 px, medium 36 px, large 56 px
export const zamimgIcon = (icon: string, px = 36) =>
  `https://wow.zamimg.com/images/wow/icons/${px <= 18 ? "small" : px <= 36 ? "medium" : "large"}/${icon}.jpg`;
