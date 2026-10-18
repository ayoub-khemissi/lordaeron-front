import type { Dbcs, Rec } from "./dbc";
import type { DbcName } from "./dbc-schema";

import { cleanText, fmt, trimBlank, type TipLine } from "./format";
import { str, strList, type LocaleConfig } from "./locales";
import { SpellRenderer, iconFile, SPELL_DBCS } from "./spell";

/*
 * Item tooltips (3.3.5 layout and wordings) from an item_template row (and its item_template_locale row) and the DBCs: binding,
 * uniqueness, slot and type, damage and speed, armor, stats and ratings, resistances, gems and sockets, durability, requirements, item
 * level, equip / use / chance on hit spells with their cooldowns and charges, item set with its pieces and bonuses, description; an
 * heirloom's damage, armor and stats at a level.
 */

export const ITEM_DBCS: readonly DbcName[] = [
  ...SPELL_DBCS,
  "ItemRandomProperties",
  "ItemRandomSuffix",
  "RandPropPoints",
  "ItemDisplayInfo",
  "ItemSet",
  "ItemLimitCategory",
  "GemProperties",
  "SpellItemEnchantment",
  "SpellItemEnchantmentCondition",
  "ChrClasses",
  "ChrRaces",
  "SkillLine",
  "Faction",
  "ScalingStatDistribution",
  "ScalingStatValues",
];

// item_template, as mysql2 returns it (numbers, strings)
export type ItemRow = Record<string, unknown>;
export interface ItemLocaleRow {
  Name?: string | null;
  Description?: string | null;
}
// names of the pieces of an item set: entry -> name in the requested locale
export type SetPieceNames = Map<number, string>;

/*
 * An item as a character wears it (the armory, lib/tooltips/instance.ts): its random enchantment, its enchantments by slot (0 permanent,
 * 1 temporary, 2-4 the sockets' gems, 5 the socket bonus, 6 the prismatic socket, 7-11 the random properties), its durability, and
 * what the rest of the equipment gives it: the item set pieces worn and the gem colors counted for the meta gems.
 */
export interface ItemInstanceContext {
  randomPropertyId: number;
  enchants: { id: number; duration: number }[];
  durability: number;
  // the entries of the character's equipped items
  worn: ReadonlySet<number>;
  // the gems of the equipment by color, [meta, red, yellow, blue] (the core's Player::EnchantmentFitsRequirements)
  gemCounts: readonly number[];
  // the socketed gems: gem item entry -> its name (in the locale), icon and colors (GemProperties.Type)
  gems: ReadonlyMap<number, { name: string; icon: string; colors: number }>;
  // the character's level: an heirloom's values follow it
  level: number;
}

// the enchantment slots of an item instance (the core's EnchantmentSlot)
const ENCH = { perm: 0, temp: 1, socket: 2, bonus: 5, prismatic: 6 };

const ALL_CLASSES = 1535;
const ALL_RACES = 1791;

const INVTYPE = [
  "",
  "INVTYPE_HEAD",
  "INVTYPE_NECK",
  "INVTYPE_SHOULDER",
  "INVTYPE_BODY",
  "INVTYPE_CHEST",
  "INVTYPE_WAIST",
  "INVTYPE_LEGS",
  "INVTYPE_FEET",
  "INVTYPE_WRIST",
  "INVTYPE_HAND",
  "INVTYPE_FINGER",
  "INVTYPE_TRINKET",
  "INVTYPE_WEAPON",
  "INVTYPE_SHIELD",
  "INVTYPE_RANGED",
  "INVTYPE_CLOAK",
  "INVTYPE_2HWEAPON",
  "INVTYPE_BAG",
  "INVTYPE_TABARD",
  "INVTYPE_ROBE",
  "INVTYPE_WEAPONMAINHAND",
  "INVTYPE_WEAPONOFFHAND",
  "INVTYPE_HOLDABLE",
  "INVTYPE_AMMO",
  "INVTYPE_THROWN",
  "INVTYPE_RANGEDRIGHT",
  "INVTYPE_QUIVER",
  "INVTYPE_RELIC",
];

