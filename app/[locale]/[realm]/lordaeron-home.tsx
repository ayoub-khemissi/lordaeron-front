import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { HeroBanner, heroBackgrounds } from "@/components/hero-banner";
import { ServerStatus } from "@/components/server-status";
import { ServerStats } from "@/components/server-stats";
import { EpicProgressionTimeline } from "@/components/epic-progression-timeline";
import { NewsSection } from "@/components/news-section";
import { JsonLd } from "@/components/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function lordaeronHomeMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return buildPageMetadata(locale, "/lordaeron", {
    title: t("title"),
    description: t("description"),
  });
}

// Lordaeron's home (the site's home before the realms' portals, 09/10/2026)
export function LordaeronHome() {
  const bgImage =
    heroBackgrounds[Math.floor(Math.random() * heroBackgrounds.length)];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.baseUrl,
          description: siteConfig.description,
          inLanguage: ["en", "fr", "de", "es", "it"],
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.baseUrl}/en/shop?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.baseUrl,
          logo: `${siteConfig.baseUrl}/img/og/og-default.png`,
          sameAs: [siteConfig.links.discord],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: "Lordaeron — Epic Progressive WoW Server",
          description:
            "Free-to-play Epic Progressive WoW 3.3.5a private server. Progress through Vanilla, TBC, and WotLK raids in order with transmog, crossfaction, x5 XP, 2-day raid resets, and more.",
          url: siteConfig.baseUrl,
          gamePlatform: "PC",
          applicationCategory: "Game",
          operatingSystem: "Windows, macOS",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          genre: ["MMORPG", "Role-playing game"],
          keywords:
            "WoW private server, 3.3.5a, WotLK, progressive, transmog, crossfaction, free to play, Vanilla, TBC, Wrath of the Lich King",
        }}
      />
      <HeroBanner bgImage={bgImage} />
      <div className="flex justify-center mt-6 relative z-10">
        <ServerStatus />
      </div>
      <ServerStats />
      <EpicProgressionTimeline />
      <NewsSection />
    </div>
  );
}
