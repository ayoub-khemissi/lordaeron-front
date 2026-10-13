import { CLASS_COLORS } from "@/lib/armory-constants";

/* A character told apart at a glance in every tool (Ayoub, 13/10/2026): its race (by gender) and class icons, the class name in its class
   colour. The icons are Blizzard's (public/img/identity: race_<race>_<gender>.jpg, classicon_<class>.jpg). Plain helpers, for the server
   pages too (the population's bars); the components are components/character-identity.tsx. */

const RACE_ICON: Record<number, string> = {
  1: "human",
  2: "orc",
  3: "dwarf",
  4: "nightelf",
  5: "scourge",
  6: "tauren",
  7: "gnome",
  8: "troll",
  10: "bloodelf",
  11: "draenei",
};
const CLASS_ICON: Record<number, string> = {
  1: "warrior",
  2: "paladin",
  3: "hunter",
  4: "rogue",
  5: "priest",
  6: "deathknight",
  7: "shaman",
  8: "mage",
  9: "warlock",
  11: "druid",
};

export const classColor = (cls: number) => CLASS_COLORS[cls] || "#FFFFFF";

export function raceIcon(race: number, gender: number) {
  const r = RACE_ICON[race];

  return r
    ? `/img/identity/race_${r}_${gender === 1 ? "female" : "male"}.jpg`
    : null;
}

export function classIcon(cls: number) {
  const c = CLASS_ICON[cls];

  return c ? `/img/identity/classicon_${c}.jpg` : null;
}
