import type { RealmHomeDefinition } from "../types";

import { getTranslations } from "next-intl/server";

import { heroBackgrounds } from "@/components/hero-banner";
import { ServerStats } from "@/components/server-stats";
import { EpicProgressionTimeline } from "@/components/epic-progression-timeline";
import { realmPath } from "@/lib/realms";

const ICON = "https://wow.zamimg.com/images/wow/icons/large";

/* Lordaeron, the epic progressive realm: its warm gold, the art of every expansion drawn at random, the site's gold crest; its
   population (players, accounts, faction balance) and its epic progression below the features, as on its home before the template. */
export async function lordaeronHome(
  locale: string,
): Promise<RealmHomeDefinition> {
  const t = await getTranslations({ locale, namespace: "home" });
  const tf = await getTranslations({ locale, namespace: "features" });
  const tr = await getTranslations({ locale, namespace: "realmHome" });
  const href = (path: string) => realmPath(locale, "lordaeron", path);
  const feature = (key: string, icon: string, path: string) => ({
    icon: `${ICON}/${icon}.jpg`,
    title: tf(key),
    line: tf(`${key}Desc`),
    href: href(path),
  });

  return {
    slug: "lordaeron",
    theme: {
      accent: "gold",
      heroImages: heroBackgrounds,
      ambience: "none",
      crest: { src: "/img/logo/logo.png" },
    },
    hero: {
      kicker: "Epic Progressive Server",
      title: t("title"),
      subtitle: t("subtitle"),
      primary: { label: t("cta"), href: href("/how-to") },
      secondary: {
        label: t("ctaRegister"),
        href: `/${locale}/register`,
        guestOnly: true,
      },
    },
    features: {
      eyebrow: tr("featuresEyebrow"),
      title: tf("featuresTitle"),
      items: [
        feature("epicProgression", "inv_misc_orb_02", "/epic-progression"),
        feature(
          "loneChampion",
          "spell_holy_avenginewrath",
          "/epic-progression",
        ),
        feature("raidScaling", "inv_misc_head_dragon_01", "/raid-scaling"),
        feature("raidReset", "inv_misc_idol_02", "/features"),
        feature("soloQueue", "spell_holy_crusade", "/features"),
        feature("fourProfessions", "inv_misc_note_01", "/features"),
        feature("transmog", "inv_misc_armorkit_17", "/features"),
        feature("crossfaction", "inv_misc_horn_01", "/features"),
      ],
      more: { label: tr("allFeatures"), href: href("/features") },
    },
    sections: (
      <>
        <ServerStats />
        <EpicProgressionTimeline />
      </>
    ),
  };
}
