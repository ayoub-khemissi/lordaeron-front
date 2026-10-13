"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/*
 * The Tools pages' clock: the current time ticking (unix seconds), a countdown ("2 d 4 h", "3 h 12 min", "4 min 05 s") and a date in the
 * reader's own time zone with the realm's (Paris, the worldservers' clock) beside it when it differs. Rendered after mount only: the
 * reader's zone is the browser's.
 */

export const REALM_ZONE = "Europe/Paris";

// the current unix time, every `everyMs`
export function useNow(everyMs = 1000): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      everyMs,
    );

    return () => clearInterval(id);
  }, [everyMs]);

  return now;
}

// the reader's time zone (null before mount)
export function useTimeZone(): string | null {
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || REALM_ZONE);
  }, []);

  return zone;
}

// a duration in seconds, its two largest units
export function useDuration() {
  const t = useTranslations("tools.duration");

  return (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);

    if (d > 0) return t("dh", { d, h });
    if (h > 0) return t("hm", { h, m });

    return t("ms", { m, s: String(s % 60).padStart(2, "0") });
  };
}

// "in 2 d 4 h" before `at`, "now" after
export function Countdown({
  at,
  now,
  className,
  mode = "in",
}: {
  at: number;
  now: number;
  className?: string;
  // "in": until a start; "left": until an end
  mode?: "in" | "left";
}) {
  const t = useTranslations("tools");
  const duration = useDuration();

  return (
    <span suppressHydrationWarning className={className}>
      {at <= now ? t("now") : t(mode, { time: duration(at - now) })}
    </span>
  );
}

const sameZone = (zone: string | null) => !zone || zone === REALM_ZONE;

// a date and time in the reader's zone, the Paris time beside when the reader is elsewhere
export function When({
  at,
  className,
  withDate = true,
}: {
  at: number;
  className?: string;
  withDate?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("tools");
  const zone = useTimeZone();

  if (!zone) return null;
  const date = new Date(at * 1000);
  const local = new Intl.DateTimeFormat(locale, {
    ...(withDate ? { weekday: "short", day: "numeric", month: "short" } : {}),
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zone,
  }).format(date);
  const paris = new Intl.DateTimeFormat(locale, {
    ...(withDate ? { weekday: "short" } : {}),
    hour: "2-digit",
    minute: "2-digit",
    timeZone: REALM_ZONE,
  }).format(date);

  return (
    <span className={className}>
      {local}
      {!sameZone(zone) && (
        <span className="text-gray-500"> · {t("paris", { time: paris })}</span>
      )}
    </span>
  );
}

// a day (an earned achievement, a clear), in the reader's language
export function Day({ at, className }: { at: number; className?: string }) {
  const locale = useLocale();

  return (
    <span className={className}>
      {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        at * 1000,
      )}
    </span>
  );
}

// the page's note on its times: the reader's zone, the realm's
export function ZoneNote() {
  const t = useTranslations("tools");
  const zone = useTimeZone();

  if (!zone) return null;

  return (
    <p className="text-center text-xs text-gray-500">
      {sameZone(zone) ? t("zoneParis") : t("zoneLocal", { zone })}
    </p>
  );
}
