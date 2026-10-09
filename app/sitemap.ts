import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { REALM_SLUGS, realmHasSection, type RealmSection } from "@/lib/realms";

const locales = routing.locales;

const shopCategories = [
  "services",
  "bags",
  "heirlooms",
  "transmog",
  "mounts",
  "tabards",
  "pets",
  "toys",
];

type PageEntry = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

// the portal and the shared pages
const sharedPages: PageEntry[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms-of-use", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-sale", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
];

// each realm's pages, the sections it has (lib/realms.ts); the armory is not open yet
const realmPages: PageEntry[] = REALM_SLUGS.flatMap((slug) => {
  const has = (section: RealmSection) => realmHasSection(slug, section);
  const at = (path: string) => `/${slug}${path}`;

  return [
    { path: at(""), priority: 0.95, changeFrequency: "daily" as const },
    ...(has("how-to")
      ? [
          {
            path: at("/how-to"),
            priority: 0.9,
            changeFrequency: "monthly" as const,
          },
        ]
      : []),
    ...(has("features")
      ? [
          {
            path: at("/features"),
            priority: 0.9,
            changeFrequency: "monthly" as const,
          },
        ]
      : []),
    ...(has("epic-progression")
      ? [
          {
            path: at("/epic-progression"),
            priority: 0.9,
            changeFrequency: "monthly" as const,
          },
        ]
      : []),
    ...(has("shop")
      ? [
          {
            path: at("/shop"),
            priority: 0.7,
            changeFrequency: "weekly" as const,
          },
          ...shopCategories.map((cat) => ({
            path: at(`/shop/${cat}`),
            priority: 0.6,
            changeFrequency: "weekly" as const,
          })),
        ]
      : []),
  ];
});

const pages: PageEntry[] = [...sharedPages, ...realmPages];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const languages: Record<string, string> = {};

      for (const loc of locales) {
        languages[loc] = `${siteConfig.baseUrl}/${loc}${page.path}`;
      }
      languages["x-default"] = `${siteConfig.baseUrl}/en${page.path}`;

      entries.push({
        url: `${siteConfig.baseUrl}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
