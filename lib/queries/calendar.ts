import type { RowDataPacket } from "mysql2";

import { LANGS, type Lang, phases } from "@/components/rimeheart/content";
import { getBlackMarket } from "@/lib/queries/black-market";
import { getRealmStatus } from "@/lib/queries/server";
import { configInt, nextRaidReset, realmConfig } from "@/lib/realm-config";
import { REALMS, isRealmOpen, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmWorldDb } from "@/lib/realms-server";
import { nextWeekly, parisParts, parisTime } from "@/lib/realm-time";
import { realmFirstsProgress } from "@/lib/realm-unlocks";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

/*
 * A realm's live calendar (Ayoub, 13/10/2026: the Tools page /<realm>/calendar): what comes next and what runs now, read from the realm
 * itself (its worldstates, its worldserver.conf through lib/realm-config.ts, its world bosses' respawns) and computed the way its core
 * does, in unix seconds. The page shows them in the reader's time zone, Paris time beside (the worldservers' clock).
 */

// the worldstates read (characters.worldstates)
const WS = {
  wintergraspTimer: 3781, // ms to the next battle, or to the end of the running one (saved every minute)
  wintergraspActive: 3801,
  wintergraspDefender: 3802, // 0 Alliance, 1 Horde
  arenaPoints: 20001, // the next arena points distribution
  weeklyQuests: 20002,
  dailyQuests: 20008,
  phase: 20100, // game/Conditions/WotLKPlusPhase: the realm's phase and the time it was set
  phaseSince: 20101,
  bonusUntil: 20110, // game/World/WotLKPlusBonus: a manual realm bonus runs until; the weekend's is stopped until
  bonusStopped: 20111,
} as const;

export type CalendarEventKind =
  | "opening"
  | "reservation"
  | "wintergrasp"
  | "tournament"
  | "raidReset"
  | "dailyQuests"
  | "weeklyQuests"
  | "arenaPoints"
  | "blackMarket"
  | "bonus";

export interface CalendarEvent {
  kind: CalendarEventKind;
  // its start (unix seconds)
  at: number;
  // a running one: since `at` until `until`
  running?: boolean;
  until?: number;
  // Wintergrasp's defender
  defender?: "alliance" | "horde";
  // the tournament's registration opening
  registration?: number;
  // the daily quests' reset is the weekly quests' too
  weekly?: boolean;
}

export interface CalendarWorldBoss {
  entry: number;
  name: string;
  phase: number;
  // its phase not reached yet
  locked: boolean;
  // killed: when it comes back (null: up)
  respawnAt: number | null;
}

export interface CalendarBonus {
  // the experience bonuses are allowed (a progressive realm: its 20 level 80 realm firsts)
  unlocked: boolean;
  firsts: { done: number; total: number };
  active: boolean;
  until: number | null;
  // the next weekend it runs (when XP.Boost.Weekend is on)
  next: number | null;
  // the experience rate (+50 %: 1.5)
  rate: number;
}

export interface Calendar {
  now: number;
  online: boolean;
  events: CalendarEvent[];
  worldBosses: CalendarWorldBoss[];
  phase: {
    n: number;
    title: string;
    icon: string;
    since: number | null;
  } | null;
  bonus: CalendarBonus | null;
}

const lang = (locale: string): Lang =>
  (LANGS as readonly string[]).includes(locale) ? (locale as Lang) : "en";

// Wintergrasp's timer is saved every minute: the time it was first seen at each value (a value seen again is no newer)
const wintergraspSeen = new Map<RealmSlug, { value: number; at: number }>();

function wintergraspEnd(slug: RealmSlug, value: number, now: number) {
  const seen = wintergraspSeen.get(slug);

  if (seen?.value === value) return seen.at + Math.round(value / 1000);
  wintergraspSeen.set(slug, { value, at: now });

  return now + Math.round(value / 1000);
}

// Friday 12:00 to Monday 05:00, server time (WotLKPlusBonus::InWeekend)
function inWeekend(ts: number) {
  const p = parisParts(ts);

  return (
    p.weekday === 6 ||
    p.weekday === 0 ||
    (p.weekday === 5 && p.hour >= 12) ||
    (p.weekday === 1 && p.hour < 5)
  );
}

