import { readFile } from "fs/promises";

import { type RealmSlug } from "@/lib/realms";
import { realmServer } from "@/lib/realms-server";
import { isoDays, nextWeekly } from "@/lib/realm-time";

/*
 * A few settings of a realm's worldserver.conf the Tools pages show (the calendar's resets, Wintergrasp, the PvP tournament, the realm
 * bonus; Ayoub, 13/10/2026). Only the keys listed here are ever read: the file also holds the databases' passwords. Kept a minute.
 */

const KEYS = [
  "Instance.RaidResetDays",
  "Instance.RaidResetHour",
  "Quests.DailyResetTime",
  "Wintergrasp.Enable",
  "Wintergrasp.BattleTimer",
  "Wintergrasp.NoBattleTimer",
  "WotLKPlus.Phase.Enable",
  "WotLKPlus.PvP.Tournament.Enable",
  "WotLKPlus.PvP.Tournament.Days",
  "WotLKPlus.PvP.Tournament.Hour",
  "WotLKPlus.PvP.Tournament.Minute",
  "WotLKPlus.PvP.Tournament.Announces",
  "XP.Boost.Weekend",
  "XP.Boost.Rate",
] as const;

export type RealmConfigKey = (typeof KEYS)[number];
export type RealmConfig = Partial<Record<RealmConfigKey, string>>;

const TTL = 60_000;
const cache = new Map<RealmSlug, { at: number; value: Promise<RealmConfig> }>();

async function read(slug: RealmSlug): Promise<RealmConfig> {
  const text = await readFile(realmServer(slug).worldConf, "utf8").catch(
    () => "",
  );
  const config: RealmConfig = {};

  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9.]+)\s*=\s*(.*?)\s*$/);

    if (m && (KEYS as readonly string[]).includes(m[1]))
      config[m[1] as RealmConfigKey] = m[2].replace(/^"(.*)"$/, "$1");
  }

  return config;
}

export function realmConfig(slug: RealmSlug): Promise<RealmConfig> {
  const hit = cache.get(slug);

  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const value = read(slug);

  cache.set(slug, { at: Date.now(), value });

  return value;
}

export const configInt = (
  config: RealmConfig,
  key: RealmConfigKey,
  fallback: number,
) => {
  const n = Number(config[key]);

  return Number.isFinite(n) && config[key] !== undefined && config[key] !== ""
    ? n
    : fallback;
};

// the next raid reset strictly after `from` (unix seconds), as the core's InstanceSaveManager::GetNextRaidResetTime: the first of
// Instance.RaidResetDays at Instance.RaidResetHour, Paris time; a week later when no days are set
export async function nextRaidReset(
  slug: RealmSlug,
  from: number,
): Promise<number> {
  const config = await realmConfig(slug);
  const days = isoDays(config["Instance.RaidResetDays"]);

  return (
    (days.length &&
      nextWeekly(from, days, configInt(config, "Instance.RaidResetHour", 4))) ||
    from + 7 * 86400
  );
}
