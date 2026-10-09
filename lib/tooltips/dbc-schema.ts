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
      ...effects("EffectDieSides", 74),
      ...effects("EffectRealPointsPerLevel", 77),
      ...effects("EffectBasePoints", 80),
      ...effects("EffectRadiusIndex", 92),
      ...effects("EffectAuraPeriod", 98),
      ...effects("EffectMultipleValue", 101),
      ...effects("EffectChainTargets", 104),
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
  ItemDisplayInfo: {
    fieldCount: 25,
    fields: { ID: 0 },
    strings: { InventoryIcon_1: 5 },
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
  GemProperties: { fieldCount: 5, fields: { ID: 0, Enchant_Id: 1 } },
  SpellItemEnchantment: {
    fieldCount: 38,
    fields: { ID: 0, Condition_Id: 34 },
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
} satisfies Record<string, DbcLayout>;

export type DbcName = keyof typeof DBC_LAYOUTS;
