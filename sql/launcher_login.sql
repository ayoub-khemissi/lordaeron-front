-- The launcher's sign-in (Ayoub, 06/11/2026): a player signs in once in the launcher (password and, when the account has
-- one, its authenticator code: app/api/launcher/login); the launcher keeps a device token, never the password. At each Play
-- it asks for a one-time game ticket (app/api/launcher/ticket); the authserver uses the ticket's verifier for that one login
-- (auth.launcher_tickets, sql/auth_launcher_tickets.sql) and the launcher types the ticket on the game's login screen.
-- Re-runnable.

CREATE TABLE IF NOT EXISTS launcher_devices (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  -- SHA-256 of the token the launcher keeps (in Windows' credential manager); the token itself is never stored here
  token_hash CHAR(64) NOT NULL,
  name VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_ip VARCHAR(45) NOT NULL,
  last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_ip VARCHAR(45) NULL,
  -- signed out, the password changed, or 30 days unused: the token is refused
  revoked_at TIMESTAMP NULL,
  UNIQUE KEY token_hash (token_hash),
  KEY account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- the tickets a device asked for, for its limit (30 an hour)
CREATE TABLE IF NOT EXISTS launcher_ticket_log (
  device_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY device_created (device_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
