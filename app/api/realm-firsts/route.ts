import { NextRequest, NextResponse } from "next/server";

import { getRealmFirsts } from "@/lib/queries/realm-firsts";
import { viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The realm's realm firsts (lib/queries/realm-firsts.ts); ?realm=, ?locale= their language */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    return NextResponse.json(
      await getRealmFirsts(
        requestRealm(searchParams.get("realm")),
        searchParams.get("locale") ?? "en",
        await viewerSeesGm(),
      ),
    );
  } catch (error) {
    console.error("Realm firsts error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
