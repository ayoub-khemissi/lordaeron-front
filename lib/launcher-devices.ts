import type { ResultSetHeader, RowDataPacket } from "mysql2";

import crypto from "crypto";

import { authDb, websiteDb } from "@/lib/db";
import { calculateVerifier, generateSalt } from "@/lib/srp6";

/*
 * The launcher's sign-in (sql/launcher_login.sql): a device token stands for the account in one launcher, revocable, and
 * each Play turns it into a one-time game ticket the authserver accepts once within a minute (auth.launcher_tickets).
 * The website keeps only hashes: the token's SHA-256, the ticket's SRP6 salt and verifier.
 */

const UNUSED_DAYS = 30;
const TICKET_SECONDS = 60;
const TICKETS_AN_HOUR = 30;
// letters only (the launcher types them as keys: digits need Shift on an AZERTY keyboard); the game uppercases a
// password, and 16 of these 24 letters are about 73 bits
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const TICKET_LENGTH = 16;

const hash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function createDevice(
  accountId: number,
  name: string,
  ip: string,
): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");

  await websiteDb.execute(
    "INSERT INTO launcher_devices (account_id, token_hash, name, created_ip, last_ip) VALUES (?, ?, ?, ?, ?)",
    [accountId, hash(token), name.slice(0, 64) || null, ip, ip],
  );

  return token;
}

export interface Device {
  id: number;
  accountId: number;
}

// the device of a token still valid: not signed out, used within 30 days
export async function findDevice(token: unknown): Promise<Device | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 100)
    return null;
  const [rows] = await websiteDb.query<RowDataPacket[]>(
    `SELECT id, account_id FROM launcher_devices
      WHERE token_hash = ? AND revoked_at IS NULL AND last_used_at > NOW() - INTERVAL ? DAY`,
    [hash(token), UNUSED_DAYS],
  );

  return rows.length ? { id: rows[0].id, accountId: rows[0].account_id } : null;
}

export async function revokeDevice(token: unknown) {
  if (typeof token !== "string") return;
  await websiteDb.execute(
    "UPDATE launcher_devices SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL",
    [hash(token)],
  );
}

// every launcher of an account signed out, and its pending ticket gone: its password changed
export async function revokeAccountDevices(accountId: number) {
  await websiteDb.execute(
    "UPDATE launcher_devices SET revoked_at = NOW() WHERE account_id = ? AND revoked_at IS NULL",
    [accountId],
  );
  await authDb.execute("DELETE FROM launcher_tickets WHERE account_id = ?", [
    accountId,
  ]);
}

export async function ticketsLastHour(deviceId: number): Promise<number> {
  const [rows] = await websiteDb.query<RowDataPacket[]>(
    "SELECT COUNT(*) n FROM launcher_ticket_log WHERE device_id = ? AND created_at > NOW() - INTERVAL 1 HOUR",
    [deviceId],
  );

  return Number(rows[0]?.n ?? 0);
}

export const TICKET_LIMIT = TICKETS_AN_HOUR;

// a new one-time ticket for the account (the one before it, if unused, is replaced): only its verifier is stored
export async function issueTicket(
  device: Device,
  username: string,
  ip: string,
): Promise<string> {
  let ticket = "";

  for (let i = 0; i < TICKET_LENGTH; i++)
    ticket += ALPHABET[crypto.randomInt(ALPHABET.length)];
  const salt = generateSalt();
  const verifier = calculateVerifier(username, ticket, salt);

  await authDb.execute(
    `REPLACE INTO launcher_tickets (account_id, salt, verifier, expires_at)
     VALUES (?, ?, ?, NOW() + INTERVAL ? SECOND)`,
    [device.accountId, salt, verifier, TICKET_SECONDS],
  );
  await websiteDb.execute(
    "INSERT INTO launcher_ticket_log (device_id) VALUES (?)",
    [device.id],
  );
  await websiteDb.execute<ResultSetHeader>(
    "UPDATE launcher_devices SET last_used_at = NOW(), last_ip = ? WHERE id = ?",
    [ip, device.id],
  );

  return ticket;
}

// the account's highest security level (auth.account_access), which shows the team's realms (the Lab) in the launcher;
// the realm itself still checks it at login
export async function securityLevel(accountId: number): Promise<number> {
  const [rows] = await authDb.query<RowDataPacket[]>(
    "SELECT MAX(SecurityLevel) level FROM account_access WHERE AccountID = ?",
    [accountId],
  );

  return Number(rows[0]?.level ?? 0);
}

// a launcher that opens keeps its sign-in alive (30 days without use sign it out)
export async function touchDevice(deviceId: number, ip: string) {
  await websiteDb.execute(
    "UPDATE launcher_devices SET last_used_at = NOW(), last_ip = ? WHERE id = ?",
    [ip, deviceId],
  );
}
