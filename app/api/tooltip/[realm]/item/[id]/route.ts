import { NextRequest } from "next/server";

import { tooltipGet } from "@/lib/tooltips/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ realm: string; id: string }> },
) {
  const { realm, id } = await params;

  return tooltipGet(
    realm,
    "item",
    id,
    request.nextUrl.searchParams.get("locale"),
  );
}
