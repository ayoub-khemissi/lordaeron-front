import { NextRequest, NextResponse } from "next/server";

import { hallOfFame } from "@/lib/queries/hall-of-fame";
import { rankFilters } from "@/lib/queries/rankings";
import { PAGE_SIZE, viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The hall of fame (lib/queries/hall-of-fame.ts): ?sort=points|count, ?faction= ?class= ?page=, ?realm= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") === "count" ? "count" : "points";
    const filters = rankFilters(searchParams);
    const { entries, total } = await hallOfFame(
      requestRealm(searchParams.get("realm")),
      sort,
      filters,
      await viewerSeesGm(),
    );

    return NextResponse.json({
      sort,
      entries,
      total,
      page: filters.page,
      pageSize: PAGE_SIZE,
    });
  } catch (error) {
    console.error("Hall of fame error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
