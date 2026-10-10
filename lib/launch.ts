// A realm's opening, written the same way everywhere: the date and the time on the realm's clock (Paris) with UTC
// beside it, so every player can convert it (Ayoub, 10/10/2026). The visitor's own local time is added client-side.
export const LAUNCH_TZ = "Europe/Paris";

export type LaunchParts = {
  // "October 16, 2026" in the page's language
  date: string;
  // "Oct 16"
  short: string;
  // "19:00 CEST": the zone's abbreviation follows daylight saving time (CEST in summer, CET in winter)
  time: string;
  // "17:00 UTC"
  utc: string;
};

const clock = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

export function launchParts(iso: string, locale: string): LaunchParts {
  const at = new Date(iso);
  const zone =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: LAUNCH_TZ,
      timeZoneName: "short",
    })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? "";

  return {
    date: new Intl.DateTimeFormat(locale, {
      timeZone: LAUNCH_TZ,
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(at),
    short: new Intl.DateTimeFormat(locale, {
      timeZone: LAUNCH_TZ,
      day: "numeric",
      month: "short",
    }).format(at),
    time: `${clock(LAUNCH_TZ).format(at)} ${zone}`,
    utc: `${clock("UTC").format(at)} UTC`,
  };
}

/** "October 16, 2026 · 19:00 CEST (17:00 UTC)" */
export function launchLine(iso: string, locale: string): string {
  const p = launchParts(iso, locale);

  return `${p.date} · ${p.time} (${p.utc})`;
}