// primary stats (white, "+N Stat", in the client's order: Strength, Agility, Stamina, Intellect, Spirit, Health, Mana) and the others
// (green "Equip:" lines), by item_template stat_type
const PRIMARY_ORDER = [4, 3, 7, 5, 6, 1, 0];
const PRIMARY_STATS: Record<number, string> = {
  0: "ITEM_MOD_MANA",
  1: "ITEM_MOD_HEALTH",
  3: "ITEM_MOD_AGILITY",
  4: "ITEM_MOD_STRENGTH",
  5: "ITEM_MOD_INTELLECT",
  6: "ITEM_MOD_SPIRIT",
  7: "ITEM_MOD_STAMINA",
};
const RATINGS: Record<number, string> = {
  12: "ITEM_MOD_DEFENSE_SKILL_RATING",
  13: "ITEM_MOD_DODGE_RATING",
  14: "ITEM_MOD_PARRY_RATING",
  15: "ITEM_MOD_BLOCK_RATING",
  16: "ITEM_MOD_HIT_MELEE_RATING",
  17: "ITEM_MOD_HIT_RANGED_RATING",
  18: "ITEM_MOD_HIT_SPELL_RATING",
  19: "ITEM_MOD_CRIT_MELEE_RATING",
  20: "ITEM_MOD_CRIT_RANGED_RATING",
  21: "ITEM_MOD_CRIT_SPELL_RATING",
  22: "ITEM_MOD_HIT_TAKEN_MELEE_RATING",
  23: "ITEM_MOD_HIT_TAKEN_RANGED_RATING",
  24: "ITEM_MOD_HIT_TAKEN_SPELL_RATING",
  25: "ITEM_MOD_CRIT_TAKEN_MELEE_RATING",
  26: "ITEM_MOD_CRIT_TAKEN_RANGED_RATING",
  27: "ITEM_MOD_CRIT_TAKEN_SPELL_RATING",
  28: "ITEM_MOD_HASTE_MELEE_RATING",
  29: "ITEM_MOD_HASTE_RANGED_RATING",
  30: "ITEM_MOD_HASTE_SPELL_RATING",
  31: "ITEM_MOD_HIT_RATING",
  32: "ITEM_MOD_CRIT_RATING",
  33: "ITEM_MOD_HIT_TAKEN_RATING",
  34: "ITEM_MOD_CRIT_TAKEN_RATING",
  35: "ITEM_MOD_RESILIENCE_RATING",
  36: "ITEM_MOD_HASTE_RATING",
  37: "ITEM_MOD_EXPERTISE_RATING",
  38: "ITEM_MOD_ATTACK_POWER",
  39: "ITEM_MOD_RANGED_ATTACK_POWER",
  40: "ITEM_MOD_FERAL_ATTACK_POWER",
  41: "ITEM_MOD_SPELL_HEALING_DONE",
  42: "ITEM_MOD_SPELL_DAMAGE_DONE",
  43: "ITEM_MOD_MANA_REGENERATION",
  44: "ITEM_MOD_ARMOR_PENETRATION_RATING",
  45: "ITEM_MOD_SPELL_POWER",
  46: "ITEM_MOD_HEALTH_REGEN",
  47: "ITEM_MOD_SPELL_PENETRATION",
  48: "ITEM_MOD_BLOCK_VALUE",
};
const SOCKETS: Record<number, string> = {
  1: "EMPTY_SOCKET_META",
  2: "EMPTY_SOCKET_RED",
  4: "EMPTY_SOCKET_YELLOW",
  8: "EMPTY_SOCKET_BLUE",
};
const GEM_COLORS: Record<number, string> = {
  1: "META_GEM",
  2: "RED_GEM",
  3: "YELLOW_GEM",
  4: "BLUE_GEM",
};
const BONDING: Record<number, string> = {
  1: "ITEM_BIND_ON_PICKUP",
  2: "ITEM_BIND_ON_EQUIP",
  3: "ITEM_BIND_ON_USE",
  4: "ITEM_BIND_QUEST",
  5: "ITEM_BIND_QUEST",
};
/*
 * Heirlooms (item_template.ScalingStatValue, flags): the item_template stats, armor and damage are placeholders, the client computes
 * them from ScalingStatValues.dbc at the level shown (as the core does, Player::_ApplyItemBonuses): one budget shared out by the
 * ScalingStatDistribution's stats, the armor of a slot and type, a weapon's DPS (damage spread ±30%, ±20% for a two-hand), spell power.
 */
const SCALING_BUDGET: Record<number, string> = {
  0x1: "ShoulderBudget",
  0x2: "TrinketBudget",
  0x4: "WeaponBudget1H",
  0x8: "PrimaryBudget",
  0x10: "RangedBudget",
  0x40000: "TertiaryBudget",
};
const SCALING_ARMOR: Record<number, string> = {
  0x20: "ClothShoulderArmor",
  0x40: "LeatherShoulderArmor",
  0x80: "MailShoulderArmor",
  0x100: "PlateShoulderArmor",
  0x80000: "ClothCloakArmor",
  0x100000: "ClothChestArmor",
  0x200000: "LeatherChestArmor",
  0x400000: "MailChestArmor",
  0x800000: "PlateChestArmor",
};
const SCALING_DPS: Record<number, [string, number]> = {
  0x200: ["WeaponDPS1H", 0.3],
  0x400: ["WeaponDPS2H", 0.2],
  0x800: ["SpellcasterDPS1H", 0.3],
  0x1000: ["SpellcasterDPS2H", 0.2],
  0x2000: ["RangedDPS", 0.3],
  0x4000: ["WandDPS", 0.3],
};
const SCALING_SPELL_POWER = 0x8000;
// the level an heirloom shows outside the armory: the highest (as Wowhead does)
const SCALING_DEFAULT_LEVEL = 80;
// the client computes the damage in single precision (its truncation to whole numbers depends on it)
const f32 = Math.fround;

