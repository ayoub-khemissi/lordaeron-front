"use client";

import type { ShopItemKind } from "@/types";

import { useTranslations } from "next-intl";
import clsx from "clsx";

import { type ShopFacets as Facets } from "@/lib/shop-utils";
import { useRealm } from "@/lib/realm-context";

/* The shop's facets under the search: the kinds the shown articles have (ground or flying mounts, transmog weapons or armor) and the
   realm's exclusives; each only when it would split the list. */
export function ShopFacets({
  entries,
  facets,
  onChange,
}: {
  entries: { kind?: ShopItemKind | null; exclusive?: boolean }[];
  facets: Facets;
  onChange: (facets: Facets) => void;
}) {
  const t = useTranslations("shop.facets");
  const realm = useRealm();
  const kinds = (["ground", "flying", "weapon", "armor"] as const).filter(
    (kind) => entries.some((e) => e.kind === kind),
  );
  const exclusives = entries.filter((e) => e.exclusive).length;
  const showKinds = kinds.length > 1;
  const showExclusive = exclusives > 0 && exclusives < entries.length;

  if (!showKinds && !showExclusive) return null;

  const chip = (active: boolean) =>
    clsx(
      "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
      active
        ? realm.accent === "ice"
          ? "border-wow-blue-ice/70 bg-wow-blue-ice/15 text-wow-blue-ice"
          : "border-wow-gold/70 bg-wow-gold/15 text-wow-gold-light"
        : "border-white/15 text-gray-400 hover:border-white/30 hover:text-gray-200",
    );

  return (
    <div className="-mt-3 mb-6 flex flex-wrap items-center gap-2">
      {showKinds && (
        <>
          <button
            className={chip(!facets.kind)}
            type="button"
            onClick={() => onChange({ ...facets, kind: null })}
          >
            {t("all")}
          </button>
          {kinds.map((kind) => (
            <button
              key={kind}
              className={chip(facets.kind === kind)}
              type="button"
              onClick={() =>
                onChange({
                  ...facets,
                  kind: facets.kind === kind ? null : kind,
                })
              }
            >
              {t(kind)}
            </button>
          ))}
        </>
      )}
      {showKinds && showExclusive && (
        <span aria-hidden className="mx-1 h-4 w-px bg-white/15" />
      )}
      {showExclusive && (
        <button
          className={chip(facets.exclusive)}
          type="button"
          onClick={() => onChange({ ...facets, exclusive: !facets.exclusive })}
        >
          ✦ {t("exclusive", { realm: realm.name })}
        </button>
      )}
    </div>
  );
}
