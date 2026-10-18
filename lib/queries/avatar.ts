import type { RowDataPacket } from "mysql2";

import { websiteDb } from "@/lib/db";
import { isAvatarIcon, randomAvatar } from "@/lib/avatars";

/* The account's avatar (sql/account_avatar.sql): an icon of the site's list, or "" for the account's initial, chosen; an account without
   a row (one made before avatars, or in game) is given a random one at its next visit (lib/avatars.ts randomAvatar) */

// the avatar shown, null for the initial
export async function getAvatar(accountId: number): Promise<string | null> {
  try {
    const [rows] = await websiteDb.execute<RowDataPacket[]>(
      "SELECT icon FROM account_avatars WHERE account_id = ?",
      [accountId],
    );

    if (!rows.length) return await assignRandomAvatar(accountId);
    const icon = rows[0].icon;

    return isAvatarIcon(icon) ? icon : null;
  } catch {
    return null;
  }
}

// a random avatar for an account that has none yet (kept if one came meanwhile); the avatar it has
export async function assignRandomAvatar(
  accountId: number,
): Promise<string | null> {
  await websiteDb.execute(
    "INSERT IGNORE INTO account_avatars (account_id, icon) VALUES (?, ?)",
    [accountId, randomAvatar()],
  );
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT icon FROM account_avatars WHERE account_id = ?",
    [accountId],
  );

  return isAvatarIcon(rows[0]?.icon) ? rows[0].icon : null;
}

// null: the account's initial, chosen (kept as "", so no random one replaces it)
export async function setAvatar(accountId: number, icon: string | null) {
  await websiteDb.execute(
    "INSERT INTO account_avatars (account_id, icon) VALUES (?, ?) ON DUPLICATE KEY UPDATE icon = VALUES(icon)",
    [accountId, icon ?? ""],
  );
}
