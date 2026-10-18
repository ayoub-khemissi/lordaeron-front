"use client";

import type { ShopCategory, ShopItemKind } from "@/types";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
import { useTranslations } from "next-intl";
import clsx from "clsx";

import {
  DEFAULT_SORT,
  NO_FACETS,
  SHOP_CATEGORIES,
  type ShopFacets,
} from "@/lib/shop-utils";
import { useRealm } from "@/lib/realm-context";
import { CategoryIcon } from "@/components/shop/category-icon";
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
  // an on/off choice: HeroUI's Switch (Ayoub, 18/10/2026: HeroUI's own components)
  const toggle = (on: boolean, label: string, onPress: () => void) => (
    <Switch
      classNames={{
        label: "text-xs text-gray-300",
        wrapper: ice
          ? "group-data-[selected=true]:bg-wow-blue-ice/70"
          : "group-data-[selected=true]:bg-wow-gold/70",
      }}
      isSelected={on}
      size="sm"
      onValueChange={onPress}
    >
      {label}
    </Switch>
  );
  // one choice among a few, its chip pressed
  const choice = (
    on: boolean,
    label: string,
    onPress: () => void,
    key?: string,
  ) => (
    <Button
      key={key}
      aria-pressed={on}
      className={clsx(chip(on), "h-auto min-w-0 bg-transparent")}
      size="sm"
      variant="bordered"
      onPress={onPress}
    >
      {label}
    </Button>
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

  // the filters narrowing the list, shown under the bar with their cross (Ayoub, 18/10/2026: an exclusives filter left on looked like a
  // shop with two items)
  const narrowing = [
    ...(facets.kind
      ? [
          {
            key: "kind",
            label: t(`facets.${facets.kind}`),
            clear: () => onFacetsChange({ ...facets, kind: null }),
          },
        ]
      : []),
    ...(facets.exclusive
      ? [
          {
            key: "exclusive",
            label: t("facets.exclusive", { realm: realm.name }),
            clear: () => onFacetsChange({ ...facets, exclusive: false }),
          },
        ]
      : []),
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            // the chosen category with its icon, as in the list (Ayoub, 18/10/2026)
            renderValue={(items) =>
              items.map((item) => (
                <span key={item.key} className="flex items-center gap-2">
                  <CategoryIcon
                    category={
                      String(item.key) as Parameters<
                        typeof CategoryIcon
                      >[0]["category"]
                    }
                    size={20}
                  />
                  {item.textValue}
                </span>
              ))
            }
            selectedKeys={[category ?? "all"]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0] as string | undefined;

              if (key)
                onCategoryChange(key === "all" ? null : (key as ShopView));
            }}
          >
            {[
              <SelectItem key="all" textValue={t("allItems")}>
                <span className="flex items-center gap-2">
                  <CategoryIcon category="all" size={22} />
                  {t("allItems")}
                </span>
              </SelectItem>,
              <SelectItem key="highlighted" textValue={t("highlights")}>
                <span className="flex items-center gap-2">
                  <CategoryIcon category="highlighted" size={22} />
                  {t("highlights")}
                </span>
              </SelectItem>,
              ...SHOP_CATEGORIES.map((cat) => (
                <SelectItem key={cat} textValue={t(`categories.${cat}`)}>
                  <span className="flex items-center gap-2">
                    <CategoryIcon category={cat} size={22} />
                    {t(`categories.${cat}`)}
                  </span>
                </SelectItem>
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
                    {SORTS.map(([key, label]) =>
                      choice(
                        sortBy === key,
                        t(label),
                        () => onSortChange(key),
                        key,
                      ),
                    )}
                  </div>,
                )}
                {kinds.length > 1 &&
                  section(
                    t("filters.type"),
                    <div className="flex flex-wrap gap-1.5">
                      {choice(!facets.kind, t("facets.all"), () =>
                        onFacetsChange({ ...facets, kind: null }),
                      )}
                      {kinds.map((kind) =>
                        choice(
                          facets.kind === kind,
                          t(`facets.${kind}`),
                          () => onFacetsChange({ ...facets, kind }),
                          kind,
                        ),
                      )}
                    </div>,
                  )}
                {section(
                  t("filters.show"),
                  <div className="flex flex-col gap-2">
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
                  <Button
                    className="h-auto min-w-0 self-end px-1 text-xs text-gray-400 data-[hover=true]:bg-transparent data-[hover=true]:text-gray-200"
                    size="sm"
                    variant="light"
                    onPress={() => {
                      onSortChange(DEFAULT_SORT);
                      onFacetsChange(NO_FACETS);
                      onShowUnavailableChange(false);
                      onShowSetsChange?.(true);
                      onShowItemsChange?.(true);
                    }}
                  >
                    {t("filters.reset")}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {narrowing.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {narrowing.map((f) => (
            <Chip
              key={f.key}
              className={clsx(
                "border",
                ice
                  ? "border-wow-blue-ice/40 bg-wow-blue-ice/10 text-wow-blue-ice"
                  : "border-wow-gold/40 bg-wow-gold/10 text-wow-gold-light",
              )}
              size="sm"
              variant="flat"
              onClose={f.clear}
            >
              {f.label}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
