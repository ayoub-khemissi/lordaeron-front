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
import {
  classSpellRefs,
  refByCardIcon,
  refByIcon,
  refByInlineText,
  refByName,
  surgeRef,
} from "./tooltip-refs";

import {
  Tip,
  TooltipProvider,
  useTipEntry,
  useTipText,
} from "@/components/experience/game-tooltip";
import { ChapterNav, ExperienceHero } from "@/components/experience/hero";
import {
  BgImg,
  Carousel,
  ChapterHeading,
  Counter,
  CtaButton,
  EdgeFade,
  IconMarquee,
  ParallaxImage,
  Reveal,
  WowIcon,
} from "@/components/experience/primitives";

const container = "mx-auto w-full max-w-7xl px-5 sm:px-8";

/* ── in-game tooltips: the ref of a card from its FR text (tooltip-refs.ts) ── */
const tipOf = (t: T) => refByName[t.fr.replace(/\*\*/g, "")];
const tipText =
  "underline decoration-wow-gold/50 decoration-dotted underline-offset-4";

// item names inside longer texts; the English page uses the names of content.ts's English texts
const inlineEn: Record<string, string> = {
  "Chronicle Fragments": refByInlineText["Fragments de chronique"],
  "Fel-Touched Defias Palfrey": refByInlineText["Palefroi gangrené défias"],
  "Ember Nightmare": refByInlineText["Cauchemar de braise"],
  "Stone Keeper's Shards": refByInlineText["Éclats du gardien de pierre"],
  "Old Frostfin": refByInlineText["Vieille Nageoire-de-givre"],
  "Deadwater Leviathan": refByInlineText["Léviathan des eaux mortes"],
  "Kalu'ak Harpoon": refByInlineText["Harpon kalu'ak"],
  "Saronite Harpoon": refByInlineText["Harpon de saronite"],
  "Drakkari Flood": refByInlineText["Crue drakkari"],
  "Kirin Tor rod": refByInlineText["canne du Kirin Tor"],
  "Lucky Gnome": refByInlineText["Gnome porte-bonheur"],
  "legendary cloak": refByInlineText["cape légendaire"],
  "Whispering Saronite Vein": refByInlineText["Veine de saronite murmurante"],
  "Keepers' Bloom": refByInlineText["Fleur des Gardiens"],
  "Aurora Rose": refByInlineText["Rose des aurores"],
};
const inlineAll: Record<string, string> = { ...refByInlineText, ...inlineEn };
const inlineRe = new RegExp(
  `(${Object.keys(inlineAll)
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
);

// a text of content.ts: **key facts** in gold, item names with their tooltip
function Rich({ text }: { text: string }) {
  const names = (part: string, key: number) =>
    part.split(inlineRe).map((bit, i) =>
      inlineAll[bit] ? (
        <Tip key={`${key}-${i}`} className={tipText} id={inlineAll[bit]}>
          {bit}
        </Tip>
      ) : (
        bit
      ),
    );

  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-wow-gold-light">
            {names(part, i)}
          </strong>
        ) : (
          names(part, i)
        ),
      )}
    </>
  );
}

/* ── small shared pieces ── */
function Card({
  icon,
  title,
  text,
  tag,
  tip,
  glow = "gold",
  className,
}: {
  icon?: string;
  title: string;
  text: string;
  tag?: string;
  tip?: string;
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
      {icon && (
        <WowIcon
          className="mb-5"
          glow={glow}
          icon={icon}
          size={52}
          tip={tip ?? refByCardIcon[icon.toLowerCase()]}
        />
      )}
      {tag && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-wow-blue-ice/80">
          {tag}
        </p>
      )}
      <h3 className="font-heading text-xl text-wow-gold-light sm:text-2xl">
        <Tip id={tip}>{title}</Tip>
      </h3>
      <p className="mt-3 leading-relaxed text-white/65">
        <Rich text={text} />
      </p>
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
              <Rich text={manifesto.text[lang]} />
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
          lede={<Rich text={phases.lede[lang]} />}
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
                      <Rich text={s.text[lang]} />
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal>
          <p className="mt-14 border-l-2 border-wow-gold/50 pl-5 text-white/60">
            <Rich text={phases.footnote[lang]} />
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
              lede={<Rich text={artifact.lede[lang]} />}
              numeral={artifact.numeral}
              title={artifact.title[lang]}
            />
            <ul className="mt-8 space-y-3">
              {artifact.points.map((p, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <li className="flex gap-3 text-white/75">
                    <Check />
                    <Rich text={p[lang]} />
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
                tip={tipOf(artifact.token.title)}
                title={artifact.token.title[lang]}
              />
            </Reveal>
          </div>
        </div>
      </section>
    </ParallaxImage>
  );
}

// the class trainers' level of the 30 new spells (lab_world trainer_spell, 08/10/2026), in classes.list's order
const TRAINER_LEVEL: Record<string, number[]> = {
  paladin: [24, 40, 50],
  priest: [20, 30, 44],
  warrior: [20, 36, 50],
  deathknight: [58, 64, 72],
  druid: [30, 40, 50],
  hunter: [30, 40, 50],
  mage: [30, 40, 50],
  rogue: [30, 40, 50],
  shaman: [30, 40, 50],
  warlock: [30, 40, 50],
};

/* a new class spell: its icon (full tooltip on hover) and what it does, readable without hovering */
function ClassSpell({
  spell,
  name,
  spec,
  color,
  lang,
  level,
}: {
  spell?: { ref: string; icon: string };
  level?: number;
  name: string;
  spec: string;
  color: string;
  lang: Lang;
}) {
  const tip = useTipText(spell?.ref);
  // the effect: the gold lines of the tooltip (the description), after cost, range and cast time
  const effect = tip?.lines
    .filter((l) => l.color === "gold" || l.color === "yellow")
    .map((l) => l.left)
    .join(" ");

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div className="flex items-center gap-4">
        {spell && (
          <WowIcon glow="none" icon={spell.icon} size={48} tip={spell.ref} />
        )}
        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-[0.25em]"
            style={{ color }}
          >
            {spec}
          </p>
          <h3 className="mt-1 font-heading text-xl leading-tight text-white sm:text-2xl">
            <Tip id={spell?.ref}>{name}</Tip>
          </h3>
        </div>
      </div>
      <p className="mt-4 min-h-[4.5rem] text-sm leading-relaxed text-[#ffd100]/85">
        {effect ?? "…"}
      </p>
      {level && (
        <p className="mt-4 border-t border-white/10 pt-3 text-xs uppercase tracking-[0.18em] text-white/45">
          {lang === "fr"
            ? `Maître de classe · niveau ${level}`
            : `Class trainer · level ${level}`}
        </p>
      )}
    </div>
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
          lede={<Rich text={classes.lede[lang]} />}
          numeral={classes.numeral}
          title={classes.title[lang]}
        />
        <div className="no-scrollbar -mx-5 mt-12 flex gap-3 overflow-x-auto px-6 py-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {classes.list.map((k, i) => (
            <button
              key={k.key}
              aria-pressed={i === active}
              className={clsx(
                "flex shrink-0 items-center gap-3 rounded-lg border py-1.5 pl-2.5 pr-4 text-sm transition",
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
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-[5px] ring-1 ring-white/25 ring-offset-1 ring-offset-black/70">
                <img
                  alt=""
                  className="h-full w-full scale-[1.14] object-cover"
                  height={32}
                  src={`/img/experience/icons/classicon_${k.key}.png`}
                  width={32}
                />
              </span>
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
              <ClassSpell
                key={i}
                color={c.color}
                lang={lang}
                level={TRAINER_LEVEL[c.key]?.[i]}
                name={s.name[lang]}
                spec={s.spec[lang]}
                spell={classSpellRefs[c.key]?.[i]}
              />
            ))}
            <p className="text-lg italic text-white/55 md:col-span-3">
              « {c.flavor[lang]} »
            </p>
          </motion.div>
        </AnimatePresence>
        <Reveal className="mt-14">
          <div className="flex flex-col gap-6 rounded-2xl border border-wow-blue/30 bg-gradient-to-r from-wow-blue-dark/60 to-transparent p-6 sm:flex-row sm:items-center sm:p-8">
            <WowIcon
              glow="ice"
              icon={classes.surge.icon}
              size={64}
              tip={surgeRef}
            />
            <div>
              <h3 className="font-heading text-2xl text-wow-blue-ice">
                {classes.surge.title[lang]}
              </h3>
              <p className="mt-2 text-white/70">
                <Rich text={classes.surge.text[lang]} />
              </p>
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
            lede={<Rich text={raids.lede[lang]} />}
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
              <Card
                icon={c.icon}
                text={c.text[lang]}
                tip={tipOf(c.title)}
                title={c.title[lang]}
              />
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
                    <Rich text={h[lang]} />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Card
              icon="achievement_reputation_argentcrusader"
              text={raids.trial.text[lang]}
              tip={tipOf(raids.trial.title)}
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
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-green-400/20 shadow-[0_0_60px_rgba(74,222,128,0.12)]">
              <BgImg sizes="(min-width: 1024px) 50vw, 100vw" src={eye.image} />
            </div>
            <div className="absolute -bottom-8 -right-4 hidden w-1/2 overflow-hidden rounded-xl border border-orange-300/30 shadow-2xl sm:block">
              <div className="relative aspect-[16/10]">
                <BgImg sizes="25vw" src={eye.mountImage} />
              </div>
            </div>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <ChapterHeading
            eyebrow={eye.eyebrow[lang]}
            lede={<Rich text={eye.lede[lang]} />}
            numeral={eye.numeral}
            title={eye.title[lang]}
            tone="fel"
          />
          <ul className="mt-8 space-y-4">
            {eye.points.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="flex items-center gap-4 text-white/75">
                  <WowIcon
                    glow="fel"
                    icon={p.icon}
                    size={40}
                    tip={tipOf(p.text)}
                  />
                  <Rich text={p.text[lang]} />
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-300/70">
              {eye.nextTitle[lang]}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {eye.next.map((n) => (
                <span
                  key={n.phase}
                  className="flex items-center gap-2.5 rounded-lg border border-green-400/20 bg-black/40 py-1.5 pl-1.5 pr-3 text-sm text-white/80"
                >
                  <WowIcon glow="none" icon={n.icon} size={28} />
                  {n.name[lang]}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-green-300/70">
                    Phase {n.phase}
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
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
          lede={<Rich text={worldBosses.lede[lang]} />}
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
                <BgImg
                  className="transition-transform duration-[1.2s] group-hover:scale-110"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={b.image}
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
                    <Rich text={b.text[lang]} />
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {b.tags.map((t, j) => (
                      <span
                        key={j}
                        className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm"
                      >
                        <Tip
                          className={tipOf(t) ? tipText : undefined}
                          id={tipOf(t)}
                        >
                          {t[lang]}
                        </Tip>
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

/* the loot priority, played as an epic item looking for its owner, step after step */
function LootCascade({ lang }: { lang: Lang }) {
  const steps = raidRules.steps;
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 1700);

    return () => clearInterval(id);
  }, [running, steps.length]);

  return (
    <motion.div
      className="relative mt-16 rounded-2xl border border-wow-gold/15 bg-gradient-to-b from-wow-gold/[0.06] to-transparent px-5 py-10 sm:px-10"
      viewport={{ once: true, margin: "-120px" }}
      onViewportEnter={() => setRunning(true)}
    >
      <ol className="relative grid gap-6 sm:grid-cols-5 sm:gap-4">
        {/* the rail and its light, behind the medallions */}
        <span className="absolute bottom-8 left-[38px] top-8 w-px bg-wow-gold/15 sm:bottom-auto sm:left-[10%] sm:right-[10%] sm:top-[38px] sm:h-px sm:w-auto" />
        <motion.span
          animate={{ scaleY: step / (steps.length - 1) }}
          className="absolute left-[38px] top-8 h-[calc(100%-4rem)] w-px origin-top bg-gradient-to-b from-wow-gold to-wow-gold-light shadow-[0_0_12px_rgba(199,156,62,0.8)] sm:hidden"
          initial={{ scaleY: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          animate={{ scaleX: step / (steps.length - 1) }}
          className="absolute left-[10%] top-[38px] hidden h-px w-[80%] origin-left bg-gradient-to-r from-wow-gold to-wow-gold-light shadow-[0_0_12px_rgba(199,156,62,0.8)] sm:block"
          initial={{ scaleX: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        {steps.map((s, i) => {
          const on = i === step;
          const past = i < step;

          return (
            <li
              key={i}
              className="relative flex cursor-pointer items-center gap-5 sm:flex-col sm:gap-4 sm:text-center"
              onMouseEnter={() => {
                setRunning(false);
                setStep(i);
              }}
              onMouseLeave={() => setRunning(true)}
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: on ? 1.12 : 1 }}
                  className={clsx(
                    "relative grid h-[76px] w-[76px] place-items-center rounded-full border-2 bg-wow-darker transition-colors duration-500",
                    on
                      ? "border-wow-gold shadow-[0_0_35px_rgba(199,156,62,0.55)]"
                      : past
                        ? "border-wow-gold/50"
                        : "border-white/15",
                  )}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span
                    className={clsx(
                      "overflow-hidden rounded-full transition-all duration-500",
                      on || past
                        ? "opacity-100 grayscale-0"
                        : "opacity-50 grayscale",
                    )}
                  >
                    <WowIcon
                      className="!rounded-full !ring-0 !ring-offset-0"
                      glow="none"
                      icon={s.icon}
                      size={56}
                    />
                  </span>
                  <span
                    className={clsx(
                      "absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full font-heading text-xs transition-colors duration-500",
                      on || past
                        ? "bg-wow-gold text-black"
                        : "bg-white/10 text-white/60",
                    )}
                  >
                    {i + 1}
                  </span>
                </motion.div>
                {on && (
                  <motion.div
                    className="absolute -top-12 left-1/2 hidden -translate-x-1/2 sm:block"
                    layoutId="loot-item"
                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      <WowIcon glow="fel" icon="inv_sword_133" size={34} />
                    </motion.div>
                  </motion.div>
                )}
              </div>
              <p
                className={clsx(
                  "font-heading text-base leading-snug transition-colors duration-500 sm:text-lg",
                  on
                    ? "text-wow-gold-light"
                    : past
                      ? "text-white/70"
                      : "text-white/40",
                )}
              >
                {s.label[lang]}
              </p>
            </li>
          );
        })}
      </ol>
    </motion.div>
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
          lede={<Rich text={raidRules.lede[lang]} />}
          numeral={raidRules.numeral}
          title={raidRules.title[lang]}
        />
        <LootCascade lang={lang} />
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <ul className="space-y-3">
            {raidRules.points.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="flex gap-3 text-white/75">
                  <Check />
                  <Rich text={p[lang]} />
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <Card
              icon="spell_shadow_soulleech_3"
              text={raidRules.fight.text[lang]}
              tip={tipOf(raidRules.fight.title)}
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
            lede={<Rich text={archivists.lede[lang]} />}
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
                <WowIcon icon={r.icon} size={46} tip={tipOf(r.title)} />
                <div>
                  <h3 className="font-heading text-lg text-wow-gold-light">
                    {r.title[lang]}
                  </h3>
                  <p className="text-sm text-white/55">
                    <Rich text={r.text[lang]} />
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {archivists.extras.map((e, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <Card
                icon={e.icon}
                text={e.text[lang]}
                tip={tipOf(e.title)}
                title={e.title[lang]}
              />
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
          lede={<Rich text={professions.lede[lang]} />}
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
                  </div>
                </div>
                {/* the specializations, the heart of each profession */}
                {!p.specs[lang].includes(" · ") ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.15em] text-wow-gold-light/70">
                    {p.specs[lang]}
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.specs[lang].split(" · ").map((spec) => (
                      <span
                        key={spec}
                        className="rounded-md border border-wow-gold/40 bg-wow-gold/10 px-2.5 py-1 font-heading text-sm text-wow-gold-light"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
                <ul className="mt-6 space-y-3">
                  {p.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-white/70"
                    >
                      <Check />
                      <Tip
                        className={tipOf(h) ? tipText : undefined}
                        id={tipOf(h)}
                      >
                        <Rich text={h[lang]} />
                      </Tip>
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
            lede={<Rich text={fishing.lede[lang]} />}
            numeral={fishing.numeral}
            title={fishing.title[lang]}
            tone="ice"
          />
          <Reveal className="mt-10 hidden lg:block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-wow-blue/20">
              <BgImg sizes="40vw" src={fishing.image} />
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
                tip={tipOf(c.title)}
                title={c.title[lang]}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* a treasure mount: its real icon and requirements, the full tooltip on hover */
function TreasureMount({
  name,
  phase,
  lang,
}: {
  name: T;
  phase: number;
  lang: Lang;
}) {
  const ref = tipOf(name);
  const entry = useTipEntry(ref);
  const lines = entry?.[lang]?.lines.map((l) => l.left) ?? [];
  const flying = lines.some((l) => /volante|Outland or Northrend/.test(l));
  const level = lines
    .map((l) => l.match(/(?:Niveau|Requires level) (\d+)/i)?.[1])
    .find(Boolean);

  return (
    <Tip className="block h-full" id={ref}>
      <div className="group flex h-full items-center gap-4 rounded-xl border border-wow-gold/20 bg-black/45 p-4 backdrop-blur-sm transition-colors hover:border-wow-gold/50">
        {entry && <WowIcon glow="none" icon={entry.icon} size={52} />}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-wow-gold/80">
            {phase === 0
              ? lang === "fr"
                ? "Prélude"
                : "Prelude"
              : `Phase ${phase}`}
          </p>
          <p className="font-heading text-lg leading-tight text-[#c69bff]">
            {name[lang]}
          </p>
          <p className="text-xs text-white/55">
            {flying
              ? lang === "fr"
                ? "Monture volante"
                : "Flying mount"
              : lang === "fr"
                ? "Monture terrestre"
                : "Ground mount"}
            {level &&
              (lang === "fr" ? ` · niveau ${level}` : ` · level ${level}`)}
          </p>
        </div>
      </div>
    </Tip>
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
            lede={<Rich text={treasures.lede[lang]} />}
            numeral={treasures.numeral}
            title={treasures.title[lang]}
          />
          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            <span className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-wow-gold/30 md:block" />
            {treasures.steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="relative text-center">
                  <WowIcon
                    className="mx-auto"
                    icon={s.icon}
                    size={64}
                    tip={tipOf(s.title)}
                  />
                  <p className="mt-2 font-heading text-sm text-wow-gold/60">
                    {i + 1}
                  </p>
                  <h3 className="mt-2 font-heading text-2xl text-white">
                    {s.title[lang]}
                  </h3>
                  <p className="mx-auto mt-3 max-w-xs text-white/65">
                    <Rich text={s.text[lang]} />
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-16">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-wow-gold-light/70">
              {treasures.mountsTitle[lang]}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {treasures.mounts.map((m, i) => (
                <TreasureMount key={i} lang={lang} name={m} phase={i} />
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
          lede={<Rich text={collections.lede[lang]} />}
          numeral={collections.numeral}
          title={collections.title[lang]}
        />
        <StatRow className="mt-12" lang={lang} stats={collections.stats} />
      </div>
      <div className="mt-12 space-y-4">
        <IconMarquee icons={collections.marquee} speed={45} tips={refByIcon} />
        <IconMarquee
          reverse
          icons={collections.marquee2}
          speed={55}
          tips={refByIcon}
        />
      </div>
      <div className={clsx(container, "mt-12 grid gap-5 md:grid-cols-3")}>
        {collections.highlights.map((h, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Card
              icon={h.icon}
              text={h.text[lang]}
              tip={tipOf(h.title)}
              title={h.title[lang]}
            />
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
            lede={<Rich text={economy.lede[lang]} />}
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
                  tip={tipOf(c.title)}
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
            lede={<Rich text={quiz.lede[lang]} />}
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
        <BgImg className="opacity-50" sizes="50vw" src={transmog.image} />
        <div className="absolute inset-0 bg-gradient-to-r from-wow-darker via-wow-darker/40 to-transparent" />
        <EdgeFade />
      </div>
      <div className={clsx(container, "relative")}>
        <div className="max-w-2xl">
          <ChapterHeading
            eyebrow={transmog.eyebrow[lang]}
            lede={<Rich text={transmog.lede[lang]} />}
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
            lede={<Rich text={pvp.lede[lang]} />}
            numeral={pvp.numeral}
            title={pvp.title[lang]}
            tone="blood"
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pvp.cards.map((c, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <Card
                  icon={c.icon}
                  text={c.text[lang]}
                  tip={tipOf(c.title)}
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

function Guilds({ lang }: { lang: Lang }) {
  return (
    <Section id={guilds.id}>
      <div className={container}>
        <ChapterHeading
          eyebrow={guilds.eyebrow[lang]}
          lede={<Rich text={guilds.lede[lang]} />}
          numeral={guilds.numeral}
          title={guilds.title[lang]}
        />
        <ol className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.perks.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <li className="flex h-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="relative">
                  <WowIcon icon={p.icon} size={44} tip={tipOf(p.text)} />
                  <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-wow-gold px-1 font-heading text-xs text-black">
                    {p.lvl}
                  </span>
                </div>
                <p className="text-sm leading-snug text-white/75">
                  <Rich text={p.text[lang]} />
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="mt-10 border-l-2 border-wow-gold/50 pl-5 text-white/65">
            <Rich text={guilds.extra[lang]} />
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
              lede={<Rich text={glory.lede[lang]} />}
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
                <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm transition-colors hover:border-wow-gold/40 sm:px-5">
                  <WowIcon icon={f.icon} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-lg leading-tight text-wow-gold-light">
                      {f.name[lang]}
                    </p>
                    <p className="text-sm text-white/60">
                      <Rich text={f.text[lang]} />
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-full border border-wow-gold/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-wow-gold sm:block">
                    {lang === "fr" ? "Prem's" : "Realm First"}
                  </span>
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
      <BgImg className="animate-ken-burns" src={finale.image} />
      <div className="absolute inset-0 bg-gradient-to-t from-wow-darker via-wow-darker/70 to-wow-darker/40" />
      <EdgeFade bottom={false} />
      <div className={clsx(container, "relative text-center")}>
        <Reveal>
          <h2 className="font-heading text-5xl text-white sm:text-7xl">
            <span className="wow-ice-text">{finale.title[lang]}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/75">
            <Rich text={finale.text[lang]} />
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <CtaButton className="mt-12" href={joinHref}>
            {finale.cta[lang]}
          </CtaButton>
        </Reveal>
      </div>
    </section>
  );
}

export default function ExperienceContent({ locale }: { locale: string }) {
  const lang: Lang = locale === "fr" ? "fr" : "en";
  const joinHref = `/${locale}/register`;

  return (
    <TooltipProvider lang={lang}>
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
    </TooltipProvider>
  );
}
