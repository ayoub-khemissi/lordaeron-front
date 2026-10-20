/**
 * Generate shop_items SQL from the world database (item_template + item_template_locale).
 *
 * Usage:
 *   npx tsx sql/generators/generate-shop-items.ts
 *
 * Env vars (fallbacks to defaults):
 *   DB_WORLD_HOST, DB_WORLD_PORT, DB_WORLD_USER, DB_WORLD_PASSWORD, DB_WORLD_NAME
 *
 * What it does:
 *   1. Queries item_template by class/subclass for each shop category
 *   2. Joins item_template_locale for fr, es, de (it = fallback EN, not in 3.3.5a DBC)
 *   3. Fetches icon names from Wowhead tooltip API (with rate limit)
 *   4. Outputs INSERT SQL with localized names + icon URLs
 *
 * Pricing: 100 Soul Shards ≈ 1€ — adjusted per category & item quality.
 */

import fs from "fs";
import path from "path";

import mysql from "mysql2/promise";

// ── Config ──────────────────────────────────────────────────────────────────

const WORLD_DB = {
  host: process.env.DB_WORLD_HOST || "localhost",
  port: parseInt(process.env.DB_WORLD_PORT || "3306"),
  user: process.env.DB_WORLD_USER || "root",
  password: process.env.DB_WORLD_PASSWORD || "",
  database: process.env.DB_WORLD_NAME || "world",
};

// Wowhead WotLK tooltip API
const WOWHEAD_TOOLTIP_URL = "https://nether.wowhead.com/wotlk/tooltip/item/";
const ICON_CDN = "https://wow.zamimg.com/images/wow/icons/large/";
const FETCH_DELAY_MS = 150; // Rate limit: ~6 req/s

// ── Types ───────────────────────────────────────────────────────────────────

interface ItemRow {
  entry: number;
  name: string;
  class: number;
  subclass: number;
  Quality: number;
  InventoryType: number;
  RequiredLevel: number;
  ItemLevel: number;
  ContainerSlots: number;
  AllowableClass: number;
  AllowableRace: number;
  // locale names
  name_fr?: string;
  name_es?: string;
  name_de?: string;
}

type ShopCategory =
  | "bags"
  | "heirlooms"
  | "transmog"
  | "mounts"
  | "tabards"
  | "pets"
  | "toys";

interface ShopEntry {
  category: ShopCategory;
  entry: number;
  name_en: string;
  name_fr: string;
  name_es: string;
  name_de: string;
  name_it: string; // fallback to EN (no itIT in 3.3.5a)
  description_en: string;
  description_fr: string;
  description_es: string;
  description_de: string;
  description_it: string;
  price: number;
  discount_percentage: number;
  class_ids: number[] | null;
  faction: "alliance" | "horde" | "both";
  is_highlighted: boolean;
  is_refundable: boolean;
  min_level: number;
  sort_order: number;
  icon_url: string | null;
  quality: number | null;
}

// ── Category query definitions ──────────────────────────────────────────────

interface CategoryDef {
  category: ShopCategory;
  query: string;
  params?: (string | number)[];
  priceFormula: (item: ItemRow) => number;
  descriptionEn: (item: ItemRow) => string;
  descriptionFr: (item: ItemRow) => string;
  descriptionEs: (item: ItemRow) => string;
  descriptionDe: (item: ItemRow) => string;
  descriptionIt: (item: ItemRow) => string;
  highlighted?: (item: ItemRow) => boolean;
  refundable: boolean;
  sortBase: number;
  limit?: number;
}

