import { NextRequest, NextResponse } from "next/server";

import { getRealmStatus, getRealmUptime } from "@/lib/queries/server";
import { REALMS, requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

// a realm's state (?realm=<slug>, Lordaeron's by default); its uptime only while it is online
export async function GET(request: NextRequest) {
  const realm = requestRealm(new URL(request.url).searchParams.get("realm"));

  try {
    const [status, starttime] = await Promise.all([
      getRealmStatus(realm),
      getRealmUptime(realm),
    ]);

    return NextResponse.json({
      ...status,
      starttime: status.online ? starttime : null,
    });
  } catch {
    return NextResponse.json(
      { online: false, name: REALMS[realm].name, starttime: null },
      { status: 200 },
    );
  }
}
