-- The second factor's reward (Ayoub, 13/10/2026): a game account that protects itself with an authenticator app receives the Core Hound
-- Pup (item 49646, Blizzard's own reward for an authenticator in 3.3) once ever, by in-game mail to the character it chooses, even if it
-- removes and adds the factor again. lib/second-factor-reward.ts. Re-runnable.

CREATE TABLE IF NOT EXISTS second_factor_reward (
  account_id INT UNSIGNED NOT NULL PRIMARY KEY,
  -- available: never sent; sending: a delivery in progress (taken over after 2 minutes); failed: the last delivery failed, retry;
  -- claimed: delivered, never again
  status ENUM('available', 'sending', 'failed', 'claimed') NOT NULL DEFAULT 'available',
  realm VARCHAR(16) NULL,
  character_guid INT UNSIGNED NULL,
  character_name VARCHAR(12) NULL,
  started_at TIMESTAMP NULL,
  claimed_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Since 13/10/2026 (Ayoub: the characters created before and after): every character of a protected account receives the pup, on every
-- realm, automatically (lib/second-factor-reward.ts deliverRewards, cron app/api/shop/cron/second-factor-rewards). One row per realm and
-- character, never sent twice; the table above is kept for history only.
CREATE TABLE IF NOT EXISTS second_factor_reward_character (
  realm VARCHAR(16) NOT NULL,
  character_guid INT UNSIGNED NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  character_name VARCHAR(12) NOT NULL,
  -- sending: a delivery in progress (taken over after 2 minutes); failed: retried by the next run (10 attempts at most); sent: never again
  status ENUM('sending', 'failed', 'sent') NOT NULL,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  started_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  PRIMARY KEY (realm, character_guid),
  KEY idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- a pup claimed the earlier way stays delivered to its character
INSERT IGNORE INTO second_factor_reward_character (realm, character_guid, account_id, character_name, status, attempts, sent_at)
SELECT realm, character_guid, account_id, character_name, 'sent', 1, claimed_at FROM second_factor_reward
 WHERE status = 'claimed' AND realm IS NOT NULL AND character_guid IS NOT NULL AND character_name IS NOT NULL;
