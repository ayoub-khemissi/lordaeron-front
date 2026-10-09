"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const WOWHEAD_ICON = "https://wow.zamimg.com/images/wow/icons/large";
const IMG = "/img/epic-progressive";

/* ── Boss data (HP from creature_template × creature_classlevelstats) ── */
interface BossDifficulty {
  label: string;
  maxPlayers: number;
  hp: number;
}

interface Boss {
  name: string;
  image: string;
  instance: string;
  difficulties: BossDifficulty[];
}

const BOSSES: Boss[] = [
  {
    name: "Ragnaros",
    image: "ragnaros.jpeg",
    instance: "Molten Core",
    difficulties: [{ label: "40", maxPlayers: 40, hp: 1099230 }],
  },
  {
    name: "Nefarian",
    image: "nefarian.jpg",
    instance: "Blackwing Lair",
    difficulties: [{ label: "40", maxPlayers: 40, hp: 2165150 }],
  },
  {
    name: "C'Thun",
    image: "cthun.jpg",
    instance: "Ahn'Qiraj",
    difficulties: [{ label: "40", maxPlayers: 40, hp: 999300 }],
  },
  {
    name: "Onyxia",
    image: "onyxia.jpg",
    instance: "Onyxia's Lair",
    difficulties: [
      { label: "10N", maxPlayers: 10, hp: 4880750 },
      { label: "25N", maxPlayers: 25, hp: 22312000 },
    ],
  },
  {
    name: "Hakkar",
    image: "hakkar.jpg",
    instance: "Zul'Gurub",
    difficulties: [{ label: "20", maxPlayers: 20, hp: 719550 }],
  },
  {
    name: "Illidan",
    image: "illidan.jpg",
    instance: "Black Temple",
    difficulties: [{ label: "25", maxPlayers: 25, hp: 4249280 }],
  },
  {
    name: "Kael'thas",
    image: "kaelthas.jpg",
    instance: "Tempest Keep",
    difficulties: [{ label: "25", maxPlayers: 25, hp: 2549400 }],
  },
  {
    name: "Archimonde",
    image: "archimonde.jpg",
    instance: "Mount Hyjal",
    difficulties: [{ label: "25", maxPlayers: 25, hp: 3186750 }],
  },
  {
    name: "Kil'jaeden",
    image: "kiljaeden.jpg",
    instance: "Sunwell Plateau",
    difficulties: [{ label: "25", maxPlayers: 25, hp: 9347800 }],
  },
  {
    name: "Kel'Thuzad",
    image: "kelthuzad.jpg",
    instance: "Naxxramas",
    difficulties: [
      { label: "10N", maxPlayers: 10, hp: 5229375 },
      { label: "25N", maxPlayers: 25, hp: 14642250 },
    ],
  },
  {
    name: "Yogg-Saron",
    image: "yoggsaron.jpg",
    instance: "Ulduar",
    difficulties: [
      { label: "10N", maxPlayers: 10, hp: 10999997 },
      { label: "25N", maxPlayers: 25, hp: 43999263 },
    ],
  },
  {
    name: "The Lich King",
    image: "lichking.jpg",
    instance: "Icecrown Citadel",
    difficulties: [
      { label: "10N", maxPlayers: 10, hp: 17431250 },
      { label: "25N", maxPlayers: 25, hp: 61009375 },
      { label: "10H", maxPlayers: 10, hp: 29458812 },
      { label: "25H", maxPlayers: 25, hp: 103151165 },
    ],
  },
];

const LOOT_ICONS = [
  `${WOWHEAD_ICON}/inv_helmet_17.jpg`,
  `${WOWHEAD_ICON}/inv_shoulder_14.jpg`,
  `${WOWHEAD_ICON}/inv_chest_plate01.jpg`,
  `${WOWHEAD_ICON}/inv_pants_04.jpg`,
];

/* ── Server defaults from worldserver.init ── */
const SERVER = {
  minPlayersRaid: 5,
  minPlayersDungeon: 1,
  healthExpRaid: 0.8,
  healthExpDungeon: 1.1,
  damageExpRaid: 0.21,
  damageExpDungeon: 1.25,
  dungeonSCurveSkew: 1.0,
};

