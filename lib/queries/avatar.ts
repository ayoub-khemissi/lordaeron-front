import type { RowDataPacket } from "mysql2";

import { websiteDb } from "@/lib/db";
import { isAvatarIcon } from "@/lib/avatars";

// the account's avatar icon (sql/account_avatar.sql), null without one (or one no longer in the list)
export async function getAvatar(accountId: number): Promise<string | null> {
  try {
    const [rows] = await websiteDb.execute<RowDataPacket[]>(
      "SELECT icon FROM account_avatars WHERE account_id = ?",
      [accountId],
    );
    const icon = rows[0]?.icon;

    return isAvatarIcon(icon) ? icon : null;
  } catch {
    return null;
  }
}

// null takes it back to the account's initial
export async function setAvatar(accountId: number, icon: string | null) {
  if (icon === null) {
    await websiteDb.execute(
      "DELETE FROM account_avatars WHERE account_id = ?",
      [accountId],
    );

    return;
  }
  await websiteDb.execute(
    "INSERT INTO account_avatars (account_id, icon) VALUES (?, ?) ON DUPLICATE KEY UPDATE icon = VALUES(icon)",
    [accountId, icon],
  );
}
