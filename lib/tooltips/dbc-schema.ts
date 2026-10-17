/*
 * The 3.3.5a (12340) layouts of the DBCs the tooltips read: the field count of each file (checked on load) and the index of the
 * fields used (from the AzerothCore schemas of tools/node-dbc-reader). A localized string field is given by the index of its enUS
 * column; the 16 locale slots follow it (lib/tooltips/locales.ts). Fields not listed are ints; `floats` lists the float ones.
 */

export interface DbcLayout {
  fieldCount: number;
  fields: Record<string, number>;
  floats?: readonly string[];
  // localized string fields (index of the enUS column)
  localized?: Record<string, number>;
  // plain string fields
  strings?: Record<string, number>;
}

const effects = (name: string, first: number) => ({
  [`${name}_1`]: first,
  [`${name}_2`]: first + 1,
  [`${name}_3`]: first + 2,
});
const numbered = (name: string, first: number, count: number) =>
  Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`${name}_${i + 1}`, first + i]),
  );

export const DBC_LAYOUTS = {
  Spell: {
    fieldCount: 234,
    fields: {
      ID: 0,
      Attributes: 4,
      AttributesEx: 5,
      AttributesEx2: 6,
      ShapeshiftMask: 12,
      CastingTimeIndex: 28,
      RecoveryTime: 29,
      CategoryRecoveryTime: 30,
      ProcChance: 35,
      ProcCharges: 36,
      MaxLevel: 37,
      BaseLevel: 38,
      SpellLevel: 39,
      DurationIndex: 40,
      PowerType: 41,
      ManaCost: 42,
      RangeIndex: 46,
      CumulativeAura: 49,
      ...effects("Effect", 71),
      ...effects("EffectDieSides", 74),
      ...effects("EffectRealPointsPerLevel", 77),
      ...effects("EffectBasePoints", 80),
      ...effects("EffectRadiusIndex", 92),
      ...effects("EffectAuraPeriod", 98),
      ...effects("EffectMultipleValue", 101),
      ...effects("EffectChainTargets", 104),
      // the item a spell creates (Effect 24): the codex's crafts
      ...effects("EffectItemType", 107),
      ...effects("EffectMiscValue", 110),
      ...effects("EffectPointsPerCombo", 119),
      SpellIconID: 133,
      ManaCostPct: 204,
      MaxTargetLevel: 207,
      MaxTargets: 212,
      ...effects("EffectChainAmplitude", 216),
      RuneCostID: 226,
      SpellDescriptionVariableID: 232,
    },
    floats: [
      "EffectRealPointsPerLevel_1",
      "EffectRealPointsPerLevel_2",
      "EffectRealPointsPerLevel_3",
      "EffectMultipleValue_1",
      "EffectMultipleValue_2",
      "EffectMultipleValue_3",
      "EffectPointsPerCombo_1",
      "EffectPointsPerCombo_2",
      "EffectPointsPerCombo_3",
      "EffectChainAmplitude_1",
      "EffectChainAmplitude_2",
      "EffectChainAmplitude_3",
    ],
    localized: {
      Name: 136,
      NameSubtext: 153,
      Description: 170,
      AuraDescription: 187,
    },
  },
  SpellIcon: { fieldCount: 2, fields: { ID: 0 }, strings: { Texture: 1 } },
  // the guild pages' achievements (lib/queries/guilds.ts), the realm firsts (lib/queries/realm-firsts.ts)
  Achievement: {
    fieldCount: 62,
    fields: {
      ID: 0,
      Faction: 1,
      Category: 38,
      Points: 39,
      Flags: 41,
      IconID: 42,
      // the achievement whose criteria it counts (the achievements' tooltips)
      Shares_Criteria: 61,
    },
    localized: { Title: 4, Description: 21, Reward: 43 },
  },
  // the realm firsts' criteria (what kind of first: a level, a skill, a kill), the achievements' tooltips (their criteria list)
  Achievement_Criteria: {
    fieldCount: 31,
    fields: {
      ID: 0,
      Achievement_Id: 1,
      Type: 2,
      Asset_Id: 3,
      Quantity: 4,
      Flags: 26,
      Ui_Order: 30,
    },
    localized: { Description: 9 },
  },
  // the titles an achievement rewards (the achievements' tooltips): Name the male form, Name1 the female one ("%s" the character)
  CharTitles: {
    fieldCount: 37,
    fields: { ID: 0 },
    localized: { Name: 2, Name1: 19 },
  },
  // the raids' names (the guilds' progression)
  Map: {
    fieldCount: 66,
    fields: { ID: 0, InstanceType: 2, ExpansionID: 63, MaxPlayers: 65 },
    localized: { MapName: 5 },
  },
  // the zones' names (the challenges' Wall of the Fallen: where a challenger fell, lib/queries/challenges.ts)
  AreaTable: {
    fieldCount: 36,
    fields: { ID: 0, ContinentID: 1, ParentAreaID: 2 },
    localized: { AreaName: 11 },
  },
  // the raids' bosses (the guilds' progression)
  DungeonEncounter: {
    fieldCount: 23,
    fields: { ID: 0, MapID: 1, Difficulty: 2, OrderIndex: 3, SpellIconID: 22 },
    localized: { Name: 5 },
  },
  SpellDescriptionVariables: {
    fieldCount: 2,
    fields: { ID: 0 },
    strings: { Variables: 1 },
  },
  SpellDuration: { fieldCount: 4, fields: { ID: 0, Duration: 1 } },
  SpellRadius: {
    fieldCount: 4,
    fields: { ID: 0, Radius: 1 },
    floats: ["Radius"],
  },
  SpellRange: {
    fieldCount: 40,
    fields: { ID: 0, RangeMin_1: 1, RangeMax_1: 3, RangeMax_2: 4 },
    floats: ["RangeMin_1", "RangeMax_1", "RangeMax_2"],
  },
  SpellCastTimes: { fieldCount: 4, fields: { ID: 0, Base: 1 } },
  SpellRuneCost: {
    fieldCount: 5,
    fields: { ID: 0, Blood: 1, Unholy: 2, Frost: 3 },
  },
  SpellShapeshiftForm: {
    fieldCount: 35,
    fields: { ID: 0 },
    localized: { Name: 2 },
  },
  // the models and textures: the armory's 3D viewer matches a realm's own displays to Blizzard's by them (lib/armory-model.ts)
  ItemDisplayInfo: {
    fieldCount: 25,
    fields: { ID: 0, ...numbered("GeosetGroup", 7, 3) },
    strings: {
      ModelName_1: 1,
      ModelName_2: 2,
      ModelTexture_1: 3,
      ModelTexture_2: 4,
      InventoryIcon_1: 5,
      ...numbered("Texture", 15, 8),
    },
  },
  ItemSet: {
    fieldCount: 53,
    fields: {
      ID: 0,
      ...numbered("ItemID", 18, 17),
      ...numbered("SetSpellID", 35, 8),
      ...numbered("SetThreshold", 43, 8),
    },
    localized: { Name: 1 },
  },
  ItemLimitCategory: {
    fieldCount: 20,
    fields: { ID: 0, Quantity: 18, Flags: 19 },
    localized: { Name: 1 },
  },
  // Type: the gem's colors (1 meta, 2 red, 4 yellow, 8 blue, combined)
  GemProperties: { fieldCount: 5, fields: { ID: 0, Enchant_Id: 1, Type: 4 } },
  SpellItemEnchantment: {
    fieldCount: 38,
    // ItemVisual: the glow a weapon shows (the armory's 3D viewer, lib/armory-model.ts)
    // Src_itemID: the gem a socketed enchantment comes from
    fields: { ID: 0, ItemVisual: 31, Src_itemID: 33, Condition_Id: 34 },
    localized: { Name: 14 },
  },
  // packed record (bytes): read with Rec.u8 / Rec.u32 (lib/tooltips/item.ts)
  SpellItemEnchantmentCondition: { fieldCount: 31, fields: { ID: 0 } },
  ChrClasses: { fieldCount: 60, fields: { ID: 0 }, localized: { Name: 4 } },
  ChrRaces: { fieldCount: 69, fields: { ID: 0 }, localized: { Name: 14 } },
  SkillLine: {
    fieldCount: 56,
    fields: { ID: 0 },
    localized: { DisplayName: 3 },
  },
  Faction: { fieldCount: 57, fields: { ID: 0 }, localized: { Name: 23 } },
  // an item's random enchantments (the armory's character tooltips, lib/tooltips/instance.ts): "of the Bear" (positive
  // item_instance.randomPropertyId) and the suffixes (negative), whose amounts come from RandPropPoints by item level
  ItemRandomProperties: {
    fieldCount: 24,
    fields: { ID: 0, ...numbered("Enchantment", 2, 5) },
    localized: { Name: 7 },
  },
  ItemRandomSuffix: {
    fieldCount: 29,
    fields: {
      ID: 0,
      ...numbered("Enchantment", 19, 5),
      ...numbered("AllocationPct", 24, 5),
    },
    localized: { Name: 1 },
  },
  RandPropPoints: {
    fieldCount: 16,
    fields: {
      ID: 0,
      ...numbered("Epic", 1, 5),
      ...numbered("Superior", 6, 5),
      ...numbered("Good", 11, 5),
    },
  },
  // the talent calculator and the armory's specializations (lib/talents.ts): a talent's tree, tier, column, the spell of each rank and
  // its prerequisite (a talent and the rank it needs, 0-based)
  Talent: {
    fieldCount: 23,
    fields: {
      ID: 0,
      TabID: 1,
      TierID: 2,
      ColumnIndex: 3,
      ...numbered("SpellRank", 4, 9),
      ...numbered("PrereqTalent", 13, 3),
      ...numbered("PrereqRank", 16, 3),
    },
  },
  TalentTab: {
    fieldCount: 24,
    fields: {
      ID: 0,
      SpellIconID: 18,
      ClassMask: 20,
      PetTalentMask: 21,
      OrderIndex: 22,
    },
    localized: { Name: 1 },
    strings: { BackgroundFile: 23 },
  },
  // the codex (lib/codex.ts): the spells of a profession and the skill they ask
  SkillLineAbility: {
    fieldCount: 14,
    fields: {
      ID: 0,
      SkillLine: 1,
      Spell: 2,
      MinSkillLineRank: 7,
      AcquireMethod: 9,
    },
  },
  // the codex: a vendor's price in honor, arena points or items
  ItemExtendedCost: {
    fieldCount: 16,
    fields: {
      ID: 0,
      HonorPoints: 1,
      ArenaPoints: 2,
      ...numbered("ItemID", 4, 5),
      ...numbered("ItemCount", 9, 5),
      RequiredArenaRating: 14,
    },
  },
} satisfies Record<string, DbcLayout>;

export type DbcName = keyof typeof DBC_LAYOUTS;
