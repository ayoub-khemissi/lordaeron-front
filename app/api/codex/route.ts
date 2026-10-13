import { NextRequest, NextResponse } from "next/server";

import { searchCodex } from "@/lib/codex";
import { isCodexKind, isCodexSource } from "@/lib/codex-types";
import { pageParam } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";
import { tooltipLocale } from "@/lib/tooltips/http";

export const dynamic = "force-dynamic";

/* The codex's search: ?realm= ?q= a name or part of it (any language of the realm's items) ?kind= ?source= ?phase=0-5 ?origin=custom|blizzard
   ?page= from 1 ?locale= the names' language */
export async function GET(request: NextRequest) {
  try {
    const p = new URL(request.url).searchParams;
    const kind = p.get("kind");
    const source = p.get("source");
    const phase = p.get("phase");
    const origin = p.get("origin");
    const result = await searchCodex(
      requestRealm(p.get("realm")),
      {
        text: (p.get("q") ?? "").slice(0, 60),
        kind: isCodexKind(kind) ? kind : null,
        source: isCodexSource(source) ? source : null,
        phase: phase && /^[0-5]$/.test(phase) ? Number(phase) : null,
        origin: origin === "custom" || origin === "blizzard" ? origin : null,
        page: pageParam(p.get("page")),
      },
      tooltipLocale(p.get("locale")),
    );

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Codex error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
