import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { websiteDb } from "@/lib/db";
import { getCharactersByAccount } from "@/lib/queries/characters";
import { REALMS, type RealmSlug } from "@/lib/realms";
import { isEnrolled } from "@/lib/second-factor";
import { sendItem } from "@/lib/soap";

/*
 * The second factor's reward (Ayoub, 13/10/2026): a game account that protects itself with an authenticator app receives the Core Hound
 * Pup (item 49646, Blizzard's own reward for an authenticator in 3.3) once ever, by in-game mail to one of its characters on the realm it
 * chooses (sql/second_factor_reward.sql). Removing and adding the factor again gives nothing more.
 * One delivery at a time: a claim takes the row (available or failed, or a delivery stuck for 2 minutes) before the mail is sent; claimed
 * only once the mail went out, failed otherwise (the player retries).
 */

export const REWARD_ITEM = 49646;
const STUCK_MINUTES = 2;

export type RewardStatus = "available" | "sending" | "failed" | "claimed";

export async function rewardState(accountId: number): Promise<{
  status: RewardStatus;
  realm: string | null;
  characterName: string | null;
}> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT status, realm, character_name FROM second_factor_reward WHERE account_id = ?",
    [accountId],
  );
  const row = rows[0];

  return {
    status: (row?.status as RewardStatus) ?? "available",
    realm: row?.realm ?? null,
    characterName: row?.character_name ?? null,
  };
}

export type ClaimResult =
  | "claimed"
  | "notEnrolled"
  | "alreadyClaimed"
  | "inProgress"
  | "characterNotFound"
  | "deliveryFailed";

export async function claimReward(
  accountId: number,
  realm: RealmSlug,
  characterGuid: number,
): Promise<ClaimResult> {
  // the reward of an account protected now
  if (!(await isEnrolled("account", accountId))) return "notEnrolled";

  const character = (await getCharactersByAccount(accountId, realm)).find(
    (c) => c.guid === characterGuid,
  );

  if (!character) return "characterNotFound";

  await websiteDb.execute(
    "INSERT IGNORE INTO second_factor_reward (account_id) VALUES (?)",
    [accountId],
  );
  // take the delivery: one at a time, never after a success
  const [taken] = await websiteDb.execute<ResultSetHeader>(
    `UPDATE second_factor_reward
        SET status = 'sending', started_at = NOW(), realm = ?, character_guid = ?, character_name = ?
      WHERE account_id = ?
        AND (status IN ('available', 'failed') OR (status = 'sending' AND started_at < NOW() - INTERVAL ${STUCK_MINUTES} MINUTE))`,
    [realm, character.guid, character.name, accountId],
  );

  if (taken.affectedRows !== 1) {
    const { status } = await rewardState(accountId);

    return status === "claimed" ? "alreadyClaimed" : "inProgress";
  }

  const sent = await sendItem(
    character.name,
    `${REALMS[realm].name} - Account protected`,
    "Thank you for protecting your account with an authenticator. Your Core Hound Pup will keep you company!",
    REWARD_ITEM,
    1,
    realm,
  ).catch(() => ({ success: false, message: "SOAP unreachable" }));

  await websiteDb.execute(
    `UPDATE second_factor_reward SET status = ?, claimed_at = IF(? = 'claimed', NOW(), NULL) WHERE account_id = ?`,
    [
      sent.success ? "claimed" : "failed",
      sent.success ? "claimed" : "failed",
      accountId,
    ],
  );
  if (!sent.success)
    console.error("Second factor reward delivery failed:", sent.message);

  return sent.success ? "claimed" : "deliveryFailed";
}
