"use client";

import type { MenuLink } from "@/components/navigation/use-navigation";

import { useState } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Image from "next/image";
import NextLink from "next/link";
import clsx from "clsx";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { useNavigation } from "@/components/navigation/use-navigation";
import { openVote } from "@/components/navigation/vote-event";
import { useAuth } from "@/lib/auth-context";
import { RealmSwitcher } from "@/components/realm-switcher";
import { registerPath } from "@/lib/realms";
import { OVERLAY_MOTION } from "@/lib/overlay-motion";

/* The top bar (Ayoub, 13/10/2026: simple and coherent, one menu for the bar, the burger and the footer, components/navigation):
   - in a realm: its switcher, its groups as dropdowns (a game icon and a one-line hint per entry) and the shop; on the right the vote,
     the language and the account;
   - on the portal and the shared pages: the realms and the account.
   The page being read is lit in the realm's colour (gold, or ice on Rimeheart). */
export const Navbar = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { realm, nodes } = useNavigation();
  const ice = realm?.accent === "ice";
  const accentText = ice ? "text-wow-blue-ice" : "text-wow-gold";
  const accentBg = ice ? "bg-wow-blue-ice/10" : "bg-wow-gold/10";

  const handleLogout = async () => {
    await logout();
    router.refresh();
    router.push(`/${locale}`);
  };

  const topLink = (link: MenuLink) =>
    clsx(
      "px-2.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300",
      link.highlight
        ? clsx(
            "border",
            ice
              ? "border-wow-blue-ice/40 text-wow-blue-ice hover:bg-wow-blue-ice/10"
              : "border-wow-gold/40 text-wow-gold hover:bg-wow-gold/10",
            link.active && accentBg,
          )
        : link.active
          ? clsx(accentText, accentBg)
          : "text-gray-200 hover:bg-white/5",
    );

  const menuIcon = (link: MenuLink, size = 28) =>
    link.icon ? (
      <img
        alt=""
        className="shrink-0 rounded-md border border-white/10"
        height={size}
        src={link.icon}
        width={size}
      />
    ) : null;

  return (
    <HeroUINavbar
      shouldHideOnScroll
      classNames={{
        base: "bg-wow-darker/60 backdrop-blur-xl border-b border-wow-gold/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]",
        wrapper: "px-4 sm:px-6",
      }}
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit shrink-0">
          <NextLink
            className="flex shrink-0 justify-start items-center gap-2 group"
            href={`/${locale}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              alt="Lordaeron"
              className="min-w-8 shrink-0 drop-shadow-[0_0_6px_rgba(199,156,62,0.4)]"
              height={32}
              src="/img/logo/logo.png"
              width={32}
            />
            {/* inside a realm the realm's pill says where one is (its name would repeat Lordaeron's) */}
            <span
              className={clsx(
                "font-heading text-xl font-black wow-gradient-text tracking-widest uppercase",
                realm && "sr-only",
              )}
            >
              Lordaeron
            </span>
          </NextLink>
        </NavbarBrand>
        {realm && (
          <li className="ml-2 shrink-0">
            <RealmSwitcher onNavigate={() => setIsMenuOpen(false)} />
          </li>
        )}
        <ul className="hidden lg:flex gap-1 justify-start items-center ml-3">
          {nodes.map((node) =>
            node.kind === "group" ? (
              <NavbarItem key={node.key}>
                <Dropdown
                  motionProps={OVERLAY_MOTION}
                  placement="bottom-start"
                  shouldBlockScroll={false}
                >
                  <DropdownTrigger>
                    <button
                      className={clsx(
                        "flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2",
                        // open: the realm's colour, not HeroUI's dimmed trigger
                        "aria-expanded:scale-100 aria-expanded:opacity-100",
                        ice
                          ? "focus-visible:ring-wow-blue-ice/50 aria-expanded:text-wow-blue-ice aria-expanded:bg-wow-blue-ice/10"
                          : "focus-visible:ring-wow-gold/50 aria-expanded:text-wow-gold aria-expanded:bg-wow-gold/10",
                        node.active
                          ? clsx(accentText, accentBg)
                          : "text-gray-200 hover:bg-white/5",
                      )}
                      type="button"
                    >
                      {node.label}
                      <svg
                        aria-hidden
                        className="h-3.5 w-3.5 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={node.label}
                    classNames={{
                      base: "bg-[#161b22] border border-wow-gold/15 min-w-[280px]",
                    }}
                    itemClasses={{
                      base: "gap-3 py-2 data-[hover=true]:bg-white/5",
                      title: "text-sm font-medium",
                      description: "text-xs text-gray-400",
                    }}
                  >
                    {node.links.map((link) => (
                      <DropdownItem
                        key={link.key}
                        className={clsx(
                          link.active ? accentText : "text-gray-200",
                        )}
                        description={link.hint}
                        href={link.comingSoon ? undefined : link.href}
                        isDisabled={link.comingSoon}
                        startContent={menuIcon(link, 30)}
                        textValue={link.label}
                      >
                        {link.label}
                        {link.comingSoon && (
                          <span className="ml-2 text-[10px] font-semibold uppercase text-wow-gold">
                            {t("nav.comingSoon")}
                          </span>
                        )}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            ) : (
              <NavbarItem key={node.link.key}>
                <NextLink className={topLink(node.link)} href={node.link.href}>
                  {node.link.label}
                </NextLink>
              </NavbarItem>
            ),
          )}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2 items-center">
          <button
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/10"
            type="button"
            onClick={openVote}
          >
            <img
              alt=""
              className="h-5 w-5 shrink-0"
              height={20}
              src="/img/icons/soul-shard.svg"
              width={20}
            />
            <span className="hidden xl:inline">{t("nav.vote")}</span>
          </button>
          <div className="w-px h-5 shrink-0 bg-default-700/50 mx-1" />
          <LocaleSwitcher />
        </NavbarItem>

        {/* Auth section */}
        <NavbarItem className="hidden md:flex gap-2">
          {loading ? (
            <div className="w-24 h-8 rounded-lg bg-white/5 animate-pulse" />
          ) : user ? (
            /* Logged in: user dropdown */
            <Dropdown
              motionProps={OVERLAY_MOTION}
              placement="bottom-end"
              shouldBlockScroll={false}
            >
              <DropdownTrigger>
                <Button
                  className="glass border-wow-gold/20 hover:border-wow-gold/40 transition-colors gap-2 px-3"
                  size="sm"
                  variant="flat"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wow-gold/40 to-wow-gold-dark/40 flex items-center justify-center border border-wow-gold/30">
                    <span className="text-xs font-bold wow-gradient-text">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-wow-gold text-sm font-medium">
                    {user.username}
                  </span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="User menu"
                classNames={{
                  base: "bg-[#161b22] border border-wow-gold/15",
                }}
              >
                <DropdownItem
                  key="account"
                  className="text-gray-300 hover:text-wow-gold"
                  onPress={() => router.push(`/${locale}/account`)}
                >
                  {t("nav.account")}
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-red-400"
                  color="danger"
                  onPress={handleLogout}
                >
                  {t("nav.logout")}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            /* Not logged in: login/register buttons */
            <>
              <Button
                as={NextLink}
                className="text-gray-200 hover:text-wow-blue"
                href={`/${locale}/login`}
                size="sm"
                variant="light"
              >
                {t("nav.login")}
              </Button>
              <Button
                as={NextLink}
                className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold glow-gold hover:shadow-[0_0_25px_rgba(199,156,62,0.4)] transition-shadow"
                href={registerPath(locale, realm?.slug ?? null)}
                size="sm"
              >
                {t("nav.register")}
              </Button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile */}
      {/* the burger until the menus fit the bar (lg), tablets included */}
      <NavbarContent className="lg:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle className="text-gray-400" />
      </NavbarContent>

      {/* the burger: the same menu as titled sections (the realm's pill stays in the bar), then the vote, the account and the language */}
      <NavbarMenu className="bg-wow-darker/95 backdrop-blur-xl pt-6 border-t border-wow-gold/10">
        <div className="mx-4 mt-2 flex flex-col gap-1 pb-8">
          {nodes.map((node) =>
            node.kind === "group" ? (
              <NavbarMenuItem key={node.key} className="mt-3">
                <p
                  className={clsx(
                    "mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.2em]",
                    accentText,
                  )}
                >
                  {node.label}
                </p>
                <div className="flex flex-col">
                  {node.links.map((link) => (
                    <NextLink
                      key={link.key}
                      className={clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        link.active
                          ? clsx(accentText, accentBg)
                          : "text-gray-200 hover:bg-white/5",
                      )}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {menuIcon(link, 28)}
                      <span className="min-w-0">
                        <span className="block text-base">{link.label}</span>
                        {link.hint && (
                          <span className="block truncate text-xs text-gray-500">
                            {link.hint}
                          </span>
                        )}
                      </span>
                    </NextLink>
                  ))}
                </div>
              </NavbarMenuItem>
            ) : (
              <NavbarMenuItem key={node.link.key} className="mt-3">
                <NextLink
                  className={clsx("block text-lg", topLink(node.link))}
                  href={node.link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {node.link.label}
                </NextLink>
              </NavbarMenuItem>
            ),
          )}

          <div className="shimmer-line w-full my-4" />

          <NavbarMenuItem>
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-lg text-purple-300 transition-all hover:bg-purple-500/10"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                openVote();
              }}
            >
              <img
                alt=""
                className="h-5 w-5"
                height={20}
                src="/img/icons/soul-shard.svg"
                width={20}
              />
              {t("nav.vote")}
            </button>
          </NavbarMenuItem>
          {!loading && user ? (
            <>
              <NavbarMenuItem>
                <NextLink
                  className="text-wow-gold hover:text-wow-gold-light transition-all text-lg block py-2 px-3 rounded-lg hover:bg-wow-gold/5 font-medium"
                  href={`/${locale}/account`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.account")}
                </NextLink>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <button
                  className="text-red-400 hover:text-red-300 transition-all text-lg block py-2 px-3 rounded-lg hover:bg-red-500/5 w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  {t("nav.logout")}
                </button>
              </NavbarMenuItem>
            </>
          ) : !loading ? (
            <>
              <NavbarMenuItem>
                <NextLink
                  className="text-gray-300 hover:text-wow-blue transition-all text-lg block py-2 px-3 rounded-lg hover:bg-wow-blue/5"
                  href={`/${locale}/login`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.login")}
                </NextLink>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <NextLink
                  className="text-wow-gold hover:text-wow-gold-light transition-all text-lg block py-2 px-3 rounded-lg hover:bg-wow-gold/5 font-medium"
                  href={registerPath(locale, realm?.slug ?? null)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.register")}
                </NextLink>
              </NavbarMenuItem>
            </>
          ) : null}
          <NavbarMenuItem className="mt-3 px-3">
            <LocaleSwitcher />
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
