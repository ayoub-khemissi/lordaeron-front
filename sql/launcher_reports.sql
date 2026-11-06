-- Lumenveil spots reported from the launcher (Ayoub, 06/11/2026): a player presses Ctrl+F5 in the game where something looks wrong,
-- then sends that spot from the launcher's Graphics > Reports tab with a few words (app/api/launcher/reports). Kept here as the history;
-- scripts/launcher-reports.py posts each new one to the private Discord channel #lumenveil-reports. Re-runnable.

CREATE TABLE IF NOT EXISTS launcher_reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NOT NULL,
  -- a random id of the launcher's installation: the limits and the player's own history go by it
  install_id CHAR(32) NOT NULL,
  account_name VARCHAR(32) NULL,
  realm VARCHAR(16) NULL,
  language VARCHAR(8) NULL,
  launcher_version VARCHAR(16) NOT NULL,
  lumenveil_version VARCHAR(16) NULL,
  -- the spot as CoAVolFog-spots.txt has it, and its look settings (CoAVolFog-spots\spot-NNN.ini)
  spot_number INT UNSIGNED NULL,
  spot_saved VARCHAR(32) NULL,
  spot TEXT NOT NULL,
  settings MEDIUMTEXT NULL,
  message TEXT NOT NULL,
  -- the screenshot's file in LAUNCHER_REPORTS_DIR (not served), null without one
  screenshot VARCHAR(64) NULL,
  discord_message_id VARCHAR(24) NULL,
  KEY install_created (install_id, created_at),
  KEY ip_created (ip, created_at),
  KEY unposted (discord_message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
