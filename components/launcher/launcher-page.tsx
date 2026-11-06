"use client";

import type { LauncherInfo } from "@/lib/patches";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { Tab, Tabs } from "@heroui/tabs";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const WOWHEAD_ICON = "https://wow.zamimg.com/images/wow/icons/large";

// the launcher's screens (public/img/launcher, rendered from the launcher itself): French ones for French, English otherwise
const SHOTS = ["home", "graphics", "all", "news", "settings"] as const;

const FEATURES = [
  { key: "realms", icon: "spell_arcane_portaldalaran" },
  { key: "updates", icon: "inv_misc_enggizmos_27" },
  { key: "graphics", icon: "spell_holy_surgeoflight" },
  { key: "login", icon: "inv_misc_key_14" },
  { key: "news", icon: "inv_letter_15" },
  { key: "reports", icon: "inv_misc_spyglass_03" },
] as const;

const SECURITY = [
  "password",
  "ticket",
  "downloads",
  "updates",
  "data",
] as const;
const FAQ = [
  "smartscreen",
  "antivirus",
  "requirements",
  "manual",
  "uninstall",
  "data",
] as const;

// "4.3 MB"
const megabytes = (bytes: number, locale: string) =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`;

function DownloadButton({
  launcher,
  big,
}: {
  launcher: LauncherInfo;
  big?: boolean;
}) {
  const t = useTranslations("launcherPage");

  return (
    <a
      download
      className={`inline-flex items-center gap-3 rounded-xl bg-gradient-to-b from-[#e9c66f] via-wow-gold to-[#9a7429] font-semibold text-black shadow-[0_10px_40px_-10px_rgba(199,156,62,0.7)] transition-all hover:brightness-110 ${
        big ? "px-7 py-4 text-lg" : "px-5 py-3"
      }`}
      href={launcher.url}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
      >
        <path
          d="M12 5v14m0 0l-6-6m6 6l6-6M5 19h14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t("download")}
    </a>
  );
}

export function LauncherPage({
  launcher,
  howTo,
}: {
  launcher: LauncherInfo | null;
  howTo: string;
}) {
  const t = useTranslations("launcherPage");
  const locale = useLocale();
  const lang = locale === "fr" ? "fr" : "en";
  const [shot, setShot] = useState<(typeof SHOTS)[number]>("home");
  const date = launcher?.date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(launcher.date),
      )
    : "";

  return (
    <div className="relative overflow-hidden bg-wow-darker">
      {/* hero */}
      <section className="relative">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          src="/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_004_1080p_png_jpgcopy.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-wow-darker/40 via-wow-darker/80 to-wow-darker" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1fr_1.25fr] lg:pt-24">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-wow-gold-light/80">
              {t("kicker")}
            </p>
            <h1 className="mt-4 font-heading text-5xl leading-tight text-white sm:text-6xl">
              <span className="wow-gradient-text">{t("title")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-gray-300">
              {t("subtitle")}
            </p>
            {launcher ? (
              <div className="mt-8">
                <DownloadButton big launcher={launcher} />
                <p className="mt-4 text-sm text-gray-400">
                  {t("details", {
                    version: launcher.version,
                    size: megabytes(launcher.size, locale),
                    date,
                  })}
                </p>
                <p className="mt-1 break-all font-mono text-[11px] text-gray-500">
                  SHA-256 {launcher.sha256}
                </p>
              </div>
            ) : (
              <p className="mt-8 text-sm text-gray-400">{t("soon")}</p>
            )}
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle,rgba(199,156,62,0.25),transparent_70%)]" />
            <img
              alt={t("shots.home")}
              className="relative w-full rounded-2xl border border-white/10 shadow-2xl"
              src={`/img/launcher/home-${lang}.webp`}
            />
          </motion.div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl space-y-24 px-6 pb-24">
        {/* what it does */}
        <section>
          <h2 className="text-center font-heading text-3xl text-white sm:text-4xl">
            {t("featuresTitle")}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.key}
                className="glass rounded-2xl border border-white/5 p-6"
                initial={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <img
                  alt=""
                  className="h-12 w-12 rounded-lg border border-wow-gold/40"
                  src={`${WOWHEAD_ICON}/${f.icon}.jpg`}
                />
                <h3 className="mt-4 font-heading text-xl text-wow-gold-light">
                  {t(`features.${f.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {t(`features.${f.key}.text`)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* its screens */}
        <section>
          <h2 className="text-center font-heading text-3xl text-white sm:text-4xl">
            {t("shotsTitle")}
          </h2>
          <div className="mt-8 flex justify-center">
            <Tabs
              aria-label={t("shotsTitle")}
              classNames={{
                cursor: "bg-wow-gold",
                tabContent: "group-data-[selected=true]:text-black",
              }}
              color="warning"
              radius="full"
              selectedKey={shot}
              onSelectionChange={(k) => setShot(k as (typeof SHOTS)[number])}
            >
              {SHOTS.map((s) => (
                <Tab key={s} title={t(`shots.${s}`)} />
              ))}
            </Tabs>
          </div>
          <img
            alt={t(`shots.${shot}`)}
            className="mx-auto mt-6 w-full max-w-5xl rounded-2xl border border-white/10 shadow-2xl"
            src={`/img/launcher/${shot}-${lang}.webp`}
          />
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-gray-400">
            {t(`shotsText.${shot}`)}
          </p>
        </section>

        {/* three steps */}
        <section>
          <h2 className="text-center font-heading text-3xl text-white sm:text-4xl">
            {t("stepsTitle")}
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li
                key={n}
                className="glass relative rounded-2xl border border-white/5 p-6 pt-10"
              >
                <span className="absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#e9c66f] to-[#9a7429] font-heading text-lg text-black">
                  {n}
                </span>
                <h3 className="font-heading text-xl text-white">
                  {t(`steps.${n}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {t(`steps.${n}.text`)}
                </p>
              </li>
            ))}
          </ol>
          {launcher && (
            <div className="mt-10 flex justify-center">
              <DownloadButton launcher={launcher} />
            </div>
          )}
        </section>

        {/* security */}
        <section className="glass-gold rounded-3xl border border-wow-gold/20 p-8 sm:p-10">
          <h2 className="font-heading text-3xl text-white">
            {t("securityTitle")}
          </h2>
          <p className="mt-2 text-gray-300">{t("securityText")}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {SECURITY.map((k) => (
              <li
                key={k}
                className="flex gap-3 text-sm leading-relaxed text-gray-200"
              >
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t(`security.${k}`)}
              </li>
            ))}
          </ul>
        </section>

        {/* questions */}
        <section>
          <h2 className="text-center font-heading text-3xl text-white sm:text-4xl">
            {t("faqTitle")}
          </h2>
          <Accordion className="mx-auto mt-8 max-w-3xl" variant="splitted">
            {FAQ.map((k) => (
              <AccordionItem
                key={k}
                classNames={{
                  base: "glass !bg-white/[0.03] border border-white/5",
                  title: "text-white",
                  content: "text-sm text-gray-300 pb-4",
                }}
                title={t(`faq.${k}.q`)}
              >
                {k === "manual"
                  ? t.rich("faq.manual.a", {
                      link: (chunks) => (
                        <NextLink
                          className="text-wow-gold hover:underline"
                          href={howTo}
                        >
                          {chunks}
                        </NextLink>
                      ),
                    })
                  : t(`faq.${k}.a`)}
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* credits */}
        <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-gray-500">
          {t.rich("credits", {
            source: (chunks) => (
              <a
                className="text-wow-gold hover:underline"
                href={
                  launcher?.source ??
                  "https://github.com/ayoub-khemissi/lordaeron-launcher"
                }
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
      </div>
    </div>
  );
}
