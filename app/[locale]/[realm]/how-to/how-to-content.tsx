"use client";

import { Snippet } from "@heroui/snippet";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const WOWHEAD_ICON = "https://wow.zamimg.com/images/wow/icons/large";

const steps = [
  {
    key: "step1",
    icon: `${WOWHEAD_ICON}/inv_misc_bag_20.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/WoW_ClassicLaunchPressKit_ThousandNeedles_1920x1080.jpg",
  },
  {
    key: "step2",
    icon: `${WOWHEAD_ICON}/inv_misc_note_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
  },
  {
    key: "step3",
    icon: `${WOWHEAD_ICON}/inv_letter_08.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_ArthasThrone_003_1080p_png_jpgcopy.jpg",
  },
  {
    key: "step4",
    icon: `${WOWHEAD_ICON}/inv_misc_enggizmos_27.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_STV_1920x1080.jpg",
  },
  {
    key: "step5",
    icon: `${WOWHEAD_ICON}/inv_misc_wrench_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
    download: "/patches/patch-Z.MPQ",
  },
  {
    key: "step6",
    icon: `${WOWHEAD_ICON}/inv_misc_horn_02.jpg`,
    bg: "/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(5)_png_jpgcopy.jpg",
  },
];

export default function HowToContent() {
  const t = useTranslations("howTo");

  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_STV_1920x1080.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />

      <div className="relative container mx-auto max-w-4xl px-6 py-16">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-black wow-gradient-text mb-3">
            {t("title")}
          </h1>
          <p className="text-gray-300 mb-4">{t("subtitle")}</p>
          <div className="shimmer-line w-32 mx-auto" />
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="relative overflow-hidden rounded-2xl group glow-gold">
                {/* Background image */}
                <img
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 group-hover:scale-110 transition-[opacity,scale] duration-700"
                  loading="lazy"
                  src={step.bg}
                />

                <div className="relative glass border-wow-gold/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start overflow-hidden">
                  {/* Step WoW icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-wow-gold/40 glow-gold bg-wow-darker/50">
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        src={step.icon}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-wow-gold/50 text-sm font-mono">
                        0{index + 1}
                      </span>
                      <h3 className="text-wow-gold font-bold text-xl">
                        {t(`${step.key}Title`)}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed break-words">
                      {t(`${step.key}Desc`)}
                    </p>

                    {step.key === "step2" && (
                      <div className="mt-5">
                        <Snippet
                          classNames={{
                            base: "glass-blue border-wow-blue/20 w-full glow-blue relative text-center",
                            pre: "text-wow-blue-ice font-mono text-sm break-all whitespace-normal",
                            copyButton:
                              "absolute -top-3.5 -right-3.5 sm:relative sm:top-auto sm:right-auto text-wow-blue hover:text-wow-blue-ice",
                          }}
                          symbol=""
                          variant="bordered"
                        >
                          {t("realmlist")}
                        </Snippet>
                      </div>
                    )}

                    {"download" in step && step.download && (
                      <div className="mt-5">
                        <a
                          download
                          className="inline-flex items-center gap-2 glass-gold glow-gold rounded-lg px-5 py-2.5 text-wow-gold font-semibold text-sm hover:brightness-125 transition-all"
                          href={step.download}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M12 5v14m0 0l-6-6m6 6l6-6M5 19h14"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {t(`${step.key}Download`)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Version badge */}
        <motion.div
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="inline-block glass-gold glow-gold-strong rounded-full px-8 py-3">
            <p className="text-wow-gold font-semibold text-sm tracking-wide">
              {t("version")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
