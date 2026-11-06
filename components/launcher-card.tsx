"use client";

import type { LauncherInfo } from "@/lib/patches";

import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";

// "25.4 MB"
const megabytes = (bytes: number, locale: string) =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`;

// The Lordaeron launcher (scripts/launcher-publish.sh, latest.json): one download that does the how-to's steps by
// itself (the realm's patches, the realm list, the cache) and keeps the enhanced graphics (Lumenveil) up to date
export function LauncherCard({ launcher }: { launcher: LauncherInfo }) {
  const t = useTranslations("howTo");
  const locale = useLocale();
  const date = launcher.date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(launcher.date),
      )
    : "";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-10 overflow-hidden rounded-2xl border border-wow-gold/40 glow-gold"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        loading="lazy"
        src="/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Ulduar_000_1080p_png_jpgcopy.jpg"
      />
      <div className="relative glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Chip color="warning" size="sm" variant="flat">
            {t("launcherBadge")}
          </Chip>
          <h2 className="text-2xl font-bold wow-gradient-text sm:text-3xl">
            {t("launcherTitle")}
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-gray-300">{t("launcherText")}</p>
        <ul className="mt-4 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
          {(
            [
              "launcherPoint1",
              "launcherPoint2",
              "launcherPoint3",
              "launcherPoint4",
            ] as const
          ).map((key) => (
            <li key={key} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wow-gold" />
              {t(key)}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            download
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c66f] via-wow-gold to-[#9a7429] px-6 py-3 font-semibold text-black shadow-lg transition-all hover:brightness-110"
            href={launcher.url}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 5v14m0 0l-6-6m6 6l6-6M5 19h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("launcherDownload")}
          </a>
          <div className="text-xs text-gray-400">
            <p>
              {t("launcherDetails", {
                version: launcher.version,
                size: megabytes(launcher.size, locale),
                date,
              })}
            </p>
            <p className="break-all font-mono text-[11px] text-gray-500">
              SHA-256 {launcher.sha256}
            </p>
          </div>
        </div>
        <p className="mt-5 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-xs text-gray-400">
          {t("launcherSmartScreen")}
        </p>
        <p className="mt-4 text-xs text-gray-500">
          {t.rich("launcherCredits", {
            source: (chunks) => (
              <a
                className="text-wow-gold hover:underline"
                href={launcher.source}
                rel="noreferrer"
                target="_blank"
              >
                {chunks}
              </a>
            ),
            lumenveil: (chunks) => (
              <a
                className="text-wow-gold hover:underline"
                href="https://github.com/lumenveil/Lumenveil"
                rel="noreferrer"
                target="_blank"
              >
                {chunks}
              </a>
            ),
            fork: (chunks) => (
              <a
                className="text-wow-gold hover:underline"
                href="https://github.com/ayoub-khemissi/Lumenveil"
                rel="noreferrer"
                target="_blank"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
        <NextLink
          className="mt-4 inline-block text-sm font-medium text-wow-gold hover:underline"
          href={`/${locale}/launcher`}
        >
          {t("launcherMore")} →
        </NextLink>
        <p className="mt-4 text-sm text-gray-400">{t("launcherManual")}</p>
      </div>
    </motion.div>
  );
}
