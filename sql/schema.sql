-- =============================================================================
-- Lordaeron Website — Database Schema (DDL)
-- Database: lordaeron_website
-- =============================================================================

CREATE DATABASE IF NOT EXISTS lordaeron_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lordaeron_website;

-- ── News ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_fr VARCHAR(255) NOT NULL DEFAULT '',
  title_es VARCHAR(255) NOT NULL DEFAULT '',
  title_de VARCHAR(255) NOT NULL DEFAULT '',
  title_it VARCHAR(255) NOT NULL DEFAULT '',
  content_en TEXT NOT NULL,
  content_fr TEXT NOT NULL,
  content_es TEXT NOT NULL,
  content_de TEXT NOT NULL,
  content_it TEXT NOT NULL,
  image_url VARCHAR(512) DEFAULT NULL,
  author_name VARCHAR(100) NOT NULL DEFAULT '',
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Soul Shards ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS soul_shards (
  account_id INT UNSIGNED NOT NULL PRIMARY KEY,
  balance INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Shop Items ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category ENUM('services','bags','heirlooms','transmog','mounts','tabards','pets','toys','consumables') NOT NULL,
  service_type VARCHAR(50) NULL,
  item_id INT UNSIGNED NULL,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL DEFAULT '',
  name_es VARCHAR(255) NOT NULL DEFAULT '',
  name_de VARCHAR(255) NOT NULL DEFAULT '',
  name_it VARCHAR(255) NOT NULL DEFAULT '',
  description_en TEXT,
  description_fr TEXT,
  description_es TEXT,
  description_de TEXT,
  description_it TEXT,
  price INT UNSIGNED NOT NULL,
  discount_percentage TINYINT UNSIGNED NOT NULL DEFAULT 0,
  realm_ids JSON NULL,
  race_ids JSON NULL,
  class_ids JSON NULL,
  faction ENUM('alliance','horde','both') NOT NULL DEFAULT 'both',
  icon_url VARCHAR(512) NULL,
  quality TINYINT UNSIGNED NULL DEFAULT NULL,
  is_highlighted TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_refundable TINYINT(1) NOT NULL DEFAULT 1,
  min_level TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_is_highlighted (is_highlighted),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Transmog Sets ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_sets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255) NOT NULL DEFAULT '',
  name_es VARCHAR(255) NOT NULL DEFAULT '',
  name_de VARCHAR(255) NOT NULL DEFAULT '',
  name_it VARCHAR(255) NOT NULL DEFAULT '',
  description_en TEXT,
  description_fr TEXT,
  description_es TEXT,
  description_de TEXT,
  description_it TEXT,
  price INT UNSIGNED NOT NULL,
  discount_percentage TINYINT UNSIGNED NOT NULL DEFAULT 0,
  class_ids JSON NULL,
  faction ENUM('alliance','horde','both') NOT NULL DEFAULT 'both',
  icon_url VARCHAR(512) NULL,
  is_highlighted TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  min_level TINYINT UNSIGNED NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_is_highlighted (is_highlighted),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Transmog Set Items ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_set_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  set_id INT UNSIGNED NOT NULL,
  item_id INT UNSIGNED NOT NULL,
  name_en VARCHAR(255) NOT NULL DEFAULT '',
  name_fr VARCHAR(255) NOT NULL DEFAULT '',
  name_es VARCHAR(255) NOT NULL DEFAULT '',
  name_de VARCHAR(255) NOT NULL DEFAULT '',
  name_it VARCHAR(255) NOT NULL DEFAULT '',
  icon_url VARCHAR(512) NULL,
  quality TINYINT UNSIGNED NULL DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_set_item_set FOREIGN KEY (set_id) REFERENCES shop_sets(id) ON DELETE CASCADE,
  INDEX idx_set_id (set_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Shop Purchases ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_purchases (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  item_id_ref INT UNSIGNED NULL,
  character_guid INT UNSIGNED NOT NULL,
  character_name VARCHAR(50) NOT NULL,
  realm_id INT UNSIGNED NOT NULL,
  is_gift TINYINT(1) NOT NULL DEFAULT 0,
  gift_to_character_name VARCHAR(50) NULL,
  gift_message TEXT NULL,
  price_paid INT UNSIGNED NOT NULL,
  original_price INT UNSIGNED NOT NULL,
  discount_applied TINYINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('completed','refunded','pending_refund','pending_delivery','cancelled') NOT NULL DEFAULT 'completed',
  wow_item_id INT UNSIGNED NULL,
  service_type VARCHAR(50) NULL,
  set_id_ref INT UNSIGNED NULL,
  refunded_at TIMESTAMP NULL,
  refunded_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_account_id (account_id),
  INDEX idx_item_id_ref (item_id_ref),
  INDEX idx_set_id_ref (set_id_ref),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_purchase_item FOREIGN KEY (item_id_ref) REFERENCES shop_items(id),
  CONSTRAINT fk_purchase_set FOREIGN KEY (set_id_ref) REFERENCES shop_sets(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Shop Admins ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role ENUM('admin','super_admin') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Shop Bans ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_bans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  reason TEXT NOT NULL,
  banned_by INT UNSIGNED NOT NULL,
  expires_at TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_account_id (account_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Shop Audit Log ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_audit_log (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT UNSIGNED NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Shard Transactions (Stripe) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shard_transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  stripe_checkout_session_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255) NULL UNIQUE,
  package_shards INT UNSIGNED NOT NULL,
  price_eur_cents INT UNSIGNED NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'eur',
  status ENUM('pending','completed','failed','expired','refunded') NOT NULL DEFAULT 'pending',
  credited_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_account_id (account_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Contact Messages ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_account_id (account_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Password Reset Tokens ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id    INT UNSIGNED NOT NULL,
  token_hash    VARCHAR(64)  NOT NULL,      -- SHA-256 du token brut
  email         VARCHAR(255) NOT NULL,
  locale        VARCHAR(5)   NOT NULL DEFAULT 'en',
  is_used       TINYINT(1)   NOT NULL DEFAULT 0,
  expires_at    TIMESTAMP    NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_token_hash (token_hash),
  INDEX idx_account_id (account_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Vote Sites ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vote_sites (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  vote_url VARCHAR(512) NOT NULL,
  image_url VARCHAR(512) NULL,
  pingback_key VARCHAR(255) NOT NULL,
  reward_shards INT UNSIGNED NOT NULL DEFAULT 10,
  cooldown_hours INT UNSIGNED NOT NULL DEFAULT 12,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Vote Logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vote_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  account_id INT UNSIGNED NOT NULL,
  site_id INT UNSIGNED NOT NULL,
  voter_ip VARCHAR(45) NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  reason VARCHAR(255) NULL,
  rewarded TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_account_site (account_id, site_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_vote_log_site FOREIGN KEY (site_id) REFERENCES vote_sites(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
