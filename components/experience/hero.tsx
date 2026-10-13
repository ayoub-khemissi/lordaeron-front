"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { BgImg, bgSrc, CtaButton, Snow } from "./primitives";

export type HeroContent = {
  kicker: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scroll: string;
  status: string;
};

export function ExperienceHero({
  content,
  image,
  joinHref,
  launch,
  pill,
}: {
  content: HeroContent;
  image: string;
  joinHref: string;
  // under the status line: the opening countdown of a realm not open yet
  launch?: ReactNode;
  // beside the status line: the realm's live state (components/realm-status-pill.tsx)
  pill?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const lift = useTransform(scrollYProgress, [0, 1], [0, -160]);
  // "Rimeheart · Wrath of the Lich King 3.3.5": the first part is the seal, the rest beside it; the status likewise
  const [kicker, ...kickerParts] = content.kicker.split(" · ");
  const kickerRest = kickerParts.join(" · ");
  const [status, ...statusParts] = content.status.split(" · ");
  const statusRest = statusParts.join(" · ");
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
      className="relative flex min-h-[100svh] items-start overflow-hidden sm:items-end lg:items-start"
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
        className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-6 sm:px-6 sm:pb-32 sm:pt-32 lg:pb-24 lg:pt-[clamp(3.5rem,9vh,7rem)]"
        style={{ y: lift }}
      >
        {/* the realm's name in a frost seal, the rest of the kicker beside it */}
        <motion.p
          animate={ready ? { opacity: 1, x: 0 } : {}}
          className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-wow-blue-ice drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:mb-7 sm:text-sm sm:tracking-[0.4em]"
          initial={{ opacity: 0, x: -16 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-wow-blue-ice/40 bg-[#04101c]/60 px-3 py-1 shadow-[0_0_18px_-6px_rgba(79,195,247,0.8)] backdrop-blur-sm sm:px-4 sm:py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-wow-blue-ice shadow-[0_0_8px_#4fc3f7]" />
            {kicker}
          </span>
          {kickerRest && <span className="text-white/70">{kickerRest}</span>}
        </motion.p>
        <motion.h1
          animate={ready ? { opacity: 1, y: 0 } : {}}
          className="font-heading text-[2.65rem] leading-[0.95] text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.9)] sm:text-7xl lg:text-8xl"
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {content.title}
          <br />
          <span className="wow-ice-text">{content.titleAccent}</span>
        </motion.h1>
        <motion.p
          animate={ready ? { opacity: 1, y: 0 } : {}}
          className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:mt-8 sm:text-2xl sm:text-white"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {content.subtitle}
        </motion.p>
        <motion.div
          animate={ready ? { opacity: 1 } : {}}
          className="mt-6 grid gap-3 sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:gap-5"
          initial={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.95 }}
        >
          <CtaButton className="[&>a]:w-full sm:[&>a]:w-auto" href={joinHref}>
            {content.ctaPrimary}
          </CtaButton>
          <CtaButton
            className="w-full sm:w-auto"
            href="#story"
            variant="secondary"
          >
            {content.ctaSecondary}
          </CtaButton>
        </motion.div>
        {/* the opening: a frost panel with the status and the countdown */}
        <motion.div
          animate={ready ? { opacity: 1, y: 0 } : {}}
          className="mt-6 w-full max-w-xl rounded-xl border border-wow-blue-ice/25 bg-[#04101c]/55 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(125,211,252,0.15)] backdrop-blur-md sm:mt-10 sm:p-5"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-wow-blue-ice sm:text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-wow-blue-ice shadow-[0_0_10px_#4fc3f7]" />
              {status}
            </p>
            {pill}
          </div>
          {statusRest && (
            <p className="mt-1.5 font-heading text-[15px] leading-snug text-white sm:text-lg">
              {statusRest}
            </p>
          )}
          {launch && <div className="mt-3">{launch}</div>}
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
  "XIX",
  "XX",
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
