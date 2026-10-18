import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getDeletedCharactersByAccount } from "@/lib/queries/characters";
import { RESTORE_CHARACTER_COST } from "@/lib/shop-utils";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const deletedCharacters = await getDeletedCharactersByAccount(
      session.id,
      requestRealm(request.nextUrl.searchParams.get("realm")),
    );

    return NextResponse.json({
      deletedCharacters,
      restoreCost: RESTORE_CHARACTER_COST,
    });
  } catch (error) {
    console.error("Deleted characters fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
