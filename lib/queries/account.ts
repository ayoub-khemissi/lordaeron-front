import type { Account, AccountBan, IpBan } from "@/types";

import { RowDataPacket } from "mysql2";

import { authDb, websiteDb } from "@/lib/db";

export async function findAccountByUsername(
  username: string,
): Promise<Account | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT id, username, email, salt, verifier, joindate, last_ip, expansion FROM account WHERE username = ?",
    [username.toUpperCase()],
  );

  if (rows.length === 0) return null;

  return rows[0] as Account;
}

export async function findAccountById(id: number): Promise<Account | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT id, username, email, joindate, last_ip, expansion FROM account WHERE id = ?",
    [id],
  );

  if (rows.length === 0) return null;

  return rows[0] as Account;
}

export async function getAccountBan(
  accountId: number,
): Promise<AccountBan | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT id, bandate, unbandate, bannedby, banreason, active FROM account_banned WHERE id = ? AND active = 1 ORDER BY bandate DESC LIMIT 1",
    [accountId],
  );

  if (rows.length === 0) return null;

  return rows[0] as AccountBan;
}

export async function getIpBan(ip: string): Promise<IpBan | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT ip, bandate, unbandate, bannedby, banreason FROM ip_banned WHERE ip = ? AND (unbandate > UNIX_TIMESTAMP() OR unbandate = bandate) ORDER BY bandate DESC LIMIT 1",
    [ip],
  );

  if (rows.length === 0) return null;

  return rows[0] as IpBan;
}

export async function findAccountByEmail(
  email: string,
): Promise<Account | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT id, username, email, salt, verifier, joindate, last_ip, expansion FROM account WHERE email = ?",
    [email],
  );

  if (rows.length === 0) return null;

  return rows[0] as Account;
}

export async function updateAccountPassword(
  accountId: number,
  salt: Uint8Array,
  verifier: Uint8Array,
): Promise<void> {
  await authDb.execute(
    "UPDATE account SET salt = ?, verifier = ? WHERE id = ?",
    [salt, verifier, accountId],
  );
}

// accounts created from this IP over the last 24 hours (sql/account_registrations.sql)
export async function countRecentRegistrations(ip: string): Promise<number> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS n FROM account_registrations WHERE ip = ? AND created_at > NOW() - INTERVAL 24 HOUR",
    [ip],
  );

  return Number(rows[0]?.n ?? 0);
}

export async function recordRegistration(accountId: number, ip: string) {
  await websiteDb.execute(
    "INSERT INTO account_registrations (account_id, ip) VALUES (?, ?)",
    [accountId, ip],
  );
}

export async function createAccount(
  username: string,
  email: string,
  salt: Uint8Array,
  verifier: Uint8Array,
): Promise<number> {
  const [result] = await authDb.execute(
    "INSERT INTO account (username, salt, verifier, email, expansion) VALUES (?, ?, ?, ?, 2)",
    [username.toUpperCase(), salt, verifier, email],
  );

  return (result as { insertId: number }).insertId;
}
