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
// originals in /home/ubuntu/lordaeron/media/key-art), cross-faded in turn (no zoom: a 1920 px capture scaled up shows its pixels), and
// its colors
const PANEL: Record<
  RealmSlug,
  {
    images: string[];
    shade: string;
    title: string;
    accent: string;
    button: string;
  }
> = {
  // Azeroth to Outland: Stranglethorn's lagoon, Karazhan at night, Netherstorm
  lordaeron: {
    images: ["ingame-07", "ingame-29", "ingame-28"],
    shade: "from-[#0b0806]/95 via-[#0b0806]/70 to-[#0b0806]/35",
    title: "wow-gradient-text",
    accent: "text-wow-gold-light",
    button:
      "bg-[#d4a849] text-[#1c1405] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] group-hover/panel:bg-[#e2b955]",
  },
  // Northrend: Icecrown Citadel and the Skybreaker, the aurora over the fjord, a city under the snow
  rimeheart: {
    images: ["ingame-09", "ingame-30", "ingame-12"],
    shade: "from-[#020812]/95 via-[#020a18]/70 to-[#020812]/35",
    title: "wow-ice-text",
    accent: "text-wow-blue-ice",
    button:
      "bg-[#5cc6f2] text-[#031420] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] group-hover/panel:bg-[#7dd3f7]",
  },
};

// what each realm's half tells, row after row, the same rows on both
const FACTS = ["progression", "raids", "solo", "xp"] as const;

// in-game screenshots below the realms: one large, four around it
const GALLERY = [
  "ingame-09",
  "ingame-11",
  "ingame-18",
  "ingame-06",
  "ingame-27",
];

const bg = (name: string, size: "" | "-sm" = "") =>
  `/img/experience/bg/${name}${size}.webp`;
const srcSet = (name: string) => `${bg(name, "-sm")} 960w, ${bg(name)} 1920w`;

