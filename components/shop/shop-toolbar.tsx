"use client";

import type { ShopCategory, ShopItemKind } from "@/types";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import {
  CATEGORY_ICONS,
  DEFAULT_SORT,
  NO_FACETS,
  SHOP_CATEGORIES,
  type ShopFacets,
} from "@/lib/shop-utils";
import { useRealm } from "@/lib/realm-context";
import { OVERLAY_POPOVER } from "@/lib/overlay-motion";

export type ShopView = ShopCategory | "highlighted" | null;

const SORTS = [
  ["price_desc", "sortPriceDesc"],
  ["price_asc", "sortPriceAsc"],
  ["quality_desc", "sortQualityDesc"],
  ["quality_asc", "sortQualityAsc"],
  ["name_asc", "sortNameAsc"],
  ["name_desc", "sortNameDesc"],
  ["newest", "sortNewest"],
  ["oldest", "sortOldest"],
] as const;

/*
 * The shop's one filter bar (Ayoub, 09/10/2026: one harmonized and compact system): the search, the category and a "Filters" button
 * whose panel holds the sort, the kind (when the shown articles have several) and what to show, all as the same toggles.
 */
export function ShopToolbar({
  category,
  onCategoryChange,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  facets,
  onFacetsChange,
  entries,
  showUnavailable,
  onShowUnavailableChange,
  showSets,
  onShowSetsChange,
  showItems,
  onShowItemsChange,
}: {
  category: ShopView;
  onCategoryChange: (category: ShopView) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  facets: ShopFacets;
  onFacetsChange: (facets: ShopFacets) => void;
  // the articles of the category shown: which kinds and exclusives the panel offers
  entries: { kind?: ShopItemKind | null; exclusive?: boolean }[];
  showUnavailable: boolean;
  onShowUnavailableChange: (value: boolean) => void;
  // transmog only: its sets and its single pieces
  showSets?: boolean;
  onShowSetsChange?: (value: boolean) => void;
  showItems?: boolean;
  onShowItemsChange?: (value: boolean) => void;
}) {
  const t = useTranslations("shop");
  const realm = useRealm();
  const ice = realm.accent === "ice";
  const kinds = (["ground", "flying", "weapon", "armor"] as const).filter(
    (kind) => entries.some((e) => e.kind === kind),
  );
  const exclusives = entries.filter((e) => e.exclusive).length;
  const showExclusive = exclusives > 0 && exclusives < entries.length;
  const withSets = !!onShowSetsChange && !!onShowItemsChange;

  const active =
    Number(sortBy !== DEFAULT_SORT) +
    Number(!!facets.kind) +
    Number(facets.exclusive) +
    Number(showUnavailable) +
    Number(withSets && showSets === false) +
    Number(withSets && showItems === false);

  const chip = (on: boolean) =>
    clsx(
      "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
      on
        ? ice
          ? "border-wow-blue-ice/60 bg-wow-blue-ice/15 text-wow-blue-ice"
          : "border-wow-gold/60 bg-wow-gold/15 text-wow-gold-light"
        : "border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200",
    );
  const toggle = (on: boolean, label: string, onPress: () => void) => (
    <button className={chip(on)} type="button" onClick={onPress}>
      <span
        aria-hidden
        className={clsx(
          "flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border text-[10px] leading-none",
          on ? "border-current" : "border-white/25",
        )}
      >
        {on ? "✓" : ""}
      </span>
      {label}
    </button>
  );
  const section = (label: string, children: React.ReactNode) => (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">
        {label}
      </p>
      {children}
    </div>
  );
  const field = "glass border-wow-gold/20 hover:border-wow-gold/30 h-10";

  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        isClearable
        aria-label={t("search")}
        className="sm:flex-1"
        classNames={{ inputWrapper: field }}
        placeholder={t("searchPlaceholder")}
        startContent={
          <svg
            aria-hidden
            className="h-4 w-4 shrink-0 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        }
        value={search}
        onClear={() => onSearchChange("")}
        onValueChange={onSearchChange}
      />
      <div className="flex gap-2">
        <Select
          aria-label={t("categoryLabel")}
          className="min-w-0 flex-1 sm:w-56 sm:flex-none"
          classNames={{
            trigger: field,
            popoverContent: "bg-[#161b22] border border-wow-gold/15",
          }}
          popoverProps={OVERLAY_POPOVER}
          selectedKeys={[category ?? "all"]}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string | undefined;

            if (key) onCategoryChange(key === "all" ? null : (key as ShopView));
          }}
        >
          {[
            <SelectItem key="all">{t("allItems")}</SelectItem>,
            <SelectItem
              key="highlighted"
              textValue={t("highlights")}
            >{`${CATEGORY_ICONS.highlighted}  ${t("highlights")}`}</SelectItem>,
            ...SHOP_CATEGORIES.map((cat) => (
              <SelectItem
                key={cat}
                textValue={t(`categories.${cat}`)}
              >{`${CATEGORY_ICONS[cat]}  ${t(`categories.${cat}`)}`}</SelectItem>
            )),
          ]}
        </Select>
        <Popover {...OVERLAY_POPOVER} placement="bottom-end">
          <PopoverTrigger>
            <Button
              className={clsx(
                "glass h-10 shrink-0 border",
                active
                  ? ice
                    ? "border-wow-blue-ice/50 text-wow-blue-ice"
                    : "border-wow-gold/50 text-wow-gold-light"
                  : "border-wow-gold/20 text-gray-300",
              )}
              startContent={
                <svg
                  aria-hidden
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 5h18M6 12h12M10 19h4" />
                </svg>
              }
              variant="bordered"
            >
              {t("filters.title")}
              {active > 0 && (
                <span
                  className={clsx(
                    "ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-black",
                    ice ? "bg-wow-blue-ice" : "bg-wow-gold",
                  )}
                >
                  {active}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(25rem,calc(100vw-2rem))] border border-wow-gold/15 bg-[#161b22] p-4">
            <div className="flex w-full flex-col gap-4">
              {section(
                t("sortBy"),
                <div className="grid grid-cols-2 gap-1.5">
                  {SORTS.map(([key, label]) => (
                    <button
                      key={key}
                      className={chip(sortBy === key)}
                      type="button"
                      onClick={() => onSortChange(key)}
                    >
                      {t(label)}
                    </button>
                  ))}
                </div>,
              )}
              {kinds.length > 1 &&
                section(
                  t("filters.type"),
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      className={chip(!facets.kind)}
                      type="button"
                      onClick={() => onFacetsChange({ ...facets, kind: null })}
                    >
                      {t("facets.all")}
                    </button>
                    {kinds.map((kind) => (
                      <button
                        key={kind}
                        className={chip(facets.kind === kind)}
                        type="button"
                        onClick={() => onFacetsChange({ ...facets, kind })}
                      >
                        {t(`facets.${kind}`)}
                      </button>
                    ))}
                  </div>,
                )}
              {section(
                t("filters.show"),
                <div className="flex flex-wrap gap-1.5">
                  {withSets &&
                    toggle(!!showSets, t("filterSets"), () =>
                      onShowSetsChange!(!showSets),
                    )}
                  {withSets &&
                    toggle(!!showItems, t("filterItems"), () =>
                      onShowItemsChange!(!showItems),
                    )}
                  {showExclusive &&
                    toggle(
                      facets.exclusive,
                      t("facets.exclusive", { realm: realm.name }),
                      () =>
                        onFacetsChange({
                          ...facets,
                          exclusive: !facets.exclusive,
                        }),
                    )}
                  {toggle(showUnavailable, t("showUnavailable"), () =>
                    onShowUnavailableChange(!showUnavailable),
                  )}
                </div>,
              )}
              {active > 0 && (
                <button
                  className="self-end text-xs text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline"
                  type="button"
                  onClick={() => {
                    onSortChange(DEFAULT_SORT);
                    onFacetsChange(NO_FACETS);
                    onShowUnavailableChange(false);
                    onShowSetsChange?.(true);
                    onShowItemsChange?.(true);
                  }}
                >
                  {t("filters.reset")}
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