const RESISTANCES: [string, number][] = [
  ["holy_res", 1],
  ["fire_res", 2],
  ["nature_res", 3],
  ["frost_res", 4],
  ["shadow_res", 5],
  ["arcane_res", 6],
];

export function itemIconName(dbcs: Dbcs, displayId: number): string {
  const r = dbcs("ItemDisplayInfo").rec(displayId);

  return r ? iconFile(r.str("InventoryIcon_1")) : "inv_misc_questionmark";
}

// the ids of the pieces of an item set (to look their names up before rendering)
export function itemSetPieces(dbcs: Dbcs, setId: number): number[] {
  const r = dbcs("ItemSet").rec(setId);
  const out: number[] = [];

  for (let k = 1; r && k <= 17; ++k) {
    const id = r.get(`ItemID_${k}`);

    if (id) out.push(id);
  }

  return out;
}

export class ItemRenderer {
  private readonly spells: SpellRenderer;

  constructor(
    private readonly dbcs: Dbcs,
    private readonly lc: LocaleConfig,
  ) {
    this.spells = new SpellRenderer(dbcs, lc);
  }

  get warnings() {
    return this.spells.warnings;
  }

  private s(key: string, ...args: unknown[]) {
    return fmt(this.lc, str(this.lc, key), ...args);
  }

  private cooldownText(ms: number): string {
    if (ms >= 86400000 && ms % 86400000 === 0)
      return this.s("ITEM_COOLDOWN_TOTAL_DAYS", ms / 86400000);
    if (ms >= 3600000 && ms % 3600000 === 0)
      return this.s("ITEM_COOLDOWN_TOTAL_HOURS", ms / 3600000);
    if (ms >= 60000)
      return this.s("ITEM_COOLDOWN_TOTAL_MIN", Math.round(ms / 60000));

    return this.s("ITEM_COOLDOWN_TOTAL_SEC", Math.round(ms / 1000));
  }

  private maskNames(dbc: "ChrClasses" | "ChrRaces", mask: number): string {
    const d = this.dbcs(dbc);
    const names: string[] = [];

    for (let i = 1; i <= 11; ++i) {
      const r = mask & (1 << (i - 1)) ? d.rec(i) : null;

      if (r) names.push(r.loc("Name", this.lc.slot));
    }

    return names.join(", ");
  }

  private enchantName(id: number): string {
    return (
      this.dbcs("SpellItemEnchantment").rec(id)?.loc("Name", this.lc.slot) ?? ""
    );
  }

  // the requirements of a meta gem (SpellItemEnchantmentCondition.dbc, a packed record: id, 5 colors (bytes), 5 operands (uint32,
  // unused), 5 comparators (bytes), 5 compared colors (bytes), 5 values (uint32), 5 logic bytes; comparator 2: fewer than, 3: more
  // than the compared color, 5: at least)
  // with the equipment's gem counts (a worn meta gem): each requirement in gray when met, red when not, and whether all are met
  private gemConditions(
    conditionId: number,
    counts?: readonly number[],
  ): TipLine[] & { met?: boolean } {
    const r = this.dbcs("SpellItemEnchantmentCondition").rec(conditionId);
    const out: TipLine[] & { met?: boolean } = [];

    out.met = true;
    for (let k = 0; r && k < 5; ++k) {
      const color = r.u8(4 + k);
      const op = r.u8(29 + k);
      const other = r.u8(34 + k);
      const value = r.u32(39 + k * 4);

      if (!color || !op) continue;
      let met = true;

      if (counts) {
        const cur = counts[color - 1] ?? 0;
        const cmp = other ? (counts[other - 1] ?? 0) : value;

        met = op === 2 ? cur < cmp : op === 3 ? cur > cmp : cur >= cmp;
        if (!met) out.met = false;
      }
      const c = str(this.lc, GEM_COLORS[color] ?? "");
      const s =
        op === 3
          ? this.s(
              "ENCHANT_CONDITION_MORE_COMPARE",
              c,
              str(this.lc, GEM_COLORS[other] ?? ""),
            )
          : this.s(
              op === 2
                ? "ENCHANT_CONDITION_LESS_VALUE"
                : "ENCHANT_CONDITION_MORE_VALUE",
              value,
              c,
            );

      out.push({
        left: str(this.lc, "ENCHANT_CONDITION_REQUIRES") + s,
        color: met ? "gray" : "red",
      });
    }

    return out;
  }

