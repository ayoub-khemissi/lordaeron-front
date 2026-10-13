import { NextRequest, NextResponse } from "next/server";

import { getCalendar } from "@/lib/queries/calendar";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* The realm's live calendar (lib/queries/calendar.ts); ?realm=, ?locale= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    return NextResponse.json(
      await getCalendar(
        requestRealm(searchParams.get("realm")),
        searchParams.get("locale") ?? "en",
      ),
    );
  } catch (error) {
    console.error("Calendar error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