const CATEGORIES: CategoryDef[] = [
  // ── BAGS ──
  {
    category: "bags",
    query: `
      SELECT entry, name, class, subclass, Quality, InventoryType,
             RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
      FROM item_template
      WHERE class = 1 AND subclass = 0 AND Quality >= 2 AND ContainerSlots >= 16
      ORDER BY ContainerSlots DESC, Quality DESC
    `,
    priceFormula: (item) => {
      // Price based on slot count: ~10 shards per slot above 14
      const base = (item.ContainerSlots - 14) * 15;

      return Math.max(50, Math.round(base / 10) * 10);
    },
    descriptionEn: (item) => `${item.ContainerSlots}-slot bag`,
    descriptionFr: (item) => `Sac ${item.ContainerSlots} emplacements`,
    descriptionEs: (item) => `Bolsa de ${item.ContainerSlots} casillas`,
    descriptionDe: (item) => `${item.ContainerSlots}-Platz-Tasche`,
    descriptionIt: (item) => `Borsa da ${item.ContainerSlots} slot`,
    highlighted: (item) => item.ContainerSlots >= 22,
    refundable: true,
    sortBase: 10,
    limit: 8,
  },

  // ── HEIRLOOMS ──
  {
    category: "heirlooms",
    query: `
      SELECT entry, name, class, subclass, Quality, InventoryType,
             RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
      FROM item_template
      WHERE Quality = 7 AND class IN (2, 4) AND InventoryType <> 0
        AND entry NOT IN (38691, 44090) -- Ancestral Claymore, Test Mail Shoulder 2: never in the game
      ORDER BY class, subclass, InventoryType, name
    `,
    priceFormula: (item) => {
      // Weapons: 250-300, Armor: 200, Trinkets: 180
      if (item.class === 2)
        return item.subclass === 1 ||
          item.subclass === 5 ||
          item.subclass === 6 ||
          item.subclass === 8 ||
          item.subclass === 10
          ? 300
          : 250; // 2H vs 1H
      if (item.class === 4 && item.InventoryType === 12) return 180; // trinket

      return 200; // shoulders/chest
    },
    descriptionEn: (item) => {
      const slotNames: Record<number, string> = {
        1: "Head",
        3: "Shoulder",
        5: "Chest",
        12: "Trinket",
        13: "One-Hand",
        14: "Shield",
        15: "Ranged",
        17: "Two-Hand",
        21: "Main Hand",
        22: "Off Hand",
        23: "Held In Off-hand",
        25: "Thrown",
        26: "Ranged",
      };
      const slot = slotNames[item.InventoryType] || "";

      return `Heirloom ${slot} — scales to 80`.trim();
    },
    descriptionFr: (item) => {
      const slotNames: Record<number, string> = {
        1: "Tête",
        3: "Épaules",
        5: "Torse",
        12: "Bijou",
        13: "Une main",
        15: "À distance",
        17: "Deux mains",
        21: "Main droite",
        26: "À distance",
      };
      const slot = slotNames[item.InventoryType] || "";

      return `Héritage ${slot} — évolue jusqu'à 80`.trim();
    },
    descriptionEs: (item) => {
      const slotNames: Record<number, string> = {
        1: "Cabeza",
        3: "Hombros",
        5: "Pecho",
        12: "Abalorio",
        13: "Una mano",
        15: "A distancia",
        17: "Dos manos",
        21: "Mano derecha",
        26: "A distancia",
      };
      const slot = slotNames[item.InventoryType] || "";

      return `Reliquia ${slot} — escala hasta 80`.trim();
    },
    descriptionDe: (item) => {
      const slotNames: Record<number, string> = {
        1: "Kopf",
        3: "Schultern",
        5: "Brust",
        12: "Schmuck",
        13: "Einhand",
        15: "Distanz",
        17: "Zweihand",
        21: "Waffenhand",
        26: "Distanz",
      };
      const slot = slotNames[item.InventoryType] || "";

      return `Erbstück ${slot} — skaliert bis 80`.trim();
    },
    descriptionIt: (item) => {
      const slotNames: Record<number, string> = {
        1: "Testa",
        3: "Spalle",
        5: "Petto",
        12: "Monile",
        13: "Una mano",
        15: "A distanza",
        17: "Due mani",
        21: "Mano principale",
        26: "A distanza",
      };
      const slot = slotNames[item.InventoryType] || "";

      return `Cimelio ${slot} — scala fino a 80`.trim();
    },
    refundable: true,
    sortBase: 100,
  },

  // ── MOUNTS ──
  {
    category: "mounts",
    query: `
      SELECT entry, name, class, subclass, Quality, InventoryType,
             RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
      FROM item_template
      WHERE class = 15 AND subclass = 5 AND Quality >= 3
      ORDER BY Quality DESC, RequiredLevel DESC, name
    `,
    priceFormula: (item) => {
      if (item.Quality === 5) return 5000; // Legendary
      if (item.Quality === 4) return 2000; // Epic

      return 800; // Rare
    },
    descriptionEn: () => "Mount",
    descriptionFr: () => "Monture",
    descriptionEs: () => "Montura",
    descriptionDe: () => "Reittier",
    descriptionIt: () => "Cavalcatura",
    highlighted: (item) => item.Quality >= 4,
    refundable: true,
    sortBase: 500,
    limit: 20,
  },

  // ── TABARDS ──
  {
    category: "tabards",
    query: `
      SELECT entry, name, class, subclass, Quality, InventoryType,
             RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
      FROM item_template
      WHERE class = 4 AND InventoryType = 19 AND Quality >= 1
      ORDER BY Quality DESC, name
    `,
    priceFormula: (item) => {
      if (item.Quality >= 4) return 150;
      if (item.Quality >= 3) return 100;

      return 80;
    },
    descriptionEn: () => "Cosmetic tabard",
    descriptionFr: () => "Tabard cosmétique",
    descriptionEs: () => "Tabardo cosmético",
    descriptionDe: () => "Kosmetischer Wappenrock",
    descriptionIt: () => "Tabardo cosmetico",
    refundable: true,
    sortBase: 600,
    limit: 15,
  },

  // ── PETS ──
  {
    category: "pets",
    query: `
      SELECT entry, name, class, subclass, Quality, InventoryType,
             RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
      FROM item_template
      WHERE class = 15 AND subclass = 2 AND Quality >= 1
      ORDER BY Quality DESC, name
    `,
    priceFormula: (item) => {
      if (item.Quality >= 4) return 500;
      if (item.Quality >= 3) return 300;

      return 100;
    },
    descriptionEn: () => "Companion pet",
    descriptionFr: () => "Familier",
    descriptionEs: () => "Mascota de compañía",
    descriptionDe: () => "Begleiter",
    descriptionIt: () => "Animale da compagnia",
    highlighted: (item) => item.Quality >= 4,
    refundable: true,
    sortBase: 700,
    limit: 20,
  },

  // ── TOYS ──
  // Toys don't have a clean class/subclass in 3.3.5a.
  // We use a curated list of known fun items.
  {
    category: "toys",
    query: `
      SELECT entry, name, class, subclass, Quality, InventoryType,
             RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
      FROM item_template
      WHERE entry IN (
        1973,   -- Orb of Deception
        35275,  -- Orb of the Sin'dorei
        44606,  -- Toy Train Set
        38301,  -- D.I.S.C.O.
        38578,  -- The Flag of Ownership
        43499,  -- Iron Boot Flask
        44430,  -- Titanium Seal of Dalaran
        33927,  -- Brewfest Pony Keg
        32542,  -- Picnic Basket
        34480,  -- Romantic Picnic Basket
        44481,  -- Grindstone of the Bored
        45014,  -- Flame Leviathan's Ladder (nah)
        36862,  -- Bold Ornamental Ruby (nah)
        44599,  -- Worn Troll Dice
        36863,  -- Decahedral Dwarven Dice
        33223,  -- Fishing Chair
        44601   -- Heavy Copper Racer
      )
      ORDER BY Quality DESC, name
    `,
    priceFormula: (item) => {
      if (item.Quality >= 4) return 250;
      if (item.Quality >= 3) return 150;

      return 100;
    },
    descriptionEn: () => "Fun item",
    descriptionFr: () => "Objet amusant",
    descriptionEs: () => "Objeto divertido",
    descriptionDe: () => "Spaßgegenstand",
    descriptionIt: () => "Oggetto divertente",
    refundable: true,
    sortBase: 800,
    limit: 15,
  },
];

