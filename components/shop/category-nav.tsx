"use client";

import type { ShopCategory } from "@/types";

import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { useTranslations } from "next-intl";

import { SHOP_CATEGORIES, CATEGORY_ICONS } from "@/lib/shop-utils";

interface CategoryNavProps {
  selectedCategory: ShopCategory | "highlighted" | null;
  onCategoryChange: (category: ShopCategory | "highlighted" | null) => void;
}

const ALL_KEYS = ["all", "highlighted", ...SHOP_CATEGORIES] as const;

export function CategoryNav({
  selectedCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const t = useTranslations("shop");

  const getLabel = (key: string) => {
    if (key === "all") return t("allItems");
    if (key === "highlighted") return t("highlights");
    return t(`categories.${key}`);
  };

  return (
    <>
      {/* Desktop — tabs */}
      <div className="mb-6 overflow-x-auto hidden sm:block">
        <Tabs
          classNames={{
            tabList:
              "gap-1 w-full relative rounded-none p-0 border-b border-wow-gold/10",
            cursor: "w-full bg-wow-gold",
            tab: "max-w-fit px-2 h-9",
            tabContent: "group-data-[selected=true]:text-wow-gold text-gray-400 text-xs",
          }}
          selectedKey={selectedCategory || "all"}
          variant="underlined"
          onSelectionChange={(key) => {
            onCategoryChange(key === "all" ? null : (key as ShopCategory | "highlighted"));
          }}
        >
          <Tab key="all" title={t("allItems")} />
          <Tab
            key="highlighted"
            title={
              <div className="flex items-center gap-1.5">
                <span>{CATEGORY_ICONS.highlighted}</span>
                <span>{t("highlights")}</span>
              </div>
            }
          />
          {SHOP_CATEGORIES.map((cat) => (
            <Tab
              key={cat}
              title={
                <div className="flex items-center gap-1.5">
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span>{t(`categories.${cat}`)}</span>
                </div>
              }
            />
          ))}
        </Tabs>
      </div>

      {/* Mobile — select */}
      <div className="mb-6 sm:hidden">
        <Select
          className="w-full"
          classNames={{
            trigger: "glass border-wow-gold/20 hover:border-wow-gold/40",
            popoverContent: "bg-[#161b22] border border-wow-gold/15",
          }}
          aria-label="Category"
          selectedKeys={[selectedCategory || "all"]}
          size="sm"
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            onCategoryChange(key === "all" ? null : (key as ShopCategory | "highlighted"));
          }}
        >
          {ALL_KEYS.map((key) => (
            <SelectItem key={key} textValue={getLabel(key)}>
              <div className="flex items-center gap-2">
                {key !== "all" && <span>{CATEGORY_ICONS[key]}</span>}
                <span>{getLabel(key)}</span>
              </div>
            </SelectItem>
          ))}
        </Select>
      </div>
    </>
  );
}
