"use client";

import React from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";

const WOWHEAD_ICON = "https://wow.zamimg.com/images/wow/icons/large";

const features: {
  key: string;
  icon: string;
  bg: string;
  link?: string;
}[] = [
  {
    key: "epicProgression",
    icon: `${WOWHEAD_ICON}/inv_misc_orb_02.jpg`,
    bg: "/img/Burning Crusade Classic  Black Temple Screenshots 1080/BCC_Black_Temple_Illidan.jpg",
    link: "/epic-progression",
  },
  {
    key: "raidScaling",
    icon: `${WOWHEAD_ICON}/inv_misc_head_dragon_01.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_Onyxia_1920x1080.jpg",
    link: "/raid-scaling",
  },
  {
    key: "tankAsDps",
    icon: `${WOWHEAD_ICON}/inv_misc_rune_08.jpg`,
    bg: "/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(5).jpg",
  },
  {
    key: "soloQueue",
    icon: `${WOWHEAD_ICON}/spell_holy_crusade.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/ClassicDungeon.jpg",
  },
  {
    key: "raidReset",
    icon: `${WOWHEAD_ICON}/inv_misc_idol_02.jpg`,
    bg: "/img/Wrath of the Lich King Classic Call of the Crusade Screenshots/Wrath_Classic_Call_of_the_Crusade_Trial_of_the_Crusader_003.jpg",
  },
  {
    key: "dungeonNoLock",
    icon: `${WOWHEAD_ICON}/inv_misc_key_08.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/ClassicDungeon.jpg",
  },
  {
    key: "fourProfessions",
    icon: `${WOWHEAD_ICON}/inv_misc_note_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_HowlingFjord_007_1080p_png_jpgcopy.jpg",
  },
  {
    key: "transmog",
    icon: `${WOWHEAD_ICON}/inv_misc_armorkit_17.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_HowlingFjord_007_1080p_png_jpgcopy.jpg",
  },
  {
    key: "crossfaction",
    icon: `${WOWHEAD_ICON}/inv_misc_horn_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_004_1080p_png_jpgcopy.jpg",
  },
  {
    key: "aoeLoot",
    icon: `${WOWHEAD_ICON}/inv_misc_bag_10_blue.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/WoW_ClassicLaunchPressKit_ScarletMonastery_1920x1080.jpg",
  },
  {
    key: "autolearnSpells",
    icon: `${WOWHEAD_ICON}/inv_misc_book_09.jpg`,
    bg: "/img/Burning Crusade Classic Fury of the Sunwell Screenshots 4K/WoW_BCC_FuryOfTheSunwell_Kalecgos_010_png_jpgcopy.jpg",
  },
];

const FeatureCard = React.memo(function FeatureCard({
  featureKey,
  iconUrl,
  bgImage,
  index,
  link,
}: {
  featureKey: string;
  iconUrl: string;
  bgImage: string;
  index: number;
  link?: string;
}) {
  const t = useTranslations("features");
  const te = useTranslations("epicProgression");
  const locale = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="relative overflow-hidden rounded-2xl group h-full glow-gold">
        <Image
          alt=""
          className="absolute inset-0 object-cover opacity-30 group-hover:opacity-45 group-hover:scale-110 transition-[opacity,scale] duration-700"
          fill={true}
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={bgImage}
        />

        <div className="relative glass-lite border-wow-gold/10 rounded-2xl p-8 text-center h-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 border-2 border-wow-gold/40 glow-gold-strong bg-wow-darker/50">
            <Image
              alt=""
              className="object-cover"
              height={64}
              src={iconUrl}
              width={64}
            />
          </div>

          <h3 className="text-wow-gold font-bold text-lg mb-2 drop-shadow-lg">
            {t(featureKey)}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {t(`${featureKey}Desc`)}
          </p>

          {link && (
            <NextLink
              className="mt-4 text-sm text-wow-gold hover:text-wow-gold-light transition-colors underline underline-offset-4"
              href={`/${locale}${link}`}
            >
              {te("learnMore")} &rarr;
            </NextLink>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export const FeaturesGrid = () => {
  const t = useTranslations("features");

  return (
    <div>
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold wow-gradient-text mb-3">
          {t("featuresTitle")}
        </h2>
        <div className="shimmer-line w-24 mx-auto" />
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, i) => (
          <FeatureCard
            key={feat.key}
            bgImage={feat.bg}
            featureKey={feat.key}
            iconUrl={feat.icon}
            index={i}
            link={feat.link}
          />
        ))}
      </div>
    </div>
  );
};
