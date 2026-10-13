import type { RealmSection, RealmSlug } from "@/lib/realms";

export type SiteConfig = typeof siteConfig;

// a page of the menus (components/navigation): its label and one-line hint (messages nav.* / nav.hints.*), its address inside the realm
// ("realm") or on the site ("shared"), the realm section it needs and the realms it belongs to, a game icon (public/img/nav/<icon>.jpg)
export interface NavEntry {
  key: string;
  labelKey: string;
  hintKey?: string;
  href: string;
  scope: "realm" | "shared";
  section?: RealmSection;
  realms?: RealmSlug[];
  icon?: string;
  comingSoon?: boolean;
}

// the realm's top bar, its burger and its footer column, in this order (Ayoub, 13/10/2026: simple and coherent): dropdown groups,
// then plain links ("highlight": the shop's accent). Adding a tool is one entry in the "tools" group.
export type NavNode =
  | { kind: "group"; key: string; labelKey: string; entries: NavEntry[] }
  | ({ kind: "link"; highlight?: boolean; signedIn?: boolean } & NavEntry);

export const siteConfig = {
  name: "Lordaeron",
  description:
    "Lordaeron — Free-to-play Epic Progressive WoW 3.3.5a private server. Progress from Vanilla through TBC to WotLK with transmog, crossfaction, x5 rates, and more.",
  baseUrl: "https://www.lordaeron.eu",
  tagline: "The Ultimate Epic Progressive WoW Experience",
  // the menus inside a realm (components/navigation/use-navigation.ts): an entry shows when its realm has its section
  navigation: [
    {
      kind: "group",
      key: "play",
      labelKey: "nav.play",
      entries: [
        {
          key: "how-to",
          labelKey: "nav.howTo",
          hintKey: "nav.hints.howTo",
          href: "/how-to",
          scope: "realm",
          section: "how-to",
          icon: "inv_misc_book_09",
        },
        {
          key: "features",
          labelKey: "nav.features",
          hintKey: "nav.hints.features",
          href: "/features",
          scope: "realm",
          section: "features",
          icon: "inv_misc_spyglass_03",
        },
        {
          key: "epic-progression",
          labelKey: "nav.epicProgression",
          hintKey: "nav.hints.epicProgression",
          href: "/epic-progression",
          scope: "realm",
          section: "epic-progression",
          icon: "achievement_level_80",
        },
        {
          key: "phases",
          labelKey: "nav.phases",
          hintKey: "nav.hints.phases",
          href: "/features#phases",
          scope: "realm",
          section: "features",
          realms: ["rimeheart"],
          icon: "spell_frost_frozencore",
        },
      ],
    },
    {
      kind: "group",
      key: "tools",
      labelKey: "nav.tools",
      entries: [
        {
          key: "armory",
          labelKey: "nav.armory",
          hintKey: "nav.hints.armory",
          href: "/armory",
          scope: "realm",
          section: "armory",
          icon: "inv_chest_plate16",
        },
        {
          key: "guilds",
          labelKey: "nav.guilds",
          hintKey: "nav.hints.guilds",
          href: "/guilds",
          scope: "realm",
          section: "guilds",
          icon: "inv_shirt_guildtabard_01",
        },
        {
          key: "pvp",
          labelKey: "nav.pvp",
          hintKey: "nav.hints.pvp",
          href: "/pvp",
          scope: "realm",
          section: "pvp",
          icon: "achievement_arena_2v2_7",
        },
        {
          key: "hall-of-fame",
          labelKey: "nav.hallOfFame",
          hintKey: "nav.hints.hallOfFame",
          href: "/hall-of-fame",
          scope: "realm",
          section: "hall-of-fame",
          icon: "achievement_general",
        },
        {
          key: "population",
          labelKey: "nav.population",
          hintKey: "nav.hints.population",
          href: "/population",
          scope: "realm",
          section: "population",
          icon: "inv_misc_groupneedmore",
        },
      ],
    },
    {
      kind: "link",
      key: "shop",
      labelKey: "nav.shop",
      href: "/shop",
      scope: "realm",
      section: "shop",
      highlight: true,
      // the shop needs an account (middleware.ts): shown to signed-in players
      signedIn: true,
    },
  ] as NavNode[],
  links: {
    discord: "https://discord.gg/MqTzu6Qhn3",
  },
  realmlist: "set realmlist logon.lordaeron.eu",
  version: "3.3.5a (Build 12340)",
};
