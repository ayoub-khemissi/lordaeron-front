"use client";

import type { NavEntry } from "@/config/site";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";
import { useAuth } from "@/lib/auth-context";
import { usePathRealm, useRealmPreview } from "@/lib/realm-context";
import {
  REALMS,
  REALM_SLUGS,
  realmPath,
  realmView,
  type RealmInfo,
} from "@/lib/realms";

export interface MenuLink {
  key: string;
  label: string;
  hint?: string;
  href: string;
  icon?: string;
  active: boolean;
  comingSoon?: boolean;
  highlight?: boolean;
}

export type MenuNode =
  | {
      kind: "group";
      key: string;
      label: string;
      links: MenuLink[];
      active: boolean;
    }
  | { kind: "link"; link: MenuLink };

/* The site's one menu (Ayoub, 13/10/2026: simple and coherent), read by the top bar, the burger and the footer:
   - inside a realm: siteConfig.navigation, each entry shown when the realm has its section (an administrator sees every section,
     lib/realms.ts realmView), its own realms only when it names some; a group without entries is left out;
   - on the portal and the shared pages: the realms.
   The page being read is marked active (an anchor entry never is). */
export function useNavigation(): {
  realm: RealmInfo | null;
  nodes: MenuNode[];
} {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useAuth();
  const pathRealm = usePathRealm();
  const preview = useRealmPreview();
  const realm = pathRealm ? realmView(pathRealm, preview) : null;

  const isActive = (href: string) =>
    !href.includes("#") &&
    (pathname === href || pathname.startsWith(`${href}/`));

  if (!realm)
    return {
      realm: null,
      nodes: REALM_SLUGS.map((slug) => {
        const href = realmPath(locale, slug);

        return {
          kind: "link",
          link: {
            key: slug,
            label: REALMS[slug].name,
            href,
            active: isActive(href),
          },
        };
      }),
    };

  const shown = (e: NavEntry) =>
    (!e.section || realm.sections.includes(e.section)) &&
    (!e.realms || e.realms.includes(realm.slug));
  const link = (e: NavEntry, highlight = false): MenuLink => {
    const href =
      e.scope === "realm"
        ? realmPath(locale, realm.slug, e.href)
        : `/${locale}${e.href}`;

    return {
      key: e.key,
      label: t(e.labelKey),
      hint: e.hintKey ? t(e.hintKey) : undefined,
      href,
      icon: e.icon ? `/img/nav/${e.icon}.jpg` : undefined,
      active: isActive(href),
      comingSoon: e.comingSoon && !preview,
      highlight,
    };
  };

  return {
    realm,
    nodes: siteConfig.navigation.flatMap((node): MenuNode[] => {
      if (node.kind === "link")
        return shown(node) && (!node.signedIn || user)
          ? [{ kind: "link", link: link(node, node.highlight) }]
          : [];
      const links = node.entries.filter(shown).map((e) => link(e));

      return links.length
        ? [
            {
              kind: "group",
              key: node.key,
              label: t(node.labelKey),
              links,
              active: links.some((l) => l.active),
            },
          ]
        : [];
    }),
  };
}
