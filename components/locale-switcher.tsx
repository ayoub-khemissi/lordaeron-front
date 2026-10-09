"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";

import { OVERLAY_MOTION } from "@/lib/overlay-motion";

const locales = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");

    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <Dropdown motionProps={OVERLAY_MOTION} shouldBlockScroll={false}>
      <DropdownTrigger>
        <Button
          className="min-w-[40px] text-gray-400"
          size="sm"
          variant="light"
        >
          {currentLocale.flag}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Select language"
        onAction={(key) => switchLocale(key as string)}
      >
        {locales.map((l) => (
          <DropdownItem
            key={l.code}
            className={locale === l.code ? "text-primary" : ""}
          >
            {l.flag} {l.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
