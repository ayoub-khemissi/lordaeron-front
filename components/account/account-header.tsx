"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import {
  CheckIcon,
  ShieldIcon,
  WarningIcon,
} from "@/components/account/account-icons";
import { DEFAULT_REALM, realmPath } from "@/lib/realms";
import {
  AccountAvatar,
  AvatarPicker,
} from "@/components/account/account-avatar";
import { useAuth } from "@/lib/auth-context";

export interface AccountSecurity {
  email: string | null;
  emailVerified: boolean;
  // null: the account may not use it (a game master's) or its state is unknown
  twoFactor: boolean | null;
}

/* The account's identity at the top of its page: its initial, its name, its address, since when, its security at a glance, its Soul
   Shards with the way to the shop */
export function AccountHeader({
  username,
  joindate,
  soulShards,
  security,
  locale,
  onSecurity,
}: {
  username: string;
  joindate: string;
  soulShards: number;
  security: AccountSecurity | null;
  locale: string;
  onSecurity: () => void;
}) {
  const t = useTranslations("account");
  const { user, refresh } = useAuth();
  const [picking, setPicking] = useState(false);
  const avatar = user?.avatar ?? null;
  const since = new Date(joindate).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-wow-gold/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(199,156,62,0.16),transparent_55%)]"
      />
      <div className="relative flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* the avatar: a click chooses another (its pencil on hover, always on a phone) */}
          <button
            aria-label={t("avatarChange")}
            className="group relative shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-wow-gold"
            title={t("avatarChange")}
            type="button"
            onClick={() => setPicking(true)}
          >
            <AccountAvatar icon={avatar} name={username} size={64} />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-wow-gold/50 bg-[#0d1117] text-wow-gold-light transition-opacity md:opacity-0 md:group-hover:opacity-100">
              <svg
                aria-hidden
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" />
              </svg>
            </span>
          </button>
          {picking && (
            <AvatarPicker
              isOpen
              current={avatar}
              name={username}
              onClose={() => setPicking(false)}
              onSaved={refresh}
            />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-gray-50">
              {username}
            </h1>
            {security?.email && (
              <p className="truncate text-sm text-gray-400">{security.email}</p>
            )}
            <p className="truncate text-xs text-gray-500">
              {t("memberSince", { date: since })}
            </p>
            {security && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <SecurityChip
                  label={
                    !security.email
                      ? t("noEmail")
                      : security.emailVerified
                        ? t("emailVerified")
                        : t("emailUnverified")
                  }
                  ok={!!security.email && security.emailVerified}
                  onPress={onSecurity}
                />
                {security.twoFactor !== null && (
                  <SecurityChip
                    shield
                    label={
                      security.twoFactor ? t("twoFactorOn") : t("twoFactorOff")
                    }
                    ok={security.twoFactor}
                    onPress={onSecurity}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-purple-400/20 bg-purple-500/[0.07] px-4 py-3 md:min-w-[15rem]">
          <div>
            <p className="text-xs text-gray-400">{t("soulShards")}</p>
            <p className="flex items-center gap-1.5 text-xl font-bold text-purple-300">
              <Image
                alt=""
                height={18}
                src="/img/icons/soul-shard.svg"
                width={18}
              />
              {soulShards.toLocaleString(locale)}
            </p>
          </div>
          <Button
            as={NextLink}
            className="bg-purple-500/15 font-semibold text-purple-200 data-[hover=true]:bg-purple-500/25"
            href={realmPath(locale, DEFAULT_REALM, "/shop")}
            size="sm"
            variant="flat"
          >
            {t("openShop")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SecurityChip({
  ok,
  label,
  shield = false,
  onPress,
}: {
  ok: boolean;
  label: string;
  shield?: boolean;
  onPress: () => void;
}) {
  const Icon = ok ? (shield ? ShieldIcon : CheckIcon) : WarningIcon;

  return (
    <Chip
      as="button"
      className={
        ok
          ? "cursor-pointer border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
          : "cursor-pointer border-amber-400/40 bg-amber-500/10 text-amber-300"
      }
      size="sm"
      startContent={<Icon className="ml-1 h-3.5 w-3.5" />}
      variant="bordered"
      onClick={onPress}
    >
      {label}
    </Chip>
  );
}
