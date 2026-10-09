import en from "./strings/en.json";
import fr from "./strings/fr.json";

/*
 * The languages of the tooltips. Each site locale reads:
 *  - its DBC locale slot (3.3.5 localized strings: 16 slots after the enUS column). The realms' DBCs carry enUS, frFR, deDE, esES and
 *    ruRU; an empty slot falls back to enUS;
 *  - its item_template_locale locale (names and descriptions of the items), English (item_template) when it has none;
 *  - its wordings (strings/<lang>.json, the client's GlobalStrings): English and French only (the client data is frFR), the English
 *    ones otherwise; a missing key falls back to English;
 *  - its decimal separator.
 */

export const TOOLTIP_LOCALES = [
  "en",
  "fr",
  "es",
  "de",
  "it",
  "ru",
  "pl",
  "pt",
] as const;
export type TooltipLocale = (typeof TOOLTIP_LOCALES)[number];

export const isTooltipLocale = (v: unknown): v is TooltipLocale =>
  typeof v === "string" && (TOOLTIP_LOCALES as readonly string[]).includes(v);

type Strings = Record<string, string | string[]>;

export interface LocaleConfig {
  locale: TooltipLocale;
  slot: number;
  itemLocale: string | null;
  strings: Strings;
  decimalComma: boolean;
}

const EN = en as Strings;
const FR = fr as Strings;

// 3.3.5 client locale ids (DBC string slots)
const SLOT = { enUS: 0, frFR: 2, deDE: 3, esES: 6, ruRU: 8 } as const;

export const LOCALES: Record<TooltipLocale, LocaleConfig> = {
  en: {
    locale: "en",
    slot: SLOT.enUS,
    itemLocale: null,
    strings: EN,
    decimalComma: false,
  },
  fr: {
    locale: "fr",
    slot: SLOT.frFR,
    itemLocale: "frFR",
    strings: FR,
    decimalComma: true,
  },
  de: {
    locale: "de",
    slot: SLOT.deDE,
    itemLocale: "deDE",
    strings: EN,
    decimalComma: true,
  },
  es: {
    locale: "es",
    slot: SLOT.esES,
    itemLocale: "esES",
    strings: EN,
    decimalComma: true,
  },
  ru: {
    locale: "ru",
    slot: SLOT.ruRU,
    itemLocale: "ruRU",
    strings: EN,
    decimalComma: true,
  },
  // no client data in these languages: English
  it: {
    locale: "it",
    slot: SLOT.enUS,
    itemLocale: null,
    strings: EN,
    decimalComma: false,
  },
  pl: {
    locale: "pl",
    slot: SLOT.enUS,
    itemLocale: null,
    strings: EN,
    decimalComma: false,
  },
  pt: {
    locale: "pt",
    slot: SLOT.enUS,
    itemLocale: null,
    strings: EN,
    decimalComma: false,
  },
};

// a wording of the client (GlobalStrings key), English when the language has none
export function str(lc: LocaleConfig, key: string): string {
  const v = lc.strings[key] ?? EN[key];

  return typeof v === "string" ? v : "";
}

export function strList(lc: LocaleConfig, key: string): string[] {
  const v = lc.strings[key] ?? EN[key];

  return Array.isArray(v) ? v : [];
}
