"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import clsx from "clsx";

import { launchLine } from "@/lib/launch";
import { useRealmHref } from "@/lib/realm-context";

const UNITS = [
  ["days", 86_400_000],
  ["hours", 3_600_000],
  ["minutes", 60_000],
  ["seconds", 1_000],
] as const;

/* A realm's opening (lib/launch.ts): the date in Paris time with UTC beside it, a live countdown and the visitor's own
   local time. The clock only starts once mounted, so the server render and the first client render match.
   compact: one line (the portal's realm card); showDate false: the boxes only (the date is already written beside).
   At zero the boxes give way to "Open — Play now", to playHref (the current realm's how-to by default). */
export function LaunchCountdown({
  iso,
  compact = false,
  showDate = true,
  align = "center",
  playHref,
  className,
}: {
  iso: string;
  compact?: boolean;
  showDate?: boolean;
  align?: "center" | "start";
  playHref?: string;
  className?: string;
}) {
  const t = useTranslations("launch");
  const locale = useLocale();
  const realmHref = useRealmHref();
  const at = Date.parse(iso);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : Math.max(0, at - now);
  const values = UNITS.map(([unit, ms], i) => ({
    unit,
    value:
      left === null
        ? "--"
        : String(
            Math.floor((i === 0 ? left : left % UNITS[i - 1][1]) / ms),
          ).padStart(i === 0 ? 1 : 2, "0"),
  }));
  const local =
    now === null
      ? null
      : new Intl.DateTimeFormat(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(at);

  if (compact) {
    return (
      <p
        className={clsx(
          "font-mono text-sm tabular-nums text-wow-blue-ice",
          className,
        )}
      >
        {left === 0
          ? t("live")
          : values.map((v) => `${v.value} ${t(v.unit)}`).join(" · ")}
      </p>
    );
  }

  return (
    <div
      className={clsx(
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {showDate && (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wow-blue-ice/90 sm:text-sm">
            {t("title")}
          </p>
          <p className="mt-2 font-heading text-lg text-white sm:text-2xl">
            {launchLine(iso, locale)}
          </p>
        </>
      )}
      {left === 0 ? (
        <NextLink
          className={clsx(
            "group inline-flex items-center gap-3 rounded-md border-2 border-wow-blue-ice/70 bg-[#06121f]/80 px-5 py-3 font-heading text-sm font-bold uppercase tracking-[0.14em] text-wow-blue-ice shadow-[0_0_28px_-6px_rgba(79,195,247,0.7)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-wow-blue-ice hover:bg-wow-blue-ice/10 sm:text-base",
            showDate && "mt-4",
          )}
          href={playHref ?? realmHref("/how-to")}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          {t("openPlay")}
          <svg
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </NextLink>
      ) : (
        <div
          className={clsx(
            "grid max-w-md grid-cols-4 gap-2 sm:gap-3",
            showDate && "mt-4",
            align === "center" && "mx-auto",
          )}
        >
          {values.map((v) => (
            <div
              key={v.unit}
              className="min-w-0 rounded-lg border border-wow-blue-ice/30 bg-black/45 px-1 py-2 text-center backdrop-blur-sm sm:px-2"
            >
              <div className="font-heading text-2xl tabular-nums text-wow-blue-ice sm:text-3xl">
                {v.value}
              </div>
              <div className="truncate text-[10px] uppercase tracking-[0.12em] text-white/60 sm:text-xs sm:tracking-[0.2em]">
                {t(v.unit)}
              </div>
            </div>
          ))}
        </div>
      )}
      {left !== 0 && (
        <p className="mt-3 min-h-[1.25rem] text-sm text-white/65">
          {local && t("yourTime", { time: local })}
        </p>
      )}
    </div>
  );
}
