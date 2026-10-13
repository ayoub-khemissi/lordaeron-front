import { NextRequest, NextResponse } from "next/server";

import { getProgression } from "@/lib/queries/progression";
import { getRealmFirsts } from "@/lib/queries/realm-firsts";
import { viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The guilds' raid progression (lib/queries/progression.ts) and the realm's first boss kills (its realm firsts of bosses); ?realm=,
   ?locale= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realm = requestRealm(searchParams.get("realm"));
    const locale = searchParams.get("locale") ?? "en";
    const showGm = await viewerSeesGm();
    const [progression, { firsts }] = await Promise.all([
      getProgression(realm, locale, showGm),
      getRealmFirsts(realm, locale, showGm),
    ]);

    return NextResponse.json({
      ...progression,
      firsts: firsts.filter((f) => f.group === "bosses"),
    });
  } catch (error) {
    console.error("Progression error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