/* ── Scaling formulas matching raid_difficulty_scaling.cpp ── */

function getEffectiveMaxDPS(maxPlayers: number, isRaid: boolean): number {
  let tanks: number, healers: number;

  if (isRaid) {
    tanks = 2;
    healers = Math.round(maxPlayers * 0.2);
  } else {
    tanks = 1;
    healers = 1;
  }

  const dps = maxPlayers > tanks + healers ? maxPlayers - tanks - healers : 1;

  return dps + tanks / 3;
}

function getEffectivePlayerDPS(playerCount: number): number {
  const tanks = playerCount < 10 ? 1 : 2;
  const healers = Math.round(playerCount * 0.2);

  if (playerCount <= tanks + healers) return Math.min(tanks, playerCount) / 3;

  const dps = playerCount - tanks - healers;

  return dps + tanks / 3;
}

function computeScalingRatio(
  playerCount: number,
  maxPlayers: number,
  minPlayers: number,
  isRaid: boolean,
): number {
  if (maxPlayers <= minPlayers) return 1;
  if (playerCount >= maxPlayers) return 1;

  const clamped = Math.max(minPlayers, playerCount);
  const effectiveMax = getEffectiveMaxDPS(maxPlayers, isRaid);

  if (isRaid) {
    const effPlayer = getEffectivePlayerDPS(clamped);

    return Math.min(1, effPlayer / effectiveMax);
  } else {
    const floor = minPlayers / effectiveMax;
    const x = Math.max(
      0,
      Math.min(1, (clamped - minPlayers) / (maxPlayers - minPlayers)),
    );
    let s = 3 * x * x - 2 * x * x * x; // smoothstep

    if (SERVER.dungeonSCurveSkew !== 1 && s > 0 && s < 1) {
      s = Math.pow(s, SERVER.dungeonSCurveSkew);
    }

    return Math.min(1, floor + (1 - floor) * s);
  }
}

function computeHealthFactor(
  playerCount: number,
  maxPlayers: number,
  minPlayers: number,
  isRaid: boolean,
): number {
  const ratio = computeScalingRatio(
    playerCount,
    maxPlayers,
    minPlayers,
    isRaid,
  );

  if (ratio >= 1) return 1;
  const exp = isRaid ? SERVER.healthExpRaid : SERVER.healthExpDungeon;

  return Math.pow(ratio, exp);
}

function computeDamageFactor(
  playerCount: number,
  maxPlayers: number,
  minPlayers: number,
  isRaid: boolean,
): number {
  const ratio = computeScalingRatio(
    playerCount,
    maxPlayers,
    minPlayers,
    isRaid,
  );

  if (ratio >= 1) return 1;
  const exp = isRaid ? SERVER.damageExpRaid : SERVER.damageExpDungeon;

  return Math.pow(ratio, exp);
}

function formatHP(hp: number): string {
  if (hp >= 1_000_000) return `${(hp / 1_000_000).toFixed(1)}M`;
  if (hp >= 1_000) return `${Math.round(hp / 1_000).toLocaleString()}K`;

  return hp.toFixed(0);
}

function getHealthColor(pct: number): string {
  if (pct > 0.5) return "from-green-500 to-green-400";
  if (pct > 0.25) return "from-yellow-500 to-amber-400";

  return "from-red-600 to-red-400";
}

/* ── What gets scaled ── */
const SCALED_STATS = [
  { key: "health", icon: `${WOWHEAD_ICON}/spell_holy_flashheal.jpg` },

  { key: "melee", icon: `${WOWHEAD_ICON}/ability_warrior_savageblow.jpg` },
  { key: "spell", icon: `${WOWHEAD_ICON}/spell_fire_fireball02.jpg` },
  { key: "dot", icon: `${WOWHEAD_ICON}/spell_shadow_curseofsargeras.jpg` },
  { key: "xp", icon: `${WOWHEAD_ICON}/spell_holy_aspiration.jpg` },
  { key: "lootItems", icon: `${WOWHEAD_ICON}/inv_chest_plate01.jpg` },
  { key: "lootGold", icon: `${WOWHEAD_ICON}/inv_misc_coin_02.jpg` },
];

