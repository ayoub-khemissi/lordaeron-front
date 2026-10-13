/*
 * The talent calculator's shapes and rules (app/[locale]/[realm]/talents), the same in the browser and on the server (lib/talents.ts reads
 * the trees from the realm's DBC, the armory turns a character's talents into a build):
 * - a build is the points of each talent, tree by tree in the game's order, talents by tier then column: "05320-0035-1" (one digit per
 *   talent, a tree's trailing zeros dropped, trees separated by "-"), the address of a calculator page (?class=mage&build=...&level=80);
 * - the game's rules: level 10 gives the first point, one more a level (71 at level 80); a tier opens after 5 points per tier above it in
 *   the same tree; a talent needs its prerequisite at its last rank; a point comes back only when nothing that stands on it breaks.
 */

export interface TalentCell {
  id: number;
  tier: number;
  column: number;
  // the spell of each rank (its length is the talent's max rank)
  ranks: number[];
  // a talent needed first, at a rank (1-based)
  prereq?: { talent: number; rank: number };
  icon: string;
  name: string;
  // each rank's game tooltip, without its name line
  tips: { left: string; right?: string; color?: string }[][];
}

export interface TalentTree {
  id: number;
  name: string;
  icon: string;
  // public/img/talents/<file>.jpg (the client's TalentFrame background), null when the client has none
  background: string | null;
  // in tier then column order (the build's order)
  talents: TalentCell[];
}

export interface ClassTalents {
  classId: number;
  key: ClassKey;
  name: string;
  trees: TalentTree[];
}

export const CLASS_KEYS = {
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
} as const;
export type ClassKey = (typeof CLASS_KEYS)[keyof typeof CLASS_KEYS];
export const CLASS_IDS = Object.fromEntries(
  Object.entries(CLASS_KEYS).map(([id, key]) => [key, Number(id)]),
) as Record<ClassKey, number>;
export const isClassKey = (v: unknown): v is ClassKey =>
  typeof v === "string" && v in CLASS_IDS;

export const MAX_LEVEL = 80;
export const MIN_TALENT_LEVEL = 10;

// the points a level gives: 0 before 10, then one a level
export const pointsAtLevel = (level: number) =>
  Math.max(0, Math.min(MAX_LEVEL, Math.floor(level)) - (MIN_TALENT_LEVEL - 1));

// the lowest level allowing `points`
export const levelForPoints = (points: number) =>
  points > 0 ? points + MIN_TALENT_LEVEL - 1 : 1;

// the points of a build: [tree][talent index]
export type BuildPoints = number[][];

export function emptyBuild(cls: ClassTalents): BuildPoints {
  return cls.trees.map((t) => t.talents.map(() => 0));
}

export function encodeBuild(points: BuildPoints): string {
  return points
    .map((tree) =>
      tree
        .map((p) => String(p))
        .join("")
        .replace(/0+$/, ""),
    )
    .join("-")
    .replace(/-+$/, "");
}

// a build from its text, clamped to the class's ranks (an unknown or damaged one gives what it can)
export function decodeBuild(
  cls: ClassTalents,
  text: string | null,
): BuildPoints {
  const parts = (text ?? "").split("-");

  return cls.trees.map((tree, i) =>
    tree.talents.map((talent, j) => {
      const digit = Number(parts[i]?.[j] ?? 0);

      return Number.isFinite(digit)
        ? Math.max(0, Math.min(talent.ranks.length, digit))
        : 0;
    }),
  );
}

export const treePoints = (tree: number[]) => tree.reduce((a, b) => a + b, 0);
export const buildTotal = (points: BuildPoints) =>
  points.reduce((a, t) => a + treePoints(t), 0);

// the points spent in a tree's tiers above `tier`
function pointsBelowTier(
  cls: ClassTalents,
  points: BuildPoints,
  tree: number,
  tier: number,
) {
  return cls.trees[tree].talents.reduce(
    (sum, t, j) => (t.tier < tier ? sum + points[tree][j] : sum),
    0,
  );
}

function rankOf(
  cls: ClassTalents,
  points: BuildPoints,
  tree: number,
  talentId: number,
) {
  const j = cls.trees[tree].talents.findIndex((t) => t.id === talentId);

  return j < 0 ? 0 : points[tree][j];
}

// whether a point can go into a talent (the build's total within `available`)
export function canAdd(
  cls: ClassTalents,
  points: BuildPoints,
  tree: number,
  j: number,
  available: number,
) {
  const talent = cls.trees[tree].talents[j];

  if (points[tree][j] >= talent.ranks.length) return false;
  if (buildTotal(points) >= available) return false;
  if (pointsBelowTier(cls, points, tree, talent.tier) < talent.tier * 5)
    return false;
  if (
    talent.prereq &&
    rankOf(cls, points, tree, talent.prereq.talent) < talent.prereq.rank
  )
    return false;

  return true;
}

// whether a point can come back from a talent: every talent of a lower tier still has its 5 points a tier, and none needing this one
// at its rank loses it
export function canRemove(
  cls: ClassTalents,
  points: BuildPoints,
  tree: number,
  j: number,
) {
  if (points[tree][j] <= 0) return false;
  const talent = cls.trees[tree].talents[j];
  const after = points.map((t) => t.slice());

  after[tree][j] -= 1;
  for (const [k, other] of cls.trees[tree].talents.entries()) {
    if (!after[tree][k]) continue;
    if (
      other.tier > talent.tier &&
      pointsBelowTier(cls, after, tree, other.tier) < other.tier * 5
    )
      return false;
    if (
      other.prereq?.talent === talent.id &&
      after[tree][j] < other.prereq.rank
    )
      return false;
  }

  return true;
}

// whether a talent's tier is open in a build (its row drawn lit)
export function tierOpen(
  cls: ClassTalents,
  points: BuildPoints,
  tree: number,
  tier: number,
) {
  return pointsBelowTier(cls, points, tree, tier) >= tier * 5;
}

// whether a build follows the rules (an address typed by hand may not): at most a level 80's points, every talent's tier open and its
// prerequisite reached
export function isValidBuild(cls: ClassTalents, points: BuildPoints) {
  if (buildTotal(points) > pointsAtLevel(MAX_LEVEL)) return false;

  return cls.trees.every((tree, i) =>
    tree.talents.every(
      (talent, j) =>
        !points[i][j] ||
        (tierOpen(cls, points, i, talent.tier) &&
          (!talent.prereq ||
            rankOf(cls, points, i, talent.prereq.talent) >=
              talent.prereq.rank)),
    ),
  );
}

// "0/53/18": the points in each tree
export const pointsSummary = (points: BuildPoints) =>
  points.map(treePoints).join("/");
