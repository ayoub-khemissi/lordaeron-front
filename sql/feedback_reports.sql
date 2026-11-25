-- Players' feedback from Discord (Ayoub, 25/11/2026): the bug-report and suggestion channels of both realms, collected by
-- scripts/feedback/collect.mjs (each run of scripts/feedback/run.sh), qualified and handled by Claude (bugs fixed and queued for the
-- 06:00 update), the suggestions decided by Ayoub on the admin page /admin/feedback. Re-runnable.

CREATE TABLE IF NOT EXISTS feedback_reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  realm ENUM('lordaeron','rimeheart') NOT NULL,
  -- the channel's kind; Claude may reclassify (a "bug" that is a suggestion, and the reverse)
  channel_kind ENUM('bug','suggestion') NOT NULL,
  kind ENUM('bug','suggestion','question','other') NOT NULL,
  channel_id VARCHAR(24) NOT NULL,
  -- the report's first message; its follow-ups (same author within 15 min, replies to it) join it
  first_message_id VARCHAR(24) NOT NULL,
  last_message_id VARCHAR(24) NOT NULL,
  author_id VARCHAR(24) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  -- the messages as posted, one block per message: "[time] name: text"
  content MEDIUMTEXT NOT NULL,
  -- [{"file": "<message id>/<n>-<name>", "name": "...", "type": "image/png", "size": 123}] under FEEDBACK_DIR
  attachments JSON NULL,
  reported_at DATETIME NOT NULL,
  status ENUM('new','not_a_bug','needs_info','duplicate','investigating','fix_queued','shipped','awaiting_decision','accepted','rejected','later','in_progress','done','wont_fix','merged','closed') NOT NULL DEFAULT 'new',
  -- 1: new messages joined it after Claude handled it (a player's "still happening"): handled again
  followup TINYINT(1) NOT NULL DEFAULT 0,
  -- Claude's qualification, for Ayoub (French): a short verdict and the details (cause, files, commits, what is left)
  title VARCHAR(255) NULL,
  verdict VARCHAR(255) NULL,
  analysis MEDIUMTEXT NULL,
  -- the answer to post to the player on Discord (English), for Ayoub to copy
  reply_draft TEXT NULL,
  commits VARCHAR(255) NULL,
  duplicate_of INT UNSIGNED NULL,
  -- Ayoub's decision on a suggestion (and his note: what to do, or why not); handled_at: Claude acted on it
  decision ENUM('accepted','rejected','later') NULL,
  decision_note TEXT NULL,
  decided_at DATETIME NULL,
  decision_handled_at DATETIME NULL,
  -- Ayoub posted the reply (or chose not to)
  replied TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY first_message (first_message_id),
  KEY status (status),
  KEY channel_last (channel_id, last_message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- where each channel's reading stopped
CREATE TABLE IF NOT EXISTS feedback_cursor (
  channel_id VARCHAR(24) NOT NULL PRIMARY KEY,
  last_message_id VARCHAR(24) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- each collected message and its report (a reply or a follow-up joins its report)
CREATE TABLE IF NOT EXISTS feedback_messages (
  message_id VARCHAR(24) NOT NULL PRIMARY KEY,
  report_id INT UNSIGNED NOT NULL,
  KEY report (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
