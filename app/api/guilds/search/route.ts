import { NextRequest, NextResponse } from "next/server";

import { searchGuilds } from "@/lib/queries/guilds";
import { PAGE_SIZE, pageParam, viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";
import { SEARCH_MIN, searchText } from "@/lib/search-text";

export const dynamic = "force-dynamic";

/* The guilds' search: ?q= the name or part of it (letters and spaces, lib/search-text.ts), every guild by size under SEARCH_MIN
   letters; ?page= from 1, ?realm= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchText(searchParams.get("q") ?? "", "guild");
    const page = pageParam(searchParams.get("page"));

    const { guilds, total } = await searchGuilds(
      query.length < SEARCH_MIN ? "" : query,
      page,
      PAGE_SIZE,
      requestRealm(searchParams.get("realm")),
      await viewerSeesGm(),
    );

    return NextResponse.json({
      guilds,
      total,
      page,
      pageSize: PAGE_SIZE,
      query,
    });
  } catch (error) {
    console.error("Guild search error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
