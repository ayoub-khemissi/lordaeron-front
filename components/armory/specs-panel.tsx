"use client";

import NextLink from "next/link";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import { zamimgIcon } from "@/components/game-tooltip";
import { useRealm, useRealmHref } from "@/lib/realm-context";
import { MAX_LEVEL, type ClassKey } from "@/lib/talent-build";

/* A character's specializations (lib/talents.ts characterSpecs): its main tree, its points per tree, the active one, and its build in
   the talent calculator (when the realm has it). */

export interface ArmorySpecs {
  classKey: ClassKey;
  specs: {
    group: number;
    active: boolean;
    points: string;
    total: number;
    main: { name: string; icon: string } | null;
    build: string;
  }[];
}

export function SpecsPanel({
  specs,
  level,
}: {
  specs: ArmorySpecs;
  level: number;
}) {
  const t = useTranslations("armory");
  const realm = useRealm();
  const realmHref = useRealmHref();
  const calculator = realm.sections.includes("talents");

  return (
    <div
      className={clsx("grid gap-3", specs.specs.length > 1 && "sm:grid-cols-2")}
    >
      {specs.specs.map((spec) => {
        const query = new URLSearchParams({ class: specs.classKey });

        if (spec.build) query.set("build", spec.build);
        if (level < MAX_LEVEL) query.set("level", String(Math.max(10, level)));

        return (
          <div
            key={spec.group}
            className={clsx(
              "glass flex items-center gap-3 rounded-xl border px-3 py-3",
              spec.active ? "border-wow-gold/40" : "border-white/10",
            )}
          >
            <img
              alt=""
              className={clsx(
                "h-11 w-11 shrink-0 rounded-md border",
                spec.active ? "border-wow-gold/60" : "border-white/15",
              )}
              height={44}
              src={zamimgIcon(spec.main?.icon ?? "inv_misc_questionmark", 56)}
              width={44}
            />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="truncate font-semibold text-white">
                  {spec.main?.name ?? t("noTalents")}
                </span>
                {spec.active && (
                  <span className="rounded-full border border-wow-gold/40 bg-wow-gold/10 px-2 py-px text-[11px] font-semibold text-wow-gold-light">
                    {t("activeSpec")}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400">
                {spec.group === 0 ? t("primarySpec") : t("secondarySpec")}
                {" · "}
                <span className="font-mono text-gray-200">{spec.points}</span>
              </p>
            </div>
            {calculator && spec.total > 0 && (
              <NextLink
                className="shrink-0 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-gray-200 transition-colors hover:border-wow-gold/50 hover:text-wow-gold"
                href={`${realmHref("/talents")}?${query}`}
              >
                {t("viewTalents")}
              </NextLink>
            )}
          </div>
        );
      })}
    </div>
  );
}
