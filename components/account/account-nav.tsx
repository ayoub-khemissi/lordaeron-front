"use client";

import { Tab, Tabs } from "@heroui/tabs";
import clsx from "clsx";

import {
  CharactersIcon,
  OverviewIcon,
  ReceiptIcon,
  ShieldIcon,
} from "@/components/account/account-icons";

export type AccountTab = "overview" | "characters" | "security" | "purchases";

export const ACCOUNT_TABS: AccountTab[] = [
  "overview",
  "characters",
  "security",
  "purchases",
];

const ICONS: Record<
  AccountTab,
  (p: { className?: string }) => React.JSX.Element
> = {
  overview: OverviewIcon,
  characters: CharactersIcon,
  security: ShieldIcon,
  purchases: ReceiptIcon,
};

export interface AccountNavItem {
  key: AccountTab;
  label: string;
  // a count beside it, or a warning dot (something to do there)
  count?: number;
  warning?: boolean;
}

/* The account's sections: a column on the left from a laptop's width on (sticky while the section scrolls), HeroUI's tabs across the top
   on a phone */
export function AccountNav({
  items,
  selected,
  onSelect,
  label,
}: {
  items: AccountNavItem[];
  selected: AccountTab;
  onSelect: (tab: AccountTab) => void;
  label: string;
}) {
  return (
    <>
      <nav
        aria-label={label}
        className="sticky top-24 hidden flex-col gap-1 lg:flex"
      >
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const active = item.key === selected;

          return (
            <button
              key={item.key}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                active
                  ? "bg-wow-gold/10 text-wow-gold-light shadow-[inset_2px_0_0_rgba(199,156,62,0.9)]"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-100",
              )}
              type="button"
              onClick={() => onSelect(item.key)}
            >
              <Icon
                className={clsx(
                  "h-5 w-5 shrink-0",
                  active
                    ? "text-wow-gold"
                    : "text-gray-500 group-hover:text-gray-300",
                )}
              />
              <span className="flex-1">{item.label}</span>
              <NavBadge item={item} />
            </button>
          );
        })}
      </nav>

      <div className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <Tabs
          aria-label={label}
          classNames={{
            tabList:
              "w-full gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1",
            cursor: "bg-wow-gold/15 shadow-none",
            tab: "h-9 px-3",
            tabContent:
              "text-sm text-gray-400 group-data-[selected=true]:text-wow-gold-light",
          }}
          selectedKey={selected}
          variant="solid"
          onSelectionChange={(key) => onSelect(key as AccountTab)}
        >
          {items.map((item) => {
            const Icon = ICONS[item.key];

            return (
              <Tab
                key={item.key}
                title={
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <NavBadge item={item} />
                  </span>
                }
              />
            );
          })}
        </Tabs>
      </div>
    </>
  );
}

function NavBadge({ item }: { item: AccountNavItem }) {
  if (item.warning)
    return (
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
      />
    );
  if (item.count)
    return (
      <span className="min-w-[1.5rem] rounded-full bg-white/[0.06] px-1.5 text-center text-xs text-gray-400">
        {item.count}
      </span>
    );

  return null;
}