// the next Monday 05:00 after `ts` (WotLKPlusBonus::WeekendEnd)
const weekendEnd = (ts: number) => nextWeekly(ts, [1], 5) ?? ts;

async function worldBosses(
  slug: RealmSlug,
  locale: string,
  phase: number,
  now: number,
): Promise<CalendarWorldBoss[]> {
  const itemLocale = isTooltipLocale(locale)
    ? LOCALES[locale].itemLocale
    : null;
  const [bosses] = await realmWorldDb(slug).query<RowDataPacket[]>(
    `SELECT w.entry, w.phase, ct.name, l.Name AS localized, MIN(c.guid) AS spawn
     FROM wotlk_plus_world_boss w
     JOIN creature_template ct ON ct.entry = w.entry
     LEFT JOIN creature_template_locale l ON l.entry = w.entry AND l.locale = ?
     LEFT JOIN creature c ON c.id = w.entry
     GROUP BY w.entry, w.phase, ct.name, l.Name
     ORDER BY w.phase, w.entry`,
    [itemLocale ?? "enUS"],
  );

  if (!bosses.length) return [];
  const spawns = bosses.map((b) => Number(b.spawn)).filter(Boolean);
  const [respawns] = spawns.length
    ? await realmCharactersDb(slug).query<RowDataPacket[]>(
        "SELECT spawnId, respawnTime FROM respawn WHERE type = 0 AND spawnId IN (?)",
        [spawns],
      )
    : [[] as RowDataPacket[]];
  const back = new Map(
    respawns.map((r) => [Number(r.spawnId), Number(r.respawnTime)]),
  );

  return bosses.map((b) => {
    const at = back.get(Number(b.spawn)) ?? 0;

    return {
      entry: Number(b.entry),
      name: String(b.localized || b.name),
      phase: Number(b.phase),
      locked: phase < Number(b.phase),
      respawnAt: at > now ? at : null,
    };
  });
}

