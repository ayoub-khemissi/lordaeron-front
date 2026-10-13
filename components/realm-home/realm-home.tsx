import type { RealmHomeDefinition } from "./types";

import NextLink from "next/link";
import clsx from "clsx";

import { RealmHero } from "./realm-hero";
import { THEME } from "./theme";

import { NewsSection } from "@/components/news-section";

// **key facts** of a text in the realm's light color
function Bold({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <strong key={i} className={clsx("font-semibold", className)}>
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

/* A realm's home, drawn from its definition (types.ts): the hero with its live block, the compact features, the realm's own sections,
   the news and the closing call. The hero's art is drawn here, on the server, so the first paint already shows it. */
export function RealmHome({ definition }: { definition: RealmHomeDefinition }) {
  const { theme, features, sections, join } = definition;
  const style = THEME[theme.accent];
  const image =
    theme.heroImages[Math.floor(Math.random() * theme.heroImages.length)];

  return (
    <div>
      <RealmHero
        definition={{ slug: definition.slug, theme, hero: definition.hero }}
        image={image}
      />

      <section className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p
              className={clsx(
                "mb-2 text-xs font-semibold uppercase tracking-[0.3em]",
                style.eyebrow,
              )}
            >
              {features.eyebrow}
            </p>
            <h2 className="font-heading text-3xl text-white sm:text-4xl">
              {features.title}
            </h2>
          </div>
          {features.more && (
            <NextLink
              className={clsx(
                "text-sm font-semibold uppercase tracking-[0.15em] underline-offset-4 hover:underline",
                style.eyebrow,
              )}
              href={features.more.href}
            >
              {features.more.label} →
            </NextLink>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {features.items.map((f) => (
            <NextLink
              key={f.href + f.title}
              className={clsx(
                "group flex flex-col items-start gap-2.5 rounded-xl border bg-white/[0.03] p-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] sm:flex-row sm:gap-3 sm:p-4",
                style.card,
              )}
              href={f.href}
            >
              <img
                alt=""
                className={clsx(
                  "h-10 w-10 shrink-0 rounded-lg border object-cover shadow-[0_4px_14px_rgba(0,0,0,0.6)] sm:h-11 sm:w-11",
                  style.icon,
                )}
                height={44}
                loading="lazy"
                src={f.icon}
                width={44}
              />
              <span className="min-w-0">
                <span className="block font-heading text-base leading-tight text-white">
                  {f.title}
                </span>
                <span className="mt-1 line-clamp-3 block text-[13px] leading-snug text-gray-400 group-hover:text-gray-300 sm:line-clamp-2 sm:text-sm">
                  {f.line}
                </span>
              </span>
            </NextLink>
          ))}
        </div>
      </section>

      {sections}

      <NewsSection />

      {join && (
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url('${encodeURI(join.image)}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wow-darker via-wow-darker/70 to-wow-darker" />
          <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
            <h2 className="font-heading text-3xl text-white sm:text-5xl">
              {join.title}
            </h2>
            {join.text && (
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
                <Bold className={style.number} text={join.text} />
              </p>
            )}
            <NextLink
              className={clsx(
                "mt-8 inline-flex h-12 items-center justify-center rounded-lg px-10 font-heading text-sm font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 sm:h-14 sm:text-base",
                style.primary,
              )}
              href={join.cta.href}
            >
              {join.cta.label}
            </NextLink>
          </div>
        </section>
      )}
    </div>
  );
}
