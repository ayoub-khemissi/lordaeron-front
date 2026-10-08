"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { Snow } from "./primitives";

export type HeroContent = {
  kicker: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scroll: string;
};

export function ExperienceHero({
  content,
  image,
  joinHref,
}: {
  content: HeroContent;
  image: string;
  joinHref: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -160]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-end overflow-hidden"
    >
      <div
        aria-hidden
        className="animate-ken-burns absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${encodeURI(image)}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-wow-darker/30 to-wow-darker" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(79,195,247,0.18),transparent_60%)]" />
      <Snow />

      <motion.div
        className="relative mx-auto w-full max-w-7xl px-6 pb-24 sm:pb-32"
        style={{ opacity: fade, y: lift }}
      >
        <motion.p
          animate={{ opacity: 1, letterSpacing: "0.45em" }}
          className="mb-6 text-xs font-semibold uppercase text-wow-blue-ice sm:text-sm"
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          {content.kicker}
        </motion.p>
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-5xl leading-[0.98] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)] sm:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {content.title}
          <br />
          <span className="wow-ice-text">{content.titleAccent}</span>
        </motion.h1>
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {content.subtitle}
        </motion.p>
        <motion.div
          animate={{ opacity: 1 }}
          className="mt-10 flex flex-wrap gap-4"
          initial={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.95 }}
        >
          <a
            className="group relative overflow-hidden rounded-md bg-gradient-to-b from-wow-gold-light to-wow-gold-dark px-8 py-4 font-heading text-lg text-black shadow-[0_0_30px_rgba(199,156,62,0.45)] transition hover:shadow-[0_0_45px_rgba(199,156,62,0.7)]"
            href={joinHref}
          >
            <span className="relative z-10">{content.ctaPrimary}</span>
            <span className="shimmer-gold absolute inset-0 opacity-0 transition group-hover:opacity-60" />
          </a>
          <a
            className="rounded-md border border-wow-blue-ice/40 px-8 py-4 font-heading text-lg text-wow-blue-ice backdrop-blur-sm transition hover:border-wow-blue-ice hover:bg-wow-blue/10"
            href="#story"
          >
            {content.ctaSecondary}
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        animate={{ y: [0, 10, 0] }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.4em] text-white/50"
        href="#story"
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        {content.scroll}
        <span className="mx-auto mt-3 block h-10 w-px bg-gradient-to-b from-wow-blue-ice to-transparent" />
      </motion.a>
    </section>
  );
}

/* ── Side navigation through the chapters, with the reading progress ── */
export function ChapterNav({
  chapters,
}: {
  chapters: { id: string; label: string }[];
}) {
  const { scrollYProgress } = useScroll();
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div className="relative flex flex-col gap-4 pl-5">
        <span className="absolute left-0 top-0 h-full w-px bg-white/10" />
        <motion.span
          className="absolute left-0 top-0 w-px bg-gradient-to-b from-wow-gold to-wow-blue-ice"
          style={{ height }}
        />
        {chapters.map((c) => (
          <a
            key={c.id}
            className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-white/40 transition hover:text-wow-gold-light"
            href={`#${c.id}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/30 transition group-hover:scale-150 group-hover:bg-wow-gold" />
            <span className="opacity-0 transition group-hover:opacity-100">
              {c.label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
