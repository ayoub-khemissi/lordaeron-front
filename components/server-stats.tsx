"use client";

import type { ServerStats as ServerStatsType } from "@/types";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import { useRealm } from "@/lib/realm-context";

const statImages = [
  "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_004_1080p_png_jpgcopy.jpg",
  "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
];

export const ServerStats = () => {
  const t = useTranslations("home");
  const realm = useRealm();
  const [stats, setStats] = useState<ServerStatsType | null>(null);
  const [factionMode, setFactionMode] = useState<"live" | "total">("live");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/server/stats?realm=${realm.slug}`);
        const data = await res.json();

        setStats(data);
      } catch {
        setStats({
          onlineCount: 0,
          totalAccounts: 0,
          alliance: 0,
          horde: 0,
          totalAlliance: 0,
          totalHorde: 0,
        });
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [realm.slug]);

  const alliance =
    factionMode === "live" ? stats?.alliance || 0 : stats?.totalAlliance || 0;
  const horde =
    factionMode === "live" ? stats?.horde || 0 : stats?.totalHorde || 0;
  const total = alliance + horde;
  const alliancePercent = total > 0 ? (alliance / total) * 100 : 50;
  const hordePercent = total > 0 ? (horde / total) * 100 : 50;

  const cards = [
    {
      value: stats?.onlineCount,
      label: t("players"),
      color: "text-wow-blue-ice",
      glowClass: "glow-blue",
      borderClass: "border-wow-blue/20",
      badge: (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
      ),
    },
    {
      value: stats?.totalAccounts,
      label: t("totalAccounts"),
      color: "text-wow-gold-light",
      glowClass: "glow-gold",
      borderClass: "border-wow-gold/20",
      badge: null,
    },
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Section background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-15"
        style={{
          backgroundImage:
            "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_004_1080p_png_jpgcopy.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-wow-darker via-transparent to-wow-darker" />

      <div className="relative container mx-auto max-w-7xl px-6">
        {/* 2 stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div
                className={`relative overflow-hidden rounded-2xl ${card.glowClass} group`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-45 group-hover:scale-110 transition-all duration-700"
                  style={{ backgroundImage: `url('${statImages[index]}')` }}
                />
                <div
                  className={`relative glass ${card.borderClass} rounded-2xl text-center py-8 px-4`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {card.badge}
                    <p
                      className={`text-5xl font-black ${card.color} drop-shadow-lg`}
                    >
                      {card.value ?? "..."}
                    </p>
                  </div>
                  <p className="text-gray-300 text-sm mt-2 uppercase tracking-wider font-medium">
                    {card.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Faction balance bar with toggle */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-center text-gray-300 text-sm mb-3 uppercase tracking-wider font-medium">
            {t("factionBalance")}
          </p>

          {/* Toggle pill */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex glass rounded-full p-1 border border-white/5">
              {(["live", "total"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors duration-200 ${
                    factionMode === mode
                      ? "text-wow-gold-light"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  onClick={() => setFactionMode(mode)}
                >
                  {factionMode === mode && (
                    <motion.div
                      className="absolute inset-0 glass-gold rounded-full border border-wow-gold/20"
                      layoutId="factionToggle"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {mode === "live" && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                      </span>
                    )}
                    {t(mode)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Faction bar */}
          <div className="relative max-w-2xl mx-auto">
            {/* Counters */}
            <div className="flex justify-between mb-2 text-sm font-bold">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`alliance-${factionMode}`}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-wow-alliance drop-shadow-[0_0_8px_rgba(0,120,255,0.5)]"
                  exit={{ opacity: 0, y: -4 }}
                  initial={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {t("alliance")} {alliance}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`horde-${factionMode}`}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-wow-horde drop-shadow-[0_0_8px_rgba(179,0,0,0.5)]"
                  exit={{ opacity: 0, y: -4 }}
                  initial={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {horde} {t("horde")}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Bar */}
            <div className="relative h-5 rounded-full overflow-hidden glass border border-white/5">
              <div
                className="absolute inset-0 bg-gradient-to-r from-red-600 to-wow-horde"
                style={{ boxShadow: "0 0 15px rgba(179,0,0,0.4)" }}
              />
              <motion.div
                animate={{ width: `${alliancePercent}%` }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-wow-alliance to-blue-400"
                initial={false}
                style={{ boxShadow: "0 0 15px rgba(0,120,255,0.4)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {/* Percentages */}
            <div className="flex justify-between mt-2 text-xs font-medium">
              <span className="text-wow-alliance drop-shadow-[0_0_8px_rgba(0,120,255,0.5)]">
                {alliancePercent.toFixed(0)}%
              </span>
              <span className="text-wow-horde drop-shadow-[0_0_8px_rgba(179,0,0,0.5)]">
                {hordePercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
