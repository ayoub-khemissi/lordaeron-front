"use client";

import type { RealmAccent } from "./types";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

import { THEME } from "./theme";

import { LaunchCountdown } from "@/components/launch-countdown";
import { launchParts } from "@/lib/launch";
import { useRealmAt } from "@/lib/realm-context";
import { type RealmSlug } from "@/lib/realms";

// the world server's uptime in the reader's words: "3 j 15 h", "15 h 42 min", "12 min" (Intl's narrow units, every locale)
function uptime(seconds: number, locale: string): string {
  const unit = (value: number, u: "day" | "hour" | "minute") =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit: u,
      unitDisplay: "narrow",
    }).format(value);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${unit(days, "day")} ${unit(hours, "hour")}`;
  if (hours > 0) return `${unit(hours, "hour")} ${unit(minutes, "minute")}`;

  return unit(minutes, "minute");
}

/* The hero's live block: an open realm shows its players online (and whether its world server answers); a realm not open yet shows
   its opening — the name reservation to come or open, and the countdown to the world's opening. Read every 30 s. */
export function RealmLive({
  slug,
  accent,
}: {
  slug: RealmSlug;
  accent: RealmAccent;
}) {
  const t = useTranslations("realmHome");
  const locale = useLocale();
  const realm = useRealmAt(slug);
  const theme = THEME[accent];
  const [online, setOnline] = useState<boolean | null>(null);
  const [players, setPlayers] = useState<number | null>(null);
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const open = realm.status === "open";

  useEffect(() => {
    if (!open) return;
    const read = async () => {
      try {
        const [status, stats] = await Promise.all([
          fetch(`/api/server/status?realm=${slug}`).then((r) => r.json()),
          fetch(`/api/server/stats?realm=${slug}`).then((r) => r.json()),
        ]);

        setOnline(!!status.online);
        setStarted(status.starttime ? Number(status.starttime) : null);
        setPlayers(Number(stats.onlineCount) || 0);
      } catch {
        setOnline(false);
      }
    };

    read();
    const timer = setInterval(read, 30_000);

    return () => clearInterval(timer);
  }, [open, slug]);

  // the world server's uptime, ticking
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);

    return () => clearInterval(timer);
  }, [started]);

  if (!open && realm.launchAt) {
    const world = launchParts(realm.launchAt, locale);
    const reserve = realm.reservationAt
      ? launchParts(realm.reservationAt, locale)
      : null;

    return (
      <div
        className={clsx(
          "mx-auto w-full max-w-md rounded-2xl border p-4 backdrop-blur-md sm:p-5",
          theme.panel,
        )}
      >
        <p
          className={clsx(
            "flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-xs",
            theme.eyebrow,
          )}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-current shadow-[0_0_10px_currentColor]" />
          {realm.reservation ? t("reservationOpen") : t("comingSoon")}
        </p>
        <p className="mt-2 text-sm leading-snug text-white/85">
          {realm.reservation
            ? t("reservationHint", { date: `${world.short} · ${world.time}` })
            : reserve
              ? t("reservationOn", {
                  date: `${reserve.short} · ${reserve.time}`,
                })
              : t("opensOn", { date: `${world.short} · ${world.time}` })}
        </p>
        <LaunchCountdown
          align="center"
          className="mt-3"
          iso={realm.launchAt}
          showDate={false}
        />
      </div>
    );
  }

  // the state on top (a pill), then two even columns: the players online and how long the world has been up
  return (
    <div
      className={clsx(
        "mx-auto w-full max-w-sm overflow-hidden rounded-2xl border backdrop-blur-md",
        theme.panel,
      )}
    >
      <p className="flex items-center justify-center gap-2 border-b border-white/10 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
        <span className="relative flex h-2 w-2">
          {online && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          )}
          <span
            className={clsx(
              "relative inline-flex h-2 w-2 rounded-full",
              online === null
                ? "bg-default-400"
                : online
                  ? "bg-green-400"
                  : "bg-red-500",
            )}
          />
        </span>
        {online === false ? t("liveOffline") : t("liveOnline")}
      </p>
      {online === false ? (
        <p className="px-4 py-4 text-center text-sm text-white/80">
          {t("offline", { realm: realm.name })}
        </p>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-white/10">
          <div className="px-3 py-3 text-center">
            <span
              className={clsx(
                "block font-heading text-3xl leading-none tabular-nums sm:text-4xl",
                theme.number,
              )}
            >
              {players ?? "—"}
            </span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {t("playersOnline", { count: players ?? 0 })}
            </span>
          </div>
          <div className="px-3 py-3 text-center">
            <span
              className={clsx(
                "block whitespace-nowrap font-heading text-2xl leading-[1.875rem] tabular-nums sm:text-3xl sm:leading-9",
                theme.number,
              )}
            >
              {started ? uptime(Math.floor(now / 1000) - started, locale) : "—"}
            </span>
            <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {t("uptimeLabel")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
