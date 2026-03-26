"use client";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { useTranslations } from "next-intl";

interface CategoryFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showSets?: boolean;
  onShowSetsChange?: (value: boolean) => void;
  showItems?: boolean;
  onShowItemsChange?: (value: boolean) => void;
  showUnavailable?: boolean;
  onShowUnavailableChange?: (value: boolean) => void;
}

export function CategoryFilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  showSets,
  onShowSetsChange,
  showItems,
  onShowItemsChange,
  showUnavailable,
  onShowUnavailableChange,
}: CategoryFilterBarProps) {
  const t = useTranslations("shop");

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          isClearable
          className="flex-1"
          classNames={{
            inputWrapper: "glass border-wow-gold/20 hover:border-wow-gold/30",
          }}
          label={t("search")}
          placeholder={t("searchPlaceholder")}
          size="sm"
          value={search}
          onClear={() => onSearchChange("")}
          onValueChange={onSearchChange}
        />
        <Select
          className="w-full sm:w-48"
          classNames={{
            trigger: "glass border-wow-gold/20 hover:border-wow-gold/30",
            popoverContent: "bg-[#161b22] border border-wow-gold/15",
          }}
          label={t("sortBy")}
          selectedKeys={[sortBy]}
          size="sm"
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;

            if (key) onSortChange(key);
          }}
        >
          <SelectItem key="price_asc">{t("sortPriceAsc")}</SelectItem>
          <SelectItem key="price_desc">{t("sortPriceDesc")}</SelectItem>
          <SelectItem key="newest">{t("sortNewest")}</SelectItem>
          <SelectItem key="oldest">{t("sortOldest")}</SelectItem>
          <SelectItem key="name_asc">{t("sortNameAsc")}</SelectItem>
          <SelectItem key="name_desc">{t("sortNameDesc")}</SelectItem>
          <SelectItem key="quality_asc">{t("sortQualityAsc")}</SelectItem>
          <SelectItem key="quality_desc">{t("sortQualityDesc")}</SelectItem>
        </Select>
      </div>
      <div className="flex gap-4">
        {onShowSetsChange && onShowItemsChange && (
          <>
            <Checkbox
              classNames={{ label: "text-sm text-gray-300" }}
              isSelected={showSets}
              size="sm"
              onValueChange={onShowSetsChange}
            >
              {t("filterSets")}
            </Checkbox>
            <Checkbox
              classNames={{ label: "text-sm text-gray-300" }}
              isSelected={showItems}
              size="sm"
              onValueChange={onShowItemsChange}
            >
              {t("filterItems")}
            </Checkbox>
          </>
        )}
        {onShowUnavailableChange && (
          <Checkbox
            classNames={{ label: "text-sm text-gray-300" }}
            isSelected={showUnavailable}
            size="sm"
            onValueChange={onShowUnavailableChange}
          >
            {t("showUnavailable")}
          </Checkbox>
        )}
      </div>
    </div>
  );
}
