import { NextRequest, NextResponse } from "next/server";

import { classTalents } from "@/lib/talents";
import { CLASS_IDS, isClassKey } from "@/lib/talent-build";
import { requestRealm } from "@/lib/realms";
import { tooltipLocale } from "@/lib/tooltips/http";

/* A class's talent trees in a realm (the talent calculator's class picker): ?realm=&class=mage&locale=fr. The same for everyone: HTTP
   cached ten minutes. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("class");

  if (!isClassKey(key))
    return NextResponse.json({ error: "unknown class" }, { status: 404 });
  try {
    const talents = await classTalents(
      requestRealm(searchParams.get("realm")),
      CLASS_IDS[key],
      tooltipLocale(searchParams.get("locale")),
    );

    if (!talents)
      return NextResponse.json({ error: "unknown class" }, { status: 404 });

    return NextResponse.json(
      { talents },
      { headers: { "Cache-Control": "public, max-age=600" } },
    );
  } catch (error) {
    console.error("Talents error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
