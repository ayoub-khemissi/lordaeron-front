import { RowDataPacket } from "mysql2";

import { authDb } from "@/lib/db";
import { DEFAULT_REALM, REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb } from "@/lib/realms-server";

// REALM_FLAG_OFFLINE (auth.realmlist.flag): set while the realm's worldserver is down
const REALM_FLAG_OFFLINE = 0x02;

// a realm's state in the realm list (its own row, by its game realm id)
export async function getRealmStatus(
  realm: RealmSlug = DEFAULT_REALM,
): Promise<{
  online: boolean;
  name: string;
}> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT name, flag FROM realmlist WHERE id = ?",
    [REALMS[realm].realmId],
  );

  if (rows.length === 0) {
    return { online: false, name: REALMS[realm].name };
  }

  return {
    online: (rows[0].flag & REALM_FLAG_OFFLINE) === 0,
    name: rows[0].name,
  };
}

// a realm not open yet has no players to count: its characters database is still the test realm's
const counted = (realm: RealmSlug) => REALMS[realm].status === "open";

export async function getOnlineCount(
  realm: RealmSlug = DEFAULT_REALM,
): Promise<number> {
  if (!counted(realm)) return 0;
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    "SELECT COUNT(*) as online_count FROM characters WHERE online = 1",
  );

  return rows[0].online_count;
}

export async function getFactionBalance(
  realm: RealmSlug = DEFAULT_REALM,
): Promise<{
  alliance: number;
  horde: number;
}> {
  if (!counted(realm)) return { alliance: 0, horde: 0 };
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT
      SUM(CASE WHEN race IN (1,3,4,7,11) THEN 1 ELSE 0 END) as alliance,
      SUM(CASE WHEN race IN (2,5,6,8,10) THEN 1 ELSE 0 END) as horde
    FROM characters WHERE online = 1`,
  );

  return {
    alliance: rows[0].alliance || 0,
    horde: rows[0].horde || 0,
  };
}

export async function getTotalFactionBalance(
  realm: RealmSlug = DEFAULT_REALM,
): Promise<{
  alliance: number;
  horde: number;
}> {
  if (!counted(realm)) return { alliance: 0, horde: 0 };
  const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
    `SELECT
      SUM(CASE WHEN race IN (1,3,4,7,11) THEN 1 ELSE 0 END) as alliance,
      SUM(CASE WHEN race IN (2,5,6,8,10) THEN 1 ELSE 0 END) as horde
    FROM characters`,
  );

  return {
    alliance: rows[0].alliance || 0,
    horde: rows[0].horde || 0,
  };
}

export async function getTotalAccounts(): Promise<number> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT COUNT(*) as total FROM account",
  );

  return rows[0].total;
}

// when the realm's worldserver last started (auth.uptime has one row per start of each realm)
export async function getRealmUptime(
  realm: RealmSlug = DEFAULT_REALM,
): Promise<number | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT starttime FROM uptime WHERE realmid = ? ORDER BY starttime DESC LIMIT 1",
    [REALMS[realm].realmId],
  );

  if (rows.length === 0) return null;

  return rows[0].starttime;
}
