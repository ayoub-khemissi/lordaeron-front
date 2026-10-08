"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import clsx from "clsx";

/* ── Reveal on scroll: rise and fade, staggered by index ── */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

/* ── A number counting up when it enters the screen ── */
export function Counter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });

    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString(
        typeof document === "undefined"
          ? undefined
          : document.documentElement.lang || undefined,
      )}
      {suffix}
    </span>
  );
}

/* ── A full-bleed image band moving slower than the page ── */
export function ParallaxImage({
  src,
  alt = "",
  strength = 120,
  className,
  overlay = "from-wow-darker via-wow-darker/40 to-wow-darker",
  children,
}: {
  src: string;
  alt?: string;
  strength?: number;
  className?: string;
  overlay?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    [-strength, strength],
  );

  return (
    <div ref={ref} className={clsx("relative overflow-hidden", className)}>
      <motion.div
        aria-hidden
        className="absolute inset-[-140px_0] bg-cover bg-center"
        style={{ y, backgroundImage: `url("${encodeURI(src)}")` }}
      >
        <span className="sr-only">{alt}</span>
      </motion.div>
      <div className={clsx("absolute inset-0 bg-gradient-to-b", overlay)} />
      <div className="relative w-full">{children}</div>
    </div>
  );
}

/* ── A WoW icon in its gold frame ── */
export function WowIcon({
  icon,
  size = 56,
  className,
  glow = "gold",
}: {
  icon: string;
  size?: number;
  className?: string;
  glow?: "gold" | "ice" | "fel" | "none";
}) {
  const ring =
    glow === "ice"
      ? "ring-wow-blue/60 shadow-[0_0_18px_rgba(79,195,247,0.35)]"
      : glow === "fel"
        ? "ring-green-400/60 shadow-[0_0_18px_rgba(74,222,128,0.35)]"
        : glow === "none"
          ? "ring-white/10"
          : "ring-wow-gold/70 shadow-[0_0_18px_rgba(199,156,62,0.35)]";

  return (
    <span
      className={clsx(
        "relative inline-block shrink-0 overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-black/80",
        ring,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {}
      <img
        alt=""
        className="h-full w-full scale-[1.08] object-cover"
        height={size}
        loading="lazy"
        src={`/img/experience/icons/${icon.toLowerCase().replace(/'/g, "")}.jpg`}
        width={size}
      />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/30" />
    </span>
  );
}

/* ── Chapter heading: numeral, eyebrow, title, lede ── */
export function ChapterHeading({
  numeral,
  eyebrow,
  title,
  lede,
  tone = "gold",
  align = "left",
}: {
  numeral: string;
  eyebrow: string;
  title: string;
  lede?: string;
  tone?: "gold" | "ice" | "fel" | "blood";
  align?: "left" | "center";
}) {
  const titleClass =
    tone === "ice"
      ? "wow-ice-text"
      : tone === "fel"
        ? "wow-fel-text"
        : tone === "blood"
          ? "bg-gradient-to-br from-red-400 via-rose-200 to-red-500 bg-clip-text text-transparent"
          : "wow-gradient-text";

  return (
    <div
      className={clsx("max-w-3xl", align === "center" && "mx-auto text-center")}
    >
      <Reveal>
        <div
          className={clsx(
            "mb-5 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-wow-gold-light/80",
            align === "center" && "justify-center",
          )}
        >
          <span className="font-heading text-2xl tracking-normal text-wow-gold">
            {numeral}
          </span>
          <span className="h-px w-10 bg-wow-gold/50" />
          <span>{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={clsx(
            "font-heading text-4xl leading-[1.05] sm:text-5xl lg:text-6xl",
            titleClass,
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lede && (
        <Reveal delay={0.16}>
          <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ── Horizontal snap carousel with arrows and drag-scroll ── */
export function Carousel({
  children,
  label,
  itemClassName = "w-[86%] sm:w-[46%] lg:w-[31%]",
}: {
  children: ReactNode[];
  label: string;
  itemClassName?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;

    if (!el) return;
    setEdge({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8,
    });
  };

  useEffect(() => {
    update();
  }, []);

  const go = (dir: number) => {
    const el = track.current;

    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div aria-label={label} className="relative" role="region">
      <div
        ref={track}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [mask-image:linear-gradient(90deg,black_92%,transparent)]"
        onScroll={update}
      >
        {children.map((child, i) => (
          <div key={i} className={clsx("shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-3">
        {[-1, 1].map((dir) => (
          <button
            key={dir}
            aria-label={dir < 0 ? "Previous" : "Next"}
            className={clsx(
              "grid h-11 w-11 place-items-center rounded-full border border-wow-gold/40 text-wow-gold-light transition hover:border-wow-gold hover:bg-wow-gold/10 disabled:opacity-25",
            )}
            disabled={dir < 0 ? edge.start : edge.end}
            onClick={() => go(dir)}
          >
            <svg
              fill="none"
              height="18"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
            >
              <path d={dir < 0 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Falling snow on a canvas (hero) ── */
export function Snow({ density = 110 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let w = 0;
    let h = 0;
    const flakes = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      s: 0.15 + Math.random() * 0.55,
      d: Math.random() * Math.PI * 2,
    }));
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += (f.s * devicePixelRatio) / h;
        f.d += 0.01;
        f.x += Math.sin(f.d) * 0.0004;
        if (f.y > 1.02) {
          f.y = -0.02;
          f.x = Math.random();
        }
        ctx.beginPath();
        ctx.arc(f.x * w, f.y * h, f.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,240,255,${0.25 + f.r / 5})`;
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    };

    resize();
    tick();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ── Endless row of icons (collections) ── */
export function IconMarquee({
  icons,
  reverse = false,
  speed = 40,
}: {
  icons: string[];
  reverse?: boolean;
  speed?: number;
}) {
  const row = [...icons, ...icons];

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        className="flex w-max gap-5 py-3"
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {row.map((icon, i) => (
          <WowIcon key={`${icon}-${i}`} glow="none" icon={icon} size={64} />
        ))}
      </motion.div>
    </div>
  );
}
