"use client";

import type { ShopPurchaseWithItem } from "@/types";
import type { AccountRealm } from "@/types/account";
import type { AccountSecurity } from "@/components/account/account-header";
import type { AccountTab } from "@/components/account/account-nav";

import { Button } from "@heroui/button";
import clsx from "clsx";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import {
  CheckIcon,
  ChevronIcon,
  ClockIcon,
  WarningIcon,
} from "@/components/account/account-icons";
import {
  AccountPanel,
  StatusDot,
  formatPlayTime,
} from "@/components/account/account-ui";
import {
  CharacterPortrait,
  LevelRaceClass,
  classColor,
} from "@/components/character-identity";
import { launchLine } from "@/lib/launch";
import { realmById, realmPath } from "@/lib/realms";
import { getQualityColor } from "@/lib/shop-utils";

/* The account at a glance: what is left to secure, each realm with its state and the account's characters there, the last purchases */
export function AccountOverview({
  realms,
  purchases,
  security,
  locale,
  onNavigate,
}: {
  realms: AccountRealm[];
  purchases: ShopPurchaseWithItem[];
  security: AccountSecurity | null;
  locale: string;
  onNavigate: (tab: AccountTab, realm?: AccountRealm["slug"]) => void;
}) {
  const t = useTranslations("account");
  const characters = realms.flatMap((r) => r.characters);
  const playtime = characters.reduce((sum, c) => sum + c.totaltime, 0);
  const todo = security
    ? [
        !security.email || !security.emailVerified
          ? t("securityCheckEmail")
          : null,
        security.twoFactor === false ? t("securityCheckTwoFactor") : null,
      ].filter((x): x is string => !!x)
    : [];

  return (
    <div className="space-y-6">
      {todo.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-400/25 bg-amber-500/[0.07] p-5 sm:flex-row sm:items-center">
          <WarningIcon className="h-6 w-6 shrink-0 text-amber-300" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-amber-200">
              {t("securityCheckTitle")}
            </h3>
            <ul className="mt-1 space-y-0.5 text-sm text-gray-300">
              {todo.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
          <Button
            className="shrink-0 bg-amber-400/15 font-semibold text-amber-200"
            size="sm"
            variant="flat"
            onPress={() => onNavigate("security")}
          >
            {t("goToSecurity")}
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t("charactersCount")} value={String(characters.length)} />
        <Stat
          icon={<ClockIcon className="h-4 w-4 text-gray-500" />}
          label={t("totalPlaytime")}
          value={formatPlayTime(playtime)}
        />
        <Stat
          icon={
            todo.length === 0 && security ? (
              <CheckIcon className="h-4 w-4 text-emerald-400" />
            ) : undefined
          }
          label={t("securityLabel")}
          tone={security && todo.length > 0 ? "warning" : "default"}
          value={
            !security
              ? "—"
              : todo.length === 0
                ? t("securityGood")
                : t("securityTodo", { count: todo.length })
          }
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {t("realmsTitle")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {realms.map((realm) => (
            <RealmCard
              key={realm.slug}
              locale={locale}
              realm={realm}
              onCharacters={() => onNavigate("characters", realm.slug)}
            />
          ))}
        </div>
      </div>

      <AccountPanel
        actions={
          purchases.length > 0 && (
            <Button
              className="text-wow-gold-light"
              endContent={<ChevronIcon className="h-3.5 w-3.5" />}
              size="sm"
              variant="light"
              onPress={() => onNavigate("purchases")}
            >
              {t("viewAllPurchases")}
            </Button>
          )
        }
        padded={purchases.length === 0}
        title={t("recentPurchases")}
      >
        {purchases.length === 0 ? (
          <p className="text-sm text-gray-400">{t("noPurchases")}</p>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {purchases.slice(0, 3).map((p) => (
              <PurchaseLine key={p.id} locale={locale} purchase={p} />
            ))}
          </ul>
        )}
      </AccountPanel>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-xs text-gray-400">
        {icon}
        {label}
      </p>
      <p
        className={clsx(
          "mt-1 text-lg font-semibold",
          tone === "warning" ? "text-amber-300" : "text-gray-100",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// a realm: its state (open and up, its players; its opening; its name reservation), the account's characters there, the way to them
function RealmCard({
  realm,
  locale,
  onCharacters,
}: {
  realm: AccountRealm;
  locale: string;
  onCharacters: () => void;
}) {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const ice = realm.accent === "ice";
  const best = [...realm.characters].sort(
    (a, b) => b.level - a.level || b.totaltime - a.totaltime,
  )[0];

  return (
    <div
      className={clsx(
        "glass flex flex-col rounded-2xl border p-5",
        ice ? "border-wow-blue-ice/20" : "border-wow-gold/20",
      )}
    >
      {/* the name, then its state beside it, or under it on a narrow card */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <h4
          className={clsx(
            "text-lg font-bold",
            ice ? "wow-ice-text" : "wow-gradient-text",
          )}
        >
          {realm.name}
        </h4>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-300">
          {realm.error ? (
            <span className="text-gray-500">{t("realmUnavailable")}</span>
          ) : !realm.open ? (
            <span className="text-wow-blue-ice">
              {realm.reservation
                ? t("realmReservation")
                : realm.launchAt
                  ? t("realmOpensOn", {
                      date: launchLine(realm.launchAt, locale),
                    })
                  : t("realmSoon")}
            </span>
          ) : (
            <>
              <StatusDot pulse online={realm.online} />
              <span
                className={realm.online ? "text-emerald-300" : "text-gray-400"}
              >
                {realm.online ? tCommon("online") : tCommon("offline")}
              </span>
              {realm.online && (
                <span className="text-gray-500">
                  · {t("playersOnline", { count: realm.playersOnline })}
                </span>
              )}
            </>
          )}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {realm.characters.slice(0, 5).map((c) => (
            <span
              key={c.guid}
              className="rounded-full ring-2 ring-[#0d1117]"
              title={c.name}
            >
              <CharacterPortrait
                cls={c.class}
                gender={c.gender}
                race={c.race}
                size={34}
              />
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-300">
          {t("yourCharacters", { count: realm.characters.length })}
        </p>
      </div>

      {best && (
        <p className="mt-3 text-sm text-gray-400">
          {t("highestLevel")}{" "}
          <span
            className="font-semibold"
            style={{ color: classColor(best.class) }}
          >
            {best.name}
          </span>{" "}
          <LevelRaceClass
            separated
            className="text-xs"
            cls={best.class}
            level={best.level}
            race={best.race}
          />
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button
          className={clsx(
            "font-semibold",
            ice
              ? "bg-wow-blue-ice/15 text-wow-blue-ice"
              : "bg-wow-gold/15 text-wow-gold-light",
          )}
          isDisabled={
            realm.characters.length === 0 && realm.deleted.length === 0
          }
          size="sm"
          variant="flat"
          onPress={onCharacters}
        >
          {t("viewCharacters")}
        </Button>
        <Button
          as={NextLink}
          className="text-gray-300"
          endContent={<ChevronIcon className="h-3.5 w-3.5" />}
          href={realmPath(locale, realm.slug)}
          size="sm"
          variant="light"
        >
          {t("realmPage")}
        </Button>
      </div>
    </div>
  );
}

function PurchaseLine({
  purchase: p,
  locale,
}: {
  purchase: ShopPurchaseWithItem;
  locale: string;
}) {
  const name =
    (p[`item_name_${locale}` as keyof ShopPurchaseWithItem] as string) ||
    p.item_name_en;

  return (
    <li className="flex items-center gap-3 px-5 py-3 sm:px-6">
      {p.item_icon_url ? (
        <img
          alt=""
          className="h-8 w-8 shrink-0 rounded-md border border-white/10"
          src={p.item_icon_url}
        />
      ) : (
        <span className="h-8 w-8 shrink-0 rounded-md border border-white/10 bg-white/[0.04]" />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={clsx("truncate text-sm", getQualityColor(p.item_quality))}
        >
          {name}
        </p>
        <p className="truncate text-xs text-gray-500">
          {new Date(p.created_at).toLocaleDateString(locale)} ·{" "}
          {realmById(p.realm_id)?.name ?? ""} · {p.character_name}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm text-purple-300">
        <Image alt="" height={14} src="/img/icons/soul-shard.svg" width={14} />
        {p.price_paid}
      </span>
    </li>
  );
}
