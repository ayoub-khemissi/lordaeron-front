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

function uptime(seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const days = Math.floor(seconds / 86400);
  const clock = `${pad(Math.floor((seconds % 86400) / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;

  return days > 0 ? `${days}d ${clock}` : clock;
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
    const timer = setInterval(() => setNow(Date.now()), 1000);

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

  return (
    <div
      className={clsx(
        "mx-auto inline-flex items-center gap-4 rounded-2xl border px-5 py-3 backdrop-blur-md",
        theme.panel,
      )}
    >
      <span className="relative flex h-3 w-3 shrink-0">
        {online && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={clsx(
            "relative inline-flex h-3 w-3 rounded-full",
            online === null
              ? "bg-default-400"
              : online
                ? "bg-green-400"
                : "bg-red-500",
          )}
        />
      </span>
      <span className="text-left">
        <span
          className={clsx(
            "block font-heading text-3xl leading-none tabular-nums sm:text-4xl",
            theme.number,
          )}
        >
          {players ?? "—"}
        </span>
        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          {online === false
            ? t("offline", { realm: realm.name })
            : t("playersOnline", { count: players ?? 0 })}
        </span>
        {online && started && (
          <span className="mt-1 block font-mono text-[11px] tracking-wider text-white/45">
            {t("uptime", { time: uptime(Math.floor(now / 1000) - started) })}
          </span>
        )}
      </span>
    </div>
  );
}
