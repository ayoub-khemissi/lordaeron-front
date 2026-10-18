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
import {
  ci,
  containsPattern,
  gmColumn,
  hideGm,
  nameRank,
  nameRankParams,
} from "@/lib/queries/realm-search";

const NAME = "c.name";

export type ArmoryListSort = "level" | "recent" | "name";

export interface ArmoryListOptions {
  // the name or a part of it (lib/search-text.ts), "" for every character
  name: string;
  faction: "" | "alliance" | "horde";
  cls: number | null;
  onlineOnly: boolean;
  sort: ArmoryListSort;
  page: number;
  pageSize: number;
  realm: RealmSlug;
  showGm: boolean;
}

// the playable races of each faction (3.3.5)
const FACTION_RACES = { alliance: [1, 3, 4, 7, 11], horde: [2, 5, 6, 8, 10] };

/* The armory's list (Ayoub, 18/10/2026: "afficher des joueurs même sans recherche", with filters): every character of the realm, or
   those whose name contains the text, narrowed by faction, class and online; a name search ranks the exact name and the prefix first,
   then the chosen order: the online first and the highest level ("level", the default), the last played ("recent"), or by name. */
export async function listArmoryCharacters(
  o: ArmoryListOptions,
): Promise<{ characters: ArmorySearchResult[]; total: number }> {
  const db = realmCharactersDb(o.realm);
  // the living characters only: a deleted one keeps its row (deleteInfos_Name, its name emptied) for a restore
  const where = ["c.level > 0", "c.deleteInfos_Name IS NULL"];
  const params: string[] = [];

  if (o.name) {
    where.push(`${ci(NAME)} LIKE ?`);
    params.push(containsPattern(o.name));
  }
  if (o.faction)
    where.push(`c.race IN (${FACTION_RACES[o.faction].join(", ")})`);
  if (o.cls) {
    where.push("c.class = ?");
    params.push(String(o.cls));
  }
  if (o.onlineOnly) where.push("c.online = 1");
  const condition = `${where.join(" AND ")} ${hideGm("c.account", o.showGm)}`;
  const [counted] = await db.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM characters c WHERE ${condition}`,
    params,
  );
  const total = Number(counted[0]?.total ?? 0);

  if (!total) return { characters: [], total };
  const order = {
    level: "c.online DESC, c.level DESC, c.name ASC",
    recent: "c.online DESC, c.logout_time DESC, c.name ASC",
    name: "c.name ASC",
  }[o.sort];
  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT c.guid, c.name, c.race, c.class, c.level, c.gender, c.online,
       ${gmColumn("c.account")}
     FROM characters c
     WHERE ${condition}
     ORDER BY ${o.name ? `${nameRank(NAME)}, ` : ""}${order}
     LIMIT ? OFFSET ?`,
    [
      ...params,
      ...(o.name ? nameRankParams(o.name) : []),
      String(o.pageSize),
      String((o.page - 1) * o.pageSize),
    ],
  );

  return {
    characters: rows.map((r) => ({ ...r, gm: !!r.gm })) as ArmorySearchResult[],
    total,
  };
}

// the guild's officers are the ranks that hear the officer channel (GR_RIGHT_OFFCHATLISTEN, as the game's roster), its master the leader
const RIGHT_OFFICER_CHAT = 0x04;

function guildRole(
  leader: number | null,
  rights: number | null,
): ArmoryCharacter["guildRole"] {
  if (leader) return "master";
  if (rights != null && rights & RIGHT_OFFICER_CHAT) return "officer";

  return null;
}

export async function getArmoryCharacter(
  name: string,
  realm: RealmSlug = DEFAULT_REALM,
  showGm = false,
): Promise<ArmoryCharacter | null> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT c.guid, c.name, c.race, c.class, c.gender, c.level, c.online,
       c.totaltime, c.zone, c.skin, c.face, c.hairStyle, c.hairColor, c.facialStyle,
       c.totalKills, c.totalHonorPoints, c.arenaPoints, c.equipmentCache,
       g.name AS guildName, g.guildid AS guildId, gr.rname AS guildRankName, gr.rights AS guildRankRights,
       g.leaderguid = c.guid AS guildLeader,
       g.EmblemStyle AS emblemStyle, g.EmblemColor AS emblemColor, g.BorderStyle AS borderStyle,
       g.BorderColor AS borderColor, g.BackgroundColor AS backgroundColor,
       ${gmColumn("c.account")}
     FROM characters c
     LEFT JOIN guild_member gm ON gm.guid = c.guid
     LEFT JOIN guild g ON g.guildid = gm.guildid
     LEFT JOIN guild_rank gr ON gr.guildid = gm.guildid AND gr.rid = gm.\`rank\`
     WHERE ${ci(NAME)} = ?
       ${hideGm("c.account", showGm)}
     ORDER BY c.name = ? DESC
     LIMIT 1`,
    [name, name],
  );

  if (rows.length === 0) return null;
  const r = rows[0];

  const { guildRankRights, guildLeader, ...character } = r;

  return {
    ...character,
    gm: !!r.gm,
    guildRole: guildRole(guildLeader, guildRankRights),
    guildEmblem:
      r.guildId != null
        ? {
            style: r.emblemStyle,
            color: r.emblemColor,
            borderStyle: r.borderStyle,
            borderColor: r.borderColor,
            background: r.backgroundColor,
          }
        : null,
  } as ArmoryCharacter;
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

// what the character really wears, transmogs aside (the equipment cache shows the transmogs): the equipped items and their
// enchantments (item_instance.enchantments: the permanent one first, the temporary one fourth), in the cache's shape
export async function getEquippedItems(
  guid: number,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<EquipmentSlot[]> {
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT ci.slot, ii.itemEntry, ii.enchantments
     FROM character_inventory ci JOIN item_instance ii ON ii.guid = ci.item
     WHERE ci.guid = ? AND ci.bag = 0 AND ci.slot < 19
     ORDER BY ci.slot`,
    [guid],
  );

  return rows.map((r) => {
    const e = String(r.enchantments ?? "")
      .trim()
      .split(/\s+/)
      .map(Number);
    const permanent = e[0] || 0;
    const temporary = e[3] || 0;

    return {
      slot: Number(r.slot),
      itemEntry: Number(r.itemEntry),
      displayId: 0,
      enchant: (permanent & 0xffff) | ((temporary & 0xffff) << 16),
    };
  });
}

export function parseEquipmentCache(cache: string): EquipmentSlot[] {
  const values = cache.trim().split(/\s+/).map(Number);
  const items: EquipmentSlot[] = [];

  for (let i = 0; i < 19; i++) {
    // the visible item and its visible enchantments (the core's PLAYER_VISIBLE_ITEM fields: transmogs applied); the display comes from
    // item_template (app/api/armory/character)
    const itemEntry = values[i * 2];
    const enchant = values[i * 2 + 1] || 0;

    if (itemEntry > 0) {
      items.push({ slot: i, itemEntry, displayId: 0, enchant });
    }
  }

  return items;
}
