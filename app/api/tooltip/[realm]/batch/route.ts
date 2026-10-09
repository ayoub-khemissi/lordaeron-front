import { NextRequest, NextResponse } from "next/server";

import { tooltipBatch } from "@/lib/tooltips/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ realm: string }> },
) {
  const { realm } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  return tooltipBatch(realm, body);
}
