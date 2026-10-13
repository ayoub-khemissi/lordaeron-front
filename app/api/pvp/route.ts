import type { PvpBoard } from "@/types/rankings";

import { NextRequest, NextResponse } from "next/server";

import {
  ARENA_BOARDS,
  arenaSeason,
  pvpArenaTeams,
  pvpCharacters,
} from "@/lib/queries/pvp";
import { rankFilters } from "@/lib/queries/rankings";
import { PAGE_SIZE, viewerSeesGm } from "@/lib/queries/realm-search";
import { REALMS, requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

const BOARDS: PvpBoard[] = [
  "kills",
  "today",
  "yesterday",
  "honor",
  "arena-points",
  "arena2",
  "arena3",
  "arena5",
  "battlegrounds",
];

/* The PvP ladder (lib/queries/pvp.ts): ?board= one of BOARDS (kills by default; battlegrounds on a progressive realm only),
   ?faction= ?class= ?page=, ?realm= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realm = requestRealm(searchParams.get("realm"));
    const asked = searchParams.get("board") as PvpBoard;
    const board =
      BOARDS.includes(asked) &&
      (asked !== "battlegrounds" || REALMS[realm].progressive)
        ? asked
        : "kills";
    const filters = rankFilters(searchParams);
    const showGm = await viewerSeesGm();
    const arena = ARENA_BOARDS[board];
    const [list, season] = await Promise.all([
      arena
        ? pvpArenaTeams(realm, arena, filters, showGm)
        : pvpCharacters(realm, board, filters, showGm),
      arenaSeason(realm),
    ]);

    return NextResponse.json({
      board,
      ...list,
      page: filters.page,
      pageSize: PAGE_SIZE,
      season,
    });
  } catch (error) {
    console.error("PvP ladder error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