const NOT_SCALED = [
  { key: "mana", icon: `${WOWHEAD_ICON}/inv_enchant_essencemagiclarge.jpg` },
  { key: "pets", icon: `${WOWHEAD_ICON}/spell_nature_spiritwolf.jpg` },
  { key: "triggers", icon: `${WOWHEAD_ICON}/spell_nature_invisibilty.jpg` },
  {
    key: "materials",
    icon: `${WOWHEAD_ICON}/inv_misc_gem_flamespessarite_02.jpg`,
  },
  { key: "questItems", icon: `${WOWHEAD_ICON}/inv_misc_map_01.jpg` },
];

function resolveDiffIndex(boss: Boss, preferred: string): number {
  // 1. Exact match
  const exact = boss.difficulties.findIndex((d) => d.label === preferred);

  if (exact !== -1) return exact;

  const prefSize = parseInt(preferred.match(/(\d+)/)?.[1] ?? "0", 10);
  const prefHeroic = preferred.includes("H");

  // 2. Heroic fallback → same size normal
  if (prefHeroic) {
    const idx = boss.difficulties.findIndex((d) => {
      const size = parseInt(d.label.match(/(\d+)/)?.[1] ?? "0", 10);

      return size === prefSize && !d.label.includes("H");
    });

    if (idx !== -1) return idx;
  }

  // 3. Match just the raid size
  const sizeIdx = boss.difficulties.findIndex((d) => {
    const size = parseInt(d.label.match(/(\d+)/)?.[1] ?? "0", 10);

    return size === prefSize;
  });

  if (sizeIdx !== -1) return sizeIdx;

  // 4. Fallback to first difficulty
  return 0;
}

