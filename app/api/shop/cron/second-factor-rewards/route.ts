import { NextRequest, NextResponse } from "next/server";

import { deliverRewards } from "@/lib/second-factor-reward";

export const dynamic = "force-dynamic";

/*
 * Every 5 minutes (scripts/shop-cron.sh second-factor-rewards): the Core Hound Pup to every protected account's characters not served
 * yet, on every realm (lib/second-factor-reward.ts). ?dry=1 lists them and sends nothing; ?limit=N caps the mails of the run.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const params = request.nextUrl.searchParams;
    const limit = Number(params.get("limit")) || undefined;
    const report = await deliverRewards({
      dryRun: params.get("dry") === "1",
      limit,
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Cron second-factor-rewards error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
