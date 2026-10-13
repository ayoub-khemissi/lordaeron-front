/*
 * The text of a name search (the armory, the guilds), the same in the browser and on the server: a character's name is letters only
 * (spaces, digits and signs dropped, 12 at most); a guild's name letters and single spaces (24 at most). Case and accents are the
 * database's business (lib/queries/realm-search.ts).
 */
export type SearchKind = "character" | "guild";

export const SEARCH_MIN = 2;

export function searchText(text: string, kind: SearchKind): string {
  const nfc = text.normalize("NFC");

  if (kind === "character") return nfc.replace(/[^\p{L}]/gu, "").slice(0, 12);

  return nfc
    .replace(/[^\p{L} ]/gu, "")
    .replace(/ +/g, " ")
    .trimStart()
    .slice(0, 24)
    .trimEnd();
}
