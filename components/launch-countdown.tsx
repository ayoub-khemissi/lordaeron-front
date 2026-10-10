"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

import { launchLine } from "@/lib/launch";

const UNITS = [
  ["days", 86_400_000],
  ["hours", 3_600_000],
  ["minutes", 60_000],
  ["seconds", 1_000],
] as const;

/* A realm's opening (lib/launch.ts): the date in Paris time with UTC beside it, a live countdown and the visitor's own
   local time. The clock only starts once mounted, so the server render and the first client render match.
   compact: one line (the portal's realm card); showDate false: the boxes only (the date is already written beside). */
export function LaunchCountdown({
  iso,
  compact = false,
  showDate = true,
  align = "center",
  className,
}: {
  iso: string;
  compact?: boolean;
  showDate?: boolean;
  align?: "center" | "start";
  className?: string;
}) {
  const t = useTranslations("launch");
  const locale = useLocale();
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
        <p className="mt-4 font-heading text-2xl text-wow-blue-ice">
          {t("live")}
        </p>
      ) : (
        <div
          className={clsx(
            "flex gap-2 sm:gap-3",
            showDate && "mt-4",
            align === "center" && "justify-center",
          )}
        >
          {values.map((v) => (
            <div
              key={v.unit}
              className="min-w-[4.25rem] rounded-lg border border-wow-blue-ice/30 bg-black/45 px-2 py-2 backdrop-blur-sm sm:min-w-[5rem]"
            >
              <div className="font-heading text-2xl tabular-nums text-wow-blue-ice sm:text-3xl">
                {v.value}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 sm:text-xs">
                {t(v.unit)}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 min-h-[1.25rem] text-sm text-white/65">
        {local && t("yourTime", { time: local })}
      </p>
    </div>
  );
}
