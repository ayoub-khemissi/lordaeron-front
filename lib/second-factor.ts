import type { RowDataPacket } from "mysql2";

import { createHmac, randomBytes } from "crypto";

import QRCode from "qrcode";

import { authDb, websiteDb } from "@/lib/db";

/*
 * The second factor (Ayoub, 13/10/2026, on majaliss's principle): an authenticator app's 6-digit code.
 * - An administrator's (shop_admins) factor lives in second_factor; the admin space waits for it (lib/admin-auth.ts).
 * - A game account's lives in auth.account.totp_secret, raw bytes: TrinityCore's authserver asks for it at every game login (no
 *   TOTPMasterSecret, so it reads them as they are) and the website's sign-in asks for it too. Game masters enrol from the same screen.
 * The codes follow TrinityCore's TOTP exactly (src/common/Cryptography/TOTP.cpp): HMAC-SHA1, 6 digits, 30 s steps, the previous,
 * current and next step accepted; here a step serves once. Secrets are never logged.
 * Lockouts: the website's sign-ins bypass the authserver's WrongPass, so 5 failures of one subject in 15 minutes lock it, and 20
 * from one IP lock the IP (sql/second_factor.sql).
 */

const STEP_SECONDS = 30;
const SECRET_BYTES = 20;
// a pending enrolment is renewed after this long without its first code
const PENDING_HOURS = 1;
const LOCK_MINUTES = 15;
const MAX_SUBJECT_FAILURES = 5;
const MAX_IP_FAILURES = 20;

export type Factor = "admin" | "account";

// ── TOTP (RFC 6238 as TrinityCore computes it) ──

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];

  return out;
}

function codeAt(secret: Buffer, step: number): string {
  const challenge = Buffer.alloc(8);

  challenge.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", new Uint8Array(secret))
    .update(new Uint8Array(challenge))
    .digest();
  const offset = digest[19] & 0xf;
  const truncated = digest.readUInt32BE(offset) & 0x7fffffff;

  return String(truncated % 1_000_000).padStart(6, "0");
}

// the step the code belongs to (previous, current or next), or null
function matchStep(secret: Buffer, code: string): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const now = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (const step of [now - 1, now, now + 1])
    if (codeAt(secret, step) === code) return step;

  return null;
}

// ── lockouts ──

export function requestIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// "subject" or "ip" when locked, null when free
export async function lockedOut(
  subject: string,
  ip: string,
): Promise<"subject" | "ip" | null> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT
       (SELECT COUNT(*) FROM login_failures WHERE subject = ? AND created_at > NOW() - INTERVAL ${LOCK_MINUTES} MINUTE) AS bySubject,
       (SELECT COUNT(*) FROM login_failures WHERE ip = ? AND created_at > NOW() - INTERVAL ${LOCK_MINUTES} MINUTE) AS byIp`,
    [subject, ip],
  );

  if (Number(rows[0]?.bySubject ?? 0) >= MAX_SUBJECT_FAILURES) return "subject";
  if (Number(rows[0]?.byIp ?? 0) >= MAX_IP_FAILURES) return "ip";

  return null;
}

export async function recordFailure(subject: string, ip: string) {
  await websiteDb.execute(
    "INSERT INTO login_failures (subject, ip) VALUES (?, ?)",
    [subject, ip],
  );
}

export async function clearFailures(subject: string) {
  await websiteDb.execute("DELETE FROM login_failures WHERE subject = ?", [
    subject,
  ]);
}

// ── factors ──

const key = (factor: Factor, id: number) => `${factor}:${id}`;

async function row(factor: Factor, id: number) {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT secret, pending_secret, last_step, pending_at > NOW() - INTERVAL ${PENDING_HOURS} HOUR AS fresh
       FROM second_factor WHERE subject = ?`,
    [key(factor, id)],
  );

  return rows[0] as
    | {
        secret: Buffer | null;
        pending_secret: Buffer | null;
        last_step: number;
        fresh: number | null;
      }
    | undefined;
}

// the confirmed secret: the administrator's here, the account's in auth.account
async function confirmedSecret(
  factor: Factor,
  id: number,
): Promise<Buffer | null> {
  if (factor === "admin") return (await row(factor, id))?.secret ?? null;
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT totp_secret FROM account WHERE id = ?",
    [id],
  );
  const secret = rows[0]?.totp_secret as Buffer | null | undefined;

  return secret && secret.length ? secret : null;
}

export async function isEnrolled(factor: Factor, id: number) {
  return !!(await confirmedSecret(factor, id));
}

// a game account's highest GM level on any realm (0: a player)
export async function gmLevel(accountId: number): Promise<number> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT MAX(SecurityLevel) AS level FROM account_access WHERE AccountID = ?",
    [accountId],
  );

  return Number(rows[0]?.level ?? 0);
}

// what the authenticator app scans: a pending secret, kept until the first valid code (renewed after an hour)
export async function enrolment(factor: Factor, id: number, label: string) {
  const current = await row(factor, id);
  let pending = current?.fresh ? current.pending_secret : null;

  if (!pending) {
    pending = randomBytes(SECRET_BYTES);
    await websiteDb.execute(
      `INSERT INTO second_factor (subject, pending_secret, pending_at) VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE pending_secret = VALUES(pending_secret), pending_at = NOW()`,
      [key(factor, id), pending],
    );
  }
  const secret = base32(pending);
  const issuer = factor === "admin" ? "Lordaeron Admin" : "Lordaeron";
  const uri = `otpauth://totp/${encodeURIComponent(`${issuer}:${label}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${STEP_SECONDS}`;

  return { secret, qr: await QRCode.toDataURL(uri, { margin: 1, width: 224 }) };
}

/*
 * Checks a code: against the confirmed secret, or, before enrolment, against the pending one, which then becomes the factor (an
 * administrator's here, a game account's in auth.account.totp_secret). A step serves once.
 */
export async function verifyCode(
  factor: Factor,
  id: number,
  code: string,
): Promise<"ok" | "enrolled" | "invalid"> {
  const current = await row(factor, id);
  const confirmed = await confirmedSecret(factor, id);
  const secret = confirmed ?? current?.pending_secret ?? null;

  if (!secret) return "invalid";
  const step = matchStep(secret, code.trim());

  if (step === null || step <= Number(current?.last_step ?? 0))
    return "invalid";

  if (confirmed) {
    await websiteDb.execute(
      `INSERT INTO second_factor (subject, last_step) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_step = VALUES(last_step)`,
      [key(factor, id), step],
    );

    return "ok";
  }

  if (factor === "account")
    await authDb.execute("UPDATE account SET totp_secret = ? WHERE id = ?", [
      secret,
      id,
    ]);
  await websiteDb.execute(
    `UPDATE second_factor SET secret = ?, pending_secret = NULL, pending_at = NULL, enabled_at = NOW(), last_step = ?
       WHERE subject = ?`,
    [factor === "admin" ? secret : null, step, key(factor, id)],
  );

  return "enrolled";
}
