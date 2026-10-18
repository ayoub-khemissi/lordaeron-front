"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { useTranslations } from "next-intl";

import { ToolSelect } from "@/components/tools/tool-select";
import { ToolTabs } from "@/components/tools/tool-tabs";

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];

// HeroUI's selection keys cannot be empty: "all" ("") travels as this key
const ALL = "__all__";

/* A ranking's boards: the tools' row of HeroUI tabs (components/tools/tool-tabs.tsx) */
export const RankTabs = ToolTabs;

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
      <Tabs
        aria-label={t("allFactions")}
        classNames={{
          tabList: "border border-white/10 bg-transparent",
          cursor:
            faction === "alliance"
              ? "bg-blue-500/25"
              : faction === "horde"
                ? "bg-red-500/25"
                : "bg-white/10",
          tabContent:
            "text-sm text-gray-400 group-data-[selected=true]:text-white",
        }}
        radius="md"
        selectedKey={faction || ALL}
        size="sm"
        variant="bordered"
        onSelectionChange={(key) => onFaction(key === ALL ? "" : String(key))}
      >
        {factions.map((f) => (
          <Tab key={f.value || ALL} title={f.label} />
        ))}
      </Tabs>
      <ToolSelect
        label={t("class")}
        options={[
          { value: "", label: t("allClasses") },
          ...CLASSES.map((id) => ({
            value: String(id),
            label: tShop(`className_${id}`),
          })),
        ]}
        value={cls}
        onChange={onClass}
      />
    </div>
  );
}
