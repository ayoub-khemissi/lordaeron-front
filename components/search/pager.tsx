"use client";

import { useTranslations } from "next-intl";

/* Previous / page n of N / next, under a list (the armory's search, the guilds, a guild's members) */
export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  const t = useTranslations("search");

  if (pages <= 1) return null;
  const button =
    "rounded-lg border border-wow-gold/25 px-4 py-2 text-sm text-wow-gold-light transition-colors hover:border-wow-gold/50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label={t("pageOf", { page, pages })}
      className="flex items-center justify-between gap-3"
    >
      <button
        className={button}
        disabled={page <= 1}
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
      >
        ← {t("previous")}
      </button>
      <span className="text-sm text-gray-400">
        {t("pageOf", { page, pages })}
      </span>
      <button
        className={button}
        disabled={page >= pages}
        type="button"
        onClick={() => onPage(Math.min(pages, page + 1))}
      >
        {t("next")} →
      </button>
    </nav>
  );
}
