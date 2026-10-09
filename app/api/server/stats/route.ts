import { NextRequest, NextResponse } from "next/server";

import {
  getOnlineCount,
  getFactionBalance,
  getTotalFactionBalance,
  getTotalAccounts,
} from "@/lib/queries/server";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

// a realm's players (?realm=<slug>, Lordaeron's by default); the accounts are shared
export async function GET(request: NextRequest) {
  const realm = requestRealm(new URL(request.url).searchParams.get("realm"));

  try {
    const [onlineCount, factionBalance, totalFactionBalance, totalAccounts] =
      await Promise.all([
        getOnlineCount(realm),
        getFactionBalance(realm),
        getTotalFactionBalance(realm),
        getTotalAccounts(),
      ]);

    return NextResponse.json({
      onlineCount,
      totalAccounts,
      alliance: factionBalance.alliance,
      horde: factionBalance.horde,
      totalAlliance: totalFactionBalance.alliance,
      totalHorde: totalFactionBalance.horde,
    });
  } catch {
    return NextResponse.json(
      {
        onlineCount: 0,
        totalAccounts: 0,
        alliance: 0,
        horde: 0,
        totalAlliance: 0,
        totalHorde: 0,
      },
      { status: 200 },
    );
  }
}
