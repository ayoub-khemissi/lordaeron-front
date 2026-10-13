import type { RowDataPacket } from "mysql2";
import type { GuildEmblem } from "@/types/armory";

import { type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import { hideGm } from "@/lib/queries/realm-search";
import { dbcStore } from "@/lib/tooltips/dbc";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

/*
 * The guilds' raid progression (Ayoub, 13/10/2026: the Tools page /<realm>/progression), from what the realm records of its characters:
 * - a boss of a raid and a difficulty: Blizzard's kill statistics (character_achievement_progress of their criteria), and on a progressive
 *   realm the WotLK+ heroic raids' achievements, one criteria per boss (content/raids: "Heroic: Naxxramas (10 player)"...);
 * - a raid cleared: its completion achievement (character_achievement, the date it was earned).
 * A guild is credited with a boss (a clear) when at least CREDIT of its members have it: 4 of a 10-player raid, 10 of a 25-player one.
 * The game masters' characters count only in a site administrator's view (lib/queries/realm-search.ts). Raids and bosses are named by the
 * realm's DBCs (Map, DungeonEncounter) in the reader's language.
 */

export const MODES = ["n10", "n25", "h10", "h25"] as const;
export type RaidMode = (typeof MODES)[number];

export const CREDIT: Record<RaidMode, number> = {
  n10: 4,
  n25: 10,
  h10: 4,
  h25: 10,
};

// the bosses' criteria of a difficulty (any of them counts)
type Criteria = number | number[];

interface BossDef {
  encounter: number;
  modes: Partial<Record<RaidMode, number[]>>;
}

interface RaidDef {
  key: string;
  map: number;
  icon: string;
  // a raid's tier (its weight in the ranking): Naxxramas 1 ... the Ruby Sanctum 5
  tier: number;
  clears: Partial<Record<RaidMode, number>>;
  bosses: BossDef[];
}

const boss = (
  encounter: number,
  n10?: Criteria | null,
  n25?: Criteria | null,
  h10?: Criteria | null,
  h25?: Criteria | null,
): BossDef => ({
  encounter,
  modes: Object.fromEntries(
    (
      [
        ["n10", n10],
        ["n25", n25],
        ["h10", h10],
        ["h25", h25],
      ] as const
    )
      .filter(([, c]) => c)
      .map(([m, c]) => [m, ([] as number[]).concat(c as Criteria)]),
  ),
});

// Wrath of the Lich King's raids, by tier; the criteria from the realms' Achievement.dbc (the kill statistics of each boss and
// difficulty, the WotLK+ heroic raids' achievements 5665-5715), the encounters from DungeonEncounter.dbc
const RAIDS: RaidDef[] = [
  {
    key: "naxxramas",
    tier: 1,
    map: 533,
    icon: "achievement_dungeon_naxxramas_normal",
    clears: { n10: 576, n25: 577, h10: 5665, h25: 5681 },
    bosses: [
      boss(673, 5100, 5111, 22515, 22545), // Anub'Rekhan
      boss(677, 5101, 5126, 22516, 22546), // Grand Widow Faerlina
      boss(679, 5102, 5132, 22517, 22547), // Maexxna
      boss(681, 5104, 5133, 22518, 22548), // Noth the Plaguebringer
      boss(683, 5112, 5128, 22519, 22549), // Heigan the Unclean
      boss(685, 5113, 5131, 22520, 22550), // Loatheb
      boss(687, 5120, 5130, 22521, 22551), // Instructor Razuvious
      boss(690, 5108, 5125, 22522, 22552), // Gothik the Harvester
      boss(692, [5121, 7805], [5129, 7806], 22523, 22553), // The Four Horsemen
      boss(694, 5110, 5103, 22524, 22554), // Patchwerk
      boss(696, 5114, 5127, 22525, 22555), // Grobbulus
      boss(698, 5117, 5124, 22526, 22556), // Gluth
      boss(700, 5119, 5134, 22527, 22557), // Thaddius
      boss(702, 5122, 5135, 22528, 22558), // Sapphiron
      boss(704, 5123, 5136, 22529, 22559), // Kel'Thuzad
    ],
  },
  {
    key: "obsidianSanctum",
    tier: 1,
    map: 615,
    icon: "achievement_dungeon_coablackdragonflight_normal",
    clears: { n10: 1876, n25: 625, h10: 5682, h25: 5683 },
    bosses: [
      boss(742, 5138, 5139, 22560, 22561), // Sartharion
    ],
  },
  {
    key: "eyeOfEternity",
    tier: 1,
    map: 616,
    icon: "achievement_dungeon_nexusraid",
    clears: { n10: 622, n25: 623, h10: 5684, h25: 5685 },
    bosses: [
      boss(734, 5137, 5140, 22562, 22563), // Malygos
    ],
  },
  {
    key: "ulduar",
    tier: 2,
    map: 603,
    icon: "achievement_dungeon_ulduarraid_misc_01",
    clears: { n10: 2894, n25: 2895, h10: 5700, h25: 5715 },
    bosses: [
      boss(744, 9938, 9954, 22578, 22605), // Flame Leviathan
      boss(745, 9940, 9956, 22579, 22606), // Ignis the Furnace Master
      boss(746, 9939, 9955, 22580, 22607), // Razorscale
      boss(747, 9941, 9957, 22581, 22608), // XT-002 Deconstructor
      boss(748, 10580, 10581, 22582, 22609), // The Iron Council
      boss(749, 9943, 9959, 22583, 22610), // Kologarn
      boss(750, 9950, 9966, 22584, 22611), // Auriaya
      boss(751, 10560, 10562, 22585, 22612), // Hodir
      boss(752, 10558, 10561, 22586, 22613), // Thorim
      boss(753, 10559, 10563, 22587, 22614), // Freya
      boss(754, 9947, 9963, 22588, 22615), // Mimiron
      boss(755, 9948, 9964, 22589, 22616), // General Vezax
      boss(756, 9951, 9967, 22590, 22617), // Yogg-Saron
      boss(757, 10565, 10566), // Algalon the Observer
    ],
  },
  {
    key: "onyxia",
    tier: 3,
    map: 249,
    icon: "achievement_boss_onyxia",
    clears: { n10: 4396, n25: 4397 },
    bosses: [
      boss(707), // Onyxia
    ],
  },
  {
    key: "trialOfTheCrusader",
    tier: 3,
    map: 649,
    icon: "achievement_reputation_argentcrusader",
    clears: { n10: 3917, n25: 3916, h10: 3918, h25: 3812 },
    bosses: [
      boss(629, 12228, 12230, 12229, 12231), // Northrend Beasts
      boss(633, 12232, 12234, 12233, 12235), // Lord Jaraxxus
      boss(637, 12236, 12238, 12237, 12239), // Faction Champions
      boss(641, 12240, 12242, 12241, 12243), // Val'kyr Twins
      boss(645, 12244, 12246, 12245, 12247), // Anub'arak
    ],
  },
  {
    key: "icecrownCitadel",
    tier: 4,
    map: 631,
    icon: "achievement_dungeon_icecrown_frostmourne",
    clears: { n10: 4532, n25: 4608, h10: 4636, h25: 4637 },
    bosses: [
      boss(845, 13089, 13092, 13090, 13091), // Lord Marrowgar
      boss(846, 13093, 13105, 13104, 13106), // Lady Deathwhisper
      boss(847, 13094, 13109, 13110, 13111), // Icecrown Gunship Battle
      boss(848, 13095, 13112, 13113, 13114), // Deathbringer Saurfang
      boss(849, 13096, 13115, 13116, 13117), // Festergut
      boss(850, 13097, 13118, 13119, 13120), // Rotface
      boss(851, 13100, 13127, 13128, 13129), // Professor Putricide
      boss(852, 13098, 13121, 13122, 13123), // Blood Council
      boss(853, 13101, 13130, 13131, 13132), // Queen Lana'thel
      boss(854, 13099, 13124, 13125, 13126), // Valithria Dreamwalker
      boss(855, 13102, 13133, 13134, 13135), // Sindragosa
      boss(856, 13103, 13136, 13137, 13138), // The Lich King
    ],
  },
  {
    key: "rubySanctum",
    tier: 5,
    map: 724,
    icon: "spell_shadow_twilight",
    clears: { n10: 4817, n25: 4815, h10: 4818, h25: 4816 },
    bosses: [
      boss(887, 13466, 13465, 13468, 13467), // Halion
    ],
  },
];

const MODE_WEIGHT: Record<RaidMode, number> = {
  n10: 1,
  n25: 1.5,
  h10: 2,
  h25: 3,
};

export interface RaidInfo {
  key: string;
  name: string;
  icon: string;
  bosses: string[];
}

export interface GuildRaidMode {
  mode: RaidMode;
  killed: number;
  total: number;
  // the day the guild cleared it (its CREDIT-th member's completion achievement), null when not cleared
  clearedAt: number | null;
}

export interface GuildRaid {
  key: string;
  modes: GuildRaidMode[];
  // per boss (the raid's order), the difficulties the guild has killed it in
  bosses: RaidMode[][];
}

export interface GuildProgress {
  guildid: number;
  name: string;
  emblem: GuildEmblem;
  score: number;
  raids: GuildRaid[];
}

export interface Progression {
  raids: RaidInfo[];
  guilds: GuildProgress[];
  credit: Record<RaidMode, number>;
}

// where a criteria counts: its raid, boss and difficulty
const CRITERIA = new Map<
  number,
  { raid: number; boss: number; mode: RaidMode }
>();
// where a completion achievement counts
const CLEARS = new Map<number, { raid: number; mode: RaidMode }>();

RAIDS.forEach((raid, r) => {
  raid.bosses.forEach((b, i) => {
    for (const mode of MODES)
      for (const c of b.modes[mode] ?? [])
        CRITERIA.set(c, { raid: r, boss: i, mode });
  });
  for (const mode of MODES) {
    const a = raid.clears[mode];

    if (a) CLEARS.set(a, { raid: r, mode });
  }
});

// the bosses a difficulty tracks one by one (a raid with none, Onyxia's Lair: its clear counts them all)
const tracked = (raid: RaidDef, mode: RaidMode) =>
  raid.bosses.filter((b) => b.modes[mode]).length || raid.bosses.length;

export async function getProgression(
  slug: RealmSlug,
  locale: string,
  showGm: boolean,
): Promise<Progression> {
  const db = realmCharactersDb(slug);
  const [[kills], [clears], dbcs] = await Promise.all([
    db.query<RowDataPacket[]>(
      `SELECT gm.guildid, p.criteria, p.guid FROM character_achievement_progress p
       JOIN guild_member gm ON gm.guid = p.guid
       JOIN characters c ON c.guid = p.guid
       WHERE p.criteria IN (?) AND p.counter > 0 ${hideGm("c.account", showGm)}`,
      [[...CRITERIA.keys()]],
    ),
    db.query<RowDataPacket[]>(
      `SELECT gm.guildid, a.achievement, a.date FROM character_achievement a
       JOIN guild_member gm ON gm.guid = a.guid
       JOIN characters c ON c.guid = a.guid
       WHERE a.achievement IN (?) ${hideGm("c.account", showGm)}
       ORDER BY a.date`,
      [[...CLEARS.keys()]],
    ),
    dbcStore(realmServer(slug).dbcDir).load(["Map", "DungeonEncounter"]),
  ]);
  const slot = LOCALES[isTooltipLocale(locale) ? locale : "en"].slot;
  const maps = dbcs("Map");
  const encounters = dbcs("DungeonEncounter");
  const raids: RaidInfo[] = RAIDS.map((raid) => ({
    key: raid.key,
    name: maps.rec(raid.map)?.loc("MapName", slot) ?? raid.key,
    icon: raid.icon,
    bosses: raid.bosses.map(
      (b) => encounters.rec(b.encounter)?.loc("Name", slot).trim() ?? "",
    ),
  }));

  // guild -> "raid:boss:mode" -> its members who killed it
  const killers = new Map<number, Map<string, Set<number>>>();

  for (const k of kills) {
    const at = CRITERIA.get(Number(k.criteria));

    if (!at) continue;
    const guild = Number(k.guildid);
    let byBoss = killers.get(guild);

    if (!byBoss) killers.set(guild, (byBoss = new Map()));
    const key = `${at.raid}:${at.boss}:${at.mode}`;
    let set = byBoss.get(key);

    if (!set) byBoss.set(key, (set = new Set()));
    set.add(Number(k.guid));
  }
  // guild -> "raid:mode" -> its members' completion dates, oldest first
  const clearers = new Map<number, Map<string, number[]>>();

  for (const c of clears) {
    const at = CLEARS.get(Number(c.achievement));

    if (!at) continue;
    const guild = Number(c.guildid);
    let byRaid = clearers.get(guild);

    if (!byRaid) clearers.set(guild, (byRaid = new Map()));
    const key = `${at.raid}:${at.mode}`;

    byRaid.set(key, [...(byRaid.get(key) ?? []), Number(c.date)]);
  }

  const ids = [...new Set([...killers.keys(), ...clearers.keys()])];
  const progress: Omit<GuildProgress, "name" | "emblem">[] = [];

  for (const guildid of ids) {
    const byBoss = killers.get(guildid);
    const byRaid = clearers.get(guildid);
    const guildRaids: GuildRaid[] = [];
    let score = 0;

    RAIDS.forEach((raid, r) => {
      const modes: GuildRaidMode[] = [];
      const bosses: RaidMode[][] = raid.bosses.map(() => []);

      for (const mode of MODES) {
        const dates = byRaid?.get(`${r}:${mode}`) ?? [];
        const clearedAt =
          dates.length >= CREDIT[mode] ? dates[CREDIT[mode] - 1] : null;
        const total = tracked(raid, mode);
        let killed = 0;

        raid.bosses.forEach((b, i) => {
          const down =
            (clearedAt !== null &&
              (b.modes[mode] || !raid.bosses.some((x) => x.modes[mode]))) ||
            (byBoss?.get(`${r}:${i}:${mode}`)?.size ?? 0) >= CREDIT[mode];

          if (!down) return;
          bosses[i].push(mode);
          ++killed;
        });
        if (!killed) continue;
        modes.push({ mode, killed, total, clearedAt });
        score += killed * raid.tier * MODE_WEIGHT[mode];
      }
      if (modes.length) guildRaids.push({ key: raid.key, modes, bosses });
    });
    if (guildRaids.length) progress.push({ guildid, score, raids: guildRaids });
  }

  if (!progress.length) return { raids, guilds: [], credit: CREDIT };
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT guildid, name, EmblemStyle, EmblemColor, BorderStyle, BorderColor, BackgroundColor
     FROM guild WHERE guildid IN (?)`,
    [progress.map((p) => p.guildid)],
  );
  const guilds = new Map(rows.map((g) => [Number(g.guildid), g]));
  // the first to clear, among equals
  const firstClear = (p: (typeof progress)[number]) =>
    Math.min(
      ...p.raids.flatMap((r) =>
        r.modes.map((m) => m.clearedAt ?? Number.MAX_SAFE_INTEGER),
      ),
    );

  return {
    raids,
    credit: CREDIT,
    guilds: progress
      .filter((p) => guilds.has(p.guildid))
      .sort(
        (a, b) =>
          b.score - a.score ||
          firstClear(a) - firstClear(b) ||
          String(guilds.get(a.guildid)?.name).localeCompare(
            String(guilds.get(b.guildid)?.name),
          ),
      )
      .map((p) => {
        const g = guilds.get(p.guildid)!;

        return {
          ...p,
          name: String(g.name),
          emblem: {
            style: g.EmblemStyle,
            color: g.EmblemColor,
            borderStyle: g.BorderStyle,
            borderColor: g.BorderColor,
            background: g.BackgroundColor,
          },
        };
      }),
  };
}
