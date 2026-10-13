/*
 * A WotLK+ guild's level from its renown (the progressive realm's worldserver.conf WotLKPlus.Guild.Levels, the same values as the
 * generator's content/guild.js THRESHOLDS, game/Guilds/WotLKPlusGuild LevelOf / ProgressPct): level n from the n-th threshold, 1 at least.
 */
export const GUILD_LEVELS = [
  0, 2000, 6000, 12000, 20000, 30000, 42000, 56000, 72000, 90000,
];

export function guildLevel(renown: number) {
  const level = Math.max(1, GUILD_LEVELS.filter((t) => renown >= t).length);
  const max = GUILD_LEVELS.length;

  if (level >= max) return { level, max, renown, next: null, pct: 100 };
  const from = GUILD_LEVELS[level - 1];
  const to = GUILD_LEVELS[level];

  return {
    level,
    max,
    renown,
    next: to,
    pct: Math.min(
      99,
      Math.floor(((renown - from) * 100) / Math.max(1, to - from)),
    ),
  };
}