  // a socketed gem's line: its icon and its enchantment (a meta gem white when its requirements are met, gray otherwise, then them)
  private gemLines(enchantId: number, inst: ItemInstanceContext): TipLine[] {
    const e = this.dbcs("SpellItemEnchantment").rec(enchantId);
    const gem = e ? inst.gems.get(e.get("Src_itemID")) : undefined;
    const name = this.enchantName(enchantId) || gem?.name || "";

    if (!e || !e.get("Condition_Id"))
      return [{ left: name, color: "white", icon: gem?.icon }];
    const conditions = this.gemConditions(
      e.get("Condition_Id"),
      inst.gemCounts,
    );

    return [
      { left: name, color: conditions.met ? "white" : "gray", icon: gem?.icon },
      ...conditions,
    ];
  }

  // the stats an item's random enchantment gives (an "of the Bear" or a suffix, whose amounts follow the item's level, quality and
  // slot: the core's GenerateEnchSuffixFactor) and the suffix of its name
  private randomEnchant(
    row: ItemRow,
    id: number,
  ): { suffix: string; lines: TipLine[] } | null {
    const n = (k: string) => Number(row[k] ?? 0) || 0;
    const lines: TipLine[] = [];

    if (id > 0) {
      const r = this.dbcs("ItemRandomProperties").rec(id);

      if (!r) return null;
      for (let k = 1; k <= 5; ++k) {
        const name = this.enchantName(r.get(`Enchantment_${k}`));

        if (name) lines.push({ left: name, color: "white" });
      }

      return { suffix: r.loc("Name", this.lc.slot), lines };
    }
    const r = this.dbcs("ItemRandomSuffix").rec(-id);

    if (!r) return null;
    const points = this.dbcs("RandPropPoints").rec(n("ItemLevel"));
    const column = (
      {
        1: 0,
        4: 0,
        5: 0,
        7: 0,
        17: 0,
        20: 0,
        3: 1,
        6: 1,
        8: 1,
        10: 1,
        12: 1,
        2: 2,
        9: 2,
        11: 2,
        14: 2,
        16: 2,
        23: 2,
        13: 3,
        21: 3,
        22: 3,
        15: 4,
        25: 4,
        26: 4,
      } as Record<number, number>
    )[n("InventoryType")];
    const quality = n("Quality");
    const tier = quality === 2 ? "Good" : quality === 3 ? "Superior" : "Epic";
    const factor =
      points && column !== undefined && quality >= 2
        ? points.get(`${tier}_${column + 1}`)
        : 0;

    for (let k = 1; k <= 5; ++k) {
      const enchant = r.get(`Enchantment_${k}`);
      const amount = Math.floor((factor * r.get(`AllocationPct_${k}`)) / 10000);
      const name = this.enchantName(enchant);

      if (name && amount > 0)
        lines.push({
          left: name.replace(/\$i/g, String(amount)),
          color: "white",
        });
    }

    return { suffix: r.loc("Name", this.lc.slot), lines };
  }

  /*
   * An heirloom at a character's level: the level shown (the client's rule: the level, kept within the item's required level and its
   * distribution's highest), its distribution, that level's stat budget, armor, DPS with its spread, and spell power. The armor and the
   * damage only when its flags scale them (the item's own otherwise). Null for an item that does not scale.
   */
  private scaling(row: ItemRow, charLevel: number) {
    const flags = Number(row.ScalingStatValue ?? 0) >>> 0;

    if (!flags) return null;
    const ssd = this.dbcs("ScalingStatDistribution").rec(
      Number(row.ScalingStatDistribution ?? 0),
    );
    const required = Number(row.RequiredLevel ?? 0) || 0;
    let level = charLevel;

    if (ssd) {
      const max = ssd.get("Maxlevel");

      if (Math.max(required, level) >= max) level = max;
      else if (required > level) level = required;
    }
    level = Math.max(level, 1);
    let ssv: Rec | null = null;

    for (const r of this.dbcs("ScalingStatValues").records())
      if (r.get("Charlevel") === level) {
        ssv = r;
        break;
      }
    const value = (field: string | undefined) =>
      ssv && field ? ssv.get(field) : 0;
    const dps = SCALING_DPS[flags & 0x7e00];

    return {
      level,
      ssd,
      // the item's values are shown at this level (its record exists)
      known: !!ssd && !!ssv,
      budget: value(SCALING_BUDGET[flags & 0x4001f]),
      armor:
        flags & 0xf801e0 ? value(SCALING_ARMOR[flags & 0xf801e0]) : undefined,
      dps:
        flags & 0x7e00 && ssv
          ? ([value(dps?.[0]), dps?.[1] ?? 0.3] as const)
          : undefined,
      spellPower: flags & SCALING_SPELL_POWER ? value("SpellPower") : 0,
    };
  }

