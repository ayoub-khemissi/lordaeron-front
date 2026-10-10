import type { Metadata } from "next";

import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import clsx from "clsx";

import { JsonLd } from "@/components/json-ld";
import { LaunchCountdown } from "@/components/launch-countdown";
import { siteConfig } from "@/config/site";
import { REALMS, REALM_SLUGS, realmPath, type RealmSlug } from "@/lib/realms";
import { launchParts } from "@/lib/launch";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return buildPageMetadata(locale, "", {
    title: t("title"),
    description: t("description"),
  });
}

// each realm's card on the portal: its picture and colors
const CARD: Record<
  RealmSlug,
  {
    image: string;
    position: string;
    overlay: string;
    title: string;
    ring: string;
    button: string;
    dot: string;
  }
> = {
  lordaeron: {
    image:
      "/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_Onyxia_1920x1080.jpg",
    position: "object-[50%_40%]",
    overlay: "from-black via-black/60 to-black/10",
    title: "wow-gradient-text",
    ring: "border-wow-gold/30 hover:border-wow-gold/70 hover:shadow-[0_0_60px_-10px_rgba(199,156,62,0.6)]",
    button: "bg-gradient-to-b from-wow-gold-light to-wow-gold-dark text-black",
    dot: "bg-green-400 shadow-[0_0_10px_#4ade80]",
  },
  rimeheart: {
    image:
      "/img/experience/bg/wrath-of-the-lich-king-classic-cinematic-still-4.webp",
    position: "object-[70%_30%]",
    overlay: "from-black via-[#020a18]/65 to-transparent",
    title: "wow-ice-text",
    ring: "border-wow-blue-ice/30 hover:border-wow-blue-ice/70 hover:shadow-[0_0_60px_-10px_rgba(79,195,247,0.6)]",
    button: "border-2 border-wow-blue-ice/70 bg-[#06121f]/80 text-wow-blue-ice",
    dot: "bg-wow-blue-ice shadow-[0_0_10px_#4fc3f7] animate-pulse",
  },
};

// the realms' portal (Ayoub, 09/10/2026: the locale's root now asks which realm; each realm has its own pages under /<locale>/<realm>)
export default async function RealmPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "realms" });
  const tl = await getTranslations({ locale, namespace: "launch" });
  // a realm not open yet with a date: "Opens Oct 16 · 19:00 CEST"
  const soonLabel = (slug: RealmSlug) => {
    const at = REALMS[slug].launchAt;

    if (!at) return t("soon");
    const p = launchParts(at, locale);

    return tl("opensOn", { date: `${p.short} · ${p.time}` });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-wow-darker">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.baseUrl,
          description: siteConfig.description,
          inLanguage: ["en", "fr", "de", "es", "it", "ru", "pl", "pt"],
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(199,156,62,0.10),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-wow-gold-light/80">
            {t("portal.kicker")}
          </p>
          <h1 className="mt-4 font-heading text-4xl text-white sm:text-6xl">
            {t("portal.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/65 sm:text-lg">
            {t("portal.subtitle")}
          </p>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {REALM_SLUGS.map((slug) => {
            const realm = REALMS[slug];
            const card = CARD[slug];
            const points = t.raw(`${slug}.points`) as string[];

            return (
              <NextLink
                key={slug}
                className={clsx(
                  "group relative flex min-h-[560px] flex-col justify-end overflow-hidden rounded-2xl border transition-all duration-500 sm:min-h-[620px]",
                  card.ring,
                )}
                href={realmPath(locale, slug)}
              >
                <img
                  alt=""
                  className={clsx(
                    "absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105",
                    card.position,
                  )}
                  src={card.image}
                />
                <div
                  className={clsx(
                    "absolute inset-0 bg-gradient-to-t",
                    card.overlay,
                  )}
                />
                <div className="relative p-7 sm:p-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/85 backdrop-blur-sm">
                    <span className={clsx("h-2 w-2 rounded-full", card.dot)} />
                    {realm.status === "open" ? t("open") : soonLabel(slug)}
                  </span>
                  <h2
                    className={clsx(
                      "mt-5 font-heading text-5xl leading-none sm:text-7xl",
                      card.title,
                    )}
                  >
                    {realm.name}
                  </h2>
                  <p className="mt-3 font-heading text-lg text-white/90 sm:text-xl">
                    {t(`${slug}.tagline`)}
                  </p>
                  {realm.status !== "open" && realm.launchAt && (
                    <LaunchCountdown
                      compact
                      className="mt-3"
                      iso={realm.launchAt}
                    />
                  )}
                  <ul className="mt-6 space-y-2">
                    {points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 text-sm text-white/75 sm:text-base"
                      >
                        <span
                          aria-hidden
                          className={clsx(
                            "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                            slug === "rimeheart"
                              ? "bg-wow-blue-ice"
                              : "bg-wow-gold",
                          )}
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={clsx(
                      "mt-8 inline-flex items-center gap-3 rounded-md px-7 py-3.5 font-heading text-base font-bold uppercase tracking-[0.14em] transition-transform duration-300 group-hover:translate-x-1",
                      card.button,
                    )}
                  >
                    {realm.status === "open" ? t("enter") : t("discover")}
                    <svg
                      aria-hidden
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </NextLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
