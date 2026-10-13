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
