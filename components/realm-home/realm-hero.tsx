"use client";

import type { RealmHomeDefinition } from "./types";

import NextLink from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";

import { RealmLive } from "./realm-live";
import { THEME } from "./theme";

import { BgImg, Snow } from "@/components/experience/primitives";
import { useAuth } from "@/lib/auth-context";

/* The hero of a realm's home: its art, its crest and name, its live block (players online or the opening) and its two calls. Sized to
   what it holds (no full-screen gap above the text on a phone), centred. */
export function RealmHero({
  definition,
  image,
}: {
  definition: Pick<RealmHomeDefinition, "slug" | "theme" | "hero">;
  image: string;
}) {
  const { slug, theme, hero } = definition;
  const style = THEME[theme.accent];
  const { user } = useAuth();
  const ice = theme.accent === "ice";
  const showSecondary = hero.secondary && !(hero.secondary.guestOnly && user);

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {theme.responsive ? (
        <BgImg
          eager
          xl
          className="animate-ken-burns object-[65%_center]"
          src={image}
        />
      ) : (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${encodeURI(image)}')` }}
        />
      )}
      {ice ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020812]/70 via-[#04101c]/40 to-wow-darker" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020812]/70 via-transparent to-[#020812]/50" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-wow-darker/80 via-wow-darker/40 to-wow-darker" />
          <div className="absolute inset-0 bg-gradient-to-r from-wow-darker/50 via-transparent to-wow-darker/50" />
        </>
      )}
      <div className={clsx("absolute inset-0", style.glow)} />
      {theme.ambience === "snow" && <Snow />}
      <div
        className={clsx(
          "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent",
          style.line,
        )}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 text-center sm:py-16">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 flex justify-center sm:mb-6"
          initial={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.8 }}
        >
          {theme.crest.ring ? (
            <span className="relative inline-flex h-16 w-16 overflow-hidden rounded-full border-2 border-wow-blue-ice/70 shadow-[0_0_30px_rgba(79,195,247,0.6),inset_0_0_14px_rgba(125,211,252,0.6)] sm:h-20 sm:w-20">
              <img
                alt=""
                className="h-full w-full scale-110 object-cover"
                src={theme.crest.src}
              />
            </span>
          ) : (
            <img
              alt=""
              className="h-16 w-16 drop-shadow-[0_0_18px_rgba(199,156,62,0.55)] sm:h-20 sm:w-20"
              src={theme.crest.src}
            />
          )}
        </motion.div>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] sm:mb-4 sm:text-sm sm:tracking-[0.3em]",
            style.kicker,
          )}
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8 }}
        >
          {hero.kicker}
        </motion.p>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "mb-4 font-heading text-[2.6rem] leading-[1.02] tracking-tight sm:mb-6 sm:text-6xl md:text-7xl",
            ice ? "font-normal" : "font-black",
            style.title,
          )}
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {hero.title}
          {hero.titleAccent && (
            <>
              <br />
              <span className={ice ? "wow-ice-text" : undefined}>
                {hero.titleAccent}
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:mb-8 sm:text-xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex justify-center sm:mb-9"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <RealmLive accent={theme.accent} slug={slug} />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto grid max-w-md gap-3 sm:flex sm:max-w-none sm:justify-center sm:gap-4"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <NextLink
            className={clsx(
              "inline-flex h-12 items-center justify-center rounded-lg px-8 font-heading text-sm font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 sm:h-14 sm:px-10 sm:text-base",
              style.primary,
            )}
            href={hero.primary.href}
          >
            {hero.primary.label}
          </NextLink>
          {showSecondary && hero.secondary && (
            <NextLink
              className={clsx(
                "inline-flex h-12 items-center justify-center rounded-lg px-8 font-heading text-sm font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 sm:h-14 sm:px-10 sm:text-base",
                style.secondary,
              )}
              href={hero.secondary.href}
            >
              {hero.secondary.label}
            </NextLink>
          )}
        </motion.div>
      </div>
    </section>
  );
}
