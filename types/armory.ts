export interface ArmorySearchResult {
  guid: number;
  name: string;
  race: number;
  class: number;
  level: number;
  gender: number;
  online: number;
  // a game master's character (only a site administrator gets them, lib/queries/realm-search.ts)
  gm?: boolean;
}

// a guild's tabard (the guild table's emblem fields): the crest's layers, components/guild-emblem.tsx
export interface GuildEmblem {
  style: number;
  color: number;
  borderStyle: number;
  borderColor: number;
  background: number;
}

export interface ArmoryCharacter {
  guid: number;
  name: string;
  race: number;
  class: number;
  gender: number;
  level: number;
  online: number;
  totaltime: number;
  zone: number;
  // Appearance
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  // PvP
  totalKills: number;
  totalHonorPoints: number;
  arenaPoints: number;
  // Equipment
  equipmentCache: string;
  // Guild
  guildId: number | null;
  guildName: string | null;
  guildRankName: string | null;
  guildEmblem?: GuildEmblem | null;
  gm?: boolean;
}

export interface ArmoryStats {
  guid: number;
  maxhealth: number;
  maxpower1: number; // mana
  maxpower2: number; // rage
  maxpower3: number; // energy
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  spirit: number;
  armor: number;
  blockPct: number;
  dodgePct: number;
  parryPct: number;
  critPct: number;
  rangedCritPct: number;
  spellCritPct: number;
  attackPower: number;
  rangedAttackPower: number;
  spellPower: number;
  resilience: number;
}

export interface ArmoryProfession {
  skill: number;
  value: number;
  max: number;
}

export interface ArenaTeamInfo {
  name: string;
  type: number;
  rating: number;
  personalRating: number;
  seasonGames: number;
  seasonWins: number;
  weekGames: number;
  weekWins: number;
}

export interface EquipmentSlot {
  slot: number;
  itemEntry: number;
  /** Item display ID from item_template (enriched server-side) */
  displayId: number;
  /** The visible enchantments (equipmentCache): the permanent one in the low 16 bits, the temporary one in the high 16 */
  enchant?: number;
}