// the realms' portal (Ayoub, 09/10/2026: the locale's root asks which realm; each realm has its own pages under /<locale>/<realm>).
// Redone 08/11/2026 (Ayoub: "digne d'un site professionnel"): two halves built alike (the same rows, the same heights: the same four
// facts each, its tagline on two lines' room), each block centred in its half at the same height, the crest on the seam; the half
// under the pointer stays lit while the other dims (no width change: nothing moves); then our screenshots and the launcher.
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

      {/* on a wide screen one grid for both realms: each realm's rows are the grid's (subgrid), so a row that wraps in one realm keeps
          the other's in line, in every language */}
      <section className="portal-split relative isolate grid min-h-[calc(100svh-4rem)] lg:grid-cols-2 lg:grid-rows-[minmax(12rem,1fr)_repeat(8,auto)_minmax(4rem,1fr)]">
        <header className="relative z-30 px-5 pb-2 pt-10 text-center lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:pt-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-white/55">
            {t("portal.kicker")}
          </p>
          <h1 className="mt-3 font-heading text-3xl text-white sm:text-4xl">
            {t("portal.title")}
          </h1>
        </header>

        {REALM_SLUGS.map((slug) => {
          const realm = realmAt(slug);
          const panel = PANEL[slug];

          return (
            <article
              key={slug}
              className="portal-panel group/panel relative flex min-h-[86svh] flex-col justify-center px-6 pb-14 pt-10 sm:px-10 lg:row-span-full lg:grid lg:min-h-0 lg:grid-rows-subgrid lg:justify-items-center lg:py-0"
            >
              {/* its pictures in turn, the first one under them; then its shade, darker where the text stands */}
              <div className="portal-media absolute inset-0 -z-10 overflow-hidden bg-black">
                <img
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={bg(panel.images[0])}
                  srcSet={srcSet(panel.images[0])}
                />
                {panel.images.map((image, i) => (
                  <img
                    key={image}
                    alt=""
                    className="portal-slide absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    src={bg(image)}
                    srcSet={srcSet(image)}
                    style={{ animationDelay: `${i * 8}s` }}
                  />
                ))}
                <div
                  className={clsx(
                    "absolute inset-0 bg-gradient-to-t",
                    panel.shade,
                  )}
                />
                <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 to-transparent" />
              </div>

              <div className="mx-auto w-full max-w-[30rem] lg:row-[2/10] lg:grid lg:grid-rows-subgrid">
                {/* online / offline, or its opening date before it opens */}
                <div>
                  <RealmStatusPill realm={slug} />
                </div>
                <h2
                  className={clsx(
                    "mt-5 font-heading text-6xl leading-[0.95] sm:text-7xl",
                    panel.title,
                  )}
                >
                  {realm.name}
                </h2>
                <div className="pb-7 pt-4">
                  <p className="text-lg leading-snug text-white/85 sm:text-xl">
                    {t(`${slug}.tagline`)}
                  </p>
                  {realm.status !== "open" && realm.launchAt && (
                    <LaunchCountdown
                      compact
                      className="mt-3"
                      iso={realm.launchAt}
                    />
                  )}
                </div>

                {/* the same rows on both sides, in the same order (Ayoub, 08/11/2026: "si on donne un type d'info d'un côté on le
                    donne de l'autre aussi") */}
                <dl className="divide-y divide-white/10 border-y border-white/10 lg:row-span-4 lg:grid lg:grid-rows-subgrid">
                  {FACTS.map((fact) => (
                    <div
                      key={fact}
                      className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-3.5"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        {t(`portal.rows.${fact}`)}
                      </dt>
                      <dd
                        className={clsx(
                          "text-[15px] leading-snug text-white/90",
                          fact === "xp" &&
                            clsx("font-heading text-lg", panel.accent),
                        )}
                      >
                        {t(`${slug}.facts.${fact}`)}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-wrap items-center gap-3 pt-8">
                  {/* the half is the link: its call stretched over the whole half (nothing on it moves, so the pointer never
                      leaves it); the features link stands above it */}
                  <NextLink
                    className={clsx(
                      "inline-flex h-12 items-center gap-2.5 rounded-lg px-6 text-[15px] font-semibold transition-colors duration-200 after:absolute after:inset-0 after:content-['']",
                      panel.button,
                    )}
                    href={realmPath(locale, slug)}
                  >
                    {realm.status === "open" ? t("enter") : t("discover")}
                    <svg
                      aria-hidden
                      className="h-4 w-4 transition-transform duration-200 group-hover/panel:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </NextLink>
                  <NextLink
                    className="relative z-10 inline-flex h-12 items-center rounded-lg border border-white/20 bg-white/[0.04] px-6 text-[15px] font-medium text-white/90 backdrop-blur-sm transition-colors duration-200 hover:border-white/40 hover:bg-white/10 hover:text-white"
                    href={realmPath(locale, slug, "/features")}
                  >
                    {t("features")}
                  </NextLink>
                </div>
              </div>
            </article>
          );
        })}

        {/* the seam between the realms, the crest at its middle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-[#07080d]/90 shadow-[0_0_0_6px_rgba(7,8,13,0.5),0_10px_40px_rgba(0,0,0,0.8)]">
            <img alt="" className="h-9 w-9" src="/img/logo/logo.png" />
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
        <div className="flex flex-col items-end justify-between gap-4 sm:flex-row">
          <div className="w-full sm:w-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-white/50">
              {t("gallery.kicker")}
            </p>
            <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl">
              {t("gallery.title")}
            </h2>
          </div>
          <p className="w-full max-w-sm text-sm text-white/55 sm:w-auto sm:text-right">
            {t("gallery.subtitle")}
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {GALLERY.map((image, i) => (
            <figure
              key={image}
              className={clsx(
                "relative aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-white/10",
                i === 0 && "sm:col-span-2 lg:row-span-2 lg:aspect-auto",
              )}
            >
              <img
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                sizes={
                  i === 0
                    ? "(min-width: 1024px) 50vw, 100vw"
                    : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                }
                src={bg(image)}
                srcSet={srcSet(image)}
              />
            </figure>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8">
        <LauncherBanner locale={locale} />
      </div>
    </div>
  );
}
