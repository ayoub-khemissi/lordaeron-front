"use client";

import type { PatchInfo } from "@/lib/patches";

import { Snippet } from "@heroui/snippet";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import NextLink from "next/link";
import clsx from "clsx";

import { launchLine } from "@/lib/launch";
import { useAuth } from "@/lib/auth-context";
import { useRealm } from "@/lib/realm-context";
import { registerPath } from "@/lib/realms";
import { RealmStatusPill } from "@/components/realm-status-pill";

const WOWHEAD_ICON = "https://wow.zamimg.com/images/wow/icons/large";

const steps = [
  {
    key: "step1",
    icon: `${WOWHEAD_ICON}/inv_misc_bag_20.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/WoW_ClassicLaunchPressKit_ThousandNeedles_1920x1080.jpg",
  },
  {
    key: "step2",
    icon: `${WOWHEAD_ICON}/inv_misc_note_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
  },
  {
    key: "step3",
    icon: `${WOWHEAD_ICON}/inv_letter_08.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_ArthasThrone_003_1080p_png_jpgcopy.jpg",
  },
  {
    key: "step4",
    icon: `${WOWHEAD_ICON}/inv_misc_enggizmos_27.jpg`,
    bg: "/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_STV_1920x1080.jpg",
  },
  {
    key: "step5",
    icon: `${WOWHEAD_ICON}/inv_misc_wrench_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
    download: "/patches/patch-Z.MPQ",
    // Lordaeron's client patch (Rimeheart's step below carries it beside its own)
    realms: ["lordaeron"],
  },
  {
    // Rimeheart's patches (Ayoub, 13/10/2026): patch-W, its content (lib/patches.ts manifest), and patch-Z, the guild bank tab costs and
    // the dungeon finder's data, the same on both realms (Guild.BankTab.Cost, LFGDungeons.dbc)
    key: "stepPatch",
    icon: `${WOWHEAD_ICON}/inv_misc_wrench_01.jpg`,
    bg: "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
    realms: ["rimeheart"],
  },
  {
    key: "step6",
    icon: `${WOWHEAD_ICON}/inv_misc_horn_02.jpg`,
    bg: "/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(5)_png_jpgcopy.jpg",
  },
];

// "25.4 MB"
const megabytes = (bytes: number, locale: string) =>
  `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`;

const DOWNLOAD =
  "inline-flex items-center gap-2 glass-gold glow-gold rounded-lg px-5 py-2.5 text-wow-gold font-semibold text-sm hover:brightness-125 transition-all";

function DownloadIcon() {
  return (
    <svg
      className="w-4 h-4"
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
  );
}

// the version, size and SHA-256 of a published patch, under its download button
function PatchDetails({ patch, locale }: { patch: PatchInfo; locale: string }) {
  const t = useTranslations("howTo");

  return (
    <>
      <p className="text-xs text-gray-400">
        {t("stepPatchVersion", {
          version: patch.version,
          size: megabytes(patch.size, locale),
        })}
      </p>
      <p className="break-all font-mono text-[11px] text-gray-500">
        SHA-256 {patch.sha256}
      </p>
    </>
  );
}

