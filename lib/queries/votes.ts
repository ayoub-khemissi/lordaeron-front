import { RowDataPacket, ResultSetHeader } from "mysql2";

import { websiteDb, authDb } from "@/lib/db";

export interface VoteSiteWithStatus {
  id: number;
  name: string;
  slug: string;
  voteUrl: string;
  imageUrl: string | null;
  rewardShards: number;
  cooldownHours: number;
  lastVotedAt: string | null;
  canVote: boolean;
}

export async function getVoteSitesWithStatus(
  accountId: number,
  voterIp?: string | null,
): Promise<VoteSiteWithStatus[]> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT
       vs.id,
       vs.name,
       vs.slug,
       vs.vote_url,
       vs.image_url,
       vs.reward_shards,
       vs.cooldown_hours,
       MAX(vl.created_at) AS last_voted_at
     FROM vote_sites vs
     LEFT JOIN vote_logs vl
       ON vl.site_id = vs.id
       AND vl.account_id = ?
       AND vl.success = 1
     WHERE vs.is_active = 1
     GROUP BY vs.id
     ORDER BY vs.sort_order ASC, vs.id ASC`,
    [accountId],
  );

  // Check IP-based cooldown: last successful vote from this IP on each site
  let ipCooldowns: Map<number, Date> = new Map();

  if (voterIp) {
    const [ipRows] = await websiteDb.execute<RowDataPacket[]>(
      `SELECT site_id, MAX(created_at) AS last_ip_vote
       FROM vote_logs
       WHERE voter_ip = ? AND success = 1
       GROUP BY site_id`,
      [voterIp],
    );

    for (const row of ipRows) {
      ipCooldowns.set(row.site_id, new Date(row.last_ip_vote));
    }
  }

  const now = Date.now();

  return rows.map((row) => {
    const lastVotedAt = row.last_voted_at
      ? new Date(row.last_voted_at).toISOString()
      : null;

    const cooldownMs = row.cooldown_hours * 60 * 60 * 1000;

    // Account-level cooldown
    const lastVoteTime = row.last_voted_at
      ? new Date(row.last_voted_at).getTime()
      : 0;
    const accountCanVote =
      !row.last_voted_at || now - lastVoteTime >= cooldownMs;

    // IP-level cooldown
    const lastIpVote = ipCooldowns.get(row.id);
    const ipCanVote = !lastIpVote || now - lastIpVote.getTime() >= cooldownMs;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      voteUrl: row.vote_url,
      imageUrl: row.image_url || null,
      rewardShards: row.reward_shards,
      cooldownHours: row.cooldown_hours,
      lastVotedAt,
      canVote: accountCanVote && ipCanVote,
    };
  });
}

export async function recordVote(
  accountId: number,
  siteId: number,
  voterIp: string | null,
  success: boolean,
  reason: string | null,
): Promise<void> {
  const connection = await websiteDb.getConnection();

  try {
    await connection.beginTransaction();

    const rewarded = success ? 1 : 0;

    await connection.execute<ResultSetHeader>(
      `INSERT INTO vote_logs (account_id, site_id, voter_ip, success, reason, rewarded)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [accountId, siteId, voterIp, success ? 1 : 0, reason, rewarded],
    );

    if (success) {
      // Get reward amount for this site
      const [siteRows] = await connection.execute<RowDataPacket[]>(
        `SELECT reward_shards FROM vote_sites WHERE id = ?`,
        [siteId],
      );

      if (siteRows.length > 0) {
        const shards = siteRows[0].reward_shards;

        await connection.execute(
          `INSERT INTO soul_shards (account_id, balance)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE balance = balance + ?`,
          [accountId, shards, shards],
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getAccountByUsername(
  username: string,
): Promise<{ id: number; username: string } | null> {
  const [rows] = await authDb.execute<RowDataPacket[]>(
    "SELECT id, username FROM account WHERE username = ?",
    [username.toUpperCase()],
  );

  if (rows.length === 0) return null;

  return { id: rows[0].id, username: rows[0].username };
}

export async function getVoteSiteBySlug(
  slug: string,
): Promise<{ id: number; pingback_key: string; reward_shards: number } | null> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT id, pingback_key, reward_shards FROM vote_sites WHERE slug = ? AND is_active = 1",
    [slug],
  );

  if (rows.length === 0) return null;

  return rows[0] as { id: number; pingback_key: string; reward_shards: number };
}
