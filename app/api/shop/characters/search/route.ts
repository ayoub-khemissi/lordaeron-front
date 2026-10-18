import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { searchCharactersByName } from "@/lib/queries/characters";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const name = request.nextUrl.searchParams.get("name");

    if (!name || name.length < 2) {
      return NextResponse.json({ characters: [] });
    }

    // on the realm being browsed (the gift goes to its characters)
    const characters = await searchCharactersByName(
      name,
      session.id,
      5,
      requestRealm(request.nextUrl.searchParams.get("realm")),
    );

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Character search error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
