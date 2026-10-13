import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { authDb, websiteDb } from "@/lib/db";
import { REALM_SLUGS, REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb } from "@/lib/realms-server";
import { sendItem } from "@/lib/soap";

/*
 * The second factor's reward (Ayoub, 13/10/2026), as Blizzard gave it for an authenticator in 3.3: every character of a protected game
 * account (auth.account.totp_secret set) receives the Core Hound Pup (item 49646, a bound companion) by in-game mail, on every realm,
 * the characters there when the player enrols and the ones created afterwards, while the account stays protected. A character served
 * keeps it if the factor is removed; none is ever served twice (sql/second_factor_reward.sql, one row per realm and character).
 * Deliveries: right after an enrolment (that account), and every 5 minutes for every protected account (app/api/shop/cron/
 * second-factor-rewards, scripts/shop-cron.sh). A delivery takes its row first (a new row, a failed one, or one stuck "sending" for
 * 2 minutes), then marks it sent or failed; a failed one is retried by the next run, up to MAX_ATTEMPTS.
 */

export const REWARD_ITEM = 49646;
const STUCK_MINUTES = 2;
const MAX_ATTEMPTS = 10;
const DEFAULT_LIMIT = 200;

type Candidate = {
  realm: RealmSlug;
  guid: number;
  name: string;
  account: number;
};

async function protectedAccounts(accountId?: number): Promise<number[]> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    accountId
      ? "SELECT id FROM account WHERE id = ? AND totp_secret IS NOT NULL"
      : "SELECT id FROM account WHERE totp_secret IS NOT NULL",
    accountId ? [accountId] : [],
  );

  return rows.map((r) => Number(r.id));
}

// the characters of these accounts on a realm (a deleted character is detached from its account: account = 0)
async function realmCharacters(
  realm: RealmSlug,
  accounts: number[],
): Promise<Candidate[]> {
  if (!accounts.length) return [];
  const [rows] = await realmCharactersDb(realm).query<RowDataPacket[]>(
    "SELECT guid, name, account FROM characters WHERE account IN (?) AND name <> '' ORDER BY guid",
    [accounts],
  );

  return rows.map((r) => ({
    realm,
    guid: Number(r.guid),
    name: String(r.name),
    account: Number(r.account),
  }));
}

// the rows already there for these characters: sent or in progress are skipped, failed ones retried (up to MAX_ATTEMPTS)
async function settled(
  realm: RealmSlug,
  guids: number[],
): Promise<Set<number>> {
  if (!guids.length) return new Set();
  const [rows] = await websiteDb.query<RowDataPacket[]>(
    `SELECT character_guid FROM second_factor_reward_character
      WHERE realm = ? AND character_guid IN (?)
        AND (status = 'sent'
             OR attempts >= ${MAX_ATTEMPTS}
             OR (status = 'sending' AND started_at >= NOW() - INTERVAL ${STUCK_MINUTES} MINUTE))`,
    [realm, guids],
  );

  return new Set(rows.map((r) => Number(r.character_guid)));
}

// takes the character's delivery: true when this run may send it (nobody else is, it was never sent)
async function take(c: Candidate): Promise<boolean> {
  const [inserted] = await websiteDb.execute<ResultSetHeader>(
    `INSERT IGNORE INTO second_factor_reward_character
       (realm, character_guid, account_id, character_name, status, started_at)
     VALUES (?, ?, ?, ?, 'sending', NOW())`,
    [c.realm, c.guid, c.account, c.name],
  );

  if (inserted.affectedRows === 1) return true;
  const [updated] = await websiteDb.execute<ResultSetHeader>(
    `UPDATE second_factor_reward_character
        SET status = 'sending', started_at = NOW(), character_name = ?
      WHERE realm = ? AND character_guid = ? AND attempts < ${MAX_ATTEMPTS}
        AND (status = 'failed' OR (status = 'sending' AND started_at < NOW() - INTERVAL ${STUCK_MINUTES} MINUTE))`,
    [c.name, c.realm, c.guid],
  );

  return updated.affectedRows === 1;
}

async function deliver(c: Candidate): Promise<boolean> {
  const sent = await sendItem(
    c.name,
    `${REALMS[c.realm].name} - Account protected`,
    "Your account is protected by an authenticator. Every one of your characters receives a Core Hound Pup to keep it company!",
    REWARD_ITEM,
    1,
    c.realm,
  ).catch((error) => ({ success: false, message: String(error) }));

  await websiteDb.execute(
    `UPDATE second_factor_reward_character
        SET status = ?, attempts = attempts + 1, sent_at = IF(? = 'sent', NOW(), sent_at)
      WHERE realm = ? AND character_guid = ?`,
    [
      sent.success ? "sent" : "failed",
      sent.success ? "sent" : "failed",
      c.realm,
      c.guid,
    ],
  );
  if (!sent.success)
    console.error(
      `Second factor reward for ${c.name} (${c.realm}) failed:`,
      sent.message,
    );

  return sent.success;
}

export type DeliveryReport = {
  candidates: number;
  sent: number;
  failed: number;
  // a dry run: who would receive it
  wouldSend?: { realm: RealmSlug; name: string; account: number }[];
};

/*
 * Mails the pup to every protected account's characters not served yet (or one account's), at most `limit` mails. A realm that cannot
 * be reached is skipped (its characters wait for the next run). dryRun: lists them, sends nothing.
 */
export async function deliverRewards({
  accountId,
  limit = DEFAULT_LIMIT,
  dryRun = false,
}: {
  accountId?: number;
  limit?: number;
  dryRun?: boolean;
} = {}): Promise<DeliveryReport> {
  const report: DeliveryReport = { candidates: 0, sent: 0, failed: 0 };
  const accounts = await protectedAccounts(accountId);

  if (dryRun) report.wouldSend = [];

  for (const realm of REALM_SLUGS) {
    let characters: Candidate[];

    try {
      characters = await realmCharacters(realm, accounts);
    } catch (error) {
      console.error(`Second factor rewards: ${realm} unreachable:`, error);
      continue;
    }
    const done = await settled(
      realm,
      characters.map((c) => c.guid),
    );
    const due = characters.filter((c) => !done.has(c.guid));

    report.candidates += due.length;
    for (const c of due) {
      if (report.sent + report.failed >= limit) return report;
      if (dryRun) {
        report.wouldSend!.push({ realm, name: c.name, account: c.account });
        continue;
      }
      if (!(await take(c))) continue;
      if (await deliver(c)) report.sent++;
      else report.failed++;
    }
  }

  return report;
}

export type RewardState = {
  // the characters that received it, per realm
  served: { realm: RealmSlug; name: string }[];
  // the account's characters still waiting for it (protected accounts only: the next run serves them)
  waiting: number;
};

export async function rewardState(accountId: number): Promise<RewardState> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT realm, character_name FROM second_factor_reward_character
      WHERE account_id = ? AND status = 'sent' ORDER BY sent_at`,
    [accountId],
  );
  const served = rows
    .filter((r) => (REALM_SLUGS as readonly string[]).includes(r.realm))
    .map((r) => ({
      realm: r.realm as RealmSlug,
      name: String(r.character_name),
    }));
  let waiting = 0;

  if ((await protectedAccounts(accountId)).length) {
    for (const realm of REALM_SLUGS) {
      try {
        const characters = await realmCharacters(realm, [accountId]);
        const done = await settled(
          realm,
          characters.map((c) => c.guid),
        );

        waiting += characters.filter((c) => !done.has(c.guid)).length;
      } catch {
        // a realm out of reach: nothing to count there now
      }
    }
  }

  return { served, waiting };
}
