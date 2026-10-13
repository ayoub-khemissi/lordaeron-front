/* The codex's shapes (lib/codex.ts on the server, app/[locale]/[realm]/codex in the browser) and its filters' values. */

export const CODEX_KINDS = [
  "mount",
  "companion",
  "toy",
  "tabard",
  "recipe",
  "glyph",
  "gear",
  "appearance",
  "item",
] as const;
export type CodexKind = (typeof CODEX_KINDS)[number];

export const CODEX_SOURCES = [
  "vendor",
  "drop",
  "object",
  "container",
  "quest",
  "craft",
  "achievement",
  "blackMarket",
  "shop",
] as const;
export type CodexSourceType = (typeof CODEX_SOURCES)[number];

export const CODEX_PHASES = [0, 1, 2, 3, 4, 5] as const;

export const isCodexKind = (v: unknown): v is CodexKind =>
  typeof v === "string" && (CODEX_KINDS as readonly string[]).includes(v);
export const isCodexSource = (v: unknown): v is CodexSourceType =>
  typeof v === "string" && (CODEX_SOURCES as readonly string[]).includes(v);

export interface CodexQuery {
  text: string;
  kind: CodexKind | null;
  source: CodexSourceType | null;
  phase: number | null;
  origin: "custom" | "blizzard" | null;
  page: number;
}

// a price: gold (copper), honor, arena points (and the rating it asks), items
export interface CodexPrice {
  copper?: number;
  honor?: number;
  arena?: number;
  rating?: number;
  items?: { id: number; count: number; name: string; icon: string }[];
}

// a way to get an item: who or what gives it (the first names, how many more), its price
export interface CodexSource {
  type: CodexSourceType;
  names: string[];
  more: number;
  // the title the vendors share ("Lost Recipes & Rare Materials")
  title?: string;
  price?: CodexPrice | null;
  // a drop from too many creatures to name
  world?: boolean;
  // a craft: the skill it asks, its spell (tooltip)
  rank?: number;
  spell?: number;
  // the site's shop: its price in Soul Shards, its category's page
  shards?: number;
  category?: string;
}

export interface CodexItem {
  id: number;
  name: string;
  quality: number;
  icon: string;
  kind: CodexKind;
  custom: boolean;
  phase: number | null;
  sources: CodexSource[];
}
