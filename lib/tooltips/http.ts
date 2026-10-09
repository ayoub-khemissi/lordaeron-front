import { NextResponse } from "next/server";

import {
  MAX_ID,
  isTooltipLocale,
  parseRef,
  realmTooltips,
  type TooltipKind,
  type TooltipLocale,
  type TooltipRef,
} from "./index";

import { isRealmSlug } from "@/lib/realms";

/* The tooltip API routes (app/api/tooltip/[realm]/...): validation and responses. */

export const MAX_BATCH = 100;
const CACHE = "public, max-age=600";

const error = (status: number, message: string) =>
  NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );

// an unknown or missing locale reads English
export const tooltipLocale = (v: unknown): TooltipLocale =>
  isTooltipLocale(v) ? v : "en";

// GET /api/tooltip/[realm]/[kind]/[id]?locale=fr -> { icon, quality?, name, lines }
export async function tooltipGet(
  realm: string,
  kind: TooltipKind,
  id: string,
  locale: string | null,
) {
  if (!isRealmSlug(realm)) return error(404, "unknown realm");
  const n = /^\d{1,10}$/.test(id) ? Number(id) : 0;

  if (n <= 0 || n > MAX_ID) return error(404, `unknown ${kind}`);
  const ref: TooltipRef = { kind, id: n };

  try {
    const tip = (await realmTooltips(realm, [ref], tooltipLocale(locale))).get(
      `${kind}:${n}`,
    );

    if (!tip) return error(404, `unknown ${kind}`);

    return NextResponse.json(tip, { headers: { "Cache-Control": CACHE } });
  } catch (e) {
    console.error(`tooltip ${realm} ${kind}:${n}:`, e);

    return error(503, "tooltips unavailable");
  }
}

// POST /api/tooltip/[realm]/batch { refs: ["item:123", "spell:456"], locale } -> { tooltips: { "item:123": {...} | null } }
export async function tooltipBatch(realm: string, body: unknown) {
  if (!isRealmSlug(realm)) return error(404, "unknown realm");
  const { refs, locale } = (body ?? {}) as { refs?: unknown; locale?: unknown };

  if (!Array.isArray(refs) || refs.length > MAX_BATCH)
    return error(
      400,
      `refs: an array of at most ${MAX_BATCH} "item:<id>" / "spell:<id>"`,
    );
  const parsed = refs.map(parseRef);

  if (parsed.some((r) => !r)) return error(400, "refs: malformed ref");
  try {
    const tips = await realmTooltips(
      realm,
      parsed as TooltipRef[],
      tooltipLocale(locale),
    );

    return NextResponse.json(
      { tooltips: Object.fromEntries(tips) },
      { headers: { "Cache-Control": "private, max-age=600" } },
    );
  } catch (e) {
    console.error(`tooltip batch ${realm}:`, e);

    return error(503, "tooltips unavailable");
  }
}