// realmPatch: the realm's own client patch from the manifest (null while it is not published); sharedPatch: patch-Z's entry
export default function HowToContent({
  realmPatch = null,
  sharedPatch = null,
}: {
  realmPatch?: PatchInfo | null;
  sharedPatch?: PatchInfo | null;
}) {
  const t = useTranslations("howTo");
  const tl = useTranslations("launch");
  const locale = useLocale();
  const realm = useRealm();
  const { user } = useAuth();
  // the signup keeps the realm (app/[locale]/register: its next step is this page)
  const registerHref = registerPath(locale, realm.slug);
  const realmSteps = steps.filter(
    (step) => !("realms" in step) || step.realms?.includes(realm.slug),
  );

  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_STV_1920x1080.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />

      <div className="relative container mx-auto max-w-4xl px-6 py-16">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className={clsx(
              "text-4xl sm:text-5xl font-black mb-3",
              realm.accent === "ice" ? "wow-ice-text" : "wow-gradient-text",
            )}
          >
            {t("title")}
          </h1>
          <p className="text-gray-300 mb-4">
            {t("subtitle", { realm: realm.name })}
          </p>
          <div className="shimmer-line w-32 mx-auto" />
          <RealmStatusPill withName className="mt-6" realm={realm.slug} />
          {/* the name reservation (lib/realms.ts reservationAt): accounts, the client and the patch are ready, the world opens at launchAt */}
          {realm.reservation && realm.launchAt && (
            <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-5 py-3 text-sm text-emerald-200">
              <span className="block font-semibold">
                {t("realmReservationTitle")}
              </span>
              {t("realmReservation", {
                realm: realm.name,
                date: launchLine(realm.launchAt, locale),
              })}
            </p>
          )}
          {realm.status !== "open" && !realm.reservation && (
            <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-wow-blue-ice/30 bg-wow-blue-ice/10 px-5 py-3 text-sm text-wow-blue-ice">
              {t("realmSoon", { realm: realm.name })}
              {realm.launchAt && (
                <span className="mt-1 block font-semibold">
                  {tl("opensOn", {
                    date: launchLine(realm.launchAt, locale),
                  })}
                </span>
              )}
            </p>
          )}
        </motion.div>

        <div className="space-y-6">
          {realmSteps.map((step, index) => (
            <motion.div
              key={step.key}
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="relative overflow-hidden rounded-2xl group glow-gold">
                {/* Background image */}
                <img
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 group-hover:scale-110 transition-[opacity,scale] duration-700"
                  loading="lazy"
                  src={step.bg}
                />

                <div className="relative glass border-wow-gold/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start overflow-hidden">
                  {/* Step WoW icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-wow-gold/40 glow-gold bg-wow-darker/50">
                      <img
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        src={step.icon}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-wow-gold/50 text-sm font-mono">
                        0{index + 1}
                      </span>
                      <h3 className="text-wow-gold font-bold text-xl">
                        {t(`${step.key}Title`)}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed break-words">
                      {t(`${step.key}Desc`, { realm: realm.name })}
                    </p>

                    {step.key === "step2" && (
                      <div className="mt-5">
                        <Snippet
                          classNames={{
                            base: "glass-blue border-wow-blue/20 w-full glow-blue relative text-center",
                            pre: "text-wow-blue-ice font-mono text-sm break-all whitespace-normal",
                            copyButton:
                              "absolute -top-3.5 -right-3.5 sm:relative sm:top-auto sm:right-auto text-wow-blue hover:text-wow-blue-ice",
                          }}
                          symbol=""
                          variant="bordered"
                        >
                          {t("realmlist")}
                        </Snippet>
                      </div>
                    )}

                    {step.key === "step3" && !user && (
                      <div className="mt-5">
                        <NextLink className={DOWNLOAD} href={registerHref}>
                          {t("step3Button")}
                        </NextLink>
                      </div>
                    )}

                    {"download" in step && step.download && (
                      <div className="mt-5">
                        <a download className={DOWNLOAD} href={step.download}>
                          <DownloadIcon />
                          {t(`${step.key}Download`)}
                        </a>
                      </div>
                    )}

                    {step.key === "stepPatch" && (
                      <div className="mt-5 space-y-4">
                        {realmPatch ? (
                          <div className="space-y-2">
                            <a
                              download
                              className={DOWNLOAD}
                              href={realmPatch.url}
                            >
                              <DownloadIcon />
                              {t("stepPatchDownload", {
                                file: realmPatch.file,
                              })}
                            </a>
                            <PatchDetails locale={locale} patch={realmPatch} />
                          </div>
                        ) : (
                          <p className="rounded-lg border border-wow-blue-ice/30 bg-wow-blue-ice/10 px-4 py-2 text-sm text-wow-blue-ice">
                            {t("stepPatchSoon")}
                          </p>
                        )}
                        <div className="space-y-2">
                          <a
                            download
                            className={DOWNLOAD}
                            href={sharedPatch?.url ?? "/patches/patch-Z.MPQ"}
                          >
                            <DownloadIcon />
                            {t("stepPatchDownload", { file: "patch-Z.MPQ" })}
                          </a>
                          {sharedPatch && (
                            <PatchDetails locale={locale} patch={sharedPatch} />
                          )}
                        </div>
                        <p className="rounded-lg border border-wow-gold/25 bg-wow-gold/5 px-4 py-3 text-sm leading-relaxed text-gray-300">
                          <span className="font-semibold text-wow-gold">
                            {t("stepPatchFolderTitle")}
                          </span>{" "}
                          {t("stepPatchFolder")}
                        </p>
                        <p className="text-xs leading-relaxed text-gray-400">
                          {t("stepPatchUpdates")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Version badge */}
        <motion.div
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="inline-block glass-gold glow-gold-strong rounded-full px-8 py-3">
            <p className="text-wow-gold font-semibold text-sm tracking-wide">
              {t("version")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
