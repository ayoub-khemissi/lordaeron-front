import type { ArmorySearchResult, GuildEmblem } from "@/types/armory";

// a guild in a search (app/api/guilds/search) and the head of its page (app/api/guilds/[name])
export interface GuildSummary {
  guildid: number;
  name: string;
  emblem: GuildEmblem;
  // its members the reader may see (the game masters' only for a site administrator), by faction
  members: number;
  alliance: number;
  horde: number;
  leaderName: string | null;
  createdate: number;
  // a progressive realm's guild level (WotLK+ renown, lib/guild-level.ts); null on the other realms
  level: {
    level: number;
    max: number;
    renown: number;
    next: number | null;
    pct: number;
  } | null;
}

export interface GuildMember extends ArmorySearchResult {
  rank: number;
  rankName: string | null;
}

// a WotLK+ guild achievement earned (the realm's Achievement.dbc names and icons)
export interface GuildAchievement {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  points: number;
  date: number;
}
