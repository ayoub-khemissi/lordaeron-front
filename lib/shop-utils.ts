import type {
  ShopItem,
  ShopItemLocalized,
  ShopSetWithItems,
  ShopSetLocalized,
  ShopSetItem,
  ShopSetItemLocalized,
} from "@/types";

export function calculateDiscountedPrice(
  price: number,
  discountPercentage: number,
): number {
  if (discountPercentage <= 0) return price;

  return Math.floor(price * (1 - discountPercentage / 100));
}

export function localizeShopItem(
  item: ShopItem,
  locale: string,
): ShopItemLocalized {
  const nameKey = `name_${locale}` as keyof ShopItem;
  const descKey = `description_${locale}` as keyof ShopItem;

  return {
    id: item.id,
    category: item.category,
    service_type: item.service_type,
    item_id: item.item_id,
    name: (item[nameKey] as string) || item.name_en,
    description: (item[descKey] as string) || item.description_en,
    price: item.price,
    discounted_price: calculateDiscountedPrice(
      item.price,
      item.discount_percentage,
    ),
    discount_percentage: item.discount_percentage,
    realm_ids: item.realm_ids,
    race_ids: item.race_ids,
    class_ids: item.class_ids,
    faction: item.faction,
    icon_url: item.icon_url,
    quality: item.quality,
    is_highlighted: item.is_highlighted,
    is_refundable: item.is_refundable,
    min_level: item.min_level,
    sort_order: item.sort_order,
  };
}

/**
 * Picks the localized name from an object with name_en, name_fr, etc.
 * Falls back to name_en if the locale name is empty.
 */
export function getLocalizedName(
  obj: object,
  locale: string,
  prefix = "name",
): string {
  const record = obj as Record<string, unknown>;
  const localized = record[`${prefix}_${locale}`] as string | undefined;

  return localized || (record[`${prefix}_en`] as string) || "";
}

export function getQualityColor(quality: number | null): string {
  switch (quality) {
    case 0:
      return "text-gray-500";
    case 1:
      return "text-gray-100";
    case 2:
      return "text-green-400";
    case 3:
      return "text-blue-400";
    case 4:
      return "text-purple-400";
    case 5:
      return "text-orange-400";
    case 6:
    case 7:
      return "text-wow-gold";
    default:
      return "text-gray-100";
  }
}

export const RACE_NAMES: Record<number, string> = {
  1: "Human",
  2: "Orc",
  3: "Dwarf",
  4: "Night Elf",
  5: "Undead",
  6: "Tauren",
  7: "Gnome",
  8: "Troll",
  10: "Blood Elf",
  11: "Draenei",
};

export const CLASS_NAMES: Record<number, string> = {
  1: "Warrior",
  2: "Paladin",
  3: "Hunter",
  4: "Rogue",
  5: "Priest",
  6: "Death Knight",
  7: "Shaman",
  8: "Mage",
  9: "Warlock",
  11: "Druid",
};

export function localizeShopSetItem(
  item: ShopSetItem,
  locale: string,
): ShopSetItemLocalized {
  const nameKey = `name_${locale}` as keyof ShopSetItem;

  return {
    id: item.id,
    item_id: item.item_id,
    name: (item[nameKey] as string) || item.name_en,
    icon_url: item.icon_url,
    quality: item.quality,
  };
}

export function localizeShopSet(
  set: ShopSetWithItems,
  locale: string,
): ShopSetLocalized {
  const nameKey = `name_${locale}` as keyof ShopSetWithItems;
  const descKey = `description_${locale}` as keyof ShopSetWithItems;

  return {
    id: set.id,
    name: (set[nameKey] as string) || set.name_en,
    description: (set[descKey] as string) || set.description_en,
    price: set.price,
    discounted_price: calculateDiscountedPrice(
      set.price,
      set.discount_percentage,
    ),
    discount_percentage: set.discount_percentage,
    class_ids: set.class_ids,
    faction: set.faction,
    icon_url: set.icon_url,
    is_highlighted: set.is_highlighted,
    min_level: set.min_level,
    sort_order: set.sort_order,
    items: set.items.map((item) => localizeShopSetItem(item, locale)),
  };
}

export const ALLIANCE_RACES = [1, 3, 4, 7, 11];
export const HORDE_RACES = [2, 5, 6, 8, 10];

export const SERVICE_TYPES = [
  { value: "xp_boost_6h", label: "XP Boost 6h" },
  { value: "xp_boost_12h", label: "XP Boost 12h" },
  { value: "xp_boost_24h", label: "XP Boost 24h" },
  { value: "xp_boost_48h", label: "XP Boost 48h" },
  { value: "rep_boost_6h", label: "Reputation Boost 6h" },
  { value: "rep_boost_12h", label: "Reputation Boost 12h" },
  { value: "rep_boost_24h", label: "Reputation Boost 24h" },
  { value: "rep_boost_48h", label: "Reputation Boost 48h" },
  { value: "name_change", label: "Name Change" },
  { value: "appearance_change", label: "Appearance Change" },
  { value: "race_change", label: "Race Change" },
  { value: "faction_change", label: "Faction Change" },
  { value: "vip", label: "VIP" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  highlighted: "\u2B50",
  services: "\u2699\uFE0F",
  bags: "\uD83C\uDF92",
  heirlooms: "\uD83D\uDDE1\uFE0F",
  transmog: "\uD83D\uDC57",
  mounts: "\uD83D\uDC0E",
  tabards: "\uD83D\uDEE1\uFE0F",
  pets: "\uD83D\uDC3E",
  toys: "\uD83C\uDFAE",
  history: "\uD83D\uDCDC",
};

export const SHOP_CATEGORIES = [
  "services",
  "bags",
  "heirlooms",
  "transmog",
  "mounts",
  "tabards",
  "pets",
  "toys",
] as const;

export const CLASS_COLORS: Record<number, string> = {
  1: "#C79C6E",
  2: "#F58CBA",
  3: "#ABD473",
  4: "#FFF569",
  5: "#FFFFFF",
  6: "#C41F3B",
  7: "#0070DE",
  8: "#69CCF0",
  9: "#9482C9",
  11: "#FF7D0A",
};

export const RESTORE_CHARACTER_COST = 50;
