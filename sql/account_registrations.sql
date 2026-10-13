-- Accounts created on the website, with the IP they came from (Ayoub, 13/10/2026, before Rimeheart's name reservation): at most
-- 3 accounts per IP per 24 hours (app/api/auth/register). Re-runnable.
CREATE TABLE IF NOT EXISTS account_registrations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  ip VARCHAR(45) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ip_created (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
