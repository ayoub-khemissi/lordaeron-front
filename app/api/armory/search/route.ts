import { NextRequest, NextResponse } from "next/server";

import { searchArmoryCharacters } from "@/lib/queries/armory";
import { PAGE_SIZE, pageParam, viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";
import { SEARCH_MIN, searchText } from "@/lib/search-text";

export const dynamic = "force-dynamic";

/* The armory's search: ?q= the name or part of it (lib/search-text.ts), ?page= from 1; a site administrator also finds the game
   masters' characters (lib/queries/realm-search.ts). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchText(searchParams.get("q") ?? "", "character");
    const page = pageParam(searchParams.get("page"));

    if (query.length < SEARCH_MIN)
      return NextResponse.json({
        characters: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        query,
      });

    const { characters, total } = await searchArmoryCharacters(
      query,
      page,
      PAGE_SIZE,
      requestRealm(searchParams.get("realm")),
      await viewerSeesGm(),
    );

    return NextResponse.json({
      characters,
      total,
      page,
      pageSize: PAGE_SIZE,
      query,
    });
  } catch (error) {
    console.error("Armory search error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