// ── Transmog: curated entry list (T3 sets + legendaries) ────────────────────

// ── Transmog description translation helpers ─────────────────────────────────

type Locale5 = "en" | "fr" | "es" | "de" | "it";

const TRANSMOG_CLASS_NAMES: Record<Locale5, Record<string, string>> = {
  en: {
    Warrior: "Warrior",
    Mage: "Mage",
    Rogue: "Rogue",
    Druid: "Druid",
    Paladin: "Paladin",
    Warlock: "Warlock",
    Hunter: "Hunter",
    Priest: "Priest",
    Shaman: "Shaman",
  },
  fr: {
    Warrior: "Guerrier",
    Mage: "Mage",
    Rogue: "Voleur",
    Druid: "Druide",
    Paladin: "Paladin",
    Warlock: "Démoniste",
    Hunter: "Chasseur",
    Priest: "Prêtre",
    Shaman: "Chaman",
  },
  es: {
    Warrior: "Guerrero",
    Mage: "Mago",
    Rogue: "Pícaro",
    Druid: "Druida",
    Paladin: "Paladín",
    Warlock: "Brujo",
    Hunter: "Cazador",
    Priest: "Sacerdote",
    Shaman: "Chamán",
  },
  de: {
    Warrior: "Krieger",
    Mage: "Magier",
    Rogue: "Schurke",
    Druid: "Druide",
    Paladin: "Paladin",
    Warlock: "Hexenmeister",
    Hunter: "Jäger",
    Priest: "Priester",
    Shaman: "Schamane",
  },
  it: {
    Warrior: "Guerriero",
    Mage: "Mago",
    Rogue: "Ladro",
    Druid: "Druido",
    Paladin: "Paladino",
    Warlock: "Stregone",
    Hunter: "Cacciatore",
    Priest: "Sacerdote",
    Shaman: "Sciamano",
  },
};

