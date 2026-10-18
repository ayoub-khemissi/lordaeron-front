"use client";

import type { ReactNode } from "react";

import { Tab, Tabs } from "@heroui/tabs";

/* A tool's row of choices as HeroUI tabs shaped as pills, scrolling sideways on a phone (the rankings' boards, the Codex's kinds; Ayoub,
   18/10/2026: HeroUI's own controls). Values are the tabs' keys: no empty one. */
export function ToolTabs({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: string; label: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <Tabs
      aria-label={label}
      classNames={{
        base: "-mx-4 max-w-[calc(100%+2rem)] px-4 sm:mx-0 sm:max-w-full sm:px-0",
        tabList: "gap-2 bg-transparent p-0 sm:flex-wrap",
        tab: "h-8 w-auto rounded-full border border-white/10 px-4 data-[hover-unselected=true]:border-wow-gold/30 data-[selected=true]:border-wow-gold/60",
        cursor: "rounded-full bg-wow-gold/15 shadow-none",
        tabContent:
          "text-sm text-gray-300 group-data-[selected=true]:text-wow-gold-light",
      }}
      selectedKey={value}
      variant="light"
      onSelectionChange={(key) => onChange(String(key))}
    >
      {options.map((o) => (
        <Tab key={o.value} title={o.label} />
      ))}
    </Tabs>
  );
}
