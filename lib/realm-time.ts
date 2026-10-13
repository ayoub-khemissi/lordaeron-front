/*
 * The realms' clock: the worldservers run on Paris time (their systemd units set TZ=Europe/Paris), so their weekly events (raid resets,
 * the PvP tournament) fall on Paris days and hours. These helpers compute those instants the way the core does
 * (InstanceSaveManager's GetNextWeekdayResetTime), in unix seconds.
 */

export const REALM_TIMEZONE = "Europe/Paris";

const PARTS = new Intl.DateTimeFormat("en-GB", {
  timeZone: REALM_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
  hourCycle: "h23",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// a unix time's date and time in Paris (weekday: 0 Sunday … 6 Saturday)
export function parisParts(ts: number) {
  const p = Object.fromEntries(
    PARTS.formatToParts(new Date(ts * 1000)).map((x) => [x.type, x.value]),
  );

  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: WEEKDAYS.indexOf(p.weekday),
  };
}

// the unix time of a Paris date and hour
export function parisTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): number {
  const wanted = Date.UTC(year, month - 1, day, hour, minute) / 1000;
  let ts = wanted;

  // twice: the offset at the guess, then at the corrected time (summer time changes)
  for (let i = 0; i < 2; ++i) {
    const p = parisParts(ts);
    const shown =
      Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) / 1000;

    ts += wanted - shown;
  }

  return ts;
}

// the first of `weekdays` (0 Sunday … 6 Saturday) at hour:minute, Paris time, strictly after `from`
export function nextWeekly(
  from: number,
  weekdays: number[],
  hour: number,
  minute = 0,
): number | null {
  if (!weekdays.length) return null;
  for (let offset = 0; offset <= 7; ++offset) {
    const p = parisParts(from + offset * 86400);

    if (!weekdays.includes(p.weekday)) continue;
    const candidate = parisTime(p.year, p.month, p.day, hour, minute);

    if (candidate > from) return candidate;
  }

  return null;
}

// the worldserver's Instance.RaidResetDays ("3,7": ISO days, 1 Monday … 7 Sunday) as weekdays (0 Sunday … 6 Saturday)
export function isoDays(value: string | undefined): number[] {
  return [...new Set((value ?? "").match(/[1-7]/g) ?? [])].map((d) =>
    Number(d) === 7 ? 0 : Number(d),
  );
}
