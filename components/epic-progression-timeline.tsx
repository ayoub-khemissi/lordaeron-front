"use client";

import { Fragment } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { useRealmHref } from "@/lib/realm-context";

const IMG = "/img/epic-progressive";

type Boss = { name: string; image: string };
type Tier = {
  label: string;
  raid: string;
  ilvl: string;
  bosses: Boss[];
  transition?: boolean;
};
type Theme = {
  frame: string;
  glow: string;
  title: string;
  lineColor: string;
  accent: string;
};

const expansions = [
  {
    name: "Vanilla",
    bgImage:
      "/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_Onyxia_1920x1080.jpg",
    theme: {
      frame: "from-amber-400 to-amber-700",
      glow: "shadow-[0_0_14px_rgba(199,156,62,0.5)]",
      title: "wow-gradient-text",
      lineColor: "bg-wow-gold/25",
      accent: "text-amber-300",
    } satisfies Theme,
    tiers: [
      {
        label: "Tier 1",
        raid: "Molten Core",
        ilvl: "61-70",
        bosses: [{ name: "Ragnaros", image: "ragnaros.jpeg" }],
      },
      {
        label: "Tier 2",
        raid: "Blackwing Lair",
        ilvl: "73-83",
        bosses: [{ name: "Nefarian", image: "nefarian.jpg" }],
      },
      {
        label: "Transition",
        raid: "Zul'Gurub",
        ilvl: "65-68",
        bosses: [{ name: "Hakkar", image: "hakkar.jpg" }],
        transition: true,
      },
      {
        label: "Tier 2.5",
        raid: "AQ40 / AQ20",
        ilvl: "66-88",
        bosses: [
          { name: "C'Thun", image: "cthun.jpg" },
          { name: "Ossirian", image: "ossirian.jpg" },
        ],
      },
    ] satisfies Tier[],
  },
  {
    name: "The Burning Crusade",
    bgImage:
      "/img/Burning Crusade Classic  Black Temple Screenshots 1080/BCC_Hyjal_Archimonde.jpg",
    theme: {
      frame: "from-green-400 to-green-700",
      glow: "shadow-[0_0_14px_rgba(74,222,128,0.5)]",
      title: "wow-fel-text",
      lineColor: "bg-green-500/25",
      accent: "text-green-300",
    } satisfies Theme,
    tiers: [
      {
        label: "Tier 4",
        raid: "Karazhan / Gruul / Magtheridon",
        ilvl: "115-125",
        bosses: [
          { name: "Malchezaar", image: "malchezaar.jpg" },
          { name: "Gruul", image: "gruul.jpg" },
          { name: "Magtheridon", image: "magtheridon.jpg" },
        ],
      },
      {
        label: "Tier 5",
        raid: "SSC / The Eye",
        ilvl: "128-133",
        bosses: [
          { name: "Lady Vashj", image: "vashj.jpg" },
          { name: "Kael'thas", image: "kaelthas.jpg" },
        ],
      },
      {
        label: "Tier 6",
        raid: "Hyjal / Black Temple",
        ilvl: "141-151",
        bosses: [
          { name: "Archimonde", image: "archimonde.jpg" },
          { name: "Illidan", image: "illidan.jpg" },
        ],
      },
      {
        label: "Transition",
        raid: "Zul'Aman",
        ilvl: "128-141",
        bosses: [{ name: "Zul'jin", image: "zuljin.jpg" }],
        transition: true,
      },
      {
        label: "Tier 6.5",
        raid: "Sunwell Plateau",
        ilvl: "154-164",
        bosses: [{ name: "Kil'jaeden", image: "kiljaeden.jpg" }],
      },
    ] satisfies Tier[],
  },
  {
    name: "Wrath of the Lich King",
    bgImage:
      "/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(1).jpg",
    theme: {
      frame: "from-sky-300 to-sky-600",
      glow: "shadow-[0_0_14px_rgba(125,211,252,0.5)]",
      title: "wow-ice-text",
      lineColor: "bg-sky-400/25",
      accent: "text-sky-300",
    } satisfies Theme,
    tiers: [
      {
        label: "Tier 7",
        raid: "Naxx / Malygos / Sartharion",
        ilvl: "200-213",
        bosses: [
          { name: "Kel'Thuzad", image: "kelthuzad.jpg" },
          { name: "Malygos", image: "malygos.jpg" },
          { name: "Sartharion", image: "sartharion.jpg" },
        ],
      },
      {
        label: "Tier 8",
        raid: "Ulduar",
        ilvl: "219-239",
        bosses: [{ name: "Yogg-Saron", image: "yoggsaron.jpg" }],
      },
      {
        label: "Tier 9",
        raid: "ToC / Onyxia",
        ilvl: "232-258",
        bosses: [
          { name: "Anub'arak", image: "anubarak.jpg" },
          { name: "Onyxia", image: "onyxia.jpg" },
        ],
      },
      {
        label: "Tier 10",
        raid: "Icecrown Citadel",
        ilvl: "251-277",
        bosses: [{ name: "The Lich King", image: "lichking.jpg" }],
      },
      {
        label: "Final",
        raid: "Ruby Sanctum",
        ilvl: "258-284",
        bosses: [{ name: "Halion", image: "halion.jpg" }],
      },
    ] satisfies Tier[],
  },
];

