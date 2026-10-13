import { NextRequest, NextResponse } from "next/server";

import { searchArmoryCharacters } from "@/lib/queries/armory";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

/* The armory's search: ?q= the name or part of it, ?page= from 1. The text keeps only letters (a character's name is letters only:
   spaces, digits and signs are dropped), 2 to 12 of them; case and accents do not matter (lib/queries/armory.ts). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "")
      .normalize("NFC")
      .replace(/[^\p{L}]/gu, "")
      .slice(0, 12);
    const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));

    if (q.length < 2) {
      return NextResponse.json({
        characters: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        query: q,
      });
    }

    const { characters, total } = await searchArmoryCharacters(
      q,
      page,
      PAGE_SIZE,
      requestRealm(searchParams.get("realm")),
    );

    return NextResponse.json({
      characters,
      total,
      page,
      pageSize: PAGE_SIZE,
      query: q,
    });
  } catch (error) {
    console.error("Armory search error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
