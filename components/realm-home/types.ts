import type { ReactNode } from "react";
import type { RealmSlug } from "@/lib/realms";

/*
 * A realm's home page (Ayoub, 13/10/2026: every realm gets the same kind of home, compact, with its live player count in the hero, and
 * two realms must be told apart at first glance). What changes from one realm to another lives in one definition per realm
 * (components/realm-home/realms/<slug>.tsx); the template (realm-home.tsx) draws it.
 * Adding a realm: write its definition (theme, hero, features, its own sections, join band) and list it in realm-home/index.ts.
 */

export type RealmAccent = "gold" | "ice";

export type RealmTheme = {
  // the realm's colors: Lordaeron's warm gold, Rimeheart's frost (realm-home/theme.ts)
  accent: RealmAccent;
  // the hero's art, one drawn at random on each visit; `responsive`: the image has its -sm/-xl webp twins
  // (components/experience/primitives.tsx BgImg)
  heroImages: string[];
  responsive?: boolean;
  // the hero's ambience: falling snow (Northrend) or none
  ambience: "none" | "snow";
  // the realm's crest above its name: an image (the site's gold crest) or a game icon in a frost ring
  crest: { src: string; ring?: boolean };
};

export type RealmLink = { label: string; href: string };

export type RealmFeature = {
  // a game icon (a path under public/img or a full URL)
  icon: string;
  title: string;
  // one line, two at most on a phone
  line: string;
  href: string;
};

export type RealmHomeDefinition = {
  slug: RealmSlug;
  theme: RealmTheme;
  hero: {
    kicker: string;
    title: string;
    titleAccent?: string;
    subtitle: string;
    primary: RealmLink;
    secondary?: RealmLink & { guestOnly?: boolean };
  };
  features: {
    eyebrow: string;
    title: string;
    items: RealmFeature[];
    more?: RealmLink;
  };
  // the realm's own sections between the features and the news (Lordaeron: its population and epic progression; Rimeheart: its phases)
  sections?: ReactNode;
  // the closing call to join
  join?: { title: string; text?: string; cta: RealmLink; image: string };
};
