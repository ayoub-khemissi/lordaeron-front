"use client";

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import clsx from "clsx";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { DiscordIcon } from "@/components/icons";
import { openVote } from "@/components/navigation/vote-event";
import { useNavigation } from "@/components/navigation/use-navigation";
import { realmPath } from "@/lib/realms";

export const Footer = () => {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tRealms = useTranslations("realms");
  const locale = useLocale();
  // the same menu as the top bar and the burger (components/navigation): no list of its own
  const { realm: view, nodes } = useNavigation();
  const ice = view?.accent === "ice";
  const heading = clsx(
    "text-xs font-bold mb-4 uppercase tracking-[0.2em]",
    ice ? "text-wow-blue-ice" : "text-wow-gold",
  );
  const linkClass = clsx(
    "text-gray-400 text-sm transition-colors",
    ice ? "hover:text-wow-blue-ice" : "hover:text-wow-gold",
  );

  // the realm column: its home and every page of its menu; on the portal the realms
  const links: { label: string; href: string }[] = [
    ...(view
      ? [{ label: tNav("home"), href: realmPath(locale, view.slug) }]
      : []),
    ...nodes.flatMap((node) =>
      node.kind === "group"
        ? node.links.filter((l) => !l.comingSoon)
        : [node.link],
    ),
    ...(view ? [{ label: tRealms("allRealms"), href: `/${locale}` }] : []),
  ];

  return (
    <footer className="relative w-full mt-auto overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage:
            "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_008_1080p_png_jpgcopy.jpg')",
        }}
      />
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wow-gold/30 to-transparent" />

      <div className="relative glass border-t-0 border-l-0 border-r-0 border-b-0">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <NextLink
                className="flex items-center gap-2 mb-3 group"
                href={`/${locale}`}
              >
                <Image
                  alt="Lordaeron"
                  className="drop-shadow-[0_0_6px_rgba(199,156,62,0.4)]"
                  height={32}
                  src="/img/logo/logo.png"
                  width={32}
                />
                <span className="font-heading text-xl font-black wow-gradient-text tracking-widest uppercase">
                  Lordaeron
                </span>
              </NextLink>
              <p className="text-gray-400 text-sm leading-relaxed">
                {view
                  ? tRealms(`${view.slug}.tagline`)
                  : tRealms("portal.subtitle")}
              </p>
            </div>

            <div>
              <h4 className={heading}>{view ? view.name : tRealms("label")}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <NextLink className={linkClass} href={link.href}>
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={heading}>{t("community")}</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    isExternal
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-[#5865F2] text-sm transition-colors"
                    href={siteConfig.links.discord}
                  >
                    <DiscordIcon className="w-5 h-5" />
                    Discord
                  </Link>
                </li>
                <li>
                  <Button
                    className="h-auto min-w-0 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-300"
                    variant="light"
                    onPress={openVote}
                  >
                    <img
                      alt=""
                      className="h-5 w-5"
                      height={20}
                      src="/img/icons/soul-shard.svg"
                      width={20}
                    />
                    {tNav("vote")}
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={heading}>{t("legal")}</h4>
              <ul className="space-y-2">
                {[
                  { label: t("contact"), href: `/${locale}/contact` },
                  { label: t("cgu"), href: `/${locale}/terms-of-use` },
                  { label: t("cgv"), href: `/${locale}/terms-of-sale` },
                  { label: t("rgpd"), href: `/${locale}/privacy-policy` },
                  {
                    label: t("legalNotice"),
                    href: `/${locale}/legal-notice`,
                  },
                ].map((link) => (
                  <li key={link.href}>
                    <NextLink className={linkClass} href={link.href}>
                      {link.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="shimmer-line w-full mt-10 mb-6" />

          <div className="text-center">
            <p className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} Lordaeron. {t("rights")}
            </p>
            <p className="text-gray-500 text-xs mt-1">{t("disclaimer")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
