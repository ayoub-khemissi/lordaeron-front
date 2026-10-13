"use client";

import type {
  Calendar,
  CalendarEvent,
  CalendarEventKind,
} from "@/lib/queries/calendar";

import { useTranslations } from "next-intl";

import { CalendarSkeleton } from "./calendar-skeleton";

import {
  Countdown,
  Day,
  When,
  ZoneNote,
  useNow,
} from "@/components/tools/time";
import { GameIcon, ToolError } from "@/components/tools/tool-page";
import { useToolData } from "@/components/tools/use-tool-data";
import { useRealm } from "@/lib/realm-context";

const ICONS: Record<CalendarEventKind, string> = {
  opening: "achievement_zone_icecrown_01",
  reservation: "inv_letter_15",
  wintergrasp: "spell_frost_chillingblast",
  tournament: "ability_warrior_challange",
  raidReset: "spell_holy_borrowedtime",
  dailyQuests: "achievement_quests_completed_daily_01",
  weeklyQuests: "inv_misc_note_06",
  arenaPoints: "achievement_arena_3v3_7",
  blackMarket: "inv_misc_coinbag_special",
  bonus: "spell_arcane_teleportdalaran",
};
// the world bosses' faces (content/worldbosses), a skull for the others
const BOSS_ICONS: Record<number, string> = {
  191200: "achievement_boss_generalvezax_01",
  191210: "inv_misc_head_dragon_blue",
};

function EventRow({ event, now }: { event: CalendarEvent; now: number }) {
  const t = useTranslations("calendar");
  const live = event.running && event.until;
  const title =
    event.kind === "dailyQuests" && event.weekly
      ? t("events.dailyWeekly")
      : t(`events.${event.kind}`);

  return (
    <li
      className={`glass flex items-center gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4 ${
        live ? "border-emerald-400/40" : "border-white/5"
      }`}
    >
      <GameIcon icon={ICONS[event.kind]} size={44} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 font-semibold text-white">
          {title}
          {live && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-px text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {t("running")}
            </span>
          )}
        </p>
        {event.defender && (
          <p className="text-xs text-gray-400">
            {t("defender", { faction: t(event.defender) })}
          </p>
        )}
        {event.registration && event.registration > now && (
          <p className="text-xs text-gray-400">
            {t("registration")}{" "}
            <When at={event.registration} withDate={false} />
          </p>
        )}
        <When
          at={live ? event.until! : event.at}
          className="mt-0.5 block text-xs text-gray-300"
        />
      </div>
      <Countdown
        at={live ? event.until! : event.at}
        className={`shrink-0 text-right text-sm font-semibold tabular-nums ${
          live ? "text-emerald-300" : "text-wow-gold-light"
        }`}
        mode={live ? "left" : "in"}
        now={now}
      />
    </li>
  );
}

/* The realm's live calendar (app/api/calendar, refreshed every minute; the countdowns tick every second): what runs now and what comes
   next, the world bosses, and on a progressive realm its phase and its realm bonus. */
export function CalendarContent() {
  const t = useTranslations("calendar");
  const tt = useTranslations("tools");
  const realm = useRealm();
  const now = useNow();
  const { data, error } = useToolData<Calendar>("/api/calendar", {}, 60_000);

  if (!data)
    return error ? <ToolError message={tt("error")} /> : <CalendarSkeleton />;
  const events = data.events.filter((e) =>
    e.running ? (e.until ?? 0) > now : e.at > now,
  );
  const { phase, bonus } = data;

  return (
    <div className="space-y-6">
      {/* the realm now */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="glass flex items-center gap-3 rounded-xl border border-white/5 p-3 sm:col-span-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${data.online ? "bg-green-500" : "bg-gray-500"}`}
          />
          <p className="text-sm text-gray-300">
            {data.online
              ? t("online", { realm: realm.name })
              : t("offline", { realm: realm.name })}
          </p>
        </div>
        {phase && (
          <div className="glass flex items-center gap-3 rounded-xl border border-wow-blue-ice/30 p-3 sm:p-4">
            <GameIcon icon={phase.icon} size={44} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-wow-blue-ice/80">
                {t("phase", { n: phase.n })}
              </p>
              <p className="font-heading text-lg text-white">{phase.title}</p>
              {phase.since && (
                <p className="text-xs text-gray-500">
                  {t("since")} <Day at={phase.since} />
                </p>
              )}
            </div>
          </div>
        )}
        {bonus && (
          <div
            className={`glass flex items-center gap-3 rounded-xl border p-3 sm:p-4 ${
              bonus.active ? "border-emerald-400/40" : "border-white/5"
            }`}
          >
            <GameIcon dim={!bonus.active} icon={ICONS.bonus} size={44} />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                {t("bonus")}
              </p>
              <p
                className={`font-semibold ${bonus.active ? "text-emerald-300" : "text-gray-200"}`}
              >
                {bonus.active
                  ? t("bonusActive", { xp: Math.round((bonus.rate - 1) * 100) })
                  : !bonus.unlocked
                    ? t("bonusLocked", {
                        done: bonus.firsts.done,
                        total: bonus.firsts.total,
                      })
                    : t("bonusIdle")}
              </p>
              {bonus.active && bonus.until && (
                <Countdown
                  at={bonus.until}
                  className="text-xs text-gray-400"
                  mode="left"
                  now={now}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* what comes next */}
      <section>
        <h2 className="mb-3 font-heading text-xl text-white">
          {t("upcoming")}
        </h2>
        <ul className="space-y-2">
          {events.map((e) => (
            <EventRow key={`${e.kind}:${e.at}`} event={e} now={now} />
          ))}
        </ul>
      </section>

      {/* the world bosses */}
      {data.worldBosses.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-xl text-white">
            {t("worldBosses")}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.worldBosses.map((b) => (
              <li
                key={b.entry}
                className="glass flex items-center gap-3 rounded-xl border border-white/5 p-3"
              >
                <GameIcon
                  dim={b.locked}
                  icon={BOSS_ICONS[b.entry] ?? "inv_misc_bone_skull_02"}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{b.name}</p>
                  <p className="text-xs text-gray-400">
                    {b.locked ? (
                      t("bossLocked", { n: b.phase })
                    ) : b.respawnAt ? (
                      <>
                        {t("bossBack")} <When at={b.respawnAt} />
                      </>
                    ) : (
                      <span className="text-emerald-300">{t("bossUp")}</span>
                    )}
                  </p>
                </div>
                {!b.locked && b.respawnAt && (
                  <Countdown
                    at={b.respawnAt}
                    className="shrink-0 text-sm font-semibold text-wow-gold-light"
                    now={now}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <ZoneNote />
    </div>
  );
}
