import type {
  ArmorySearchResult,
  ArmoryCharacter,
  ArmoryStats,
  ArmoryProfession,
  ArenaTeamInfo,
  EquipmentSlot,
} from "@/types/armory";

import { RowDataPacket } from "mysql2";

import { DEFAULT_REALM, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";

const GM_FILTER = `AND c.account NOT IN (
  SELECT AccountID FROM auth.account_access WHERE SecurityLevel >= 1
)`;

export async function searchArmoryCharacters(
  name: string,
  limit = 20,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<ArmorySearchResult[]> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT c.guid, c.name, c.race, c.class, c.level, c.gender, c.online
     FROM characters c
     WHERE c.name LIKE ? AND c.level > 0
       ${GM_FILTER}
     ORDER BY c.level DESC, c.name ASC
     LIMIT ?`,
    [`%${name}%`, String(limit)],
  );

  return rows as ArmorySearchResult[];
}

export async function getArmoryCharacter(
  name: string,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<ArmoryCharacter | null> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT c.guid, c.name, c.race, c.class, c.gender, c.level, c.online,
       c.totaltime, c.zone, c.skin, c.face, c.hairStyle, c.hairColor, c.facialStyle,
       c.totalKills, c.totalHonorPoints, c.arenaPoints, c.equipmentCache,
       g.name AS guildName, g.guildid AS guildId, gr.rname AS guildRankName
     FROM characters c
     LEFT JOIN guild_member gm ON gm.guid = c.guid
     LEFT JOIN guild g ON g.guildid = gm.guildid
     LEFT JOIN guild_rank gr ON gr.guildid = gm.guildid AND gr.rid = gm.\`rank\`
     WHERE c.name = ?
       ${GM_FILTER}
     LIMIT 1`,
    [name],
  );

  if (rows.length === 0) return null;

  return rows[0] as ArmoryCharacter;
}

export async function getCharacterStats(
  guid: number,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<ArmoryStats | null> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT guid, maxhealth, maxpower1, maxpower2, maxpower3,
       strength, agility, stamina, intellect, spirit,
       armor, blockPct, dodgePct, parryPct, critPct,
       rangedCritPct, spellCritPct, attackPower, rangedAttackPower,
       spellPower, resilience
     FROM character_stats WHERE guid = ?`,
    [guid],
  );

  if (rows.length === 0) return null;

  return rows[0] as ArmoryStats;
}

export async function getCharacterProfessions(
  guid: number,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<ArmoryProfession[]> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT skill, value, max FROM character_skills
     WHERE guid = ? AND skill IN (164,165,171,182,186,197,202,333,755,773,129,356,185)`,
    [guid],
  );

  return rows as ArmoryProfession[];
}

export async function getCharacterArenaTeams(
  guid: number,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<ArenaTeamInfo[]> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT at.name, at.type, at.rating, atm.personalRating,
       atm.seasonGames, atm.seasonWins, atm.weekGames, atm.weekWins
     FROM arena_team_member atm
     JOIN arena_team at ON at.arenaTeamId = atm.arenaTeamId
     WHERE atm.guid = ?`,
    [guid],
  );

  return rows as ArenaTeamInfo[];
}

export async function getCharacterAchievementCount(
  guid: number,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<number> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM character_achievement WHERE guid = ?`,
    [guid],
  );

  return (rows[0] as { count: number }).count;
}

/** Fetch displayid from item_template for a list of item entries */
export async function getItemDisplayIds(
  entries: number[],
  realm: RealmSlug = DEFAULT_REALM,
): Promise<Map<number, number>> {
  if (entries.length === 0) return new Map();

  const placeholders = entries.map(() => "?").join(",");
  const [rows] = await realmWorldDb(realm).execute<RowDataPacket[]>(
    `SELECT entry, displayid FROM item_template WHERE entry IN (${placeholders})`,
    entries.map(String),
  );

  const map = new Map<number, number>();

  for (const row of rows) {
    map.set(row.entry, row.displayid);
  }

  return map;
}

export function parseEquipmentCache(cache: string): EquipmentSlot[] {
  const values = cache.trim().split(/\s+/).map(Number);
  const items: EquipmentSlot[] = [];

  for (let i = 0; i < 19; i++) {
    const itemEntry = values[i * 2];
    const displayId = values[i * 2 + 1];

    if (itemEntry > 0) {
      items.push({ slot: i, itemEntry, displayId });
    }
  }

  return items;
}
