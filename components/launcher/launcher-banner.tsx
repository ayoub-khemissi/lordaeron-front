import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { launcherInfo } from "@/lib/patches";

// The launcher on the realms' portal: its words and its call on the left, its window on the right (shown once a build is published)
export async function LauncherBanner({ locale }: { locale: string }) {
  const launcher = await launcherInfo();

  if (!launcher) return null;
  const t = await getTranslations({ locale, namespace: "launcherPage" });

  return (
    <NextLink
      className="group relative grid items-center gap-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121017] to-[#08090d] p-8 transition-colors duration-500 hover:border-wow-gold/40 sm:p-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14"
      href={`/${locale}/launcher`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-wow-gold/10 blur-3xl"
      />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-wow-gold-light/80">
          {launcher.mac ? t("kickerMac") : t("kicker")}
        </p>
        <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-white/65">
          {t("bannerText")}
        </p>
        <span className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-lg bg-[#d4a849] px-6 text-[15px] font-semibold text-[#1c1405] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-colors duration-200 group-hover:bg-[#e2b955]">
          {t("bannerButton")}
          <svg
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
      <img
        alt=""
        className="relative w-full rounded-lg shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/10"
        src={`/img/launcher/home-${locale === "fr" ? "fr" : "en"}.webp`}
      />
    </NextLink>
  );
}
