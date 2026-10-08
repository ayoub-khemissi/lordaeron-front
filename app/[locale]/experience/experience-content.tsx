"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

import {
  archivists,
  artifact,
  classes,
  collections,
  economy,
  eye,
  finale,
  fishing,
  glory,
  guilds,
  hero,
  manifesto,
  nav,
  phases,
  professions,
  pvp,
  quiz,
  raidRules,
  raids,
  transmog,
  treasures,
  worldBosses,
  type Lang,
  type T,
} from "./content";

import { ChapterNav, ExperienceHero } from "@/components/experience/hero";
import {
  Carousel,
  ChapterHeading,
  Counter,
  IconMarquee,
  ParallaxImage,
  Reveal,
  WowIcon,
} from "@/components/experience/primitives";

const container = "mx-auto w-full max-w-7xl px-5 sm:px-8";

/* ── small shared pieces ── */
function Card({
  icon,
  title,
  text,
  tag,
  glow = "gold",
  className,
}: {
  icon?: string;
  title: string;
  text: string;
  tag?: string;
  glow?: "gold" | "ice" | "fel";
  className?: string;
}) {
  return (
    <motion.div
      className={clsx(
        "group relative h-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-sm transition-colors duration-500 hover:border-wow-gold/40",
        className,
      )}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ y: -6 }}
    >
      <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-wow-gold/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      {icon && <WowIcon className="mb-5" glow={glow} icon={icon} size={52} />}
      {tag && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-wow-blue-ice/80">
          {tag}
        </p>
      )}
      <h3 className="font-heading text-xl text-wow-gold-light sm:text-2xl">
        {title}
      </h3>
      <p className="mt-3 leading-relaxed text-white/65">{text}</p>
    </motion.div>
  );
}

function StatRow({
  stats,
  lang,
  className,
}: {
  stats: { value: number; label: T }[];
  lang: Lang;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "grid gap-px overflow-hidden rounded-xl border border-wow-gold/15 bg-wow-gold/15",
        stats.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {stats.map((s, i) => (
        <div key={i} className="bg-wow-darker/90 px-2 py-6 text-center sm:px-5">
          <Counter
            className="block font-heading text-3xl text-wow-gold-light sm:text-5xl"
            value={s.value}
          />
          <span className="mt-2 block text-[10px] uppercase tracking-[0.12em] text-white/50 sm:text-xs sm:tracking-[0.2em]">
            {s.label[lang]}
          </span>
        </div>
      ))}
    </div>
  );
}

function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx("relative scroll-mt-20 py-24 sm:py-32", className)}
      id={id}
    >
      {children}
    </section>
  );
}

