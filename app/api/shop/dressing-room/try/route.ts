import { NextRequest, NextResponse } from "next/server";

import { tryOn } from "@/lib/dressing-room";
import { getShopItemById } from "@/lib/queries/shop-items";
import { getShopSetItems } from "@/lib/queries/shop-sets";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* What the dressing room draws of a shop item or set (lib/dressing-room.ts): ?realm= &item= (a shop item's id) or &set= (a set's id):
   its gear for the character's slots, or the mount or companion alone, or nothing it can draw. Never kept by the browser (a creature
   converted since stayed "no preview" an hour, Ayoub 18/10/2026); the server keeps its own lookups */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const realm = requestRealm(params.get("realm"));
    const itemId = Number(params.get("item"));
    const setId = Number(params.get("set"));
    // ?entries= item entries themselves (an item shown anywhere on the site: its tooltip's Ctrl + click), at most 20
    const given = (params.get("entries") ?? "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 20);
    let entries: number[] = given;

    if (setId) entries = (await getShopSetItems(setId)).map((i) => i.item_id);
    else if (itemId) {
      const item = await getShopItemById(itemId);

      entries = item?.item_id ? [item.item_id] : [];
    }

    return NextResponse.json(await tryOn(realm, entries), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Dressing room try-on:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