  private enchantTime(name: string, ms: number): string {
    if (ms <= 0) return name;
    if (ms >= 86400000)
      return this.s(
        "ITEM_ENCHANT_TIME_LEFT_DAYS",
        name,
        Math.ceil(ms / 86400000),
      );
    if (ms >= 3600000)
      return this.s(
        "ITEM_ENCHANT_TIME_LEFT_HOURS",
        name,
        Math.ceil(ms / 3600000),
      );
    if (ms >= 60000)
      return this.s("ITEM_ENCHANT_TIME_LEFT_MIN", name, Math.ceil(ms / 60000));

    return this.s("ITEM_ENCHANT_TIME_LEFT_SEC", name, Math.ceil(ms / 1000));
  }

  tooltip(
    row: ItemRow,
    locRow: ItemLocaleRow | undefined,
    setPieces: SetPieceNames,
    // the item as a character wears it (the armory), else the item itself (the shop, the links)
    inst?: ItemInstanceContext,
  ): { name: string; lines: TipLine[] } {
    const lc = this.lc;
    const n = (k: string) => Number(row[k] ?? 0) || 0;
    const lines: TipLine[] = [];
    const random =
      inst && inst.randomPropertyId
        ? this.randomEnchant(row, inst.randomPropertyId)
        : null;
    const baseName = locRow?.Name || String(row.name ?? "");
    const name = random?.suffix ? `${baseName} ${random.suffix}` : baseName;
    const ench = (slot: number) => inst?.enchants[slot]?.id ?? 0;
    const desc = locRow?.Description || String(row.description ?? "");
    const quality = n("Quality");
    const flags = n("Flags") >>> 0;
    const itemClass = n("class");
    const subclass = n("subclass");
    const invType = n("InventoryType");
    // an heirloom: at the character's level in the armory, at the highest elsewhere
    const scaling = this.scaling(row, inst?.level ?? SCALING_DEFAULT_LEVEL);

    lines.push({ left: name, color: `q${quality}` });
    if (flags & 0x8)
      lines.push({ left: str(lc, "ITEM_HEROIC"), color: "green" });
    if (flags & 0x2)
      lines.push({ left: str(lc, "ITEM_CONJURED"), color: "white" });
    if (flags & 0x8000000)
      lines.push({ left: str(lc, "ITEM_BIND_TO_ACCOUNT"), color: "white" });
    else if (BONDING[n("bonding")])
      lines.push({ left: str(lc, BONDING[n("bonding")]), color: "white" });
    if (n("maxcount") === 1)
      lines.push({ left: str(lc, "ITEM_UNIQUE"), color: "white" });
    else if (n("maxcount") > 1)
      lines.push({
        left: this.s("ITEM_UNIQUE_MULTIPLE", n("maxcount")),
        color: "white",
      });
    else if (flags & 0x80000)
      lines.push({ left: str(lc, "ITEM_UNIQUE_EQUIPPABLE"), color: "white" });
    if (n("ItemLimitCategory")) {
      const r = this.dbcs("ItemLimitCategory").rec(n("ItemLimitCategory"));

      if (r)
        lines.push({
          left: this.s(
            r.get("Flags") === 1
              ? "ITEM_LIMIT_CATEGORY_MULTIPLE"
              : "ITEM_LIMIT_CATEGORY",
            r.loc("Name", lc.slot),
            r.get("Quantity"),
          ),
          color: "white",
        });
    }
    if (n("startquest"))
      lines.push({ left: str(lc, "ITEM_STARTS_QUEST"), color: "white" });

    // slot and type
    if (invType > 0 && invType < INVTYPE.length) {
      let type = "";

      if (itemClass === 2 && ![14, 16].includes(subclass))
        type = strList(lc, "_WEAPON_SUBCLASS")[subclass] ?? "";
      else if (
        itemClass === 4 &&
        subclass > 0 &&
        ![12, 2, 11, 4, 19].includes(invType)
      )
        type = strList(lc, "_ARMOR_SUBCLASS")[subclass] ?? "";
      const slot = str(lc, INVTYPE[invType]);

      lines.push(
        type
          ? { left: slot, right: type, color: "white" }
          : { left: slot, color: "white" },
      );
    }

    // damage: an heirloom's from its level's DPS (no school, no second damage), in single precision and truncated as the client does
    if (itemClass === 2 && scaling?.dps && n("delay") > 0) {
      const [dps, spread] = scaling.dps.map(f32);
      const delay = f32(n("delay"));
      const min = f32(f32(f32(dps - f32(dps * spread)) * delay) * f32(0.001));
      const max = f32(f32(0.001) * f32(delay * f32(dps * f32(spread + 1))));
      const average = f32(f32(min + max) * 0.5);

      lines.push({
        left: this.s("DAMAGE_TEMPLATE", Math.trunc(min), Math.trunc(max)),
        right: `${str(lc, "SPEED")} ${fmt(lc, "%.2f", delay / 1000)}`,
        color: "white",
      });
      lines.push({
        left: this.s("DPS_TEMPLATE", f32(average / f32(delay * f32(0.001)))),
        color: "white",
      });
    } else if (itemClass === 2 && n("dmg_max1") > 0) {
      const speed = n("delay") / 1000;
      const school = n("dmg_type1")
        ? str(lc, `SPELL_SCHOOL${n("dmg_type1")}_CAP`)
        : "";

      lines.push({
        left: school
          ? this.s(
              "DAMAGE_TEMPLATE_WITH_SCHOOL",
              Math.round(n("dmg_min1")),
              Math.round(n("dmg_max1")),
              school,
            )
          : this.s(
              "DAMAGE_TEMPLATE",
              Math.round(n("dmg_min1")),
              Math.round(n("dmg_max1")),
            ),
        right: `${str(lc, "SPEED")} ${fmt(lc, "%.2f", speed)}`,
        color: "white",
      });
      let dps = speed ? (n("dmg_min1") + n("dmg_max1")) / 2 / speed : 0;

      if (n("dmg_max2") > 0) {
        lines.push({
          left: this.s(
            "PLUS_DAMAGE_TEMPLATE_WITH_SCHOOL",
            Math.round(n("dmg_min2")),
            Math.round(n("dmg_max2")),
            str(lc, `SPELL_SCHOOL${n("dmg_type2")}_CAP`),
          ),
          color: "white",
        });
        dps += speed ? (n("dmg_min2") + n("dmg_max2")) / 2 / speed : 0;
      }
      lines.push({
        left: this.s("DPS_TEMPLATE", Math.round(dps * 10) / 10),
        color: "white",
      });
    }
    const armor = scaling?.armor ?? n("armor");

    if (armor > 0)
      lines.push({ left: this.s("ARMOR_TEMPLATE", armor), color: "white" });
    if (n("block") > 0)
      lines.push({
        left: this.s("SHIELD_BLOCK_TEMPLATE", n("block")),
        color: "white",
      });

    // primary stats (white) and the others (green "Equip:" lines, after the requirements); an heirloom's are its distribution's
    // shares of its level's budget (its item_template stats are placeholders)
    const greens: TipLine[] = [];
    const equip = str(lc, "ITEM_SPELL_TRIGGER_ONEQUIP");
    const stats: [number, number][] = [];

    for (let k = 1; k <= 10; ++k)
      if (!scaling) stats.push([n(`stat_type${k}`), n(`stat_value${k}`)]);
      else if (scaling.ssd && scaling.ssd.get(`StatID_${k}`) >= 0)
        stats.push([
          scaling.ssd.get(`StatID_${k}`),
          Math.trunc((scaling.budget * scaling.ssd.get(`Bonus_${k}`)) / 10000),
        ]);
    for (const type of PRIMARY_ORDER)
      for (const [t, value] of stats)
        if (t === type && value)
          lines.push({
            left: this.s(
              PRIMARY_STATS[type],
              value < 0 ? "-" : "+",
              Math.abs(value),
            ),
            color: "white",
          });
    for (const [type, value] of stats)
      if (value && RATINGS[type])
        greens.push({
          left: `${equip} ${this.s(RATINGS[type], value)}`,
          color: "green",
        });
    if (scaling?.spellPower)
      greens.push({
        left: `${equip} ${this.s("ITEM_MOD_SPELL_POWER", scaling.spellPower)}`,
        color: "green",
      });
    for (const [k, school] of RESISTANCES)
      if (n(k))
        lines.push({
          left: this.s(
            "ITEM_RESIST_SINGLE",
            n(k) < 0 ? "-" : "+",
            Math.abs(n(k)),
            str(lc, `SPELL_SCHOOL${school}_CAP`),
          ),
          color: "white",
        });
    if (random) lines.push(...random.lines);
    else if (n("RandomProperty") || n("RandomSuffix"))
      lines.push({ left: str(lc, "ITEM_RANDOM_ENCHANT"), color: "green" });

    // a worn item's enchantments: the permanent one, then the temporary one with its time left (green, as in game)
    if (inst) {
      const perm = this.enchantName(ench(ENCH.perm));
      const temp = this.enchantName(ench(ENCH.temp));

      if (perm) lines.push({ left: perm, color: "green" });
      if (temp)
        lines.push({
          left: this.enchantTime(temp, inst.enchants[ENCH.temp]?.duration ?? 0),
          color: "green",
        });
    }

    // a gem: its enchantment and its requirements (meta gems)
    if (itemClass === 3 && n("GemProperties")) {
      const g = this.dbcs("GemProperties").rec(n("GemProperties"));

      if (g) {
        const enchant = g.get("Enchant_Id");
        const e = this.dbcs("SpellItemEnchantment").rec(enchant);

        lines.push({ left: this.enchantName(enchant), color: "white" });
        if (e && e.get("Condition_Id"))
          lines.push(...this.gemConditions(e.get("Condition_Id")));
      }
    }

    // sockets: a worn item's gems in them, its prismatic socket (a belt buckle, a blacksmith's socket: the first socket without a color)
    let fits = !!inst;

    for (let k = 1; k <= 3; ++k) {
      const color = n(`socketColor_${k}`);
      const gem = ench(ENCH.socket + k - 1);

      if (color) {
        if (gem && inst) {
          lines.push(...this.gemLines(gem, inst));
          const e = this.dbcs("SpellItemEnchantment").rec(gem);
          const colors = (e && inst.gems.get(e.get("Src_itemID"))?.colors) || 0;

          if (!(colors & color)) fits = false;
        } else {
          lines.push({
            left: str(lc, SOCKETS[color] ?? "EMPTY_SOCKET_NO_COLOR"),
            color: "gray",
          });
          fits = false;
        }
      } else if (inst && ench(ENCH.prismatic)) {
        // the prismatic socket, once
        if (gem) lines.push(...this.gemLines(gem, inst));
        else
          lines.push({ left: str(lc, "EMPTY_SOCKET_NO_COLOR"), color: "gray" });
        break;
      }
    }
    if (n("socketBonus"))
      lines.push({
        left: this.s("ITEM_SOCKET_BONUS", this.enchantName(n("socketBonus"))),
        color: fits ? "green" : "gray",
      });
    if (n("MaxDurability") > 0)
      lines.push({
        left: this.s(
          "DURABILITY_TEMPLATE",
          inst
            ? Math.min(inst.durability, n("MaxDurability"))
            : n("MaxDurability"),
          n("MaxDurability"),
        ),
        color: "white",
      });

    // requirements
    const classes = n("AllowableClass");
    const races = n("AllowableRace");

    if (classes > 0 && (classes & ALL_CLASSES) !== ALL_CLASSES)
      lines.push({
        left: this.s(
          "ITEM_CLASSES_ALLOWED",
          this.maskNames("ChrClasses", classes),
        ),
        color: "white",
      });
    if (races > 0 && (races & ALL_RACES) !== ALL_RACES)
      lines.push({
        left: this.s("ITEM_RACES_ALLOWED", this.maskNames("ChrRaces", races)),
        color: "white",
      });
    // an heirloom: its level range and the level shown ("Requires level 1 to 80 (80)")
    if (scaling?.ssd)
      lines.push({
        left: this.s(
          "ITEM_LEVEL_RANGE_CURRENT",
          Math.max(n("RequiredLevel"), 1),
          scaling.ssd.get("Maxlevel"),
          scaling.level,
        ),
        color: "white",
      });
    else if (n("RequiredLevel") > 1)
      lines.push({
        left: this.s("ITEM_MIN_LEVEL", n("RequiredLevel")),
        color: "white",
      });
    if (n("RequiredSkill")) {
      const r = this.dbcs("SkillLine").rec(n("RequiredSkill"));

      if (r)
        lines.push({
          left: this.s(
            "ITEM_MIN_SKILL",
            r.loc("DisplayName", lc.slot),
            n("RequiredSkillRank"),
          ),
          color: "white",
        });
    }
    if (n("RequiredReputationFaction")) {
      const r = this.dbcs("Faction").rec(n("RequiredReputationFaction"));

      if (r)
        lines.push({
          left: this.s(
            "ITEM_REQ_REPUTATION",
            r.loc("Name", lc.slot),
            str(lc, `FACTION_STANDING_LABEL${n("RequiredReputationRank") + 1}`),
          ),
          color: "white",
        });
    }
    if (
      [2, 4].includes(itemClass) &&
      n("ItemLevel") > 1 &&
      ![4, 19].includes(invType)
    )
      lines.push({ left: this.s("ITEM_LEVEL", n("ItemLevel")), color: "gold" });
    lines.push(...greens);

    // spells: equip, use, chance on hit; an item teaching a spell shows its description as its use
    let learn = false;

    for (let k = 1; k <= 5; ++k)
      if (n(`spellid_${k}`) > 0 && n(`spelltrigger_${k}`) === 6) learn = true;
    for (let k = 1; k <= 5; ++k) {
      const id = n(`spellid_${k}`);
      const trigger = n(`spelltrigger_${k}`);

      if (id <= 0 || ![0, 1, 2, 5].includes(trigger)) continue;
      const text = this.spells.desc(id);

      if (!text) continue;
      const prefix = str(
        lc,
        trigger === 1
          ? "ITEM_SPELL_TRIGGER_ONEQUIP"
          : trigger === 2
            ? "ITEM_SPELL_TRIGGER_ONPROC"
            : "ITEM_SPELL_TRIGGER_ONUSE",
      );
      const parts = text.split("\n");

      if (trigger === 0 || trigger === 5) {
        const rec = this.spells.rec(id);
        const own = n(`spellcooldown_${k}`);
        const cat = n(`spellcategorycooldown_${k}`);
        const cd = Math.max(
          own > 0 ? own : own === -1 && rec ? rec.get("RecoveryTime") : 0,
          cat > 0
            ? cat
            : cat === -1 && rec
              ? rec.get("CategoryRecoveryTime")
              : 0,
        );

        if (cd >= 1500) parts[parts.length - 1] += ` ${this.cooldownText(cd)}`;
      }
      parts.forEach((p, j) =>
        lines.push({ left: j ? p : `${prefix} ${p}`, color: "green" }),
      );
      if (n(`spellcharges_${k}`) > 0)
        lines.push({
          left: this.s("ITEM_SPELL_CHARGES", n(`spellcharges_${k}`)),
          color: "white",
        });
    }
    if (learn && desc)
      cleanText(desc)
        .split("\n")
        .forEach((p, j) =>
          lines.push({
            left: j ? p : `${str(lc, "ITEM_SPELL_TRIGGER_ONUSE")} ${p}`,
            color: "green",
          }),
        );
    if (flags & 0x4)
      lines.push({ left: str(lc, "ITEM_OPENABLE"), color: "green" });
    if (n("PageText"))
      lines.push({ left: str(lc, "ITEM_READABLE"), color: "green" });

    // item set: its name, its pieces, its bonuses
    const set = n("itemset") ? this.dbcs("ItemSet").rec(n("itemset")) : null;

    if (set) {
      const pieces = itemSetPieces(this.dbcs, n("itemset"));
      // the pieces a character wears (one per name: a set lists some pieces twice, as their versions)
      const worn = inst
        ? new Set(
            pieces
              .filter((p) => inst.worn.has(p))
              .map((p) => setPieces.get(p) ?? String(p)),
          )
        : new Set<string>();
      const shown = new Set<string>();

      lines.push({ left: "", color: "white" });
      lines.push({
        left: this.s(
          "ITEM_SET_NAME",
          set.loc("Name", lc.slot),
          worn.size,
          pieces.length,
        ),
        color: "gold",
      });
      for (const p of pieces) {
        const pieceName = setPieces.get(p);

        if (!pieceName || shown.has(pieceName)) continue;
        shown.add(pieceName);
        lines.push({
          left: `  ${pieceName}`,
          color: worn.has(pieceName) ? "white" : "gray",
        });
      }
      const bonuses: [number, number][] = [];

      for (let k = 1; k <= 8; ++k)
        if (set.get(`SetSpellID_${k}`))
          bonuses.push([
            set.get(`SetThreshold_${k}`),
            set.get(`SetSpellID_${k}`),
          ]);
      bonuses.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      lines.push({ left: "", color: "white" });
      // a bonus the worn pieces reach shows as the client's active one (green), the others gray
      for (const [count, spell] of bonuses) {
        const active = worn.size >= count;

        this.spells
          .desc(spell)
          .split("\n")
          .forEach((p, j) =>
            lines.push({
              left: j
                ? p
                : active
                  ? this.s("ITEM_SET_BONUS", p)
                  : this.s("ITEM_SET_BONUS_GRAY", count, p),
              color: active ? "green" : "gray",
            }),
          );
      }
    }
    if (desc && !learn)
      lines.push({ left: `"${cleanText(desc).trim()}"`, color: "gold" });
    // the site's note: the values above follow the level (the client shows them at the player's)
    if (scaling?.known)
      lines.push({
        left: this.s("_ITEM_SCALING_LEVEL", scaling.level),
        color: "gray",
      });

    return { name, lines: trimBlank(lines) };
  }
}