const TRANSMOG_SLOT_NAMES: Record<Locale5, Record<string, string>> = {
  en: {
    Head: "Head",
    Chest: "Chest",
    Legs: "Legs",
    Shoulders: "Shoulders",
    Hands: "Hands",
  },
  fr: {
    Head: "Casque",
    Chest: "Plastron",
    Legs: "Jambières",
    Shoulders: "Épaulières",
    Hands: "Gants",
  },
  es: {
    Head: "Cabeza",
    Chest: "Pecho",
    Legs: "Piernas",
    Shoulders: "Hombros",
    Hands: "Manos",
  },
  de: {
    Head: "Kopf",
    Chest: "Brust",
    Legs: "Beine",
    Shoulders: "Schultern",
    Hands: "Hände",
  },
  it: {
    Head: "Testa",
    Chest: "Petto",
    Legs: "Gambe",
    Shoulders: "Spalle",
    Hands: "Mani",
  },
};

/** Translate a transmog description key like "t3:Warrior:Head" into localized text */
function transmogDesc(key: string, locale: Locale5): string {
  if (key.startsWith("t3:")) {
    const [, className, slot] = key.split(":");
    const cls = TRANSMOG_CLASS_NAMES[locale][className] || className;
    const sl = TRANSMOG_SLOT_NAMES[locale][slot] || slot;

    return `${cls} T3 ${sl} — Naxx 40`;
  }
  // Legendary / special items — keyed by English description
  const legendaryMap: Record<string, Record<Locale5, string>> = {
    "Legendary 1H Sword": {
      en: "Legendary 1H Sword",
      fr: "Épée 1M Légendaire",
      es: "Espada 1M legendaria",
      de: "Legendäres 1H-Schwert",
      it: "Spada 1M leggendaria",
    },
    "Legendary 2H Mace": {
      en: "Legendary 2H Mace",
      fr: "Masse 2M Légendaire",
      es: "Maza 2M legendaria",
      de: "Legendäre 2H-Keule",
      it: "Mazza 2M leggendaria",
    },
    "Legendary Staff": {
      en: "Legendary Staff",
      fr: "Bâton Légendaire",
      es: "Bastón legendario",
      de: "Legendärer Stab",
      it: "Bastone leggendario",
    },
    "Warglaive (MH)": {
      en: "Illidan's Warglaive (MH)",
      fr: "Glaive d'Illidan (Main droite)",
      es: "Guja de guerra de Illidan (Mano derecha)",
      de: "Illidans Kriegsgleve (Waffenhand)",
      it: "Lama da guerra di Illidan (Mano principale)",
    },
    "Warglaive (OH)": {
      en: "Illidan's Warglaive (OH)",
      fr: "Glaive d'Illidan (Main gauche)",
      es: "Guja de guerra de Illidan (Mano izquierda)",
      de: "Illidans Kriegsgleve (Schildhand)",
      it: "Lama da guerra di Illidan (Mano secondaria)",
    },
  };

  return legendaryMap[key]?.[locale] || key;
}

