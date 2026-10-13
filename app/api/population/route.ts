import { NextRequest, NextResponse } from "next/server";

import { realmPopulation } from "@/lib/queries/population";
import { viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The realm's population (lib/queries/population.ts): counts only; ?realm= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    return NextResponse.json(
      await realmPopulation(
        requestRealm(searchParams.get("realm")),
        await viewerSeesGm(),
      ),
    );
  } catch (error) {
    console.error("Population error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
