"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { BgImg, bgSrc, Snow } from "./primitives";

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
  // the intro veil stays until the hero picture is decoded (2.5 s at most), so the page never shows half-built
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    const done = () => setReady(true);
    const timer = setTimeout(done, 2500);

    img.srcset = `${bgSrc(image, "-sm")} 960w, ${bgSrc(image)} 1920w, ${bgSrc(image, "-xl")} 2880w`;
    img.sizes = "100vw";
    img.src = bgSrc(image);
    img.decode().then(done, done);

    return () => clearTimeout(timer);
  }, [image]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-end overflow-hidden lg:items-center"
    >
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="veil"
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-wow-darker"
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            initial={{ opacity: 1 }}
          >
            <div className="text-center">
              {}
              <img
                alt=""
                className="mx-auto h-16 w-16 animate-pulse"
                src="/img/logo/logo.png"
              />
              <span className="mx-auto mt-6 block h-px w-40 overflow-hidden bg-white/10">
                <motion.span
                  animate={{ x: ["-100%", "100%"] }}
                  className="block h-full w-1/2 bg-gradient-to-r from-transparent via-wow-gold to-transparent"
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BgImg
        eager
        xl
        className="animate-ken-burns object-[65%_center]"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-wow-darker" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent lg:via-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(79,195,247,0.18),transparent_60%)]" />
      <Snow />

      <motion.div
        className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-32 sm:pb-32 lg:pb-16 lg:pt-24"
        style={{ opacity: fade, y: lift }}
      >
        <motion.p
          animate={ready ? { opacity: 1, letterSpacing: "0.45em" } : {}}
          className="mb-6 text-xs font-semibold uppercase text-wow-blue-ice drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-sm"
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          {content.kicker}
        </motion.p>
        <motion.h1
          animate={ready ? { opacity: 1, y: 0 } : {}}
          className="font-heading text-5xl leading-[0.98] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.9)] sm:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {content.title}
          <br />
          <span className="wow-ice-text">{content.titleAccent}</span>
        </motion.h1>
        <motion.p
          animate={ready ? { opacity: 1, y: 0 } : {}}
          className="mt-8 max-w-xl text-lg leading-relaxed text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-2xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {content.subtitle}
        </motion.p>
        <motion.div
          animate={ready ? { opacity: 1 } : {}}
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
            className="rounded-md border border-wow-blue-ice/50 bg-black/30 px-8 py-4 font-heading text-lg text-wow-blue-ice backdrop-blur-sm transition hover:border-wow-blue-ice hover:bg-wow-blue/10"
            href="#story"
          >
            {content.ctaSecondary}
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        animate={{ y: [0, 10, 0] }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.4em] text-white/50 sm:block"
        href="#story"
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        {content.scroll}
        <span className="mx-auto mt-3 block h-10 w-px bg-gradient-to-b from-wow-blue-ice to-transparent" />
      </motion.a>
    </section>
  );
}

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
];

/* ── Chapter list on the left (the vote panel holds the right side): all titles on wide screens, the current one lit ── */
export function ChapterNav({
  chapters,
}: {
  chapters: { id: string; label: string }[];
}) {
  const { scrollYProgress } = useScroll();
  const height = useTransform(scrollYProgress, [0.04, 0.96], ["0%", "100%"]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const c of chapters) {
      const el = document.getElementById(c.id);

      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="Chapters"
      className={clsx(
        "fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-500 xl:block",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="relative flex flex-col gap-1.5 pl-4">
        <span className="absolute left-0 top-1 h-[calc(100%-8px)] w-px bg-white/10" />
        <motion.span
          className="absolute left-0 top-1 w-px bg-gradient-to-b from-wow-gold to-wow-blue-ice"
          style={{ height }}
        />
        {chapters.map((c, i) => {
          const on = c.id === active;

          return (
            <a
              key={c.id}
              className={clsx(
                "group flex items-center gap-2.5 rounded-md py-0.5 pr-2 text-[11px] uppercase tracking-[0.18em] transition-colors",
                on
                  ? "text-wow-gold-light"
                  : "text-white/35 hover:text-white/80",
              )}
              href={`#${c.id}`}
            >
              <span
                className={clsx(
                  "w-7 shrink-0 text-right font-heading text-xs tracking-normal transition-colors",
                  on
                    ? "text-wow-gold"
                    : "text-white/30 group-hover:text-wow-gold/70",
                )}
              >
                {ROMAN[i]}
              </span>
              <span
                className={clsx(
                  // under 1700 px the titles would cover the page: shown on hover only (on a dark plate)
                  "max-w-0 overflow-hidden whitespace-nowrap rounded bg-wow-darker/90 px-0 opacity-0 transition-all duration-300 group-hover:max-w-[14rem] group-hover:px-1.5 group-hover:opacity-100 min-[1700px]:max-w-none min-[1700px]:bg-transparent min-[1700px]:opacity-100",
                )}
              >
                {c.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
