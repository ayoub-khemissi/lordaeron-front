-- Second factor (Ayoub, 13/10/2026, on majaliss's principle): an authenticator app's code (TOTP, RFC 6238: HMAC-SHA1, 6 digits,
-- 30 s, the previous, current and next step accepted, as TrinityCore's authserver does). lib/second-factor.ts.
-- An administrator's (shop_admins) factor lives in this table; a game account's lives in auth.account.totp_secret (raw bytes, asked
-- by the authserver at every game login), this table only keeping its enrolment until the first valid code. Re-runnable.

CREATE TABLE IF NOT EXISTS second_factor (
  -- 'admin:<shop_admins.id>' or 'account:<auth.account.id>'
  subject VARCHAR(32) NOT NULL PRIMARY KEY,
  -- an administrator's confirmed secret (a game account's is auth.account.totp_secret)
  secret VARBINARY(32) NULL,
  -- generated at enrolment, kept until the first valid code
  pending_secret VARBINARY(32) NULL,
  pending_at TIMESTAMP NULL,
  enabled_at TIMESTAMP NULL,
  -- the last time step accepted: a code serves once
  last_step BIGINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed sign-ins and codes, for the lockouts (the website's logins do not go through the authserver's WrongPass):
-- 5 failures of one subject in 15 minutes lock it, 20 from one IP lock the IP
CREATE TABLE IF NOT EXISTS login_failures (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  -- 'login:<USERNAME>', 'admin-login:<username>', 'totp:admin:<id>', 'totp:account:<id>'
  subject VARCHAR(64) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_subject_created (subject, created_at),
  KEY idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