export async function getCalendar(
  slug: RealmSlug,
  locale: string,
): Promise<Calendar> {
  const realm = REALMS[slug];
  const now = Math.floor(Date.now() / 1000);
  const [config, status, [stateRows]] = await Promise.all([
    realmConfig(slug),
    getRealmStatus(slug).catch(() => ({ online: false })),
    realmCharactersDb(slug).query<RowDataPacket[]>(
      "SELECT entry, value FROM worldstates WHERE entry IN (?)",
      [Object.values(WS)],
    ),
  ]);
  const ws = new Map(stateRows.map((r) => [Number(r.entry), Number(r.value)]));
  const state = (id: number) => ws.get(id) ?? 0;
  const events: CalendarEvent[] = [];
  const future = (at: number) => at > now;

  // a realm not open yet: its name reservation, its opening
  if (realm.reservationAt && future(Date.parse(realm.reservationAt) / 1000))
    events.push({
      kind: "reservation",
      at: Date.parse(realm.reservationAt) / 1000,
    });
  if (realm.launchAt && !isRealmOpen(realm))
    events.push({ kind: "opening", at: Date.parse(realm.launchAt) / 1000 });

  // Wintergrasp (Wintergrasp.Enable): a battle runs (its end), or the next one; the timer only moves while the worldserver runs
  if (
    status.online &&
    configInt(config, "Wintergrasp.Enable", 0) &&
    ws.has(WS.wintergraspTimer)
  ) {
    const end = wintergraspEnd(slug, state(WS.wintergraspTimer), now);
    const defender = state(WS.wintergraspDefender) === 1 ? "horde" : "alliance";
    const battle = configInt(config, "Wintergrasp.BattleTimer", 30) * 60;
    const pause = configInt(config, "Wintergrasp.NoBattleTimer", 150) * 60;

    if (state(WS.wintergraspActive))
      events.push(
        {
          kind: "wintergrasp",
          at: end - battle,
          until: end,
          running: true,
          defender,
        },
        { kind: "wintergrasp", at: end + pause, defender },
      );
    else
      events.push({
        kind: "wintergrasp",
        at: end,
        until: end + battle,
        defender,
      });
  }

  // the Sewer Tournament (scripts/Custom/wotlk_plus_tournament.cpp): its days (0 Sunday ... 6 Saturday), its hour, registrations open
  // with its first announce
  if (configInt(config, "WotLKPlus.PvP.Tournament.Enable", 0)) {
    const days = (config["WotLKPlus.PvP.Tournament.Days"] ?? "3 0")
      .split(/[\s,]+/)
      .map(Number)
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
    const at = nextWeekly(
      now,
      days,
      configInt(config, "WotLKPlus.PvP.Tournament.Hour", 19),
      configInt(config, "WotLKPlus.PvP.Tournament.Minute", 0),
    );
    const announce =
      Number(
        (config["WotLKPlus.PvP.Tournament.Announces"] ?? "30").split(/\s+/)[0],
      ) || 30;

    if (at)
      events.push({
        kind: "tournament",
        at,
        registration: at - announce * 60,
      });
  }

  events.push({ kind: "raidReset", at: await nextRaidReset(slug, now) });
  // the quests' resets (World::InitDailyQuestResetTime...): saved as the next time; a past one waits for the worldserver
  const daily = state(WS.dailyQuests);
  const weekly = state(WS.weeklyQuests);

  if (future(daily))
    events.push({ kind: "dailyQuests", at: daily, weekly: daily === weekly });
  else {
    const p = parisParts(now);
    const hour = configInt(config, "Quests.DailyResetTime", 3);
    let at = parisTime(p.year, p.month, p.day, hour);

    if (at <= now) at = parisTime(p.year, p.month, p.day + 1, hour);
    events.push({ kind: "dailyQuests", at });
  }
  if (future(weekly) && weekly !== daily)
    events.push({ kind: "weeklyQuests", at: weekly });
  if (future(state(WS.arenaPoints)))
    events.push({ kind: "arenaPoints", at: state(WS.arenaPoints) });

  let phase: Calendar["phase"] = null;
  let bonus: CalendarBonus | null = null;
  let bosses: CalendarWorldBoss[] = [];

  if (realm.progressive) {
    const n = state(WS.phase);
    const step = phases.steps[n];
    const market = await getBlackMarket(slug, locale).catch(() => null);

    if (market?.nextDelivery)
      events.push({ kind: "blackMarket", at: market.nextDelivery });
    if (configInt(config, "WotLKPlus.Phase.Enable", 0) || ws.has(WS.phase))
      phase = {
        n,
        title: step?.title[lang(locale)] ?? "",
        icon: step?.icon ?? "spell_frost_frozencore",
        since: state(WS.phaseSince) || null,
      };
    bosses = await worldBosses(slug, locale, n, now).catch(() => []);

    // the realm bonus (WotLKPlusBonus): allowed once the 20 level 80 realm firsts are earned on a realm with phases
    const firsts = await realmFirstsProgress(slug);
    const unlocked =
      !configInt(config, "WotLKPlus.Phase.Enable", 0) ||
      firsts.done >= firsts.total;
    const weekendOn = !!configInt(config, "XP.Boost.Weekend", 0);
    const manual = state(WS.bonusUntil);
    const weekend =
      weekendOn && inWeekend(now) && now >= state(WS.bonusStopped);
    const active = unlocked && (now < manual || weekend);
    const until = active
      ? Math.max(now < manual ? manual : 0, weekend ? weekendEnd(now) : 0)
      : null;
    const nextFriday = nextWeekly(now, [5], 12);

    bonus = {
      unlocked,
      firsts,
      active,
      until,
      next: !active && unlocked && weekendOn ? nextFriday : null,
      rate: Number(config["XP.Boost.Rate"]) || 1,
    };
    if (active && until)
      events.push({ kind: "bonus", at: now, until, running: true });
    else if (bonus.next) events.push({ kind: "bonus", at: bonus.next });
  }

  events.sort(
    (a, b) => (b.running ? 1 : 0) - (a.running ? 1 : 0) || a.at - b.at,
  );

  return {
    now,
    online: status.online,
    events: events.filter((e) => e.running || e.at > now),
    worldBosses: bosses,
    phase,
    bonus,
  };
}
