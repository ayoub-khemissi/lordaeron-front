import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

import { websiteDb } from "@/lib/db";

const ITEM_CATEGORIES = [
  "bags",
  "heirlooms",
  "transmog",
  "mounts",
  "tabards",
  "pets",
  "toys",
] as const;

const DISCOUNTS = [10, 20, 30] as const;

function randomDiscount() {
  return DISCOUNTS[Math.floor(Math.random() * DISCOUNTS.length)];
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Reset all current highlights
    await websiteDb.execute(
      "UPDATE shop_items SET is_highlighted = 0, discount_percentage = 0 WHERE is_highlighted = 1",
    );

    const selected: {
      id: number;
      category: string;
      discount: number;
    }[] = [];

    // Pick 1 random active item from each of the 7 categories
    for (const category of ITEM_CATEGORIES) {
      const [rows] = await websiteDb.execute<RowDataPacket[]>(
        "SELECT id FROM shop_items WHERE is_active = 1 AND category = ? ORDER BY RAND() LIMIT 1",
        [category],
      );

      if (rows.length === 0) continue;

      const id = rows[0].id as number;
      const discount = randomDiscount();

      await websiteDb.execute(
        "UPDATE shop_items SET is_highlighted = 1, discount_percentage = ? WHERE id = ?",
        [discount, id],
      );
      selected.push({ id, category, discount });
    }

    return NextResponse.json({ selected });
  } catch (error) {
    console.error("Cron rotate-highlights error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
