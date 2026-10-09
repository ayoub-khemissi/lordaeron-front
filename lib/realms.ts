/*
 * The realms of Lordaeron (Ayoub, 09/10/2026: two realms that coexist, each with its own portal): the one place that says what a realm
 * is — its address on the site, its game realm, its databases, the SOAP that delivers its purchases, its client data (DBC) and the
 * sections it has. Adding a realm is adding an entry here.
 *
 * Server-side values (databases, SOAP, DBC folder) come from the environment, with the current machine's values as defaults:
 *   <PREFIX>_DB_WORLD_NAME, <PREFIX>_DB_CHARACTERS_NAME, <PREFIX>_SOAP_HOST, <PREFIX>_SOAP_PORT, <PREFIX>_DBC_DIR
 * (PREFIX: LORDAERON, RIMEHEART). The database host and user are the site's (DB_CHARACTERS_*).
 */

export const REALM_SLUGS = ["lordaeron", "rimeheart"] as const;
export type RealmSlug = (typeof REALM_SLUGS)[number];

// the realm-scoped sections of the site (the account, the login, the vote, news and the legal pages are shared)
export type RealmSection =
  | "home"
  | "how-to"
  | "features"
  | "epic-progression"
  | "raid-scaling"
  | "armory"
  | "shop";

export interface RealmInfo {
  slug: RealmSlug;
  // the game realm (auth.realmlist.id)
  realmId: number;
  name: string;
  // open: playable and its shop sells; soon: shown, the shop's catalogue visible but purchases closed
  status: "open" | "soon";
  sections: RealmSection[];
  // the realm's colors on the portal and its pages
  accent: "gold" | "ice";
}

export const REALMS: Record<RealmSlug, RealmInfo> = {
  lordaeron: {
    slug: "lordaeron",
    realmId: 1,
    name: "Lordaeron",
    status: "open",
    sections: [
      "home",
      "how-to",
      "features",
      "epic-progression",
      "raid-scaling",
      "armory",
      "shop",
    ],
    accent: "gold",
  },
  rimeheart: {
    slug: "rimeheart",
    // the Lab realm until Rimeheart opens on its own server
    realmId: Number(process.env.RIMEHEART_REALM_ID || 3),
    name: "Rimeheart",
    status: "soon",
    // its how-to (the client patch to download) comes with its opening
    sections: ["home", "armory", "shop"],
    accent: "ice",
  },
};

export const DEFAULT_REALM: RealmSlug = "lordaeron";

export function isRealmSlug(
  value: string | undefined | null,
): value is RealmSlug {
  return !!value && (REALM_SLUGS as readonly string[]).includes(value);
}

export function realmHasSection(slug: RealmSlug, section: RealmSection) {
  return REALMS[slug].sections.includes(section);
}

export function realmBySlug(slug: string | undefined | null): RealmInfo | null {
  return isRealmSlug(slug) ? REALMS[slug] : null;
}

export function realmById(realmId: number): RealmInfo | null {
  return Object.values(REALMS).find((r) => r.realmId === realmId) ?? null;
}

// a page of a realm: realmPath("fr", "rimeheart", "/shop/mounts") -> "/fr/rimeheart/shop/mounts"
export function realmPath(locale: string, slug: RealmSlug, path = "") {
  return `/${locale}/${slug}${path === "/" ? "" : path}`;
}

// a shop item or set for a realm: its realm list, or Lordaeron's alone when it has none (every item from before the realms)
export function offeredOnRealm(
  realmIds: number[] | null | undefined,
  slug: RealmSlug,
) {
  return realmIds && realmIds.length
    ? realmIds.includes(REALMS[slug].realmId)
    : slug === DEFAULT_REALM;
}

// the realm a shop request is about (?realm=<slug>), Lordaeron's by default
export function requestRealm(value: string | null | undefined): RealmSlug {
  return isRealmSlug(value) ? value : DEFAULT_REALM;
}
