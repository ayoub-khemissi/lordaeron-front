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

export const CLASS_COLORS: Record<number, string> = {
  1: "#C79C6E", // Warrior
  2: "#F58CBA", // Paladin
  3: "#ABD473", // Hunter
  4: "#FFF569", // Rogue
  5: "#FFFFFF", // Priest
  6: "#C41F3B", // Death Knight
  7: "#0070DE", // Shaman
  8: "#69CCF0", // Mage
  9: "#9482C9", // Warlock
  11: "#FF7D0A", // Druid
};

export const ALLIANCE_RACES = [1, 3, 4, 7, 11];

export const PROFESSION_SKILL_IDS: Record<number, string> = {
  164: "Blacksmithing",
  165: "Leatherworking",
  171: "Alchemy",
  182: "Herbalism",
  186: "Mining",
  197: "Tailoring",
  202: "Engineering",
  333: "Enchanting",
  755: "Jewelcrafting",
  773: "Inscription",
  129: "First Aid",
  356: "Fishing",
  185: "Cooking",
};

export const EQUIPMENT_SLOT_NAMES: Record<number, string> = {
  0: "Head",
  1: "Neck",
  2: "Shoulders",
  3: "Shirt",
  4: "Chest",
  5: "Waist",
  6: "Legs",
  7: "Feet",
  8: "Wrists",
  9: "Hands",
  10: "Ring 1",
  11: "Ring 2",
  12: "Trinket 1",
  13: "Trinket 2",
  14: "Back",
  15: "Main Hand",
  16: "Off Hand",
  17: "Ranged",
  18: "Tabard",
};

/** Slots that are rendered on the 3D model */
export const RENDERED_SLOTS = [0, 2, 3, 4, 5, 6, 7, 8, 9, 14, 15, 16, 17, 18];

/** Ordered slots for equipment panel display */
export const EQUIPMENT_SLOTS_DISPLAY = [
  0, 1, 2, 4, 3, 18, 8, 9, 5, 6, 7, 14, 10, 11, 12, 13, 15, 16, 17,
];
