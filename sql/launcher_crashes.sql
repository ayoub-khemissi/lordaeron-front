-- Game crash reports sent by the launcher (Ayoub, 19/11/2026): when the game stops, the launcher sends the new reports of
-- its Errors folder (<date> Error.txt / Crash.txt and their .dmp) on a Lordaeron realm, the player's Windows names masked
-- in the text (app/api/launcher/crashes). Kept here as the history; scripts/launcher-crashes.py posts each new one to the
-- private Discord channel #wow-errors, read with tools/wow-crash-reader. Re-runnable (a database made before 19/11 gets large_address_aware with: ALTER TABLE launcher_crashes ADD COLUMN
-- large_address_aware TINYINT(1) NULL AFTER platform).

CREATE TABLE IF NOT EXISTS launcher_crashes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip VARCHAR(45) NOT NULL,
  -- a random id of the launcher's installation: the limits and the "how many players" count go by it
  install_id CHAR(32) NOT NULL,
  account_name VARCHAR(32) NULL,
  -- the realm chosen in the launcher (the report itself names the one the game was on)
  realm VARCHAR(32) NULL,
  language VARCHAR(8) NULL,
  launcher_version VARCHAR(16) NOT NULL,
  lumenveil_version VARCHAR(16) NULL,
  platform VARCHAR(16) NULL,
  -- whether Wow.exe may use 4 GB of memory (large address aware; the launcher sets it from 0.1.39), when it said
  large_address_aware TINYINT(1) NULL,
  -- the report's name in the Errors folder, without .txt: "2026-11-19 00.37.28 Error"
  file_name VARCHAR(80) NOT NULL,
  -- its files in LAUNCHER_CRASHES_DIR (not served): <id>.txt, and <id>.dmp when the dump came with it
  report_file VARCHAR(64) NULL,
  dump_file VARCHAR(64) NULL,
  -- the dump's size, also when it was too big to be sent
  dump_size INT UNSIGNED NULL,
  -- what makes two crashes the same one (a known crash's id, else the failing function), set when posted
  signature VARCHAR(191) NULL,
  discord_message_id VARCHAR(24) NULL,
  UNIQUE KEY install_file (install_id, file_name),
  KEY install_created (install_id, created_at),
  KEY ip_created (ip, created_at),
  KEY unposted (discord_message_id),
  KEY signature (signature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
