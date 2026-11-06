import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { launcherInfo } from "@/lib/patches";

// The launcher on the realms' portal: one line, its picture, a way to its page (shown once a build is published)
export async function LauncherBanner({ locale }: { locale: string }) {
  const launcher = await launcherInfo();

  if (!launcher) return null;
  const t = await getTranslations({ locale, namespace: "launcherPage" });

  return (
    <NextLink
      className="group relative mt-10 flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-wow-gold/30 bg-gradient-to-r from-wow-gold/[0.08] via-black/40 to-black/60 p-6 transition-all duration-500 hover:border-wow-gold/70 hover:shadow-[0_0_60px_-10px_rgba(199,156,62,0.5)] sm:flex-row sm:p-8"
      href={`/${locale}/launcher`}
    >
      <img
        alt=""
        className="w-full max-w-sm rounded-xl border border-white/10 shadow-xl transition-transform duration-700 group-hover:scale-[1.02]"
        src={`/img/launcher/home-${locale === "fr" ? "fr" : "en"}.webp`}
      />
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wow-gold-light/80">
          {t("kicker")}
        </p>
        <h2 className="mt-2 font-heading text-3xl text-white">{t("title")}</h2>
        <p className="mt-2 text-gray-300">{t("bannerText")}</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#e9c66f] via-wow-gold to-[#9a7429] px-5 py-2.5 text-sm font-semibold text-black">
          {t("bannerButton")}
        </span>
      </div>
    </NextLink>
  );
}
