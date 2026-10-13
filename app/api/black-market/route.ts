import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import {
  getAccountCharacters,
  getBlackMarket,
  getBlackMarketView,
} from "@/lib/queries/black-market";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* Zar'haam's black market (lib/queries/black-market.ts): the realm's showcase and its next delivery; for a signed-in player, the
   account's characters on the realm and, for one of them (?character=, the first by default), what it may still buy */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realm = requestRealm(searchParams.get("realm"));
    const showcase = await getBlackMarket(
      realm,
      searchParams.get("locale") ?? "en",
    );
    const session = await verifySession();
    const characters =
      session && showcase.open
        ? await getAccountCharacters(realm, session.id)
        : [];
    const wanted = Number(searchParams.get("character"));
    const guid = characters.some((c) => c.guid === wanted)
      ? wanted
      : characters[0]?.guid;
    const view =
      session && guid
        ? await getBlackMarketView(
            realm,
            session.id,
            guid,
            showcase.shelves.map((s) => s.item),
          )
        : null;

    return NextResponse.json(
      { ...showcase, signedIn: !!session, characters, view },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Black market error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
