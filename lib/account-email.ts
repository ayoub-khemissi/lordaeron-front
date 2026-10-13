import crypto from "crypto";

import { RowDataPacket } from "mysql2";

import { authDb, websiteDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { emailLocale, SITE_URL } from "@/lib/email-templates/layout";
import {
  emailChangedNotice,
  emailChangeEmail,
  secondFactorNotice,
  welcomeEmail,
} from "@/lib/email-templates/account";

/*
 * The account's e-mail address and the player's e-mail choices (Ayoub, 13/10/2026; sql/account_email.sql):
 * - the address is required at signup and confirmed by a link (welcome e-mail); an account without one is asked for it on its
 *   page; a new address applies only once its link is opened, and the old address is told;
 * - the news consent (the box at signup, unchecked; the account page; the one-click unsubscribe) is logged with its date, the
 *   version of the text and where it was given (GDPR art. 7: the proof of consent). News go only to confirmed addresses.
 * - e-mails are written in the account's language (kept at signup, updated when the player acts on the account page).
 */

// the text the player agreed to: change the version whenever the wording of the box changes (messages emailPrefs.consent)
export const NEWS_CONSENT_VERSION = "news-2026-10-13";
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const VERIFY_HOURS = 48;
const CHANGE_HOURS = 24;

export type ConsentSource = "signup" | "account" | "unsubscribe";

export interface EmailPreferences {
  locale: string;
  emailVerified: boolean;
  newsConsent: boolean;
  newsConsentAt: string | null;
}

const hash = (raw: string) =>
  crypto.createHash("sha256").update(raw).digest("hex");

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const value = email.trim();

  return value.length <= 254 && EMAIL_PATTERN.test(value) ? value : null;
}

export async function ensurePreferences(accountId: number, locale: string) {
  await websiteDb.execute(
    "INSERT IGNORE INTO account_preferences (account_id, locale) VALUES (?, ?)",
    [accountId, emailLocale(locale)],
  );
}

export async function setPreferredLocale(accountId: number, locale: string) {
  await ensurePreferences(accountId, locale);
  await websiteDb.execute(
    "UPDATE account_preferences SET locale = ? WHERE account_id = ?",
    [emailLocale(locale), accountId],
  );
}

export async function getPreferences(
  accountId: number,
): Promise<EmailPreferences> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT locale, email_verified_at, news_consent, news_consent_at FROM account_preferences WHERE account_id = ?",
    [accountId],
  );
  const row = rows[0];

  return {
    locale: row?.locale ?? "en",
    emailVerified: !!row?.email_verified_at,
    newsConsent: !!row?.news_consent,
    newsConsentAt: row?.news_consent_at
      ? new Date(row.news_consent_at).toISOString()
      : null,
  };
}

export async function setNewsConsent(
  accountId: number,
  consent: boolean,
  source: ConsentSource,
  ip: string | null,
) {
  await ensurePreferences(accountId, "en");
  await websiteDb.execute(
    "UPDATE account_preferences SET news_consent = ?, news_consent_at = NOW(), news_consent_version = ?, news_consent_source = ? WHERE account_id = ?",
    [consent ? 1 : 0, NEWS_CONSENT_VERSION, source, accountId],
  );
  await websiteDb.execute(
    "INSERT INTO account_consent_log (account_id, consent, version, source, ip) VALUES (?, ?, ?, ?, ?)",
    [accountId, consent ? 1 : 0, NEWS_CONSENT_VERSION, source, ip],
  );
}

async function account(accountId: number) {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT id, username, email FROM account WHERE id = ?",
    [accountId],
  );

  return rows[0] as
    | { id: number; username: string; email: string | null }
    | undefined;
}

// a display name for the e-mails: the account name as the player typed it is not kept, so the capitalized one
const displayName = (username: string) =>
  username.charAt(0) + username.slice(1).toLowerCase();

async function createToken(
  accountId: number,
  kind: "verify" | "change",
  email: string,
  locale: string,
  hours: number,
): Promise<string | "rateLimited"> {
  const [recent] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT id FROM account_email_tokens WHERE account_id = ? AND created_at > NOW() - INTERVAL 60 SECOND",
    [accountId],
  );

  if (recent.length) return "rateLimited";
  // one link at a time: the older ones of this kind stop working
  await websiteDb.execute(
    "UPDATE account_email_tokens SET used_at = NOW() WHERE account_id = ? AND kind = ? AND used_at IS NULL",
    [accountId, kind],
  );
  const raw = crypto.randomBytes(32).toString("hex");

  await websiteDb.execute(
    "INSERT INTO account_email_tokens (account_id, token_hash, kind, email, locale, expires_at) VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL ? HOUR)",
    [accountId, hash(raw), kind, email, emailLocale(locale), hours],
  );

  return raw;
}

const confirmUrl = (locale: string, raw: string) =>
  `${SITE_URL}/${emailLocale(locale)}/confirm-email?token=${raw}`;
const accountUrl = (locale: string) =>
  `${SITE_URL}/${emailLocale(locale)}/account`;

