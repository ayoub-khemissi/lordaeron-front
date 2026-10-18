import { NextRequest, NextResponse } from "next/server";

import {
  type ArmoryListSort,
  listArmoryCharacters,
} from "@/lib/queries/armory";
import { PAGE_SIZE, pageParam, viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";
import { SEARCH_MIN, searchText } from "@/lib/search-text";

export const dynamic = "force-dynamic";

const SORTS: ArmoryListSort[] = ["level", "recent", "name"];

/* The armory's list (lib/queries/armory.ts listArmoryCharacters): ?q= the name or part of it (lib/search-text.ts; shorter than
   SEARCH_MIN: every character), ?faction=alliance|horde, ?class= the class id, ?online=1, ?sort=level|recent|name, ?page= from 1; a site
   administrator also finds the game masters' characters (lib/queries/realm-search.ts). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchText(searchParams.get("q") ?? "", "character");
    const name = text.length >= SEARCH_MIN ? text : "";
    const page = pageParam(searchParams.get("page"));
    const faction = searchParams.get("faction");
    const cls = Number(searchParams.get("class")) || null;
    const sort = searchParams.get("sort") as ArmoryListSort;

    const { characters, total } = await listArmoryCharacters({
      name,
      faction: faction === "alliance" || faction === "horde" ? faction : "",
      cls: cls && cls >= 1 && cls <= 11 ? cls : null,
      onlineOnly: searchParams.get("online") === "1",
      sort: SORTS.includes(sort) ? sort : "level",
      page,
      pageSize: PAGE_SIZE,
      realm: requestRealm(searchParams.get("realm")),
      showGm: await viewerSeesGm(),
    });

    return NextResponse.json({
      characters,
      total,
      page,
      pageSize: PAGE_SIZE,
      query: name,
    });
  } catch (error) {
    console.error("Armory search error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
