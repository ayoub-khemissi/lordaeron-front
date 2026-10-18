import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { dressingCharacter } from "@/lib/dressing-room";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The dressing room's character (lib/dressing-room.ts): ?realm= &guid= one of the account's characters, its looks and visible gear */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const params = request.nextUrl.searchParams;
    const guid = Number(params.get("guid"));

    if (!guid) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }
    const character = await dressingCharacter(
      requestRealm(params.get("realm")),
      guid,
      session.id,
    );

    if (!character) {
      return NextResponse.json({ error: "characterNotFound" }, { status: 404 });
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error("Dressing room character:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
