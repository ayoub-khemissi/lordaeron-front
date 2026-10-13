import { verifyAdminSession } from "@/lib/admin-auth";

/*
 * What the armory's and the guilds' queries share (Ayoub, 13/10/2026: one real search for both):
 * - names compared case and accent insensitively (the name columns are utf8mb4_bin: "redos" finds "Redös");
 * - the found ones ranked: the exact name, then the names starting with the text, then the others containing it;
 * - the game masters' characters hidden from the public, shown to a site administrator whose second factor is verified (decided on
 *   the server from the admin session, never from the request) with a "gm" flag;
 * - pages of PAGE_SIZE.
 */

export const PAGE_SIZE = 20;

// a name column compared without case nor accents
export const ci = (column: string) => `${column} COLLATE utf8mb4_unicode_ci`;

// a search's text as a LIKE pattern: its own % and _ taken literally
export const likeEscape = (text: string) =>
  text.replace(/[\\%_]/g, (c) => `\\${c}`);

// the "contains" pattern of a search
export const containsPattern = (text: string) => `%${likeEscape(text)}%`;

// ORDER BY the exact name, then the prefix; its parameters follow the query's own
export const nameRank = (column: string) =>
  `${ci(column)} = ? DESC, ${ci(column)} LIKE ? DESC`;
export const nameRankParams = (text: string) => [text, `${likeEscape(text)}%`];

const GM_ACCOUNTS =
  "SELECT AccountID FROM auth.account_access WHERE SecurityLevel >= 1";

// the condition hiding the game masters' characters (empty for an administrator)
export const hideGm = (accountColumn: string, showGm: boolean) =>
  showGm ? "" : `AND ${accountColumn} NOT IN (${GM_ACCOUNTS})`;

// whether an account is a game master's (a condition)
export const isGm = (accountColumn: string) =>
  `${accountColumn} IN (${GM_ACCOUNTS})`;

// whether a character belongs to a game master (a column for the administrators' view)
export const gmColumn = (accountColumn: string) =>
  `(${isGm(accountColumn)}) AS gm`;

// a page number from a request (?page=), 1 at least
export const pageParam = (value: string | null) =>
  Math.max(1, Math.floor(Number(value) || 1));

// a site administrator with the second factor: sees the game masters' characters
export async function viewerSeesGm(): Promise<boolean> {
  return !!(await verifyAdminSession().catch(() => null));
}
