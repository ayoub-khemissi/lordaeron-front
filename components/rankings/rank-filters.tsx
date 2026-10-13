"use client";

import { useTranslations } from "next-intl";
import clsx from "clsx";

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];

/* A ranking's choices: its boards as a row of chips (scrolling sideways on a phone), the faction and the class (Ayoub, 13/10/2026) */
export function RankTabs({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="tablist"
    >
      {options.map((o) => (
        <button
          key={o.value}
          aria-selected={o.value === value}
          className={clsx(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
            o.value === value
              ? "border-wow-gold/60 bg-wow-gold/15 text-wow-gold-light"
              : "border-white/10 text-gray-300 hover:border-wow-gold/30 hover:text-white",
          )}
          role="tab"
          type="button"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function RankFilters({
  faction,
  cls,
  onFaction,
  onClass,
}: {
  faction: string;
  cls: string;
  onFaction: (value: string) => void;
  onClass: (value: string) => void;
}) {
  const t = useTranslations("rankings");
  const tShop = useTranslations("shop");
  const factions = [
    { value: "", label: t("allFactions") },
    { value: "alliance", label: "Alliance" },
    { value: "horde", label: "Horde" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded-lg border border-white/10">
        {factions.map((f) => (
          <button
            key={f.value}
            aria-pressed={f.value === faction}
            className={clsx(
              "px-3 py-1.5 text-sm transition-colors",
              f.value === faction
                ? f.value === "alliance"
                  ? "bg-blue-500/25 text-blue-200"
                  : f.value === "horde"
                    ? "bg-red-500/25 text-red-200"
                    : "bg-white/10 text-white"
                : "text-gray-400 hover:text-white",
            )}
            type="button"
            onClick={() => onFaction(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor="rank-class">
        {t("class")}
      </label>
      <select
        className="rounded-lg border border-white/10 bg-[#0d1117] px-3 py-1.5 text-sm text-gray-200 focus:border-wow-gold/50 focus:outline-none"
        id="rank-class"
        value={cls}
        onChange={(e) => onClass(e.target.value)}
      >
        <option value="">{t("allClasses")}</option>
        {CLASSES.map((id) => (
          <option key={id} value={String(id)}>
            {tShop(`className_${id}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
