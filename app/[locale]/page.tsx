import type { Metadata } from "next";

import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import clsx from "clsx";

import { JsonLd } from "@/components/json-ld";
import { LauncherBanner } from "@/components/launcher/launcher-banner";
import { LaunchCountdown } from "@/components/launch-countdown";
import { RealmStatusPill } from "@/components/realm-status-pill";
import { siteConfig } from "@/config/site";
import { REALM_SLUGS, realmAt, realmPath, type RealmSlug } from "@/lib/realms";
import { buildPageMetadata } from "@/lib/seo";

// rendered again every minute: a realm's card switches to "open" by itself after its opening (lib/realms.ts realmAt)
export const revalidate = 60;

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

// each realm's half of the portal: its in-game pictures (taken on our realms, 07/11/2026: public/img/experience/bg/ingame-*, the
// originals in /home/ubuntu/lordaeron/media/key-art), shown in turn, and its colors
const PANEL: Record<
  RealmSlug,
  {
    images: string[];
    overlay: string;
    title: string;
    ring: string;
    dot: string;
    button: string;
  }
> = {
  // Azeroth to Outland: Stranglethorn's lagoon, Karazhan at night, Netherstorm
  lordaeron: {
    images: ["ingame-07", "ingame-29", "ingame-28"],
    overlay: "bg-gradient-to-t from-[#07050a] via-[#07050a]/55 to-[#07050a]/10",
    title: "wow-gradient-text",
    ring: "lg:border-r border-wow-gold/20 shadow-[inset_0_0_0_1px_rgba(199,156,62,0.08)]",
    dot: "bg-wow-gold",
    button:
      "bg-gradient-to-b from-wow-gold-light to-wow-gold-dark text-black shadow-[0_8px_30px_-8px_rgba(199,156,62,0.7)]",
  },
  // Northrend: Icecrown Citadel and the Skybreaker, the aurora over the fjord, a city under the snow
  rimeheart: {
    images: ["ingame-09", "ingame-30", "ingame-12"],
    overlay: "bg-gradient-to-t from-[#020812] via-[#020a18]/55 to-[#020812]/10",
    title: "wow-ice-text",
    ring: "shadow-[inset_0_0_0_1px_rgba(79,195,247,0.08)]",
    dot: "bg-wow-blue-ice",
    button:
      "border-2 border-wow-blue-ice/70 bg-[#06121f]/80 text-wow-blue-ice shadow-[0_8px_30px_-8px_rgba(79,195,247,0.6)]",
  },
};

// in-game screenshots below the realms: the first one large
const GALLERY = [
  "ingame-09",
  "ingame-11",
  "ingame-18",
  "ingame-06",
  "ingame-27",
  "ingame-04",
  "ingame-10",
  "ingame-23",
];

const bg = (name: string, size: "" | "-sm" = "") =>
  `/img/experience/bg/${name}${size}.webp`;

// the realms' portal (Ayoub, 09/10/2026: the locale's root asks which realm; each realm has its own pages under /<locale>/<realm>).
// Redone 08/11/2026 (Ayoub: "je la trouve nulle + buguée avec le launcher"): the two realms side by side over the whole screen, each in
// its own in-game pictures, the one under the pointer widening; then screenshots of our realms; the launcher in the page's width.
export default async function RealmPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "realms" });

  return (
    <div className="relative overflow-hidden bg-wow-darker">
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

      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col lg:flex-row">
        {/* the question, over both realms on a wide screen, above them on a phone */}
        <header className="relative z-20 px-5 pb-6 pt-10 text-center lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-wow-gold-light/85 sm:text-xs">
            {t("portal.kicker")}
          </p>
          <h1 className="mt-3 font-heading text-4xl text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-6xl">
            {t("portal.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/70 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:text-lg">
            {t("portal.subtitle")}
          </p>
        </header>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-64 bg-gradient-to-b from-black/80 to-transparent lg:block" />

        {REALM_SLUGS.map((slug) => {
          const realm = realmAt(slug);
          const panel = PANEL[slug];
          const points = t.raw(`${slug}.points`) as string[];

          return (
            <NextLink
              key={slug}
              className={clsx(
                "group relative flex min-h-[82svh] flex-1 flex-col justify-end overflow-hidden transition-[flex-grow] duration-700 ease-out lg:min-h-0 lg:hover:flex-[1.3]",
                panel.ring,
              )}
              href={realmPath(locale, slug)}
            >
              {/* its pictures in turn, slowly zooming; the first one stays under them */}
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                src={bg(panel.images[0])}
                srcSet={`${bg(panel.images[0], "-sm")} 960w, ${bg(panel.images[0])} 1920w`}
              />
              {panel.images.map((image, i) => (
                <img
                  key={image}
                  alt=""
                  className="portal-slide absolute inset-0 h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  src={bg(image)}
                  srcSet={`${bg(image, "-sm")} 960w, ${bg(image)} 1920w`}
                  style={{ animationDelay: `${i * 8}s` }}
                />
              ))}
              <div className={clsx("absolute inset-0", panel.overlay)} />
              <div className="absolute inset-0 bg-black/20 transition-colors duration-700 group-hover:bg-transparent" />

              <div className="relative z-10 w-full max-w-2xl p-7 sm:p-10 lg:p-14">
                {/* online / offline, or its opening date before it opens */}
                <RealmStatusPill realm={slug} />
                <h2
                  className={clsx(
                    "mt-5 font-heading text-6xl leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] sm:text-8xl",
                    panel.title,
                  )}
                >
                  {realm.name}
                </h2>
                <p className="mt-4 font-heading text-lg text-white/90 sm:text-2xl">
                  {t(`${slug}.tagline`)}
                </p>
                {realm.status !== "open" && realm.launchAt && (
                  <LaunchCountdown
                    compact
                    className="mt-3"
                    iso={realm.launchAt}
                  />
                )}
                <ul className="mt-6 space-y-2.5">
                  {points.map((p) => (
                    <li
                      key={p}
                      className="flex gap-3 text-sm text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-base"
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          "mt-2 h-1.5 w-1.5 shrink-0 rotate-45",
                          panel.dot,
                        )}
                      />
                      {p}
                    </li>
                  ))}
                </ul>
                <span
                  className={clsx(
                    "mt-9 inline-flex items-center gap-3 rounded-md px-8 py-4 font-heading text-base font-bold uppercase tracking-[0.16em] transition-transform duration-300 group-hover:translate-x-1.5",
                    panel.button,
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
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-wow-gold-light/80 sm:text-xs">
            {t("gallery.kicker")}
          </p>
          <h2 className="mt-3 font-heading text-3xl text-white sm:text-5xl">
            {t("gallery.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            {t("gallery.subtitle")}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {GALLERY.map((image, i) => (
            <div
              key={image}
              className={clsx(
                "group relative overflow-hidden rounded-xl border border-white/10 bg-black",
                i === 0
                  ? "col-span-2 row-span-2 aspect-video lg:aspect-auto"
                  : "aspect-video",
              )}
            >
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                loading="lazy"
                sizes={
                  i === 0
                    ? "(min-width: 1024px) 50vw, 100vw"
                    : "(min-width: 1024px) 25vw, 50vw"
                }
                src={bg(image)}
                srcSet={`${bg(image, "-sm")} 960w, ${bg(image)} 1920w`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-0" />
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-20 pt-6 sm:px-8">
        <LauncherBanner locale={locale} />
      </div>
    </div>
  );
}
