-- In the auth database (the authserver reads it): the one-time ticket of a launcher's Play (app/api/launcher/ticket), as an
-- SRP6 salt and verifier, never the ticket itself. The authserver's logon challenge uses it instead of the account's for one
-- login within its minute, deletes it, and does not ask for the authenticator code (the launcher's sign-in asked for it).
-- Apply to the auth database: mysql auth < sql/auth_launcher_tickets.sql. Re-runnable.

CREATE TABLE IF NOT EXISTS launcher_tickets (
  account_id INT UNSIGNED NOT NULL PRIMARY KEY,
  salt BINARY(32) NOT NULL,
  verifier BINARY(32) NOT NULL,
  expires_at TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- the website's user replaces (REPLACE: delete then insert) and deletes tickets; it already has SELECT and INSERT on auth.*
GRANT DELETE ON auth.launcher_tickets TO 'lordaeron'@'localhost';
