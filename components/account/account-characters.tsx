"use client";

import type { DeletedCharacter } from "@/types";
import type { AccountCharacter, AccountRealm } from "@/types/account";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tab, Tabs } from "@heroui/tabs";
import clsx from "clsx";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronIcon,
  ClockIcon,
} from "@/components/account/account-icons";
import {
  AccountPanel,
  SectionHeading,
  StatusDot,
  formatPlayTime,
} from "@/components/account/account-ui";
import {
  CharacterBlock,
  CharacterPortrait,
  LevelRaceClass,
  classColor,
} from "@/components/character-identity";
import {
  ChallengeIcon,
  ChallengeTags,
} from "@/components/challenges/challenge-parts";
import { RestoreCharacterModal } from "@/components/restore-character-modal";
import { realmPath } from "@/lib/realms";

// the characters a realm lets an account have (the client's character screen)
const MAX_CHARACTERS = 10;
// the days a deleted character stays restorable (CharDelete.KeepDays)
const KEEP_DAYS = 30;

/* The account's characters, realm by realm: each opens its armory page; their order on the character screen; the deleted ones still
   restorable */
export function AccountCharacters({
  realms,
  realm: selected,
  onRealm,
  locale,
  soulShards,
  restoreCost,
  onChanged,
}: {
  realms: AccountRealm[];
  realm: AccountRealm["slug"];
  onRealm: (slug: AccountRealm["slug"]) => void;
  locale: string;
  soulShards: number;
  restoreCost: number;
  onChanged: () => Promise<void>;
}) {
  const t = useTranslations("account");
  const realm = realms.find((r) => r.slug === selected) ?? realms[0];
  const [reordering, setReordering] = useState(false);
  const [order, setOrder] = useState<AccountCharacter[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [restoring, setRestoring] = useState<DeletedCharacter | null>(null);

  if (!realm) return null;

  const startReorder = () => {
    setOrder([...realm.characters]);
    setSaveError(false);
    setReordering(true);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);

    next.splice(to, 0, moved);
    setOrder(next);
  };

  const saveOrder = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch("/api/account/reorder-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: order.map((c) => c.guid),
          realm: realm.slug,
        }),
      });

      if (!res.ok) throw new Error();
      await onChanged();
      setReordering(false);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const restore = async (guid: number) => {
    const res = await fetch("/api/account/restore-character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guid, realm: realm.slug }),
    });
    const data = await res.json();

    if (data.success) {
      await onChanged();

      return { success: true, name: data.name };
    }

    return { success: false, error: data.error };
  };

  return (
    <div>
      <SectionHeading
        description={t("charactersIntro")}
        title={t("navCharacters")}
      />

      {realms.length > 1 && (
        <Tabs
          aria-label={t("realm")}
          className="mb-4"
          classNames={{
            tabList:
              "gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1",
            cursor: "bg-white/[0.08] shadow-none",
            tab: "h-9 px-4",
            tabContent:
              "text-sm text-gray-400 group-data-[selected=true]:text-gray-50",
          }}
          selectedKey={realm.slug}
          variant="solid"
          onSelectionChange={(key) => {
            setReordering(false);
            onRealm(key as AccountRealm["slug"]);
          }}
        >
          {realms.map((r) => (
            <Tab
              key={r.slug}
              title={
                <span className="flex items-center gap-2">
                  {r.name}
                  <span className="rounded-full bg-white/[0.06] px-1.5 text-xs text-gray-400">
                    {r.characters.length}
                  </span>
                </span>
              }
            />
          ))}
        </Tabs>
      )}

      <div className="space-y-6">
        <AccountPanel
          actions={
            !reordering &&
            realm.characters.length > 1 && (
              <Button
                className="bg-white/[0.05] text-gray-200"
                size="sm"
                variant="flat"
                onPress={startReorder}
              >
                {t("reorder")}
              </Button>
            )
          }
          description={
            reordering
              ? t("reorderDescription")
              : t("slotsUsed", {
                  count: realm.characters.length,
                  max: MAX_CHARACTERS,
                })
          }
          padded={reordering || realm.characters.length === 0 || !!realm.error}
          title={realm.name}
        >
          {realm.error ? (
            <p className="text-sm text-gray-400">{t("realmUnavailable")}</p>
          ) : realm.characters.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400">{t("noCharacters")}</p>
              <Button
                as={NextLink}
                className="mt-3 text-wow-gold-light"
                href={realmPath(locale, realm.slug, "/how-to")}
                size="sm"
                variant="light"
              >
                {t("howToPlay")}
              </Button>
            </div>
          ) : reordering ? (
            <div>
              <ol className="space-y-2">
                {order.map((c, i) => (
                  <li
                    key={c.guid}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2"
                  >
                    <span className="w-5 text-center font-mono text-xs text-gray-500">
                      {i + 1}
                    </span>
                    <CharacterPortrait
                      cls={c.class}
                      gender={c.gender}
                      race={c.race}
                      size={32}
                    />
                    <span
                      className="min-w-0 flex-1 truncate font-semibold"
                      style={{ color: classColor(c.class) }}
                    >
                      {c.name}
                    </span>
                    <Button
                      isIconOnly
                      aria-label={t("moveUp")}
                      className="text-gray-300"
                      isDisabled={i === 0}
                      size="sm"
                      variant="light"
                      onPress={() => move(i, i - 1)}
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      aria-label={t("moveDown")}
                      className="text-gray-300"
                      isDisabled={i === order.length - 1}
                      size="sm"
                      variant="light"
                      onPress={() => move(i, i + 1)}
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ol>
              {saveError && (
                <p className="mt-3 text-sm text-red-400">{t("reorderError")}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  className="text-gray-400"
                  size="sm"
                  variant="light"
                  onPress={() => setReordering(false)}
                >
                  {t("cancelReorder")}
                </Button>
                <Button
                  className="bg-gradient-to-r from-wow-gold to-wow-gold-light font-bold text-black"
                  isLoading={saving}
                  size="sm"
                  onPress={saveOrder}
                >
                  {t("saveOrder")}
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {realm.characters.map((c) => (
                <li key={c.guid}>
                  <CharacterLine
                    character={c}
                    href={realmPath(locale, realm.slug, `/armory/${c.name}`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </AccountPanel>

        {realm.deleted.length > 0 && (
          <AccountPanel
            description={t("deletedHint", {
              cost: restoreCost,
              days: KEEP_DAYS,
            })}
            padded={false}
            title={t("deletedCharacters")}
          >
            <ul className="divide-y divide-white/[0.05]">
              {realm.deleted.map((c) => {
                const left = Math.max(
                  0,
                  KEEP_DAYS -
                    Math.floor((Date.now() / 1000 - c.deleteDate) / 86400),
                );
                const full = realm.characters.length >= MAX_CHARACTERS;

                return (
                  <li
                    key={c.guid}
                    className="flex flex-wrap items-center gap-3 px-5 py-3 sm:px-6"
                  >
                    <span className="opacity-50 grayscale">
                      <CharacterPortrait
                        cls={c.class}
                        gender={c.gender}
                        race={c.race}
                        size={36}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-400">
                        {c.name}
                      </p>
                      <LevelRaceClass
                        separated
                        className="block truncate text-xs"
                        cls={c.class}
                        level={c.level}
                        race={c.race}
                      />
                    </div>
                    <Chip
                      className={
                        left <= 7
                          ? "bg-red-500/10 text-red-300"
                          : "bg-white/[0.05] text-gray-400"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {t("daysRemaining", { days: left })}
                    </Chip>
                    <Button
                      className={
                        full
                          ? "bg-white/[0.04] text-gray-500"
                          : "bg-wow-gold/15 font-semibold text-wow-gold-light"
                      }
                      isDisabled={full}
                      size="sm"
                      startContent={
                        !full && (
                          <Image
                            alt=""
                            height={14}
                            src="/img/icons/soul-shard.svg"
                            width={14}
                          />
                        )
                      }
                      variant="flat"
                      onPress={() => setRestoring(c)}
                    >
                      {full ? t("slotsFull") : t("restoreCharacter")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </AccountPanel>
        )}
      </div>

      <RestoreCharacterModal
        balance={soulShards}
        character={restoring}
        characterCount={realm.characters.length}
        isOpen={!!restoring}
        restoreCost={restoreCost}
        onClose={() => setRestoring(null)}
        onRestore={restore}
      />
    </div>
  );
}

// a character: the site's character block (the whole line opens its armory page, its name underlined on hover) with its challenge, its
// play time
function CharacterLine({
  character: c,
  href,
}: {
  character: AccountCharacter;
  href: string;
}) {
  const tCommon = useTranslations("common");
  const tChallenges = useTranslations("challenges");
  const challenge = c.challenge;

  return (
    <Card
      isPressable
      as={NextLink}
      className="group group/char w-full rounded-none bg-transparent shadow-none data-[hover=true]:bg-white/[0.03]"
      href={href}
      radius="none"
    >
      <CardBody className="flex flex-row items-center gap-3 overflow-visible px-5 py-3 sm:gap-4 sm:px-6">
        <CharacterBlock
          character={c}
          className="flex-1"
          online={!!c.online}
          size={42}
        >
          {challenge && (
            <span className="mt-1 flex min-w-0 items-center gap-1.5">
              <ChallengeIcon
                challenge={challenge.challenge}
                done={challenge.completed}
                size={16}
              />
              <span
                className={clsx(
                  "truncate text-xs",
                  challenge.completed ? "text-wow-gold" : "text-wow-gold-light",
                )}
                title={
                  challenge.completed
                    ? tChallenges("armoryCompleted")
                    : tChallenges("armoryInProgress")
                }
              >
                {challenge.challenge.name}
              </span>
              <ChallengeTags
                authentic={challenge.authentic}
                pvp={!challenge.completed && challenge.pvp}
              />
            </span>
          )}
        </CharacterBlock>
        <div className="hidden shrink-0 flex-col items-end gap-1 text-xs sm:flex">
          <span className="flex items-center gap-1.5 text-gray-300">
            <ClockIcon className="h-3.5 w-3.5 text-gray-500" />
            {formatPlayTime(c.totaltime)}
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <StatusDot online={!!c.online} />
            {c.online ? tCommon("online") : tCommon("offline")}
          </span>
        </div>
        <ChevronIcon className="h-4 w-4 shrink-0 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-wow-gold" />
      </CardBody>
    </Card>
  );
}
