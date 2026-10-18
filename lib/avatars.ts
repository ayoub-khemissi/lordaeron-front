/* The icons a player may take as its account's avatar (Ayoub, 18/10/2026: chosen by the players themselves), by group: the game's own
   (Wowhead's copies of its Interface\Icons, as everywhere on the site), checked present, from Wrath of the Lich King or before. The
   server takes nothing outside this list (app/api/account/avatar). */

export const AVATAR_GROUPS: { key: string; icons: string[] }[] = [
  {
    key: "classes",
    icons: [
      "classicon_warrior",
      "classicon_paladin",
      "classicon_hunter",
      "classicon_rogue",
      "classicon_priest",
      "spell_deathknight_classicon",
      "classicon_shaman",
      "classicon_mage",
      "classicon_warlock",
      "classicon_druid",
    ],
  },
  {
    key: "races",
    icons: [
      "human",
      "dwarf",
      "nightelf",
      "gnome",
      "draenei",
      "orc",
      "undead",
      "tauren",
      "troll",
      "bloodelf",
    ].flatMap((race) =>
      ["male", "female"].map((g) => `achievement_character_${race}_${g}`),
    ),
  },
  {
    key: "factions",
    icons: [
      "inv_bannerpvp_02",
      "inv_bannerpvp_01",
      "achievement_pvp_a_16",
      "achievement_pvp_h_16",
      "inv_misc_tournaments_banner_human",
      "inv_misc_tournaments_banner_orc",
      "inv_misc_tabardpvp_01",
    ],
  },
  {
    key: "legends",
    icons: [
      "achievement_boss_lichking",
      "achievement_boss_sindragosa",
      "achievement_boss_kelthuzad_01",
      "achievement_boss_algalon_01",
      "achievement_boss_yoggsaron_01",
      "achievement_boss_mimiron_01",
      "achievement_boss_thorim",
      "achievement_boss_malygos_01",
      "achievement_boss_sartharion_01",
      "achievement_boss_illidan",
      "achievement_boss_kiljaedan",
      "achievement_boss_ragnaros",
      "achievement_boss_onyxia",
      "achievement_boss_nefarion",
      "achievement_boss_cthun",
      "achievement_boss_bazil_akumai",
    ],
  },
  {
    key: "beasts",
    icons: [
      "ability_mount_drake_azure",
      "ability_mount_drake_proto",
      "ability_mount_spectraltiger",
      "ability_mount_whitetiger",
      "ability_mount_dreadsteed",
      "ability_mount_charger",
      "ability_mount_mammoth_brown",
      "ability_mount_polarbear_white",
      "ability_mount_gryphon_01",
      "ability_mount_wyvern_01",
      "ability_hunter_pet_wolf",
      "ability_hunter_pet_bear",
      "ability_hunter_pet_raptor",
      "inv_misc_head_dragon_01",
      "inv_misc_head_dragon_black",
      "inv_misc_head_dragon_blue",
      "inv_pet_babyblizzardbear",
    ],
  },
  {
    key: "arcana",
    icons: [
      "inv_axe_113",
      "inv_sword_122",
      "inv_helmet_96",
      "inv_shield_75",
      "inv_misc_rune_01",
      "spell_shadow_soulgem",
      "spell_fire_felflamering",
      "spell_fire_flamebolt",
      "spell_frost_frostnova",
      "spell_nature_lightning",
      "spell_nature_starfall",
      "spell_holy_holybolt",
      "spell_holy_powerwordshield",
      "spell_shadow_deathcoil",
      "spell_arcane_portaldalaran",
    ],
  },
];

const ALL = new Set(AVATAR_GROUPS.flatMap((g) => g.icons));

export function isAvatarIcon(icon: unknown): icon is string {
  return typeof icon === "string" && ALL.has(icon);
}
