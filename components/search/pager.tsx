"use client";

import { Pagination } from "@heroui/pagination";
import { useTranslations } from "next-intl";

/* The pages under a list (the armory's search, the guilds, a guild's members, the rankings, the Codex): HeroUI's Pagination (Ayoub,
   18/10/2026: HeroUI's own controls) */
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

  return (
    <nav
      aria-label={t("pageOf", { page, pages })}
      className="flex justify-center"
    >
      <Pagination
        showControls
        classNames={{
          item: "border-wow-gold/25 bg-transparent text-gray-200 data-[hover=true]:border-wow-gold/50",
          prev: "border-wow-gold/25 bg-transparent text-wow-gold-light",
          next: "border-wow-gold/25 bg-transparent text-wow-gold-light",
          cursor:
            "border border-wow-gold/60 bg-wow-gold/20 font-semibold text-wow-gold-light",
        }}
        page={page}
        size="sm"
        total={pages}
        variant="bordered"
        onChange={onPage}
      />
    </nav>
  );
}
