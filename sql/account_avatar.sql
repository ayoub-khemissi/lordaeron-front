-- The icon a player chose as the avatar of its account (Ayoub, 18/10/2026): one of the site's list (lib/avatars.ts), shown in the
-- navigation bar and on the account page; "" the account's initial, chosen. No row: a random one is given (lib/queries/avatar.ts).
-- Re-runnable.
CREATE TABLE IF NOT EXISTS account_avatars (
  account_id INT UNSIGNED NOT NULL PRIMARY KEY,
  icon VARCHAR(64) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
