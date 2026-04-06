import type { Character, DeletedCharacter } from "@/types";

import { RowDataPacket } from "mysql2";

import { charactersDb } from "@/lib/db";

export async function getCharactersByAccount(
  accountId: number,
): Promise<Character[]> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    "SELECT guid, name, race, class, level, gender, online, totaltime, zone FROM characters WHERE account = ? ORDER BY level DESC",
    [accountId],
  );

  return rows as Character[];
}

export async function getCharacterByGuid(
  guid: number,
): Promise<Character | null> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    "SELECT guid, name, race, class, level, gender, online, totaltime, zone FROM characters WHERE guid = ?",
    [guid],
  );

  if (rows.length === 0) return null;

  return rows[0] as Character;
}

export async function getCharacterByExactName(
  name: string,
): Promise<Character | null> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    "SELECT guid, name, race, class, level, gender, online, totaltime, zone FROM characters WHERE name = ?",
    [name],
  );

  if (rows.length === 0) return null;

  return rows[0] as Character;
}

export async function searchCharactersByName(
  name: string,
  excludeAccountId?: number,
  limit: number = 5,
): Promise<Character[]> {
  const safeLimit = Math.max(1, Math.min(Math.floor(limit), 20));

  const query = excludeAccountId
    ? `SELECT guid, name, race, class, level, gender, online, totaltime, zone FROM characters WHERE LOWER(name) LIKE LOWER(?) AND account != ? ORDER BY level DESC LIMIT ${safeLimit}`
    : `SELECT guid, name, race, class, level, gender, online, totaltime, zone FROM characters WHERE LOWER(name) LIKE LOWER(?) ORDER BY level DESC LIMIT ${safeLimit}`;

  const params = excludeAccountId
    ? [`${name}%`, excludeAccountId]
    : [`${name}%`];

  const [rows] = await charactersDb.execute<RowDataPacket[]>(query, params);

  return rows as Character[];
}

export async function hasItemInInventory(
  characterGuid: number,
  itemEntry: number,
): Promise<boolean> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    `SELECT 1 FROM character_inventory ci
     JOIN item_instance ii ON ci.item = ii.guid
     WHERE ci.guid = ? AND ii.itemEntry = ?
     LIMIT 1`,
    [characterGuid, itemEntry],
  );

  return rows.length > 0;
}

export type ItemLocation =
  | { location: "mail"; mailId: number; itemGuid: number }
  | { location: "inventory"; itemGuid: number };

export async function findItemLocation(
  characterGuid: number,
  itemEntry: number,
): Promise<ItemLocation | null> {
  // Check mail first
  const [mailRows] = await charactersDb.execute<RowDataPacket[]>(
    `SELECT mi.mail_id, mi.item_guid
     FROM mail_items mi
     JOIN item_instance ii ON mi.item_guid = ii.guid
     WHERE mi.receiver = ? AND ii.itemEntry = ?
     LIMIT 1`,
    [characterGuid, itemEntry],
  );

  if (mailRows.length > 0) {
    return {
      location: "mail",
      mailId: mailRows[0].mail_id,
      itemGuid: mailRows[0].item_guid,
    };
  }

  // Check inventory
  const [invRows] = await charactersDb.execute<RowDataPacket[]>(
    `SELECT ci.item as item_guid
     FROM character_inventory ci
     JOIN item_instance ii ON ci.item = ii.guid
     WHERE ci.guid = ? AND ii.itemEntry = ?
     LIMIT 1`,
    [characterGuid, itemEntry],
  );

  if (invRows.length > 0) {
    return { location: "inventory", itemGuid: invRows[0].item_guid };
  }

  return null;
}

export async function removeMailWithItem(
  mailId: number,
  itemGuid: number,
): Promise<void> {
  await charactersDb.execute(
    "DELETE FROM mail_items WHERE mail_id = ? AND item_guid = ?",
    [mailId, itemGuid],
  );
  await charactersDb.execute("DELETE FROM item_instance WHERE guid = ?", [
    itemGuid,
  ]);
  // Delete the mail if it has no remaining items
  await charactersDb.execute(
    `DELETE FROM mail WHERE id = ? AND NOT EXISTS (SELECT 1 FROM mail_items WHERE mail_id = ?)`,
    [mailId, mailId],
  );
}