// ── Transmog: curated entry list (T3 sets + legendaries) ────────────────────

const TRANSMOG_ENTRIES: {
  entry: number;
  descKey: string; // key for transmogDesc()
  price: number;
  classIds: number[] | null;
  highlighted: boolean;
  minLevel: number;
}[] = [
  // Legendaries (Vanilla: min_level 60)
  {
    entry: 19019,
    descKey: "Legendary 1H Sword",
    price: 2000,
    classIds: null,
    highlighted: true,
    minLevel: 60,
  },
  {
    entry: 17182,
    descKey: "Legendary 2H Mace",
    price: 2000,
    classIds: null,
    highlighted: true,
    minLevel: 60,
  },
  {
    entry: 22589,
    descKey: "Legendary Staff",
    price: 2500,
    classIds: null,
    highlighted: true,
    minLevel: 60,
  },
  // Warglaives (TBC: min_level 70)
  {
    entry: 32837,
    descKey: "Warglaive (MH)",
    price: 1500,
    classIds: null,
    highlighted: false,
    minLevel: 70,
  },
  {
    entry: 32838,
    descKey: "Warglaive (OH)",
    price: 1500,
    classIds: null,
    highlighted: false,
    minLevel: 70,
  },
  // T3 Warrior (Vanilla: min_level 60)
  {
    entry: 22416,
    descKey: "t3:Warrior:Head",
    price: 500,
    classIds: [1],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22418,
    descKey: "t3:Warrior:Chest",
    price: 500,
    classIds: [1],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22419,
    descKey: "t3:Warrior:Legs",
    price: 500,
    classIds: [1],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22420,
    descKey: "t3:Warrior:Shoulders",
    price: 500,
    classIds: [1],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22421,
    descKey: "t3:Warrior:Hands",
    price: 400,
    classIds: [1],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Mage (Vanilla: min_level 60)
  {
    entry: 22496,
    descKey: "t3:Mage:Chest",
    price: 500,
    classIds: [8],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22497,
    descKey: "t3:Mage:Head",
    price: 500,
    classIds: [8],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22498,
    descKey: "t3:Mage:Legs",
    price: 500,
    classIds: [8],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22499,
    descKey: "t3:Mage:Shoulders",
    price: 500,
    classIds: [8],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22500,
    descKey: "t3:Mage:Hands",
    price: 400,
    classIds: [8],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Rogue (Vanilla: min_level 60)
  {
    entry: 22476,
    descKey: "t3:Rogue:Chest",
    price: 500,
    classIds: [4],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22477,
    descKey: "t3:Rogue:Head",
    price: 500,
    classIds: [4],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22478,
    descKey: "t3:Rogue:Legs",
    price: 500,
    classIds: [4],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22479,
    descKey: "t3:Rogue:Shoulders",
    price: 500,
    classIds: [4],
    highlighted: false,
    minLevel: 60,
  },
  {
    entry: 22480,
    descKey: "t3:Rogue:Hands",
    price: 400,
    classIds: [4],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Druid (Vanilla: min_level 60)
  {
    entry: 22512,
    descKey: "t3:Druid:Chest",
    price: 500,
    classIds: [11],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Paladin (Vanilla: min_level 60)
  {
    entry: 22425,
    descKey: "t3:Paladin:Chest",
    price: 500,
    classIds: [2],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Warlock (Vanilla: min_level 60)
  {
    entry: 22464,
    descKey: "t3:Warlock:Chest",
    price: 500,
    classIds: [9],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Hunter (Vanilla: min_level 60)
  {
    entry: 22504,
    descKey: "t3:Hunter:Chest",
    price: 500,
    classIds: [3],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Priest (Vanilla: min_level 60)
  {
    entry: 22515,
    descKey: "t3:Priest:Chest",
    price: 500,
    classIds: [5],
    highlighted: false,
    minLevel: 60,
  },
  // T3 Shaman (Vanilla: min_level 60)
  {
    entry: 22488,
    descKey: "t3:Shaman:Chest",
    price: 500,
    classIds: [7],
    highlighted: false,
    minLevel: 60,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const iconCache = new Map<number, string | null>();

async function fetchIconName(entry: number): Promise<string | null> {
  if (iconCache.has(entry)) return iconCache.get(entry)!;

  try {
    const res = await fetch(`${WOWHEAD_TOOLTIP_URL}${entry}`, {
      headers: { "User-Agent": "Lordaeron-Shop-Generator/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      iconCache.set(entry, null);

      return null;
    }

    const data = await res.json();
    const icon: string | undefined = data.icon;

    if (icon) {
      iconCache.set(entry, icon);

      return icon;
    }
  } catch {
    // Silently fail — icon will be NULL
  }

  iconCache.set(entry, null);

  return null;
}

function escSql(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function factionFromRaceMask(mask: number): "alliance" | "horde" | "both" {
  if (mask === -1 || mask === 0) return "both";
  // Alliance race bits: Human(1), Dwarf(4), NightElf(8), Gnome(64), Draenei(1024) = 1101
  // Horde race bits: Orc(2), Undead(16), Tauren(32), Troll(128), BloodElf(512) = 690
  const allianceMask = 1 | 4 | 8 | 64 | 1024;
  const hordeMask = 2 | 16 | 32 | 128 | 512;

  const hasAlliance = (mask & allianceMask) !== 0;
  const hasHorde = (mask & hordeMask) !== 0;

  if (hasAlliance && hasHorde) return "both";
  if (hasAlliance) return "alliance";
  if (hasHorde) return "horde";

  return "both";
}

function classIdsFromMask(mask: number): number[] | null {
  if (mask === -1 || mask === 0) return null;
  const classes: number[] = [];
  // Class bits: 1=Warrior(1), 2=Paladin(2), 3=Hunter(4), 4=Rogue(8), 5=Priest(16),
  // 6=DK(32), 7=Shaman(64), 8=Mage(128), 9=Warlock(256), 11=Druid(1024)
  const classMap: Record<number, number> = {
    1: 1,
    2: 2,
    4: 3,
    8: 4,
    16: 5,
    32: 6,
    64: 7,
    128: 8,
    256: 9,
    1024: 11,
  };

  for (const [bit, classId] of Object.entries(classMap)) {
    if (mask & parseInt(bit)) classes.push(classId);
  }

  return classes.length > 0 && classes.length < 10 ? classes : null;
}

// ── Main ────────────────────────────────────────────────────────────────────

const OUTPUT_FILE = path.join(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
  "output",
  "shop-items.sql",
);

async function main() {
  const pool = mysql.createPool({
    ...WORLD_DB,
    waitForConnections: true,
    connectionLimit: 5,
  });

  const lines: string[] = [];
  const out = (line = "") => lines.push(line);

  out(
    "-- =============================================================================",
  );
  out("-- Shop Items Seed — Auto-generated from item_template");
  out(`-- Generated: ${new Date().toISOString()}`);
  out("-- Database: lordaeron_website");
  out("-- Pricing: 100 Soul Shards = 1 EUR");
  out(
    "-- =============================================================================",
  );
  out();
  out("SET FOREIGN_KEY_CHECKS = 0;");
  out("DELETE FROM shop_items WHERE category != 'services';");
  out("SET FOREIGN_KEY_CHECKS = 1;");
  out();

  const allEntries: ShopEntry[] = [];

  // ── Process auto-queried categories ──

  for (const def of CATEGORIES) {
    process.stderr.write(`\n[${def.category}] Querying item_template...\n`);

    const [rows] = await pool.execute<mysql.RowDataPacket[]>(
      def.query,
      def.params,
    );
    let items = rows as ItemRow[];

    if (def.limit && items.length > def.limit) {
      items = items.slice(0, def.limit);
    }

    process.stderr.write(`  Found ${items.length} items\n`);

    // Fetch locale names
    if (items.length > 0) {
      const entries = items.map((i) => i.entry);
      const placeholders = entries.map(() => "?").join(",");
      const [localeRows] = await pool.execute<mysql.RowDataPacket[]>(
        `SELECT ID as entry, locale, Name
         FROM item_template_locale
         WHERE ID IN (${placeholders}) AND locale IN ('frFR','esES','deDE')`,
        entries,
      );

      // Build locale map
      const localeMap = new Map<string, string>();

      for (const row of localeRows as {
        entry: number;
        locale: string;
        Name: string;
      }[]) {
        localeMap.set(`${row.entry}_${row.locale}`, row.Name || "");
      }

      for (const item of items) {
        item.name_fr = localeMap.get(`${item.entry}_frFR`) || "";
        item.name_es = localeMap.get(`${item.entry}_esES`) || "";
        item.name_de = localeMap.get(`${item.entry}_deDE`) || "";
      }
    }

    // Fetch icons from wowhead
    for (const item of items) {
      process.stderr.write(
        `  Fetching icon for [${item.entry}] ${item.name}...`,
      );
      const icon = await fetchIconName(item.entry);
      const iconUrl = icon ? `${ICON_CDN}${icon}.jpg` : null;

      process.stderr.write(icon ? ` ${icon}\n` : " (none)\n");

      const faction = factionFromRaceMask(item.AllowableRace);
      const classIds = classIdsFromMask(item.AllowableClass);

      allEntries.push({
        category: def.category,
        entry: item.entry,
        name_en: item.name,
        name_fr: item.name_fr || "",
        name_es: item.name_es || "",
        name_de: item.name_de || "",
        name_it: "", // No itIT in 3.3.5a — fallback to EN
        description_en: def.descriptionEn(item),
        description_fr: def.descriptionFr(item),
        description_es: def.descriptionEs(item),
        description_de: def.descriptionDe(item),
        description_it: def.descriptionIt(item),
        price: def.priceFormula(item),
        discount_percentage: 0,
        class_ids: classIds,
        faction,
        is_highlighted: def.highlighted ? def.highlighted(item) : false,
        is_refundable: def.refundable,
        min_level: 0,
        sort_order:
          def.sortBase +
          allEntries.filter((e) => e.category === def.category).length * 10,
        icon_url: iconUrl,
        quality: item.Quality,
      });

      await sleep(FETCH_DELAY_MS);
    }
  }

  // ── Process transmog (curated list) ──

  process.stderr.write("\n[transmog] Querying curated entries...\n");

  const transmogEntries = TRANSMOG_ENTRIES.map((t) => t.entry);

  if (transmogEntries.length > 0) {
    const placeholders = transmogEntries.map(() => "?").join(",");

    const [tmRows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT entry, name, class, subclass, Quality, InventoryType,
              RequiredLevel, ItemLevel, ContainerSlots, AllowableClass, AllowableRace
       FROM item_template
       WHERE entry IN (${placeholders})`,
      transmogEntries,
    );

    const tmItems = new Map<number, ItemRow>();

    for (const row of tmRows as ItemRow[]) {
      tmItems.set(row.entry, row);
    }

    // Fetch locale names
    const [tmLocaleRows] = await pool.execute<mysql.RowDataPacket[]>(
      `SELECT ID as entry, locale, Name
       FROM item_template_locale
       WHERE ID IN (${placeholders}) AND locale IN ('frFR','esES','deDE')`,
      transmogEntries,
    );

    const tmLocaleMap = new Map<string, string>();

    for (const row of tmLocaleRows as {
      entry: number;
      locale: string;
      Name: string;
    }[]) {
      tmLocaleMap.set(`${row.entry}_${row.locale}`, row.Name || "");
    }

    let sortIdx = 0;

    for (const def of TRANSMOG_ENTRIES) {
      const item = tmItems.get(def.entry);

      if (!item) {
        process.stderr.write(
          `  [SKIP] Entry ${def.entry} not found in item_template\n`,
        );
        continue;
      }

      process.stderr.write(
        `  Fetching icon for [${def.entry}] ${item.name}...`,
      );
      const icon = await fetchIconName(def.entry);
      const iconUrl = icon ? `${ICON_CDN}${icon}.jpg` : null;

      process.stderr.write(icon ? ` ${icon}\n` : " (none)\n");

      allEntries.push({
        category: "transmog",
        entry: def.entry,
        name_en: item.name,
        name_fr: tmLocaleMap.get(`${def.entry}_frFR`) || "",
        name_es: tmLocaleMap.get(`${def.entry}_esES`) || "",
        name_de: tmLocaleMap.get(`${def.entry}_deDE`) || "",
        name_it: "",
        description_en: transmogDesc(def.descKey, "en"),
        description_fr: transmogDesc(def.descKey, "fr"),
        description_es: transmogDesc(def.descKey, "es"),
        description_de: transmogDesc(def.descKey, "de"),
        description_it: transmogDesc(def.descKey, "it"),
        price: def.price,
        discount_percentage: 0,
        class_ids: def.classIds,
        faction: "both",
        is_highlighted: def.highlighted,
        is_refundable: false, // transmog = non-refundable (high value cosmetics)
        min_level: def.minLevel,
        sort_order: 300 + sortIdx * 10,
        icon_url: iconUrl,
        quality: item.Quality,
      });

      sortIdx++;
      await sleep(FETCH_DELAY_MS);
    }
  }

  // ── Output SQL ──

  // Group by category for readability
  const grouped = new Map<ShopCategory, ShopEntry[]>();

  for (const entry of allEntries) {
    const list = grouped.get(entry.category) || [];

    list.push(entry);
    grouped.set(entry.category, list);
  }

  const categoryOrder: ShopCategory[] = [
    "bags",
    "heirlooms",
    "transmog",
    "mounts",
    "tabards",
    "pets",
    "toys",
  ];

  for (const cat of categoryOrder) {
    const entries = grouped.get(cat);

    if (!entries || entries.length === 0) continue;

    out(
      `-- ─────────────────────────────────────────────────────────────────────────────`,
    );
    out(`-- ${cat.toUpperCase()} (${entries.length} items)`);
    out(
      `-- ─────────────────────────────────────────────────────────────────────────────`,
    );

    for (const e of entries) {
      const classIdsStr = e.class_ids
        ? `'${JSON.stringify(e.class_ids)}'`
        : "NULL";
      const iconStr = e.icon_url ? `'${escSql(e.icon_url)}'` : "NULL";

      const qualityStr = e.quality != null ? String(e.quality) : "NULL";

      out(
        `INSERT INTO shop_items (category, item_id, name_en, name_fr, name_es, name_de, name_it, description_en, description_fr, description_es, description_de, description_it, price, discount_percentage, class_ids, faction, icon_url, quality, is_highlighted, is_active, is_refundable, min_level, sort_order) VALUES`,
      );
      out(
        `  ('${e.category}', ${e.entry}, '${escSql(e.name_en)}', '${escSql(e.name_fr)}', '${escSql(e.name_es)}', '${escSql(e.name_de)}', '${escSql(e.name_it)}', '${escSql(e.description_en)}', '${escSql(e.description_fr)}', '${escSql(e.description_es)}', '${escSql(e.description_de)}', '${escSql(e.description_it)}', ${e.price}, ${e.discount_percentage}, ${classIdsStr}, '${e.faction}', ${iconStr}, ${qualityStr}, ${e.is_highlighted ? 1 : 0}, 1, ${e.is_refundable ? 1 : 0}, ${e.min_level}, ${e.sort_order});`,
      );
    }

    out();
  }

  // Write file as UTF-8
  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf-8");
  process.stderr.write(
    `\nDone! ${allEntries.length} items written to ${OUTPUT_FILE}\n`,
  );

  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
