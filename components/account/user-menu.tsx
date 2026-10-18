"use client";

import { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import clsx from "clsx";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import {
  AccountAvatar,
  AvatarPicker,
} from "@/components/account/account-avatar";
import { useAuth } from "@/lib/auth-context";
import { DEFAULT_REALM, realmPath, type RealmSlug } from "@/lib/realms";
import { OVERLAY_MOTION } from "@/lib/overlay-motion";

const icon = (name: string) =>
  `https://wow.zamimg.com/images/wow/icons/medium/${name}.jpg`;

// the account's sections (app/[locale]/account: their #hash), each with the game icon that says it
const SECTIONS = [
  { tab: "overview", label: "account.navOverview", icon: "inv_misc_book_11" },
  {
    tab: "characters",
    label: "account.navCharacters",
    icon: "inv_misc_grouplooking",
  },
  {
    tab: "security",
    label: "account.navSecurity",
    icon: "spell_holy_powerwordshield",
  },
  { tab: "purchases", label: "account.navPurchases", icon: "inv_misc_bag_08" },
] as const;

function GameGlyph({
  name,
  danger = false,
}: {
  name: string;
  danger?: boolean;
}) {
  return (
    <img
      alt=""
      className={clsx(
        "h-6 w-6 shrink-0 rounded border shadow-[inset_0_0_4px_rgba(0,0,0,0.6)]",
        danger ? "border-red-400/40" : "border-wow-gold/30",
      )}
      draggable={false}
      src={icon(name)}
    />
  );
}

// the account page's section: its #hash on the page itself (no navigation, the page follows the hash), else the page opened at it
function useOpenAccount() {
  const router = useRouter();
  const locale = useLocale();

  return (tab: string) => {
    const path = `/${locale}/account`;

    if (window.location.pathname === path) window.location.hash = tab;
    else router.push(`${path}#${tab}`);
  };
}

/* The bar's account menu (Ayoub, 18/10/2026: make it beautiful, with the game's icons): the avatar and name as its button; inside, the
   account's identity and Soul Shards, its sections, the shop, the avatar's choice, the sign-out */
export function UserMenu({
  realm,
  onLogout,
}: {
  realm: RealmSlug | null;
  onLogout: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, refresh } = useAuth();
  const openAccount = useOpenAccount();
  const [picking, setPicking] = useState(false);

  if (!user) return null;

  return (
    <>
      <Dropdown
        classNames={{
          content:
            "min-w-[260px] border border-wow-gold/20 bg-[#0f141b]/95 p-0 backdrop-blur-xl",
        }}
        motionProps={OVERLAY_MOTION}
        placement="bottom-end"
        shouldBlockScroll={false}
      >
        <DropdownTrigger>
          <Button
            className="glass h-9 gap-2 border border-wow-gold/20 pl-1 pr-3 transition-colors hover:border-wow-gold/40"
            size="sm"
            variant="flat"
          >
            <AccountAvatar icon={user.avatar} name={user.username} size={28} />
            <span className="max-w-[9rem] truncate text-sm font-semibold text-wow-gold">
              {user.username}
            </span>
            <svg
              aria-hidden
              className="h-3 w-3 text-wow-gold/60"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={t("nav.userMenu")}
          classNames={{ base: "p-1.5" }}
          itemClasses={{
            base: "gap-3 rounded-lg px-2.5 py-2 data-[hover=true]:bg-white/[0.05] text-gray-200",
            title: "text-sm",
          }}
          onAction={(key) => {
            const k = String(key);

            if (k === "logout") onLogout();
            else if (k === "avatar") setPicking(true);
            else if (k === "shop")
              router.push(realmPath(locale, realm ?? DEFAULT_REALM, "/shop"));
            else if (k !== "identity") openAccount(k);
          }}
        >
          <DropdownSection showDivider aria-label={user.username}>
            <DropdownItem
              key="identity"
              isReadOnly
              className="cursor-default data-[hover=true]:bg-transparent"
              textValue={user.username}
            >
              <div className="flex items-center gap-3 py-1">
                <AccountAvatar
                  icon={user.avatar}
                  name={user.username}
                  size={44}
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-gray-50">
                    {user.username}
                  </p>
                  {user.soulShards != null && (
                    <p className="flex items-center gap-1 text-xs text-purple-300">
                      <Image
                        alt=""
                        height={13}
                        src="/img/icons/soul-shard.svg"
                        width={13}
                      />
                      {user.soulShards.toLocaleString(locale)}{" "}
                      {t("account.soulShards")}
                    </p>
                  )}
                </div>
              </div>
            </DropdownItem>
          </DropdownSection>
          <DropdownSection showDivider aria-label={t("nav.account")}>
            {SECTIONS.map((s) => (
              <DropdownItem
                key={s.tab}
                startContent={<GameGlyph name={s.icon} />}
                textValue={t(s.label)}
              >
                {t(s.label)}
              </DropdownItem>
            ))}
          </DropdownSection>
          <DropdownSection showDivider aria-label={t("account.openShop")}>
            <DropdownItem
              key="shop"
              startContent={<GameGlyph name="inv_misc_coin_01" />}
              textValue={t("account.openShop")}
            >
              {t("account.openShop")}
            </DropdownItem>
            <DropdownItem
              key="avatar"
              startContent={
                <AccountAvatar
                  icon={user.avatar}
                  name={user.username}
                  size={24}
                />
              }
              textValue={t("account.avatarChange")}
            >
              {t("account.avatarChange")}
            </DropdownItem>
          </DropdownSection>
          <DropdownSection aria-label={t("nav.logout")}>
            <DropdownItem
              key="logout"
              className="text-red-300 data-[hover=true]:bg-red-500/10 data-[hover=true]:text-red-200"
              startContent={<GameGlyph danger name="inv_misc_rune_01" />}
              textValue={t("nav.logout")}
            >
              {t("nav.logout")}
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
      {picking && (
        <AvatarPicker
          isOpen
          current={user.avatar ?? null}
          name={user.username}
          onClose={() => setPicking(false)}
          onSaved={refresh}
        />
      )}
    </>
  );
}

/* The burger's account block: the avatar, the name and the Soul Shards, then the account's sections and the sign-out, with the same
   icons */
export function UserMenuMobile({
  onNavigate,
  onLogout,
}: {
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();
  const openAccount = useOpenAccount();

  if (!user) return null;

  return (
    <div className="mt-4 rounded-2xl border border-wow-gold/15 bg-white/[0.02] p-3">
      <div className="flex items-center gap-3 px-1 pb-3">
        <AccountAvatar icon={user.avatar} name={user.username} size={44} />
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-gray-50">
            {user.username}
          </p>
          {user.soulShards != null && (
            <p className="flex items-center gap-1 text-xs text-purple-300">
              <Image
                alt=""
                height={13}
                src="/img/icons/soul-shard.svg"
                width={13}
              />
              {user.soulShards.toLocaleString(locale)} {t("account.soulShards")}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {SECTIONS.map((s) => (
          <button
            key={s.tab}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5 text-left text-sm text-gray-200 active:bg-white/[0.08]"
            type="button"
            onClick={() => {
              onNavigate();
              openAccount(s.tab);
            }}
          >
            <GameGlyph name={s.icon} />
            {t(s.label)}
          </button>
        ))}
      </div>
      <button
        className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-red-300 active:bg-red-500/10"
        type="button"
        onClick={() => {
          onNavigate();
          onLogout();
        }}
      >
        <GameGlyph danger name="inv_misc_rune_01" />
        {t("nav.logout")}
      </button>
    </div>
  );
}
