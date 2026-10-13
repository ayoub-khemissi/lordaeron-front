import type { ArmorySearchResult } from "@/types/armory";

/* The realm's rankings (lib/queries/pvp.ts, hall-of-fame.ts) and its population (population.ts) */

export type PvpBoard =
  | "kills"
  | "today"
  | "yesterday"
  | "honor"
  | "arena-points"
  | "arena2"
  | "arena3"
  | "arena5"
  | "battlegrounds";

// a character of a ranking: its place, the board's value and, for the battlegrounds, its games and whether it qualifies for the titles
export interface RankedCharacter extends ArmorySearchResult {
  rank: number;
  value: number;
  games?: number;
  qualified?: boolean;
  guildName?: string | null;
}

export interface ArenaTeamMember {
  guid: number;
  name: string;
  race: number;
  class: number;
  gender: number;
  level: number;
  personalRating: number;
  gm?: boolean;
}

export interface RankedArenaTeam {
  rank: number;
  id: number;
  name: string;
  type: number;
  rating: number;
  games: number;
  wins: number;
  faction: "alliance" | "horde";
  members: ArenaTeamMember[];
}

// a progressive realm's arena season: its phase, the season that phase runs (null: none, phase 0) and whether it is in progress
export interface ArenaSeasonInfo {
  phase: number;
  season: number | null;
  running: boolean;
}

export interface HallOfFameEntry extends ArmorySearchResult {
  rank: number;
  points: number;
  achievements: number;
  guildName?: string | null;
}

export interface PopulationStats {
  total: number;
  online: number;
  accounts: number;
  factions: { alliance: number; horde: number };
  classes: { id: number; count: number }[];
  races: { id: number; count: number }[];
  levels: { from: number; to: number; count: number }[];
  // accounts that play the realm, by the week they joined (the last 12 weeks; a character has no creation date in 3.3.5)
  weeks: { start: string; count: number }[];
}
