import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getCharactersByAccount } from "@/lib/queries/characters";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // the account's characters on the realm being browsed (its own characters database, lib/realms-server.ts)
    const characters = await getCharactersByAccount(
      session.id,
      requestRealm(new URL(request.url).searchParams.get("realm")),
    );

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Characters fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
