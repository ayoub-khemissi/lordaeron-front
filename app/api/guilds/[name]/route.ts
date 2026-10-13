import { NextRequest, NextResponse } from "next/server";

import {
  getGuild,
  getGuildAchievements,
  getGuildMembers,
} from "@/lib/queries/guilds";
import { PAGE_SIZE, pageParam, viewerSeesGm } from "@/lib/queries/realm-search";
import { requestRealm } from "@/lib/realms";

export const dynamic = "force-dynamic";

/* A guild's page: its summary, a page of its members (?page=), and on a progressive realm its achievements (?locale= their language) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const realm = requestRealm(searchParams.get("realm"));
    const showGm = await viewerSeesGm();
    const guild = await getGuild(decodeURIComponent(name), realm, showGm);

    if (!guild)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    const page = pageParam(searchParams.get("page"));
    const [{ members, total }, achievements] = await Promise.all([
      getGuildMembers(guild.guildid, page, PAGE_SIZE, realm, showGm),
      getGuildAchievements(
        guild.guildid,
        realm,
        searchParams.get("locale") ?? "en",
      ).catch((e) => {
        console.error("Guild achievements:", e);

        return [];
      }),
    ]);

    return NextResponse.json({
      guild,
      members,
      total,
      page,
      pageSize: PAGE_SIZE,
      achievements,
    });
  } catch (error) {
    console.error("Guild error:", error);

    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
