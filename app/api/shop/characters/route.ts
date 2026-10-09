import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getCharactersByAccount } from "@/lib/queries/characters";
import { DEFAULT_REALM, requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Lordaeron's characters; another realm's come with its own characters database when it opens (lib/realms-server.ts),
    // until then its shop shows the catalogue only
    if (
      requestRealm(new URL(request.url).searchParams.get("realm")) !==
      DEFAULT_REALM
    )
      return NextResponse.json({ characters: [] });

    const characters = await getCharactersByAccount(session.id);

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Characters fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
