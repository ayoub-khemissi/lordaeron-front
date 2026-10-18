import { NextRequest, NextResponse } from "next/server";

import { tryKinds } from "@/lib/dressing-room";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* What the dressing room shows of items (lib/dressing-room.ts tryKinds): ?realm= &ids= item entries (at most 200) -> { kinds: {entry:
   "gear" | "creature"} }, the others absent. The pages whose tooltips are prepared beforehand (the features) ask it for their magnifiers;
   the same for everyone: cached an hour */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const ids = (params.get("ids") ?? "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 200);
    const kinds = await tryKinds(requestRealm(params.get("realm")), ids);

    return NextResponse.json(
      { kinds: Object.fromEntries(kinds) },
      { headers: { "Cache-Control": "public, max-age=3600" } },
    );
  } catch (error) {
    console.error("Dressing room kinds:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
