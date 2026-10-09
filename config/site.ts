import type { RealmSection } from "@/lib/realms";

export type SiteConfig = typeof siteConfig;

export interface NavItem {
  labelKey: string;
  href: string;
  scope: "realm" | "shared";
  section?: RealmSection;
  comingSoon?: boolean;
}

export const siteConfig = {
  name: "Lordaeron",
  description:
    "Lordaeron — Free-to-play Epic Progressive WoW 3.3.5a private server. Progress from Vanilla through TBC to WotLK with transmog, crossfaction, x5 rates, and more.",
  baseUrl: "https://www.lordaeron.eu",
  tagline: "The Ultimate Epic Progressive WoW Experience",
  // the menu inside a realm (lib/realms.ts): "realm" links are the realm's sections (shown when the realm has them), the others shared
  navItems: [
    {
      labelKey: "nav.howTo",
      href: "/how-to",
      scope: "realm",
      section: "how-to",
    },
    {
      labelKey: "nav.features",
      href: "/features",
      scope: "realm",
      section: "features",
    },
    {
      labelKey: "nav.epicProgression",
      href: "/epic-progression",
      scope: "realm",
      section: "epic-progression",
    },
    { labelKey: "nav.news", href: "/news", scope: "shared" },
    {
      labelKey: "nav.armory",
      href: "/armory",
      scope: "realm",
      section: "armory",
      comingSoon: true,
    },
    { labelKey: "nav.shop", href: "/shop", scope: "realm", section: "shop" },
  ] as NavItem[],
  links: {
    discord: "https://discord.gg/MqTzu6Qhn3",
  },
  realmlist: "set realmlist logon.lordaeron.eu",
  version: "3.3.5a (Build 12340)",
};
