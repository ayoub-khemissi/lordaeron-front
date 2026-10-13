-- The account's e-mail address and the player's choices about e-mail (Ayoub, 13/10/2026). Re-runnable.
--
-- account_preferences: one row per game account (auth.account.id). The address itself stays in auth.account.email, where the
--   site already reads it; this keeps when it was confirmed, the language e-mails are written in, and the news consent.
-- account_consent_log: every change of the news consent, for the proof the GDPR asks for (who, when, which text, from where).
-- account_email_tokens: the links e-mailed to confirm an address (the one given at signup, or a new one); only a hash is stored,
--   a link opens once, before it expires.

CREATE TABLE IF NOT EXISTS account_preferences (
  account_id INT UNSIGNED NOT NULL PRIMARY KEY,
  locale VARCHAR(5) NOT NULL DEFAULT 'en',
  email_verified_at DATETIME NULL,
  news_consent TINYINT(1) NOT NULL DEFAULT 0,
  news_consent_at DATETIME NULL,
  news_consent_version VARCHAR(32) NULL,
  news_consent_source VARCHAR(16) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_consent_log (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  consent TINYINT(1) NOT NULL,
  version VARCHAR(32) NOT NULL,
  source VARCHAR(16) NOT NULL,
  ip VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_account (account_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS account_email_tokens (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  -- verify: the address the account already has; change: a new address, applied when its link is opened
  kind ENUM('verify', 'change') NOT NULL,
  email VARCHAR(255) NOT NULL,
  locale VARCHAR(5) NOT NULL DEFAULT 'en',
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_token (token_hash),
  KEY idx_account (account_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