/* ── Boss portrait (unit-frame style) ── */
const BossPortrait = ({
  boss,
  theme,
  showName = true,
}: {
  boss: Boss;
  theme: Theme;
  showName?: boolean;
}) => (
  <motion.div
    className="flex flex-col items-center"
    whileHover={{ scale: 1.12, transition: { duration: 0.2 } }}
  >
    <div
      className={`w-14 h-14 md:w-[72px] md:h-[72px] rounded-full p-[2px] md:p-[3px] bg-gradient-to-b ${theme.frame} ${theme.glow}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden ring-1 ring-black/50">
        <Image
          alt={boss.name}
          className="object-cover w-full h-full"
          height={160}
          src={`${IMG}/${boss.image}`}
          width={160}
        />
      </div>
    </div>
    {showName && (
      <span className="text-[10px] text-gray-400 mt-1.5 text-center leading-tight max-w-[80px]">
        {boss.name}
      </span>
    )}
  </motion.div>
);

export const EpicProgressionTimeline = ({
  standalone = false,
}: {
  standalone?: boolean;
}) => {
  const t = useTranslations("home");
  const te = useTranslations("epicProgression");
  const realmHref = useRealmHref();

  return (
    <section className="relative overflow-hidden">
      {/* ── Expansion sections ── */}
      {expansions.map((exp, ei) => (
        <div
          key={exp.name}
          className={`relative overflow-hidden ${ei === 0 ? (standalone ? "pb-12 md:pb-20" : "pt-20 pb-12 md:pt-28 md:pb-20") : "py-12 md:py-20"}`}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-15"
            style={{ backgroundImage: `url('${exp.bgImage}')` }}
          />
          {/* Gradient overlays for smooth section transitions */}
          <div className="absolute inset-0 bg-gradient-to-b from-wow-darker via-transparent to-wow-darker" />

          <div className="relative container mx-auto max-w-5xl px-6">
            {/* Section header (inside first expansion for seamless bg) */}
            {ei === 0 && !standalone && (
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold wow-gradient-text mb-3 pb-1">
                  {t("epicProgressionTitle")}
                </h2>
                <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-4">
                  {t("epicProgressionDesc")}
                </p>
                <div className="shimmer-line w-24 mx-auto mb-5" />
                <NextLink
                  className="inline-block text-sm text-wow-gold hover:text-wow-gold-light transition-colors underline underline-offset-4"
                  href={realmHref("/epic-progression")}
                >
                  {te("learnMore")} &rarr;
                </NextLink>
              </motion.div>
            )}

            {/* Expansion title */}
            <motion.h3
              className={`text-2xl sm:text-3xl font-bold text-center mb-10 md:mb-14 ${exp.theme.title}`}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {exp.name}
            </motion.h3>

            {/* Timeline */}
            <div className="relative">
              {/* Desktop vertical line (centered) */}
              <div
                className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 ${exp.theme.lineColor}`}
              />

              {/* ── Desktop: alternating left/right ── */}
              <div className="hidden md:block space-y-2">
                {exp.tiers.map((tier, i) => {
                  const isLeft = i % 2 === 0;

                  return (
                    <motion.div
                      key={tier.label}
                      className="flex items-center py-4"
                      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      whileInView={{ opacity: 1, x: 0 }}
                    >
                      {/* Left side */}
                      <div className="flex-1 pr-8">
                        {isLeft && (
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-xs uppercase tracking-widest font-bold ${
                                tier.transition
                                  ? "text-gray-500 italic"
                                  : tier.label === "Final"
                                    ? "wow-gradient-text"
                                    : exp.theme.accent
                              }`}
                            >
                              {tier.label}
                            </span>
                            <span className="text-sm text-gray-400 mt-0.5">
                              {tier.raid}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5">
                              ilvl {tier.ilvl}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Center - portraits (on the timeline) */}
                      <div className="relative z-10 flex items-start gap-3 shrink-0">
                        {tier.bosses.map((boss) => (
                          <BossPortrait
                            key={boss.name}
                            boss={boss}
                            theme={exp.theme}
                          />
                        ))}
                      </div>

                      {/* Right side */}
                      <div className="flex-1 pl-8">
                        {!isLeft && (
                          <div className="flex flex-col items-start">
                            <span
                              className={`text-xs uppercase tracking-widest font-bold ${
                                tier.transition
                                  ? "text-gray-500 italic"
                                  : tier.label === "Final"
                                    ? "wow-gradient-text"
                                    : exp.theme.accent
                              }`}
                            >
                              {tier.label}
                            </span>
                            <span className="text-sm text-gray-400 mt-0.5">
                              {tier.raid}
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5">
                              ilvl {tier.ilvl}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ── Mobile: centered vertical flow ── */}
              <div className="md:hidden flex flex-col items-center">
                {exp.tiers.map((tier, i) => (
                  <Fragment key={tier.label}>
                    <motion.div
                      className="flex flex-col items-center py-3"
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      viewport={{ once: true }}
                      whileInView={{ opacity: 1, y: 0 }}
                    >
                      {/* Tier label */}
                      <span
                        className={`text-[11px] uppercase tracking-widest font-bold mb-2 ${
                          tier.transition
                            ? "text-gray-500 italic"
                            : tier.label === "Final"
                              ? "wow-gradient-text"
                              : exp.theme.accent
                        }`}
                      >
                        {tier.label}
                      </span>

                      {/* Boss portraits */}
                      <div className="flex items-start justify-center gap-2 mb-1.5">
                        {tier.bosses.map((boss) => (
                          <BossPortrait
                            key={boss.name}
                            boss={boss}
                            showName={false}
                            theme={exp.theme}
                          />
                        ))}
                      </div>

                      {/* Raid name */}
                      <span className="text-xs text-gray-400 text-center">
                        {tier.raid}
                      </span>
                      {/* ilvl */}
                      <span className="text-[10px] text-gray-500 text-center mt-0.5">
                        ilvl {tier.ilvl}
                      </span>
                      {/* Boss names */}
                      <span className="text-[10px] text-gray-500 text-center mt-0.5">
                        {tier.bosses.map((b) => b.name).join(" · ")}
                      </span>
                    </motion.div>

                    {/* Mobile connector */}
                    {i < exp.tiers.length - 1 && (
                      <div className="flex flex-col items-center my-1">
                        <div className={`w-px h-3 ${exp.theme.lineColor}`} />
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${exp.theme.lineColor}`}
                        />
                        <div className={`w-px h-3 ${exp.theme.lineColor}`} />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