// the welcome e-mail with the link confirming the address given at signup (or a new link from the account page)
export async function sendVerification(
  accountId: number,
  locale: string,
): Promise<"sent" | "rateLimited" | "noEmail" | "verified"> {
  const acc = await account(accountId);

  if (!acc?.email) return "noEmail";
  if ((await getPreferences(accountId)).emailVerified) return "verified";
  const raw = await createToken(
    accountId,
    "verify",
    acc.email,
    locale,
    VERIFY_HOURS,
  );

  if (raw === "rateLimited") return raw;
  const mail = welcomeEmail(
    locale,
    displayName(acc.username),
    confirmUrl(locale, raw),
  );

  await sendEmail({ to: acc.email, ...mail });

  return "sent";
}

// a new address (or the first one of an old account): applied only once its link is opened
export async function requestEmailChange(
  accountId: number,
  newEmail: string,
  locale: string,
): Promise<"sent" | "rateLimited" | "same"> {
  const acc = await account(accountId);

  if (!acc) throw new Error("no account");
  if (acc.email && acc.email.toLowerCase() === newEmail.toLowerCase())
    return "same";
  const raw = await createToken(
    accountId,
    "change",
    newEmail,
    locale,
    CHANGE_HOURS,
  );

  if (raw === "rateLimited") return raw;
  const mail = emailChangeEmail(
    locale,
    displayName(acc.username),
    newEmail,
    confirmUrl(locale, raw),
  );

  await sendEmail({ to: newEmail, ...mail });

  return "sent";
}

// a link opened: the address confirmed, or the new address in place (and the old one told)
export async function confirmEmailToken(
  raw: string,
): Promise<{ kind: "verify" | "change"; locale: string } | null> {
  if (!/^[0-9a-f]{64}$/.test(raw)) return null;
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT id, account_id, kind, email, locale FROM account_email_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()",
    [hash(raw)],
  );
  const token = rows[0];

  if (!token) return null;
  // used once: whoever opens it second gets nothing
  const [claim] = await websiteDb.execute(
    "UPDATE account_email_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL",
    [token.id],
  );

  if ((claim as { affectedRows: number }).affectedRows !== 1) return null;
  const acc = await account(token.account_id);

  if (!acc) return null;
  await ensurePreferences(acc.id, token.locale);

  if (token.kind === "verify") {
    // the address may have changed since the link was sent
    if ((acc.email ?? "").toLowerCase() !== token.email.toLowerCase())
      return null;
  } else {
    const oldEmail = acc.email;

    await authDb.execute("UPDATE account SET email = ? WHERE id = ?", [
      token.email,
      acc.id,
    ]);
    if (oldEmail && oldEmail.toLowerCase() !== token.email.toLowerCase()) {
      const prefs = await getPreferences(acc.id);
      const notice = emailChangedNotice(
        prefs.locale,
        displayName(acc.username),
        token.email,
        accountUrl(prefs.locale),
      );

      await sendEmail({ to: oldEmail, ...notice }).catch((error) =>
        console.error("Old address notice:", error),
      );
    }
  }
  await websiteDb.execute(
    "UPDATE account_preferences SET email_verified_at = NOW() WHERE account_id = ?",
    [acc.id],
  );

  return { kind: token.kind, locale: token.locale };
}

// the account's address and the change waiting for its link (the account page)
export async function emailState(accountId: number) {
  const acc = await account(accountId);
  const prefs = await getPreferences(accountId);
  const [pending] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT email FROM account_email_tokens WHERE account_id = ? AND kind = 'change' AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
    [accountId],
  );

  return {
    email: acc?.email || null,
    emailVerified: prefs.emailVerified,
    pendingEmail: (pending[0]?.email as string | undefined) ?? null,
    newsConsent: prefs.newsConsent,
    newsConsentAt: prefs.newsConsentAt,
  };
}

// the security notice of the second factor, to the account's address (never blocks the action)
export async function notifySecondFactor(accountId: number, enabled: boolean) {
  try {
    const acc = await account(accountId);

    if (!acc?.email) return;
    const prefs = await getPreferences(accountId);
    const mail = secondFactorNotice(
      prefs.locale,
      displayName(acc.username),
      enabled,
      accountUrl(prefs.locale),
    );

    await sendEmail({ to: acc.email, ...mail });
  } catch (error) {
    console.error("Second factor notice:", error);
  }
}

// ---------- the one-click unsubscribe of news e-mails (signed, no session needed) ----------
function unsubscribeSignature(accountId: number) {
  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error("JWT_SECRET is not set");

  return crypto
    .createHmac("sha256", secret)
    .update(`unsubscribe:${accountId}`)
    .digest("base64url")
    .slice(0, 32);
}

export function unsubscribeUrl(accountId: number) {
  return `${SITE_URL}/api/email/unsubscribe?u=${accountId}&t=${unsubscribeSignature(accountId)}`;
}

export function verifyUnsubscribe(u: unknown, t: unknown): number | null {
  const id = Number(u);

  if (!Number.isInteger(id) || id <= 0 || typeof t !== "string") return null;
  const expected = unsubscribeSignature(id);

  const encoder = new TextEncoder();

  return t.length === expected.length &&
    crypto.timingSafeEqual(encoder.encode(t), encoder.encode(expected))
    ? id
    : null;
}