export default function RaidScalingContent() {
  const t = useTranslations("raidScaling");

  const [bossIndex, setBossIndex] = useState(0);
  const [diffIndex, setDiffIndex] = useState(0);
  const [preferredLabel, setPreferredLabel] = useState(
    BOSSES[0].difficulties[0].label,
  );
  const [playerCount, setPlayerCount] = useState(
    Math.ceil(BOSSES[0].difficulties[0].maxPlayers / 2),
  );

  useEffect(() => {
    const i = Math.floor(Math.random() * BOSSES.length);
    const firstDiff = BOSSES[i].difficulties[0];

    setBossIndex(i);
    setDiffIndex(0);
    setPreferredLabel(firstDiff.label);
    setPlayerCount(Math.ceil(firstDiff.maxPlayers / 2));
  }, []);

  const boss = BOSSES[bossIndex];
  const diff = boss.difficulties[diffIndex] ?? boss.difficulties[0];
  const isRaid = diff.maxPlayers > 5;
  const isDungeon = !isRaid;
  const minPlayers = isDungeon
    ? SERVER.minPlayersDungeon
    : SERVER.minPlayersRaid;

  const healthFactor = useMemo(
    () => computeHealthFactor(playerCount, diff.maxPlayers, minPlayers, isRaid),
    [playerCount, diff.maxPlayers, minPlayers, isRaid],
  );

  const damageFactor = useMemo(
    () => computeDamageFactor(playerCount, diff.maxPlayers, minPlayers, isRaid),
    [playerCount, diff.maxPlayers, minPlayers, isRaid],
  );

  const scalingRatio = useMemo(
    () => computeScalingRatio(playerCount, diff.maxPlayers, minPlayers, isRaid),
    [playerCount, diff.maxPlayers, minPlayers, isRaid],
  );

  const scaledHP = Math.round(diff.hp * healthFactor);
  const lootKept = Math.max(1, Math.round(LOOT_ICONS.length * scalingRatio));

  const changeBoss = (delta: number) => {
    const i = (bossIndex + delta + BOSSES.length) % BOSSES.length;
    const b = BOSSES[i];
    const newDiffIndex = resolveDiffIndex(b, preferredLabel);

    setBossIndex(i);
    setDiffIndex(newDiffIndex);

    const newMax = b.difficulties[newDiffIndex].maxPlayers;

    setPlayerCount(Math.max(1, Math.min(playerCount, newMax)));
  };

  const changeDifficulty = (i: number) => {
    setDiffIndex(i);
    setPreferredLabel(boss.difficulties[i].label);
    const newMax = boss.difficulties[i].maxPlayers;

    if (playerCount > newMax) setPlayerCount(newMax);
  };

  /* ── Scaling table rows ── */
  const tableRows = useMemo(() => {
    const steps = new Set<number>();

    steps.add(1);
    steps.add(minPlayers);
    steps.add(diff.maxPlayers);
    for (let p = 5; p < diff.maxPlayers; p += diff.maxPlayers <= 5 ? 1 : 5) {
      steps.add(p);
    }
    steps.add(playerCount);

    const bossIsRaid = diff.maxPlayers > 5;

    return [...steps]
      .filter((p) => p >= 1 && p <= diff.maxPlayers)
      .sort((a, b) => a - b)
      .map((p) => {
        const hf = computeHealthFactor(
          p,
          diff.maxPlayers,
          minPlayers,
          bossIsRaid,
        );
        const df = computeDamageFactor(
          p,
          diff.maxPlayers,
          minPlayers,
          bossIsRaid,
        );
        const sr = computeScalingRatio(
          p,
          diff.maxPlayers,
          minPlayers,
          bossIsRaid,
        );

        return {
          players: p,
          healthPct: hf,
          damagePct: df,
          hp: Math.round(diff.hp * hf),
          loot: Math.max(1, Math.round(4 * sr)),
          isCurrent: p === playerCount,
        };
      });
  }, [diff, minPlayers, playerCount]);

  return (
    <div
      className="relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('/img/Wrath of the Lich King Classic Secret of Ulduar Screenshots 4K/WoW_Wrath_Ulduar_003_4K_png_jpgcopy.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/92" />

      <div className="relative">
        <div className="container mx-auto max-w-5xl px-6 pt-16 pb-12">
          {/* ── Hero ── */}
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

          {/* ══════════════════════════════════════════════
              ── Interactive Simulator ──
              ══════════════════════════════════════════════ */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("simulatorTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-10" />

            <div className="glass glow-gold rounded-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* ── LEFT: WoW Unit Frame ── */}
                <div className="flex flex-col items-center">
                  {/* Boss navigation */}
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      className="w-8 h-8 rounded-full border border-wow-gold/40 bg-wow-darker/80 text-wow-gold hover:bg-wow-gold/20 transition-colors flex items-center justify-center text-lg font-bold"
                      onClick={() => changeBoss(-1)}
                    >
                      &lsaquo;
                    </button>
                    <span className="text-gray-400 text-sm">
                      {t("changeBoss")}
                    </span>
                    <button
                      className="w-8 h-8 rounded-full border border-wow-gold/40 bg-wow-darker/80 text-wow-gold hover:bg-wow-gold/20 transition-colors flex items-center justify-center text-lg font-bold"
                      onClick={() => changeBoss(1)}
                    >
                      &rsaquo;
                    </button>
                  </div>

                  {/* Unit Frame */}
                  <div className="w-full max-w-sm">
                    <div className="relative glass-lite border-wow-gold/30 rounded-xl p-5 overflow-hidden">
                      {/* Top & bottom gold accent lines */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-wow-gold/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-wow-gold/70 to-transparent" />

                      <div className="flex items-start gap-4">
                        {/* Portrait */}
                        <div className="relative flex-shrink-0">
                          {/* Skull level badge */}
                          <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-wow-darker border-2 border-wow-gold/60 flex items-center justify-center">
                            <span className="text-wow-gold text-[10px] font-black">
                              ??
                            </span>
                          </div>

                          {/* Portrait ring */}
                          <div
                            className="w-[88px] h-[88px] rounded-full overflow-hidden border-[3px] border-wow-gold"
                            style={{
                              boxShadow:
                                "0 0 20px rgba(199,156,62,0.4), inset 0 0 15px rgba(0,0,0,0.7)",
                            }}
                          >
                            <img
                              alt={boss.name}
                              className="w-full h-full object-cover scale-110"
                              src={`${IMG}/${boss.image}`}
                            />
                          </div>

                          {/* Elite dragon wing accents */}
                          <div
                            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-14 rounded-l-full"
                            style={{
                              background:
                                "linear-gradient(180deg, transparent 0%, rgba(199,156,62,0.5) 50%, transparent 100%)",
                            }}
                          />
                          <div
                            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-14 rounded-r-full"
                            style={{
                              background:
                                "linear-gradient(180deg, transparent 0%, rgba(199,156,62,0.5) 50%, transparent 100%)",
                            }}
                          />
                        </div>

                        {/* Name + Health Bar */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="mb-2">
                            <h3 className="text-wow-gold font-bold text-lg leading-tight truncate">
                              {boss.name}
                            </h3>
                            <p className="text-gray-400 text-xs">
                              {boss.instance} ({diff.maxPlayers} {t("players")})
                            </p>
                            {boss.difficulties.length > 1 && (
                              <div className="flex gap-1.5 mt-1.5">
                                {boss.difficulties.map((d, i) => (
                                  <button
                                    key={d.label}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                      i === diffIndex
                                        ? "bg-wow-gold/20 text-wow-gold border border-wow-gold/40"
                                        : "bg-wow-darker/50 text-gray-500 border border-gray-700/30 hover:text-gray-300"
                                    }`}
                                    onClick={() => changeDifficulty(i)}
                                  >
                                    {d.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Health Bar */}
                          <div className="relative h-7 bg-wow-darker/80 rounded-sm border border-gray-700/50 overflow-hidden mb-1.5">
                            <motion.div
                              animate={{ width: `${healthFactor * 100}%` }}
                              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getHealthColor(healthFactor)} rounded-sm`}
                              transition={{
                                duration: 0.5,
                                ease: "easeOut",
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {formatHP(scaledHP)} / {formatHP(diff.hp)}
                              </span>
                            </div>
                          </div>

                          {/* Scaling badge */}
                          <div className="text-center">
                            <span
                              className={`text-sm font-bold ${
                                healthFactor > 0.5
                                  ? "text-green-400"
                                  : healthFactor > 0.25
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {(healthFactor * 100).toFixed(1)}%{" "}
                              {t("ofOriginal")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loot Preview */}
                  <div className="mt-6 w-full max-w-sm">
                    <p className="text-gray-400 text-xs text-center mb-3 uppercase tracking-wider">
                      {t("lootPreview")}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {LOOT_ICONS.map((icon, i) => (
                        <div
                          key={i}
                          className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-500 ${
                            i < lootKept
                              ? "border-purple-500/80 opacity-100"
                              : "border-gray-600/30 opacity-20 grayscale"
                          }`}
                          style={
                            i < lootKept
                              ? {
                                  boxShadow:
                                    "0 0 10px rgba(168,85,247,0.4), inset 0 0 4px rgba(168,85,247,0.2)",
                                }
                              : {}
                          }
                        >
                          <img
                            alt=""
                            className="w-full h-full object-cover"
                            src={icon}
                          />
                          {i >= lootKept && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <span className="text-red-500 text-2xl font-black leading-none">
                                &times;
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      <span className="text-gray-300 text-sm ml-2 font-mono">
                        {lootKept}/{LOOT_ICONS.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: Controls ── */}
                <div className="flex flex-col gap-6">
                  {/* Player Count Slider */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-wow-gold/30 bg-wow-darker/50 flex-shrink-0">
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          src={`${WOWHEAD_ICON}/inv_misc_groupneedmore.jpg`}
                        />
                      </div>
                      <label className="text-wow-gold font-bold text-sm">
                        {t("playerCount")}
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-[#c79c3e]"
                        max={diff.maxPlayers}
                        min={1}
                        type="range"
                        value={playerCount}
                        onChange={(e) => setPlayerCount(Number(e.target.value))}
                      />
                      <div className="glass-lite border-wow-gold/20 rounded-lg px-3 py-1.5 min-w-[4.5rem] text-center">
                        <span className="text-wow-gold font-bold text-lg">
                          {playerCount}
                        </span>
                        <span className="text-gray-400 text-xs">
                          /{diff.maxPlayers}
                        </span>
                      </div>
                    </div>
                    {playerCount < minPlayers && (
                      <p className="text-amber-400/80 text-xs mt-2 italic">
                        {t("clampedTo", { min: minPlayers })}
                      </p>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="glass-lite border-wow-gold/15 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/30 bg-wow-darker/50 mx-auto mb-2">
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          src={`${WOWHEAD_ICON}/spell_holy_flashheal.jpg`}
                        />
                      </div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                        {t("statHP")}
                      </p>
                      <p className="text-white font-bold text-lg">
                        {formatHP(scaledHP)}
                      </p>
                      <p className="text-green-400 text-xs">
                        {(healthFactor * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="glass-lite border-wow-gold/15 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-red-500/30 bg-wow-darker/50 mx-auto mb-2">
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          src={`${WOWHEAD_ICON}/ability_warrior_savageblow.jpg`}
                        />
                      </div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                        {t("statDamage")}
                      </p>
                      <p className="text-white font-bold text-lg">
                        {(damageFactor * 100).toFixed(1)}%
                      </p>
                      <p className="text-red-400 text-xs">{t("ofOriginal")}</p>
                    </div>

                    <div className="glass-lite border-wow-gold/15 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-purple-500/30 bg-wow-darker/50 mx-auto mb-2">
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          src={`${WOWHEAD_ICON}/inv_chest_plate01.jpg`}
                        />
                      </div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                        {t("statLoot")}
                      </p>
                      <p className="text-white font-bold text-lg">
                        {lootKept}/{LOOT_ICONS.length}
                      </p>
                      <p className="text-purple-400 text-xs">
                        {t("itemsKept")}
                      </p>
                    </div>

                    <div className="glass-lite border-wow-gold/15 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-yellow-500/30 bg-wow-darker/50 mx-auto mb-2">
                        <img
                          alt=""
                          className="w-full h-full object-cover"
                          src={`${WOWHEAD_ICON}/inv_misc_coin_02.jpg`}
                        />
                      </div>
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
                        {t("statGold")}
                      </p>
                      <p className="text-white font-bold text-lg">
                        {(scalingRatio * 100).toFixed(1)}%
                      </p>
                      <p className="text-yellow-400 text-xs">
                        {t("ofOriginal")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula display */}
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                  {t("formula")}
                </p>
                <div className="space-y-1">
                  {isRaid ? (
                    <>
                      <p className="text-wow-gold text-sm font-mono">
                        ratio = effDPS(
                        {Math.max(
                          minPlayers,
                          Math.min(playerCount, diff.maxPlayers),
                        )}
                        ) / effMaxDPS({diff.maxPlayers}) ={" "}
                        {scalingRatio.toFixed(3)}
                      </p>
                      <p className="text-wow-gold text-sm font-mono">
                        HP = {scalingRatio.toFixed(3)}
                        <sup>{SERVER.healthExpRaid}</sup> ={" "}
                        <span className="text-white font-bold">
                          {(healthFactor * 100).toFixed(1)}%
                        </span>{" "}
                        &middot; DMG = {scalingRatio.toFixed(3)}
                        <sup>{SERVER.damageExpRaid}</sup> ={" "}
                        <span className="text-white font-bold">
                          {(damageFactor * 100).toFixed(1)}%
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-wow-gold text-sm font-mono">
                        ratio = S-curve(
                        {Math.max(
                          minPlayers,
                          Math.min(playerCount, diff.maxPlayers),
                        )}
                        , {diff.maxPlayers}) = {scalingRatio.toFixed(3)}
                      </p>
                      <p className="text-wow-gold text-sm font-mono">
                        HP = {scalingRatio.toFixed(3)}
                        <sup>{SERVER.healthExpDungeon}</sup> ={" "}
                        <span className="text-white font-bold">
                          {(healthFactor * 100).toFixed(1)}%
                        </span>{" "}
                        &middot; DMG = {scalingRatio.toFixed(3)}
                        <sup>{SERVER.damageExpDungeon}</sup> ={" "}
                        <span className="text-white font-bold">
                          {(damageFactor * 100).toFixed(1)}%
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Scaling Table ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("tableTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-10" />

            <div className="glass-lite border-wow-gold/15 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-wow-gold/20 bg-wow-darker/50">
                      <th className="text-wow-gold font-bold py-3 px-4 text-left">
                        {t("colPlayers")}
                      </th>
                      <th className="text-wow-gold font-bold py-3 px-4 text-center">
                        {t("colHP")}
                      </th>
                      <th className="text-wow-gold font-bold py-3 px-4 text-center">
                        {t("colDamage")}
                      </th>
                      <th className="text-wow-gold font-bold py-3 px-4 text-center">
                        {t("colScaledHP")}
                      </th>
                      <th className="text-wow-gold font-bold py-3 px-4 text-center">
                        {t("colLoot")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr
                        key={row.players}
                        className={`border-b border-gray-700/30 transition-colors ${
                          row.isCurrent
                            ? "bg-wow-gold/10 border-wow-gold/30"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="py-2.5 px-4">
                          <span
                            className={`font-mono ${row.isCurrent ? "text-wow-gold font-bold" : "text-gray-300"}`}
                          >
                            {row.players}
                          </span>
                          {row.isCurrent && (
                            <span className="text-wow-gold text-xs ml-2">
                              &larr;
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`font-mono ${
                              row.healthPct > 0.5
                                ? "text-green-400"
                                : row.healthPct > 0.25
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {(row.healthPct * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`font-mono ${
                              row.damagePct > 0.5
                                ? "text-green-400"
                                : row.damagePct > 0.25
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {(row.damagePct * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-gray-300 font-mono">
                          {formatHP(row.hp)}
                        </td>
                        <td className="py-2.5 px-4 text-center text-gray-300 font-mono">
                          {row.loot}/4
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* ── What Gets Scaled ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("scaledTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {SCALED_STATS.map((stat, i) => (
                <motion.div
                  key={stat.key}
                  className="glass-lite border-green-500/10 rounded-xl p-4 flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-500/30 flex-shrink-0 bg-wow-darker/50">
                    <img
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      src={stat.icon}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">
                    {t(`scaled_${stat.key}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── What Is NOT Scaled ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("notScaledTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NOT_SCALED.map((stat, i) => (
                <motion.div
                  key={stat.key}
                  className="glass-lite border-sky-400/10 rounded-xl p-4 flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-sky-400/30 flex-shrink-0 bg-wow-darker/50">
                    <img
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      src={stat.icon}
                    />
                  </div>
                  <span className="text-gray-300 text-sm">
                    {t(`notScaled_${stat.key}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── Server Configuration ── */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold wow-gradient-text text-center mb-3">
              {t("configTitle")}
            </h2>
            <div className="shimmer-line w-24 mx-auto mb-4" />
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">
              {t("configDesc")}
            </p>

            <div className="glass glow-gold rounded-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: t("cfgMinRaid"),
                    value: SERVER.minPlayersRaid.toString(),
                  },
                  {
                    label: t("cfgMinDungeon"),
                    value: SERVER.minPlayersDungeon.toString(),
                  },
                  {
                    label: t("cfgHealthExpRaid"),
                    value: SERVER.healthExpRaid.toString(),
                  },
                  {
                    label: t("cfgHealthExpDungeon"),
                    value: SERVER.healthExpDungeon.toString(),
                  },
                  {
                    label: t("cfgDamageExpRaid"),
                    value: SERVER.damageExpRaid.toString(),
                  },
                  {
                    label: t("cfgDamageExpDungeon"),
                    value: SERVER.damageExpDungeon.toString(),
                  },
                  {
                    label: t("cfgSCurveSkew"),
                    value: SERVER.dungeonSCurveSkew.toString(),
                  },
                  { label: t("cfgScaleLoot"), value: t("cfgEnabled") },
                  { label: t("cfgScaleXP"), value: t("cfgEnabled") },
                  { label: t("cfgScaleDungeons"), value: t("cfgEnabled") },
                ].map((cfg) => (
                  <div
                    key={cfg.label}
                    className="glass-lite border-wow-gold/15 rounded-xl p-4 flex items-center justify-between"
                  >
                    <span className="text-gray-300 text-sm">{cfg.label}</span>
                    <span className="text-wow-gold font-bold font-mono">
                      {cfg.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