export async function removeInventoryItem(itemGuid: number): Promise<void> {
  await charactersDb.execute("DELETE FROM character_inventory WHERE item = ?", [
    itemGuid,
  ]);
  await charactersDb.execute("DELETE FROM item_instance WHERE guid = ?", [
    itemGuid,
  ]);
}

export async function getDeletedCharactersByAccount(
  accountId: number,
): Promise<DeletedCharacter[]> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    `SELECT guid, deleteInfos_Name AS name, deleteDate, race, class, level, gender
     FROM characters
     WHERE deleteDate IS NOT NULL AND deleteInfos_Account = ?
     ORDER BY deleteDate DESC`,
    [accountId],
  );

  return rows as DeletedCharacter[];
}

export async function getDeletedCharacterByGuid(
  guid: number,
): Promise<(DeletedCharacter & { accountId: number }) | null> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    `SELECT guid, deleteInfos_Name AS name, deleteInfos_Account AS accountId,
            deleteDate, race, class, level, gender
     FROM characters WHERE guid = ? AND deleteDate IS NOT NULL`,
    [guid],
  );

  if (rows.length === 0) return null;

  return rows[0] as DeletedCharacter & { accountId: number };
}

export async function getActiveCharacterCount(
  accountId: number,
): Promise<number> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM characters WHERE account = ? AND deleteDate IS NULL",
    [accountId],
  );

  return rows[0].count;
}

export async function isCharacterNameTaken(name: string): Promise<boolean> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    "SELECT 1 FROM characters WHERE name = ? LIMIT 1",
    [name],
  );

  return rows.length > 0;
}

/**
 * TrinityCore at_login flags for character services.
 * Values are ORed into the existing bitmask.
 */
export const AT_LOGIN_FLAGS: Record<string, number> = {
  name_change: 0x01, // AT_LOGIN_RENAME
  appearance_change: 0x08, // AT_LOGIN_CUSTOMIZE
  faction_change: 0x40, // AT_LOGIN_CHANGE_FACTION
  race_change: 0x80, // AT_LOGIN_CHANGE_RACE
};

export async function setAtLoginFlag(
  characterGuid: number,
  flag: number,
): Promise<boolean> {
  const [result] = await charactersDb.execute<RowDataPacket[]>(
    "UPDATE characters SET at_login = at_login | ? WHERE guid = ? AND online = 0",
    [flag, characterGuid],
  );

  return (result as unknown as { affectedRows: number }).affectedRows > 0;
}

export async function getCharacterGuidsForAccount(
  accountId: number,
): Promise<number[]> {
  const [rows] = await charactersDb.execute<RowDataPacket[]>(
    "SELECT guid FROM characters WHERE account = ? AND deleteInfos_Name IS NULL ORDER BY slot, guid",
    [accountId],
  );

  return rows.map((r) => r.guid);
}

export async function updateCharacterSlots(
  accountId: number,
  guidOrder: number[],
): Promise<boolean> {
  const connection = await charactersDb.getConnection();

  try {
    await connection.beginTransaction();

    for (let i = 0; i < guidOrder.length; i++) {
      const [result] = await connection.execute<RowDataPacket[]>(
        "UPDATE characters SET slot = ? WHERE guid = ? AND account = ? AND deleteInfos_Name IS NULL",
        [i, guidOrder[i], accountId],
      );

      if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
        await connection.rollback();

        return false;
      }
    }

    await connection.commit();

    return true;
  } catch {
    await connection.rollback();

    return false;
  } finally {
    connection.release();
  }
}

export async function restoreCharacter(
  guid: number,
  name: string,
  accountId: number,
): Promise<boolean> {
  const [result] = await charactersDb.execute<RowDataPacket[]>(
    `UPDATE characters
     SET name = ?, account = ?, deleteDate = NULL,
         deleteInfos_Name = NULL, deleteInfos_Account = NULL
     WHERE guid = ? AND deleteDate IS NOT NULL AND deleteInfos_Account = ?`,
    [name, accountId, guid, accountId],
  );

  return (result as unknown as { affectedRows: number }).affectedRows > 0;
}
