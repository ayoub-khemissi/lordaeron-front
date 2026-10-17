import { NextRequest, NextResponse } from "next/server";

import { getChallengeBoard } from "@/lib/queries/challenges";
import { viewerSeesGm } from "@/lib/queries/realm-search";
import { realmHasChallenges, requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The Hall of Fame's Challenges tab (lib/queries/challenges.ts): ?realm=, ?locale= the challenges' names and the zones' language. Not
   found on a realm whose challenges are not open on the site (lib/realms.ts RealmInfo.challenges). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realm = requestRealm(searchParams.get("realm"));

    if (!realmHasChallenges(realm))
      return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json(
      await getChallengeBoard(
        realm,
        searchParams.get("locale") ?? "en",
        await viewerSeesGm(),
      ),
    );
  } catch (error) {
    console.error("Challenges error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
