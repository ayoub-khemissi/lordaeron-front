import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getAvatar } from "@/lib/queries/avatar";
import { getSoulShardBalance } from "@/lib/queries/soul-shards";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      // a cookie that no longer opens a session (expired, signed with an older secret) is dropped
      const response = NextResponse.json({ user: null }, { status: 401 });

      response.cookies.delete("lordaeron_session");

      return response;
    }

    // the session, the avatar the player chose (lib/avatars.ts) and its Soul Shards: the bar's account menu shows them
    const [avatar, soulShards] = await Promise.all([
      getAvatar(session.id),
      getSoulShardBalance(session.id).catch(() => 0),
    ]);

    return NextResponse.json({
      user: { id: session.id, username: session.username, avatar, soulShards },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
