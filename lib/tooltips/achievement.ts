import type { Dbc, Dbcs, Rec } from "./dbc";
import type { DbcName } from "./dbc-schema";
import type { LocaleConfig } from "./locales";

import { cleanText, fmt, type TipLine } from "./format";
import { spellIconName } from "./spell";

/*
 * Achievement tooltips (Ayoub, 13/10/2026), as the game shows them: the title, its points (a shield), the description, the criteria
 * (Achievement_Criteria.dbc in their Ui_Order, the hidden ones left out; a meta achievement's are the achievements it asks, named by
 * their titles when the criterion has no text) and the reward: the realm's achievement_reward (a title from CharTitles.dbc, an item),
 * else the DBC's own reward text. The realm's DBCs, so the WotLK+ achievements show like Blizzard's.
 */

export const ACHIEVEMENT_DBCS: readonly DbcName[] = [
  "Achievement",
  "Achievement_Criteria",
  "CharTitles",
  "SpellIcon",
  "ItemDisplayInfo",
];

const CRITERIA_PROGRESS_BAR = 0x1;
const CRITERIA_HIDDEN = 0x2;
const CRITERIA_COMPLETE_ACHIEVEMENT = 8;

// the world's achievement_reward row of an achievement
export interface AchievementRewardRow {
  ID: number;
  TitleA: number;
  TitleH: number;
  ItemID: number;
}

// a rewarded item, its name in the reader's language
export interface RewardItem {
  name: string;
  icon: string;
}

// no client wording for these: the five languages of the realms' DBCs, English for the others (their texts are English too)
const WORDS: Record<string, { reward: string; title: string }> = {
  en: { reward: "Reward: %s", title: "Title: %s" },
  fr: { reward: "Récompense : %s", title: "titre « %s »" },
  de: { reward: "Belohnung: %s", title: "Titel „%s“" },
  es: { reward: "Recompensa: %s", title: "título «%s»" },
  ru: { reward: "Награда: %s", title: "звание «%s»" },
};

// the criteria of each achievement, in their order (once per Achievement_Criteria.dbc, reloaded with it)
const criteriaIndex = new WeakMap<Dbc, Map<number, Rec[]>>();

function criteriaOf(dbc: Dbc, achievement: number): Rec[] {
  let index = criteriaIndex.get(dbc);

  if (!index) {
    index = new Map();
    for (const c of dbc.records()) {
      const a = c.get("Achievement_Id");
      const list = index.get(a) ?? [];

      list.push(c);
      index.set(a, list);
    }
    for (const list of index.values())
      list.sort((x, y) => x.get("Ui_Order") - y.get("Ui_Order"));
    criteriaIndex.set(dbc, index);
  }

  return index.get(achievement) ?? [];
}

// a text compared loosely (a lone criterion that repeats the description is not listed)
const loose = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.!?。]+$/u, "")
    .trim();

export class AchievementRenderer {
  readonly warnings: string[] = [];

  constructor(
    private readonly dbcs: Dbcs,
    private readonly lc: LocaleConfig,
  ) {}

  private loc(rec: Rec, field: string) {
    return cleanText(rec.loc(field, this.lc.slot)).trim();
  }

  // "%s the Explorer" -> "the Explorer", "%s, Conqueror of Naxxramas" -> "Conqueror of Naxxramas"
  private titleName(id: number): string {
    const r = id ? this.dbcs("CharTitles").rec(id) : null;

    return r
      ? this.loc(r, "Name")
          .replace(/%s/g, "")
          .replace(/^[\s,]+|[\s,]+$/g, "")
          .replace(/\s{2,}/g, " ")
      : "";
  }

  icon(id: number): string {
    const a = this.dbcs("Achievement").rec(id);

    return spellIconName(this.dbcs, a?.get("IconID") ?? 0);
  }

  tooltip(
    id: number,
    reward: AchievementRewardRow | undefined,
    rewardItem: RewardItem | undefined,
  ): { name: string; points: number; lines: TipLine[] } | null {
    const achievements = this.dbcs("Achievement");
    const a = achievements.rec(id);

    if (!a) return null;
    const name = this.loc(a, "Title");
    const description = this.loc(a, "Description");
    const words = WORDS[this.lc.locale] ?? WORDS.en;
    const lines: TipLine[] = [{ left: name }];

    if (description) lines.push({ left: description });

    const criteria: TipLine[] = [];

    for (const c of criteriaOf(
      this.dbcs("Achievement_Criteria"),
      a.get("Shares_Criteria") || id,
    )) {
      const flags = c.get("Flags");

      if (flags & CRITERIA_HIDDEN) continue;
      const text =
        this.loc(c, "Description") ||
        (c.get("Type") === CRITERIA_COMPLETE_ACHIEVEMENT
          ? (achievements.rec(c.get("Asset_Id"))?.loc("Title", this.lc.slot) ??
            "")
          : "");

      if (!text) continue;
      const quantity = c.get("Quantity");

      criteria.push({
        left: text,
        criterion:
          flags & CRITERIA_PROGRESS_BAR && quantity > 1
            ? { max: quantity }
            : {},
      });
    }
    // a lone criterion that only says the description again ("Complete 50 quests"): its progress bar alone (shown when a progress is
    // known, components/game-tooltip), or nothing
    if (
      criteria.length === 1 &&
      [loose(description), loose(name)].includes(loose(criteria[0].left))
    ) {
      if (criteria[0].criterion?.max) criteria[0].left = "";
      else criteria.length = 0;
    }
    // the box sets the criteria apart (no blank line: a list with nothing to show leaves no gap)
    lines.push(...criteria);

    const rewards: TipLine[] = [];
    const titles = [
      ...new Set(
        [reward?.TitleA, reward?.TitleH]
          .map((t) => this.titleName(Number(t) || 0))
          .filter(Boolean),
      ),
    ];

    if (titles.length)
      rewards.push({
        left: fmt(
          this.lc,
          words.reward,
          fmt(this.lc, words.title, titles.join(" / ")),
        ),
        color: "gold",
      });
    if (rewardItem)
      rewards.push({
        left: fmt(this.lc, words.reward, rewardItem.name),
        color: "gold",
        icon: rewardItem.icon,
      });
    if (!rewards.length) {
      const text = this.loc(a, "Reward");

      if (text) rewards.push({ left: text, color: "gold" });
    }
    if (rewards.length) lines.push({ left: "" }, ...rewards);

    return { name, points: a.get("Points"), lines };
  }
}
