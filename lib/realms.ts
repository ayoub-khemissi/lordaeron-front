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
  | "guilds"
  | "pvp"
  | "hall-of-fame"
  | "population"
  | "black-market"
  | "realm-firsts"
  | "calendar"
  | "progression"
  | "shop";

export interface RealmInfo {
  slug: RealmSlug;
  // the game realm (auth.realmlist.id)
  realmId: number;
  name: string;
  // open: playable and its shop sells; soon: shown, the shop's catalogue visible but purchases closed. A realm with a launchAt opens by
  // itself at that instant (realmAt): read the status through realmAt / realmView / useRealm, never from REALMS directly
  status: "open" | "soon";
  sections: RealmSection[];
  // the realm's colors on the portal and its pages
  accent: "gold" | "ice";
  // an administrator's view of it (realmView): everything open, as on its opening day
  preview?: boolean;
  // its opening, an instant in UTC (shown in Paris time with UTC beside it, see lib/launch.ts); "soon" becomes "open" at that instant
  launchAt?: string;
  // before its opening, the name reservation (an instant in UTC): its players log in, create their characters and keep their names,
  // the world stays closed until launchAt (the core's gate) and so does the shop
  reservationAt?: string;
  // computed (realmAt): the name reservation runs now (status still "soon")
  reservation?: boolean;
  // a progressive realm (phases): its shop follows its phase and its realm firsts (lib/realm-unlocks.ts)
  progressive?: boolean;
}

export const ALL_SECTIONS: RealmSection[] = [
  "home",
  "how-to",
  "features",
  "epic-progression",
  "raid-scaling",
  "armory",
  "guilds",
  "pvp",
  "hall-of-fame",
  "population",
  "black-market",
  "realm-firsts",
  "calendar",
  "progression",
  "shop",
];

// the sections only a progressive realm has (its WotLK+ systems: Zar'haam's black market), even in an administrator's view
const PROGRESSIVE_SECTIONS: RealmSection[] = ["black-market"];

// set (not httpOnly) beside the admin session so the pages know to show the administrators' view; the server checks the session itself
export const ADMIN_PREVIEW_COOKIE = "lordaeron_admin_preview";

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
      "guilds",
      "pvp",
      "hall-of-fame",
      "population",
      "realm-firsts",
      "calendar",
      "progression",
      "shop",
    ],
    accent: "gold",
  },
  rimeheart: {
    slug: "rimeheart",
    // its own row in auth.realmlist, its own worldserver and databases (lib/realms-server.ts)
    realmId: Number(process.env.RIMEHEART_REALM_ID || 4),
    name: "Rimeheart",
    status: "soon",
    // Ayoub, 10/10/2026: opens on 16 October 2026 at 19:00 Paris time (CEST, UTC+2); the site switches by itself (realmAt)
    launchAt: "2026-10-16T17:00:00Z",
    // Ayoub, 13/10/2026: the names are reserved from Wednesday 14 October 2026, 19:00 Paris time
    reservationAt: "2026-10-14T17:00:00Z",
    // features: its long showcase ("Discover the realm", 13/10/2026), its home being the realm-home template's
    sections: [
      "home",
      "how-to",
      "features",
      "armory",
      "guilds",
      "pvp",
      "hall-of-fame",
      "population",
      "black-market",
      "realm-firsts",
      "calendar",
      "progression",
      "shop",
    ],
    accent: "ice",
    progressive: true,
  },
};

export const DEFAULT_REALM: RealmSlug = "lordaeron";

// what an administrator sees of a realm (Ayoub, 09/10/2026: to build a realm's site as if it were open): every section, its shop selling
const PREVIEWS = Object.fromEntries(
  Object.values(REALMS).map((realm) => [
    realm.slug,
    {
      ...realm,
      status: "open",
      sections: ALL_SECTIONS.filter(
        (s) => realm.progressive || !PROGRESSIVE_SECTIONS.includes(s),
      ),
      preview: true,
    },
  ]),
) as Record<RealmSlug, RealmInfo>;

// whether a realm is open at `now` (Ayoub, 13/10/2026: Rimeheart opens by itself at 19:00, no rebuild nor restart): its status, or its
// opening reached. `now` 0 reads the configured status alone (the browser before its first render, lib/realm-context.tsx useLaunchClock)
export function isRealmOpen(realm: RealmInfo, now: number = Date.now()) {
  return (
    realm.status === "open" ||
    (!!realm.launchAt && now > 0 && now >= Date.parse(realm.launchAt))
  );
}

// whether a realm not open yet takes its name reservations at `now` (reservationAt reached, launchAt not)
export function isReservationOpen(realm: RealmInfo, now: number = Date.now()) {
  return (
    !isRealmOpen(realm, now) &&
    !!realm.reservationAt &&
    now > 0 &&
    now >= Date.parse(realm.reservationAt)
  );
}

// the realm as it is at `now`: soon, its name reservation (status "soon", reservation true), open from its opening on
export function realmAt(slug: RealmSlug, now: number = Date.now()): RealmInfo {
  const realm = REALMS[slug];

  if (realm.status !== "open" && isRealmOpen(realm, now))
    return { ...realm, status: "open" };
  if (isReservationOpen(realm, now)) return { ...realm, reservation: true };

  return realm;
}

// the realm as a visitor sees it at `now`: an administrator's preview opens everything
export function realmView(
  slug: RealmSlug,
  preview: boolean,
  now: number = Date.now(),
): RealmInfo {
  return preview ? PREVIEWS[slug] : realmAt(slug, now);
}

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

// the realm of a recorded purchase (shop_purchases.realm_id), Lordaeron's for an unknown id
export function realmSlugById(realmId: number | null | undefined): RealmSlug {
  return (realmId != null && realmById(realmId)?.slug) || DEFAULT_REALM;
}

// the signup page for a realm (Ayoub, 13/10/2026): ?realm= gives it the realm's name and its how-to as the next step (app/[locale]/register)
export function registerPath(locale: string, slug?: RealmSlug | null) {
  return slug && slug !== DEFAULT_REALM
    ? `/${locale}/register?realm=${slug}`
    : `/${locale}/register`;
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
