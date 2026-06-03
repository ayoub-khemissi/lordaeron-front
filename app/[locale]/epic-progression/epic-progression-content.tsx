"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

import { EpicProgressionTimeline } from "@/components/epic-progression-timeline";

const WOWHEAD_ICON = "https://wow.zamimg.com/images/wow/icons/large";

const expansionCards = [
  {
    key: "vanilla",
    icon: `${WOWHEAD_ICON}/inv_hammer_unique_sulfuras.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_Onyxia_1920x1080.jpg",
    titleClass: "wow-gradient-text",
    borderClass: "border-wow-gold/20",
    glowClass: "glow-gold",
    accentClass: "text-amber-300",
  },
  {
    key: "tbc",
    icon: `${WOWHEAD_ICON}/inv_weapon_glave_01.jpg`,
    bg: "/img/Burning Crusade Classic  Black Temple Screenshots 1080/BCC_Black_Temple_Illidan.jpg",
    titleClass: "wow-fel-text",
    borderClass: "border-green-500/20",
    glowClass: "shadow-[0_0_30px_rgba(74,222,128,0.2)]",
    accentClass: "text-green-300",
  },
  {
    key: "wotlk",
    icon: `${WOWHEAD_ICON}/inv_sword_122.jpg`,
    bg: "/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(1).jpg",
    titleClass: "wow-ice-text",
    borderClass: "border-sky-400/20",
    glowClass: "shadow-[0_0_30px_rgba(125,211,252,0.2)]",
    accentClass: "text-sky-300",
  },
];

const restrictions = [
  {
    key: "restrictionGroup",
    icon: `${WOWHEAD_ICON}/spell_holy_prayerofspirit.jpg`,
  },
  { key: "restrictionTrade", icon: `${WOWHEAD_ICON}/inv_misc_coin_01.jpg` },
  { key: "restrictionAH", icon: `${WOWHEAD_ICON}/inv_misc_bag_10.jpg` },
  { key: "restrictionGuildBank", icon: `${WOWHEAD_ICON}/inv_box_02.jpg` },
  { key: "restrictionMail", icon: `${WOWHEAD_ICON}/inv_letter_15.jpg` },
];

export default function EpicProgressionContent() {
  const t = useTranslations("epicProgression");

  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(5)_png_jpgcopy.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />

      <div className="relative">
        {/* ── Hero ── */}
        <div className="container mx-auto max-w-5xl px-6 pt-16 pb-12">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black wow-gradient-text mb-3 pb-1">
              {t("title")}
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto mb-4">
              {t("subtitle")}
            </p>
            <div className="shimmer-line w-32 mx-auto" />
          </motion.div>

          {/* ── Introduction ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="glass glow-gold rounded-2xl p-8 sm:p-10">
              <h2 className="text-2xl font-bold wow-gradient-text mb-4">
                {t("introTitle")}
              </h2>
              <p className="text-gray-300 leading-relaxed">{t("introDesc")}</p>
            </div>
          </motion.section>

          {/* ── DK Note + Stay on Tier ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <motion.div
              className="glass-lite border-sky-400/15 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-sky-400/30 bg-wow-darker/50 flex-shrink-0">
                  <img
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={`${WOWHEAD_ICON}/spell_deathknight_classicon.jpg`}
                  />
                </div>
                <h3 className="text-lg font-bold wow-ice-text">
                  {t("dkTitle")}
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t("dkDesc")}
              </p>
            </motion.div>

            <motion.div
              className="glass-lite border-wow-gold/15 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-wow-gold/30 bg-wow-darker/50 flex-shrink-0">
                  <img
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={`${WOWHEAD_ICON}/inv_misc_groupneedmore.jpg`}
                  />
                </div>
                <h3 className="text-lg font-bold wow-gradient-text">
                  {t("stayOnTierTitle")}
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t("stayOnTierDesc")}
              </p>
            </motion.div>
          </div>

          {/* ── The 3 Expansion Tiers ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("paliersTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {expansionCards.map((card, index) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl group h-full ${card.glowClass}`}
                  >
                    <img
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-[opacity,scale] duration-700"
                      loading="lazy"
                      src={card.bg}
                    />

                    <div
                      className={`relative glass-lite ${card.borderClass} rounded-2xl p-8 h-full flex flex-col`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 border-2 border-wow-gold/40 glow-gold-strong bg-wow-darker/50 mx-auto">
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          src={card.icon}
                        />
                      </div>

                      <h3
                        className={`text-xl font-bold text-center mb-3 ${card.titleClass}`}
                      >
                        {t(`${card.key}Title`)}
                      </h3>

                      <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                        {t(`${card.key}Desc`)}
                      </p>

                      <div className="glass rounded-lg p-3 mb-3">
                        <p
                          className={`text-xs font-mono ${card.accentClass} text-center`}
                        >
                          {t(`${card.key}Tiers`)}
                        </p>
                      </div>

                      <p className="text-gray-400 text-xs text-center italic">
                        {t(`${card.key}Npc`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── Cross-Tier Restrictions ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("restrictionsTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-4" />
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">
              {t("restrictionsDesc")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restrictions.map((r, index) => (
                <motion.div
                  key={r.key}
                  className="glass-lite border-red-500/10 rounded-xl p-5 flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-red-500/30 flex-shrink-0 bg-wow-darker/50">
                    <img
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      src={r.icon}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">{t(r.key)}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 glass-lite border-green-500/20 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="text-gray-200 text-sm leading-relaxed text-center">
                ✓ {t("restrictionsWithinExpansion")}
              </p>
            </motion.div>

            <motion.div
              className="mt-4 glass-gold rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="text-gray-300 text-sm leading-relaxed text-center">
                {t("restrictionsWhy")}
              </p>
            </motion.div>
          </motion.section>

          {/* ── How to Progress ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="glass glow-gold rounded-2xl p-8 sm:p-10">
              <h2 className="text-2xl font-bold wow-gradient-text mb-4">
                {t("questTitle")}
              </h2>
              <p className="text-gray-300 leading-relaxed">{t("questDesc")}</p>
            </div>
          </motion.section>
        </div>

        {/* ── Timeline (full-width, reuses existing component) ── */}
        <section className="pb-16">
          <div className="container mx-auto max-w-5xl px-6 mb-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold wow-gradient-text mb-3">
                {t("timelineTitle")}
              </h2>
              <div className="shimmer-line w-24 mx-auto" />
            </motion.div>
          </div>
          <EpicProgressionTimeline standalone />
        </section>
      </div>
    </div>
  );
}
