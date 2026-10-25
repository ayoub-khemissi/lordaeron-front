import type { RealmHomeDefinition } from "../types";

import { getTranslations } from "next-intl/server";

import { PhaseStrip } from "../phase-strip";

import {
  IMG,
  LANGS,
  type Lang,
  collections,
  artifact,
  challenges,
  finale,
  hero,
  heroes,
  manifesto,
  phases,
  professions,
  raceClasses,
  raids,
  worldBosses,
} from "@/components/rimeheart/content";
import { realmPath } from "@/lib/realms";

const icon = (name: string) => `/img/experience/icons/${name}.jpg`;

/* Rimeheart, the progressive Northrend realm: frost from top to bottom, the Lich King's art, falling snow, a frost-ringed crest; its
   phases below the features. Its long showcase lives on /<locale>/rimeheart/features (components/rimeheart/showcase.tsx), whose texts
   (components/rimeheart/content.ts) this home reuses. */
export async function rimeheartHome(
  locale: string,
): Promise<RealmHomeDefinition> {
  const lang: Lang = (LANGS as readonly string[]).includes(locale)
    ? (locale as Lang)
    : "en";
  const tr = await getTranslations({ locale, namespace: "realmHome" });
  const href = (path: string) => realmPath(locale, "rimeheart", path);
  // a chapter of the showcase as a card: its eyebrow as the title, its headline as the line
  const chapter = (
    section: {
      id: string;
      eyebrow: Record<Lang, string>;
      title: Record<Lang, string>;
    },
    iconName: string,
  ) => ({
    icon: icon(iconName),
    title: section.eyebrow[lang],
    line: section.title[lang].replace(/\n/g, " "),
    href: href(`/features#${section.id}`),
  });

  return {
    slug: "rimeheart",
    theme: {
      accent: "ice",
      heroImages: [IMG.lk],
      responsive: true,
      ambience: "snow",
      crest: { src: icon("achievement_boss_lichking"), ring: true },
    },
    hero: {
      kicker: hero.kicker[lang],
      title: hero.title[lang],
      titleAccent: hero.titleAccent[lang],
      subtitle: hero.subtitle[lang],
      primary: { label: hero.ctaPrimary[lang], href: href("/how-to") },
      secondary: { label: hero.ctaSecondary[lang], href: href("/features") },
    },
    features: {
      eyebrow: manifesto.eyebrow[lang],
      title: manifesto.title[lang].replace(/\n/g, " "),
      items: [
        chapter(heroes, "inv_misc_book_09"),
        chapter(raceClasses, "achievement_character_tauren_male"),
        chapter(challenges, "inv_misc_bone_humanskull_01"),
        chapter(raids, "achievement_dungeon_ulduarraid_misc_01"),
        chapter(worldBosses, "inv_misc_head_dragon_blue"),
        chapter(artifact, "inv_jewelcrafting_icediamond_02"),
        chapter(professions, "inv_inscription_tradeskill01"),
        chapter(collections, "ability_mount_redfrostwyrm_01"),
      ],
      more: { label: hero.ctaSecondary[lang], href: href("/features") },
    },
    sections: (
      <PhaseStrip
        classic={{
          planned: phases.plannedTag[lang],
          legend: `${phases.track[0][lang]} ${phases.track[1][lang]}`,
        }}
        eyebrow={phases.eyebrow[lang]}
        more={{ label: tr("allPhases"), href: href("/features#phases") }}
        phases={phases.steps.map((s) => ({
          n: s.n,
          tag:
            s.n === "0"
              ? phases.launchTag[lang]
              : `${phases.phaseTag[lang]} ${s.n}`,
          title: s.title[lang],
          length: s.length[lang],
          icon: icon(s.icon),
          lines: s.lines.map((l) => l[lang]),
          classic: s.classic && {
            icon: icon(s.classic.icon),
            name: s.classic.name[lang],
            planned: s.classic.planned,
          },
        }))}
        title={phases.title[lang]}
      />
    ),
    join: {
      title: finale.title[lang],
      text: finale.reservation[lang],
      cta: { label: finale.cta[lang], href: href("/how-to") },
      image: finale.image,
    },
  };
}