function Check() {
  return (
    <svg
      aria-hidden
      className="mt-1 h-4 w-4 shrink-0 text-wow-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

/* ── chapters ── */
function Manifesto({ lang }: { lang: Lang }) {
  return (
    <Section className="overflow-hidden" id="story">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,195,247,0.08),transparent_60%)]" />
      <div
        className={clsx(
          container,
          "relative grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center",
        )}
      >
        <div>
          <Reveal>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.4em] text-wow-blue-ice/80">
              {manifesto.eyebrow[lang]}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="whitespace-pre-line font-heading text-4xl leading-[1.05] text-white sm:text-6xl">
              {manifesto.title[lang].split("\n")[0]}
              <br />
              <span className="wow-gradient-text">
                {manifesto.title[lang].split("\n")[1]}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
              {manifesto.text[lang]}
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-wow-gold/20 bg-wow-gold/20">
          {manifesto.stats.map((s, i) => (
            <Reveal key={i} className="bg-wow-darker" delay={i * 0.05} y={14}>
              <div className="px-4 py-7 text-center sm:px-6">
                <Counter
                  className="block font-heading text-3xl text-wow-gold-light sm:text-5xl"
                  value={s.value}
                />
                <span className="mt-2 block text-[11px] uppercase leading-snug tracking-[0.08em] text-white/50 [overflow-wrap:anywhere] sm:text-xs sm:tracking-[0.18em]">
                  {s.label[lang]}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Phases({ lang }: { lang: Lang }) {
  return (
    <Section id={phases.id}>
      <div className={container}>
        <ChapterHeading
          eyebrow={phases.eyebrow[lang]}
          lede={phases.lede[lang]}
          numeral={phases.numeral}
          title={phases.title[lang]}
          tone="ice"
        />
        <div className="relative mt-16">
          <span className="absolute left-[27px] top-0 h-full w-px bg-gradient-to-b from-wow-blue-ice/60 via-wow-gold/40 to-red-500/40 lg:left-0 lg:top-[27px] lg:h-px lg:w-full lg:bg-gradient-to-r" />
          <ol className="grid gap-10 lg:grid-cols-6 lg:gap-5">
            {phases.steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <li className="relative flex gap-5 lg:block">
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-wow-blue-ice/50 bg-wow-darker font-heading text-xl text-wow-blue-ice shadow-[0_0_25px_rgba(79,195,247,0.25)]">
                    {s.n}
                  </span>
                  <div className="lg:mt-6">
                    <div className="group relative mb-4 hidden aspect-[4/5] overflow-hidden rounded-lg border border-white/10 lg:block">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url("${encodeURI(s.image)}")`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-wow-darker via-transparent to-transparent" />
                    </div>
                    <h3 className="font-heading text-xl text-white">
                      {s.title[lang]}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {s.text[lang]}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal>
          <p className="mt-14 border-l-2 border-wow-gold/50 pl-5 text-white/60">
            {phases.footnote[lang]}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

// a real pair from the realm: Void Sabre (Ulduar), epic and its Artifact copy
const voidSabre = [
  { color: "#a335ee", ilvl: 232, dmg: [187, 349], agi: 52, sta: 51 },
  { color: "#e6cc80", ilvl: 252, dmg: [226, 421], agi: 72, sta: 71 },
];

function ArtifactItem({ lang }: { lang: Lang }) {
  const [up, setUp] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setUp((u) => 1 - u), 2600);

    return () => clearInterval(id);
  }, []);
  const v = voidSabre[up];
  const fr = lang === "fr";
  const num = (n: number) => (
    <motion.span
      key={`${up}-${n}`}
      animate={{ color: "#ffffff" }}
      initial={{ color: up ? "#1eff00" : "#ffffff" }}
      transition={{ duration: 1.2 }}
    >
      {n}
    </motion.span>
  );
  const dps = ((v.dmg[0] + v.dmg[1]) / 2 / 1.5).toFixed(1);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        className="absolute -inset-8 rounded-full opacity-40 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: v.color }}
      />
      <div
        className="relative rounded-lg border bg-[#070914]/95 p-5 text-[15px] leading-snug shadow-2xl transition-colors duration-700"
        style={{ borderColor: `${v.color}66` }}
      >
        <div className="flex items-start gap-4">
          <WowIcon glow="none" icon="inv_sword_133" size={52} />
          <div className="min-w-0">
            <p
              className="text-lg font-semibold transition-colors duration-700"
              style={{ color: v.color }}
            >
              {fr ? "Sabre du Vide" : "Void Sabre"}
            </p>
            <p className="text-wow-gold-light">
              {fr ? "Niveau d'objet" : "Item Level"} {num(v.ilvl)}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-0.5 text-white/90">
          <p>{fr ? "Lié quand ramassé" : "Binds when picked up"}</p>
          <p className="flex justify-between">
            <span>{fr ? "Une main" : "One-Hand"}</span>
            <span>{fr ? "Épée" : "Sword"}</span>
          </p>
          <p className="flex justify-between">
            <span>
              {num(v.dmg[0])} - {num(v.dmg[1])} {fr ? "Dégâts" : "Damage"}
            </span>
            <span>{fr ? "Vitesse 1,50" : "Speed 1.50"}</span>
          </p>
          <p>
            ({fr ? dps.replace(".", ",") : dps}{" "}
            {fr ? "dégâts par seconde" : "damage per second"})
          </p>
          <p>
            +{num(v.agi)} {fr ? "Agilité" : "Agility"}
          </p>
          <p>
            +{num(v.sta)} {fr ? "Endurance" : "Stamina"}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em] sm:text-[11px] sm:tracking-[0.12em]">
          {artifact.tiers.map((x, i) => (
            <span
              key={i}
              className="flex-auto whitespace-nowrap rounded-sm px-1.5 py-1 text-center transition-all duration-700"
              style={{
                color: x.color,
                backgroundColor: `${x.color}1f`,
                opacity: i === 2 + up ? 1 : 0.3,
                boxShadow: i === 2 + up ? `0 0 0 1px ${x.color}` : "none",
              }}
            >
              {x.label[lang]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Artifact({ lang }: { lang: Lang }) {
  return (
    <ParallaxImage
      className="py-24 sm:py-32"
      overlay="from-wow-darker via-wow-darker/85 to-wow-darker"
      src="/img/Wrath of the Lich King Classic Secret of Ulduar Screenshots 4K/WoW_Wrath_Ulduar_002_4K_png_jpgcopy.jpg"
    >
      <section className="scroll-mt-20" id={artifact.id}>
        <div
          className={clsx(
            container,
            "grid gap-16 lg:grid-cols-2 lg:items-center",
          )}
        >
          <div>
            <ChapterHeading
              eyebrow={artifact.eyebrow[lang]}
              lede={artifact.lede[lang]}
              numeral={artifact.numeral}
              title={artifact.title[lang]}
            />
            <ul className="mt-8 space-y-3">
              {artifact.points.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <li className="flex gap-3 text-white/75">
                    <Check />
                    {p[lang]}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="space-y-10">
            <Reveal>
              <ArtifactItem lang={lang} />
            </Reveal>
            <Reveal delay={0.1}>
              <Card
                icon={artifact.token.icon}
                text={artifact.token.text[lang]}
                title={artifact.token.title[lang]}
              />
            </Reveal>
          </div>
        </div>
      </section>
    </ParallaxImage>
  );
}

function Classes({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const c = classes.list[active];

  return (
    <Section id={classes.id}>
      <div className={container}>
        <ChapterHeading
          eyebrow={classes.eyebrow[lang]}
          lede={classes.lede[lang]}
          numeral={classes.numeral}
          title={classes.title[lang]}
        />
        <div className="no-scrollbar -mx-5 mt-12 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {classes.list.map((k, i) => (
            <button
              key={k.key}
              aria-pressed={i === active}
              className={clsx(
                "flex shrink-0 items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition",
                i === active
                  ? "border-transparent bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:text-white/80",
              )}
              style={
                i === active
                  ? { boxShadow: `0 0 0 1px ${k.color}, 0 0 22px ${k.color}55` }
                  : undefined
              }
              onClick={() => setActive(i)}
            >
              <WowIcon glow="none" icon={k.icon} size={30} />
              {k.name[lang]}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={c.key}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 grid gap-5 md:grid-cols-3"
            exit={{ opacity: 0, y: -12 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35 }}
          >
            {c.spells.map((s, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6"
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
                  }}
                />
                <p
                  className="text-[11px] uppercase tracking-[0.25em]"
                  style={{ color: c.color }}
                >
                  {s.spec[lang]}
                </p>
                <h3 className="mt-3 font-heading text-2xl text-white">
                  {s.name[lang]}
                </h3>
              </div>
            ))}
            <p className="text-lg italic text-white/55 md:col-span-3">
              « {c.flavor[lang]} »
            </p>
          </motion.div>
        </AnimatePresence>
        <Reveal className="mt-14">
          <div className="flex flex-col gap-6 rounded-2xl border border-wow-blue/30 bg-gradient-to-r from-wow-blue-dark/60 to-transparent p-6 sm:flex-row sm:items-center sm:p-8">
            <WowIcon glow="ice" icon={classes.surge.icon} size={64} />
            <div>
              <h3 className="font-heading text-2xl text-wow-blue-ice">
                {classes.surge.title[lang]}
              </h3>
              <p className="mt-2 text-white/70">{classes.surge.text[lang]}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Raids({ lang }: { lang: Lang }) {
  return (
    <section className="scroll-mt-20" id={raids.id}>
      <ParallaxImage
        className="flex min-h-[70vh] items-end pb-16 pt-40"
        overlay="from-wow-darker/30 via-wow-darker/50 to-wow-darker"
        src={raids.image}
      >
        <div className={container}>
          <ChapterHeading
            eyebrow={raids.eyebrow[lang]}
            lede={raids.lede[lang]}
            numeral={raids.numeral}
            title={raids.title[lang]}
          />
        </div>
      </ParallaxImage>
      <div className={clsx(container, "pb-24 sm:pb-32")}>
        <StatRow lang={lang} stats={raids.stats} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {raids.cards.map((c, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <Card icon={c.icon} text={c.text[lang]} title={c.title[lang]} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="h-full rounded-2xl border border-wow-blue/25 bg-wow-blue-dark/30 p-7">
              <h3 className="font-heading text-2xl text-wow-blue-ice">
                {raids.howTitle[lang]}
              </h3>
              <ul className="mt-5 space-y-3">
                {raids.how.map((h, i) => (
                  <li key={i} className="flex gap-3 text-white/75">
                    <Check />
                    {h[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Card
              icon="achievement_reputation_argentcrusader"
              text={raids.trial.text[lang]}
              title={raids.trial.title[lang]}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Eye({ lang }: { lang: Lang }) {
  return (
    <Section className="overflow-hidden" id={eye.id}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(74,222,128,0.08),transparent_55%)]" />
      <div
        className={clsx(
          container,
          "relative grid gap-14 lg:grid-cols-2 lg:items-center",
        )}
      >
        <Reveal className="order-2 lg:order-1">
          <div className="relative">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-green-400/20 shadow-[0_0_60px_rgba(74,222,128,0.12)]">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${encodeURI(eye.image)}")` }}
              />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-1/2 overflow-hidden rounded-xl border border-orange-300/30 shadow-2xl sm:block">
              <div
                className="aspect-[16/10] bg-cover bg-center"
                style={{
                  backgroundImage: `url("${encodeURI(eye.mountImage)}")`,
                }}
              />
            </div>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <ChapterHeading
            eyebrow={eye.eyebrow[lang]}
            lede={eye.lede[lang]}
            numeral={eye.numeral}
            title={eye.title[lang]}
            tone="fel"
          />
          <ul className="mt-8 space-y-4">
            {eye.points.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="flex items-center gap-4 text-white/75">
                  <WowIcon glow="fel" icon={p.icon} size={40} />
                  {p.text[lang]}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function WorldBosses({ lang }: { lang: Lang }) {
  return (
    <Section id={worldBosses.id}>
      <div className={container}>
        <ChapterHeading
          align="center"
          eyebrow={worldBosses.eyebrow[lang]}
          lede={worldBosses.lede[lang]}
          numeral={worldBosses.numeral}
          title={worldBosses.title[lang]}
          tone="ice"
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {worldBosses.bosses.map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.article
                className="group relative flex min-h-[520px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10"
                whileHover={{ y: -6 }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] group-hover:scale-110"
                  style={{ backgroundImage: `url("${encodeURI(b.image)}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
                <div className="relative p-7 sm:p-9">
                  <span className="rounded-full border border-wow-blue-ice/40 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-wow-blue-ice">
                    {b.phase[lang]}
                  </span>
                  <h3 className="mt-5 font-heading text-3xl text-white sm:text-4xl">
                    {b.name[lang]}
                  </h3>
                  <p className="mt-4 leading-relaxed text-white/70">
                    {b.text[lang]}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {b.tags.map((t, j) => (
                      <span
                        key={j}
                        className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm"
                      >
                        {t[lang]}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Loot({ lang }: { lang: Lang }) {
  return (
    <Section
      className="overflow-hidden bg-gradient-to-b from-transparent via-wow-gold/[0.03] to-transparent"
      id={raidRules.id}
    >
      <div className={container}>
        <ChapterHeading
          eyebrow={raidRules.eyebrow[lang]}
          lede={raidRules.lede[lang]}
          numeral={raidRules.numeral}
          title={raidRules.title[lang]}
        />
        <ol className="mt-14 grid gap-3 sm:grid-cols-5">
          {raidRules.steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <li className="relative flex h-full items-center gap-4 rounded-xl border border-wow-gold/20 bg-wow-darker/80 px-5 py-3 sm:block sm:py-5">
                <span className="font-heading text-3xl text-wow-gold/60">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-white/85 sm:mt-2">
                  {s[lang]}
                </p>
                {i < raidRules.steps.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden h-px w-3 bg-wow-gold/40 sm:block" />
                )}
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <ul className="space-y-3">
            {raidRules.points.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="flex gap-3 text-white/75">
                  <Check />
                  {p[lang]}
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <Card
              icon="spell_shadow_soulleech_3"
              text={raidRules.fight.text[lang]}
              title={raidRules.fight.title[lang]}
            />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Archivists({ lang }: { lang: Lang }) {
  return (
    <section className="scroll-mt-20" id={archivists.id}>
      <ParallaxImage
        className="flex min-h-[60vh] items-end pb-14 pt-40"
        overlay="from-wow-darker/20 via-wow-darker/60 to-wow-darker"
        src={archivists.image}
      >
        <div className={container}>
          <ChapterHeading
            eyebrow={archivists.eyebrow[lang]}
            lede={archivists.lede[lang]}
            numeral={archivists.numeral}
            title={archivists.title[lang]}
          />
        </div>
      </ParallaxImage>
      <div className={clsx(container, "pb-24 sm:pb-32")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {archivists.rewards.map((r, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className="flex h-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <WowIcon icon={r.icon} size={46} />
                <div>
                  <h3 className="font-heading text-lg text-wow-gold-light">
                    {r.title[lang]}
                  </h3>
                  <p className="text-sm text-white/55">{r.text[lang]}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {archivists.extras.map((e, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <Card icon={e.icon} text={e.text[lang]} title={e.title[lang]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Professions({ lang }: { lang: Lang }) {
  return (
    <Section className="overflow-hidden" id={professions.id}>
      <div className={container}>
        <ChapterHeading
          eyebrow={professions.eyebrow[lang]}
          lede={professions.lede[lang]}
          numeral={professions.numeral}
          title={professions.title[lang]}
        />
        <div className="mt-14">
          <Carousel label={professions.eyebrow[lang]}>
            {professions.list.map((p) => (
              <div
                key={p.key}
                className="h-full rounded-2xl border border-white/10 bg-gradient-to-b from-wow-panel to-wow-darker p-7"
              >
                <div className="flex items-center gap-4">
                  <WowIcon icon={p.icon} size={56} />
                  <div>
                    <h3 className="font-heading text-2xl text-white">
                      {p.name[lang]}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.15em] text-wow-gold-light/70">
                      {p.specs[lang]}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-white/70"
                    >
                      <Check />
                      {h[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </Section>
  );
}

function Fishing({ lang }: { lang: Lang }) {
  return (
    <Section className="overflow-hidden" id={fishing.id}>
      <div
        className={clsx(
          container,
          "grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-start",
        )}
      >
        <div className="lg:sticky lg:top-28">
          <ChapterHeading
            eyebrow={fishing.eyebrow[lang]}
            lede={fishing.lede[lang]}
            numeral={fishing.numeral}
            title={fishing.title[lang]}
            tone="ice"
          />
          <Reveal className="mt-10 hidden lg:block">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-wow-blue/20">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${encodeURI(fishing.image)}")`,
                }}
              />
            </div>
          </Reveal>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {fishing.cards.map((c, i) => (
            <Reveal
              key={i}
              className={i % 2 ? "sm:translate-y-10" : ""}
              delay={i * 0.07}
            >
              <Card
                glow="ice"
                icon={c.icon}
                text={c.text[lang]}
                title={c.title[lang]}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Treasures({ lang }: { lang: Lang }) {
  return (
    <section className="scroll-mt-20" id={treasures.id}>
      <ParallaxImage
        className="py-24 sm:py-32"
        overlay="from-wow-darker via-wow-darker/80 to-wow-darker"
        src={treasures.image}
      >
        <div className={container}>
          <ChapterHeading
            align="center"
            eyebrow={treasures.eyebrow[lang]}
            lede={treasures.lede[lang]}
            numeral={treasures.numeral}
            title={treasures.title[lang]}
          />
          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <span className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-wow-gold/30 md:block" />
            {treasures.steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="relative text-center">
                  <WowIcon className="mx-auto" icon={s.icon} size={64} />
                  <p className="mt-2 font-heading text-sm text-wow-gold/60">
                    {i + 1}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl text-white">
                    {s.title[lang]}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xs text-white/65">
                    {s.text[lang]}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-wow-gold-light/70">
              {treasures.mountsTitle[lang]}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {treasures.mounts.map((m, i) => (
                <span
                  key={i}
                  className="rounded-full border border-wow-gold/30 bg-black/40 px-4 py-2 text-sm text-white/85 backdrop-blur-sm"
                >
                  <span className="mr-2 font-heading text-wow-gold">{i}</span>
                  {m[lang]}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </ParallaxImage>
    </section>
  );
}

function Collections({ lang }: { lang: Lang }) {
  return (
    <Section className="overflow-hidden" id={collections.id}>
      <div className={container}>
        <ChapterHeading
          eyebrow={collections.eyebrow[lang]}
          lede={collections.lede[lang]}
          numeral={collections.numeral}
          title={collections.title[lang]}
        />
        <StatRow className="mt-12" lang={lang} stats={collections.stats} />
      </div>
      <div className="mt-12 space-y-4">
        <IconMarquee icons={collections.marquee} speed={45} />
        <IconMarquee reverse icons={collections.marquee2} speed={55} />
      </div>
      <div className={clsx(container, "mt-12 grid gap-5 md:grid-cols-3")}>
        {collections.highlights.map((h, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Card icon={h.icon} text={h.text[lang]} title={h.title[lang]} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Economy({ lang }: { lang: Lang }) {
  return (
    <section className="scroll-mt-20" id={economy.id}>
      <ParallaxImage
        className="py-24 sm:py-32"
        overlay="from-wow-darker via-[#0a0614]/85 to-wow-darker"
        src={economy.image}
      >
        <div className={container}>
          <ChapterHeading
            eyebrow={economy.eyebrow[lang]}
            lede={economy.lede[lang]}
            numeral={economy.numeral}
            title={economy.title[lang]}
            tone="fel"
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {economy.cards.map((c, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <Card
                  glow="fel"
                  icon={c.icon}
                  tag={c.tag[lang]}
                  text={c.text[lang]}
                  title={c.title[lang]}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </ParallaxImage>
    </section>
  );
}

function Quiz({ lang }: { lang: Lang }) {
  const [picked, setPicked] = useState<number | null>(null);
  // the right answer is the first of the data; shown in a fixed shuffled order
  const order = [2, 0, 3, 1];

  return (
    <Section id={quiz.id}>
      <div
        className={clsx(
          container,
          "grid gap-14 lg:grid-cols-2 lg:items-center",
        )}
      >
        <div>
          <ChapterHeading
            eyebrow={quiz.eyebrow[lang]}
            lede={quiz.lede[lang]}
            numeral={quiz.numeral}
            title={quiz.title[lang]}
            tone="ice"
          />
          <StatRow className="mt-10" lang={lang} stats={quiz.stats} />
        </div>
        <Reveal>
          <div className="rounded-2xl border border-wow-gold/30 bg-[#1b140b]/90 p-6 shadow-[0_0_60px_rgba(199,156,62,0.12)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-wow-gold-light/70">
              {lang === "fr" ? "Une question facile" : "An easy question"}
            </p>
            <p className="mt-4 font-heading text-xl leading-snug text-[#f3e3c3] sm:text-2xl">
              {quiz.sample.question[lang]}
            </p>
            <div className="mt-6 space-y-3">
              {order.map((i) => {
                const right = i === quiz.sample.right;
                const state =
                  picked === null
                    ? "idle"
                    : right
                      ? "right"
                      : picked === i
                        ? "wrong"
                        : "idle";

                return (
                  <button
                    key={i}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition",
                      state === "right" &&
                        "border-green-400/70 bg-green-500/15 text-green-200",
                      state === "wrong" &&
                        "border-red-400/70 bg-red-500/15 text-red-200",
                      state === "idle" &&
                        "border-white/10 bg-black/30 text-white/80 hover:border-wow-gold/50",
                    )}
                    disabled={picked !== null}
                    onClick={() => setPicked(i)}
                  >
                    <span className="h-2 w-2 rounded-full bg-wow-gold/60" />
                    {quiz.sample.answers[i][lang]}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.p
                animate={{ opacity: 1 }}
                className="mt-5 text-sm text-white/60"
                initial={{ opacity: 0 }}
              >
                {picked === quiz.sample.right
                  ? lang === "fr"
                    ? "Exact ! Le Kirin Tor récompense votre savoir."
                    : "Correct! The Kirin Tor rewards your knowledge."
                  : lang === "fr"
                    ? "Non… la réponse était : Désolation des dragons."
                    : "No… the answer was: Dragonblight."}
              </motion.p>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Transmog({ lang }: { lang: Lang }) {
  return (
    <Section className="overflow-hidden" id={transmog.id}>
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <div
          className="h-full w-full bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url("${encodeURI(transmog.image)}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-wow-darker via-wow-darker/40 to-transparent" />
      </div>
      <div className={clsx(container, "relative")}>
        <div className="max-w-2xl">
          <ChapterHeading
            eyebrow={transmog.eyebrow[lang]}
            lede={transmog.lede[lang]}
            numeral={transmog.numeral}
            title={transmog.title[lang]}
          />
          <div className="mt-10 flex flex-wrap gap-2">
            {transmog.categories.map((c, i) => (
              <Reveal key={i} delay={i * 0.04} y={10}>
                <span className="inline-block rounded-md border border-wow-gold/25 bg-black/40 px-3 py-2 text-sm text-white/80">
                  {c[lang]}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function PvP({ lang }: { lang: Lang }) {
  return (
    <section className="scroll-mt-20" id={pvp.id}>
      <ParallaxImage
        className="py-24 sm:py-32"
        overlay="from-wow-darker via-[#140608]/85 to-wow-darker"
        src={pvp.image}
      >
        <div className={container}>
          <ChapterHeading
            eyebrow={pvp.eyebrow[lang]}
            lede={pvp.lede[lang]}
            numeral={pvp.numeral}
            title={pvp.title[lang]}
            tone="blood"
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pvp.cards.map((c, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <Card icon={c.icon} text={c.text[lang]} title={c.title[lang]} />
              </Reveal>
            ))}
          </div>
        </div>
      </ParallaxImage>
    </section>
  );
}

function Guilds({ lang }: { lang: Lang }) {
  return (
    <Section id={guilds.id}>
      <div className={container}>
        <ChapterHeading
          eyebrow={guilds.eyebrow[lang]}
          lede={guilds.lede[lang]}
          numeral={guilds.numeral}
          title={guilds.title[lang]}
        />
        <ol className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.perks.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <li className="flex h-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="relative">
                  <WowIcon icon={p.icon} size={44} />
                  <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-wow-gold px-1 font-heading text-xs text-black">
                    {p.lvl}
                  </span>
                </div>
                <p className="text-sm leading-snug text-white/75">
                  {p.text[lang]}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="mt-10 border-l-2 border-wow-gold/50 pl-5 text-white/65">
            {guilds.extra[lang]}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

function Glory({ lang }: { lang: Lang }) {
  return (
    <section className="scroll-mt-20" id={glory.id}>
      <ParallaxImage
        className="py-24 sm:py-32"
        overlay="from-wow-darker via-wow-darker/80 to-wow-darker"
        src={glory.image}
      >
        <div className={clsx(container, "grid gap-14 lg:grid-cols-2")}>
          <div>
            <ChapterHeading
              eyebrow={glory.eyebrow[lang]}
              lede={glory.lede[lang]}
              numeral={glory.numeral}
              title={glory.title[lang]}
              tone="ice"
            />
            <div className="mt-10 flex flex-wrap gap-2">
              {glory.titles.map((t, i) => (
                <span
                  key={i}
                  className="rounded-md border border-wow-blue-ice/30 bg-black/40 px-3 py-2 font-heading text-sm text-wow-blue-ice"
                >
                  {t[lang]}
                </span>
              ))}
            </div>
          </div>
          <ul className="space-y-3 self-end">
            {glory.firsts.map((f, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-sm">
                  <span className="font-heading text-2xl text-wow-gold/70">
                    #1
                  </span>
                  <span className="text-white/80">{f[lang]}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </ParallaxImage>
    </section>
  );
}

function Finale({ lang, joinHref }: { lang: Lang; joinHref: string }) {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div
        className="animate-ken-burns absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${encodeURI(finale.image)}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-wow-darker via-wow-darker/70 to-wow-darker/40" />
      <div className={clsx(container, "relative text-center")}>
        <Reveal>
          <h2 className="font-heading text-5xl text-white sm:text-7xl">
            <span className="wow-ice-text">{finale.title[lang]}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/75">
            {finale.text[lang]}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <a
            className="mt-12 inline-block rounded-md bg-gradient-to-b from-wow-gold-light to-wow-gold-dark px-10 py-5 font-heading text-xl text-black shadow-[0_0_40px_rgba(199,156,62,0.5)] transition hover:shadow-[0_0_60px_rgba(199,156,62,0.8)]"
            href={joinHref}
          >
            {finale.cta[lang]}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export default function ExperienceContent({ locale }: { locale: string }) {
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const joinHref = `/${locale}/register`;

  return (
    <div className="relative overflow-x-clip bg-wow-darker text-white">
      <ChapterNav
        chapters={nav.map((n) => ({ id: n.id, label: n.label[lang] }))}
      />
      <ExperienceHero
        content={{
          kicker: hero.kicker[lang],
          title: hero.title[lang],
          titleAccent: hero.titleAccent[lang],
          subtitle: hero.subtitle[lang],
          ctaPrimary: hero.ctaPrimary[lang],
          ctaSecondary: hero.ctaSecondary[lang],
          scroll: hero.scroll[lang],
        }}
        image="/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(4).jpg"
        joinHref={joinHref}
      />
      <Manifesto lang={lang} />
      <Phases lang={lang} />
      <Artifact lang={lang} />
      <Classes lang={lang} />
      <Raids lang={lang} />
      <Eye lang={lang} />
      <WorldBosses lang={lang} />
      <Loot lang={lang} />
      <Archivists lang={lang} />
      <Professions lang={lang} />
      <Fishing lang={lang} />
      <Treasures lang={lang} />
      <Collections lang={lang} />
      <Economy lang={lang} />
      <Quiz lang={lang} />
      <Transmog lang={lang} />
      <PvP lang={lang} />
      <Guilds lang={lang} />
      <Glory lang={lang} />
      <Finale joinHref={joinHref} lang={lang} />
    </div>
  );
}
