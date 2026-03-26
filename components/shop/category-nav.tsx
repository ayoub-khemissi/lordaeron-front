"use client";

import type { ShopCategory } from "@/types";

import { Tabs, Tab } from "@heroui/tabs";
import { useTranslations } from "next-intl";

import { SHOP_CATEGORIES, CATEGORY_ICONS } from "@/lib/shop-utils";

interface CategoryNavProps {
  selectedCategory: ShopCategory | "highlighted" | "history" | null;
  onCategoryChange: (category: ShopCategory | "highlighted" | "history" | null) => void;
}

export function CategoryNav({
  selectedCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const t = useTranslations("shop");

  return (
    <div className="mb-6 overflow-x-auto">
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
          onCategoryChange(key === "all" ? null : (key as ShopCategory));
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
        <Tab
          key="history"
          title={
            <div className="flex items-center gap-1.5">
              <span>{CATEGORY_ICONS.history}</span>
              <span>{t("history")}</span>
            </div>
          }
        />
      </Tabs>
    </div>
  );
}
