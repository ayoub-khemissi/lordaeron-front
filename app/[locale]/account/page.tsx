"use client";

import type { Character, AccountInfo, DeletedCharacter } from "@/types";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import NextLink from "next/link";

import { useAuth } from "@/lib/auth-context";
import { ChangePasswordForm } from "@/components/change-password-form";
import { RestoreCharacterModal } from "@/components/restore-character-modal";
import { PurchaseHistory } from "@/components/shop/purchase-history";
import {
  RACE_NAMES,
  CLASS_NAMES,
  CLASS_COLORS,
  ALLIANCE_RACES,
} from "@/lib/shop-utils";

function formatPlayTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

export default function AccountPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [realm, setRealm] = useState<{ online: boolean; name: string } | null>(
    null,
  );
  const [soulShards, setSoulShards] = useState<number>(0);
  const [accountBan, setAccountBan] = useState<{
    bandate: number;
    unbandate: number;
    bannedby: string;
    banreason: string;
  } | null>(null);
  const [ipBan, setIpBan] = useState<{
    bandate: number;
    unbandate: number;
    bannedby: string;
    banreason: string;
  } | null>(null);
  const [deletedCharacters, setDeletedCharacters] = useState<
    DeletedCharacter[]
  >([]);
  const [restoreCost, setRestoreCost] = useState(0);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [purchases, setPurchases] = useState<
    import("@/types").ShopPurchaseWithItem[]
  >([]);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash === "#purchases")
      return "purchases";

    return "account";
  });
  const [selectedDeletedChar, setSelectedDeletedChar] =
    useState<DeletedCharacter | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderList, setReorderList] = useState<Character[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace(`/${locale}/login`);

      return;
    }

    const fetchAccount = async () => {
      try {
        const [res, deletedRes, purchasesRes] = await Promise.all([
          fetch("/api/account"),
          fetch("/api/account/deleted-characters"),
          fetch("/api/shop/purchases"),
        ]);

        if (res.status === 401) {
          router.replace(`/${locale}/login`);

          return;
        }
        const data = await res.json();

        setAccount(data.account);
        setCharacters(data.characters || []);
        setRealm(data.realm);
        setSoulShards(data.soulShards ?? 0);
        setAccountBan(data.accountBan || null);
        setIpBan(data.ipBan || null);

        if (deletedRes.ok) {
          const deletedData = await deletedRes.json();

          setDeletedCharacters(deletedData.deletedCharacters || []);
          setRestoreCost(deletedData.restoreCost || 0);
        }

        if (purchasesRes.ok) {
          const purchasesData = await purchasesRes.json();

          setPurchases(purchasesData.purchases || []);
        }
      } catch {
        router.replace(`/${locale}/login`);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [authUser, authLoading, locale, router]);

  const refreshData = async () => {
    const [res, deletedRes] = await Promise.all([
      fetch("/api/account"),
      fetch("/api/account/deleted-characters"),
    ]);

    if (res.ok) {
      const data = await res.json();

      setAccount(data.account);
      setCharacters(data.characters || []);
      setSoulShards(data.soulShards ?? 0);
    }
    if (deletedRes.ok) {
      const deletedData = await deletedRes.json();

      setDeletedCharacters(deletedData.deletedCharacters || []);
    }
  };

  const handleRestore = async (
    guid: number,
  ): Promise<{ success: boolean; error?: string; name?: string }> => {
    const res = await fetch("/api/account/restore-character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guid }),
    });

    const data = await res.json();

    if (data.success) {
      await refreshData();

      return { success: true, name: data.name };
    }

    return { success: false, error: data.error };
  };

  const startReordering = () => {
    setReorderList([...characters]);
    setIsReordering(true);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      setOverIndex(null);

      return;
    }
    setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);

      return;
    }
    const newList = [...reorderList];
    const [moved] = newList.splice(dragIndex, 1);

    newList.splice(index, 0, moved);
    setReorderList(newList);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch("/api/account/reorder-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reorderList.map((c) => c.guid) }),
      });

      if (res.ok) {
        setCharacters(reorderList);
        setIsReordering(false);
      }
    } catch {
      // silently fail
    } finally {
      setSavingOrder(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  if (!account) return null;

  return (
    <div
      className="relative bg-cover bg-center bg-fixed overflow-x-hidden"
      style={{
        backgroundImage:
          "url('/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_Andorhal_1920x1080.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />

      <div className="relative container mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
        >
          <h1 className="text-4xl font-black wow-gradient-text mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-300">{t("subtitle")}</p>
          <div className="shimmer-line w-24 mx-auto mt-4" />
        </motion.div>

        {/* Ban alerts */}
        {(accountBan || ipBan) && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            {accountBan && (
              <BanCard
                bandate={accountBan.bandate}
                banreason={accountBan.banreason}
                locale={locale}
                t={t}
                type="account"
                unbandate={accountBan.unbandate}
              />
            )}
            {ipBan && (
              <BanCard
                bandate={ipBan.bandate}
                banreason={ipBan.banreason}
                locale={locale}
                t={t}
                type="ip"
                unbandate={ipBan.unbandate}
              />
            )}
          </motion.div>
        )}

        {/* Desktop — tabs */}
        <div className="hidden sm:block mb-8">
          <Tabs
            classNames={{
              tabList:
                "gap-4 w-full relative rounded-none p-0 border-b border-wow-gold/10",
              cursor: "w-full bg-wow-gold",
              tab: "max-w-fit px-0 h-10",
              tabContent:
                "group-data-[selected=true]:text-wow-gold text-gray-400",
            }}
            selectedKey={activeTab}
            variant="underlined"
            onSelectionChange={(key) => setActiveTab(key as string)}
          >
            <Tab key="account" title={t("info")} />
            <Tab key="characters" title={t("characters")} />
            <Tab key="purchases" title={t("purchaseHistory")} />
          </Tabs>
        </div>

        {/* Mobile — select */}
        <div className="sm:hidden mb-6">
          <Select
            className="w-full"
            classNames={{
              trigger: "glass border-wow-gold/20 hover:border-wow-gold/30",
              popoverContent: "bg-[#161b22] border border-wow-gold/15",
            }}
            label={t("title")}
            selectedKeys={[activeTab]}
            size="sm"
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0] as string;

              if (key) setActiveTab(key);
            }}
          >
            <SelectItem key="account">{t("info")}</SelectItem>
            <SelectItem key="characters">{t("characters")}</SelectItem>
            <SelectItem key="purchases">{t("purchaseHistory")}</SelectItem>
          </Select>
        </div>

        {activeTab === "account" && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* Account Info Card */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative overflow-hidden rounded-2xl glow-gold">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25"
                  style={{
                    backgroundImage:
                      "url('/img/Burning Crusade Classic Overlords of Outland Screenshots 1080p/BCC_Overlords_of_Outland_Ogrila_1920x1080.jpg')",
                  }}
                />
                <div className="relative glass border-wow-gold/15 rounded-2xl p-6">
                  <h2 className="text-lg font-bold wow-gradient-text mb-5">
                    {t("info")}
                  </h2>

                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-wow-gold/30 to-wow-gold-dark/30 flex items-center justify-center border-2 border-wow-gold/40 glow-gold-strong">
                      <span className="text-3xl font-black wow-gradient-text">
                        {account.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <InfoRow
                      highlight
                      label={t("username")}
                      value={account.username}
                    />
                    <InfoRow label={t("email")} value={account.email} />
                    <InfoRow
                      label={t("joinDate")}
                      value={new Date(account.joindate).toLocaleDateString(
                        locale,
                      )}
                    />
                    <InfoRow label={t("soulShards")}>
                      <span className="flex items-center gap-1.5">
                        <img
                          alt="Soul Shard"
                          className="w-4 h-4"
                          src="/img/icons/soul-shard.svg"
                        />
                        <span className="text-purple-400 text-sm font-medium">
                          {soulShards.toLocaleString()}
                        </span>
                      </span>
                    </InfoRow>
                  </div>
                </div>
              </div>

              {/* Realm Info Card */}
              {realm && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="glass border-wow-blue/15 rounded-2xl p-6 glow-blue">
                    <h2 className="text-lg font-bold wow-ice-text mb-4">
                      {t("realmInfo")}
                    </h2>
                    <div className="space-y-3">
                      <InfoRow label={t("realmName")} value={realm.name} />
                      <InfoRow label={t("realmStatus")}>
                        <span className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            {realm.online && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${realm.online ? "bg-green-400" : "bg-red-500"}`}
                            />
                          </span>
                          <span
                            className={
                              realm.online ? "text-green-400" : "text-red-400"
                            }
                          >
                            {realm.online
                              ? tCommon("online")
                              : tCommon("offline")}
                          </span>
                        </span>
                      </InfoRow>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Change Password */}
              <ChangePasswordForm />
            </motion.div>
          </div>
        )}

        {activeTab === "characters" && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative overflow-hidden rounded-2xl glow-gold">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                  backgroundImage:
                    "url('/img/Burning Crusade Classic  Black Temple Screenshots 1080/BCC_BlackTemple_Entrance.jpg')",
                }}
              />
              <div className="relative glass border-wow-gold/15 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold wow-gradient-text">
                    {t("characters")}
                  </h2>
                  {characters.length > 1 && !isReordering && (
                    <Button
                      className="bg-wow-gold/10 border border-wow-gold/20 text-wow-gold text-xs font-semibold"
                      size="sm"
                      variant="flat"
                      onPress={startReordering}
                    >
                      {t("reorder")}
                    </Button>
                  )}
                </div>

                {characters.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">{t("noCharacters")}</p>
                  </div>
                ) : isReordering ? (
                  <div>
                    <p className="text-gray-400 text-xs mb-4">
                      {t("reorderDescription")}
                    </p>
                    <div className="space-y-2">
                      {reorderList.map((char, index) => {
                        const faction = ALLIANCE_RACES.includes(char.race)
                          ? "alliance"
                          : "horde";
                        const isDragged = dragIndex === index;
                        const isOver = overIndex === index;

                        return (
                          <div
                            key={char.guid}
                            draggable
                            className={`relative transition-colors ${isDragged ? "opacity-30" : ""} cursor-grab active:cursor-grabbing`}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragStart={() => handleDragStart(index)}
                            onDrop={() => handleDrop(index)}
                          >
                            {/* Drop indicator line — above */}
                            {isOver &&
                              dragIndex !== null &&
                              dragIndex > index && (
                                <div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-wow-gold rounded-full shadow-[0_0_8px_rgba(199,156,62,0.6)] z-10" />
                              )}
                            <div
                              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all select-none ${
                                isOver
                                  ? "border-wow-gold/40 bg-wow-gold/5"
                                  : "border-white/5 bg-wow-darker/40"
                              }`}
                            >
                              {/* Grip handle */}
                              <div className="shrink-0 text-gray-500 hover:text-wow-gold/70 transition-colors">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M2 4h12v1.5H2V4zm0 3.25h12v1.5H2v-1.5zm0 3.25h12V12H2v-1.5z" />
                                </svg>
                              </div>
                              <span className="text-wow-gold/40 text-xs font-mono w-5 text-center shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-200 text-sm truncate">
                                    {char.name}
                                  </span>
                                  <span
                                    className={`font-bold text-xs ${char.level >= 80 ? "text-wow-gold" : "text-gray-400"}`}
                                  >
                                    {char.level}
                                  </span>
                                  <span
                                    className="text-xs font-medium hidden sm:inline"
                                    style={{
                                      color:
                                        CLASS_COLORS[char.class] || "#ffffff",
                                    }}
                                  >
                                    {CLASS_NAMES[char.class] || ""}
                                  </span>
                                  <Chip
                                    classNames={{
                                      base: `hidden sm:flex ${faction === "alliance" ? "bg-wow-alliance/10 border border-wow-alliance/20" : "bg-wow-horde/10 border border-wow-horde/20"}`,
                                      content: `text-[10px] font-medium ${faction === "alliance" ? "text-wow-alliance" : "text-wow-horde"}`,
                                    }}
                                    size="sm"
                                    variant="flat"
                                  >
                                    {RACE_NAMES[char.race] || ""}
                                  </Chip>
                                </div>
                              </div>
                            </div>
                            {/* Drop indicator line — below */}
                            {isOver &&
                              dragIndex !== null &&
                              dragIndex < index && (
                                <div className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-wow-gold rounded-full shadow-[0_0_8px_rgba(199,156,62,0.6)] z-10" />
                              )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        className="text-gray-400 text-xs"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setIsReordering(false);
                          setDragIndex(null);
                          setOverIndex(null);
                        }}
                      >
                        {t("cancelReorder")}
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold text-xs"
                        isLoading={savingOrder}
                        size="sm"
                        onPress={saveOrder}
                      >
                        {t("saveOrder")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table
                      aria-label="Characters"
                      classNames={{
                        wrapper: "bg-transparent shadow-none p-0",
                        th: "bg-wow-darker/60 text-wow-gold text-xs uppercase tracking-wider border-b border-wow-gold/10",
                        td: "border-b border-white/5 py-3",
                        tr: "hover:bg-white/[0.02] transition-colors",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>{t("name")}</TableColumn>
                        <TableColumn>{t("level")}</TableColumn>
                        <TableColumn>{t("race")}</TableColumn>
                        <TableColumn>{t("class")}</TableColumn>
                        <TableColumn>{t("playTime")}</TableColumn>
                        <TableColumn>{t("status")}</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {characters.map((char) => {
                          const faction = ALLIANCE_RACES.includes(char.race)
                            ? "alliance"
                            : "horde";

                          return (
                            <TableRow key={char.guid}>
                              <TableCell>
                                <NextLink
                                  className="font-semibold text-gray-200 hover:text-wow-gold transition-colors"
                                  href={`/${locale}/armory/${char.name}`}
                                >
                                  {char.name}
                                </NextLink>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`font-bold ${char.level >= 80 ? "text-wow-gold drop-shadow-[0_0_4px_rgba(199,156,62,0.5)]" : "text-gray-300"}`}
                                >
                                  {char.level}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  classNames={{
                                    base: `${faction === "alliance" ? "bg-wow-alliance/10 border border-wow-alliance/20" : "bg-wow-horde/10 border border-wow-horde/20"}`,
                                    content: `text-xs font-medium ${faction === "alliance" ? "text-wow-alliance" : "text-wow-horde"}`,
                                  }}
                                  size="sm"
                                  variant="flat"
                                >
                                  {RACE_NAMES[char.race] || `Race ${char.race}`}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <span
                                  className="font-medium text-sm"
                                  style={{
                                    color:
                                      CLASS_COLORS[char.class] || "#ffffff",
                                  }}
                                >
                                  {CLASS_NAMES[char.class] ||
                                    `Class ${char.class}`}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-300 text-sm">
                                  {formatPlayTime(char.totaltime)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className={`w-2 h-2 shrink-0 rounded-full ${char.online ? "bg-green-400" : "bg-default-600"}`}
                                  />
                                  <span
                                    className={`text-xs ${char.online ? "text-green-400" : "text-gray-400"}`}
                                  >
                                    {char.online
                                      ? tCommon("online")
                                      : tCommon("offline")}
                                  </span>
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Deleted Characters Section */}
            {deletedCharacters.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl glow-gold mt-6">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-15"
                  style={{
                    backgroundImage:
                      "url('/img/Burning Crusade Classic  Black Temple Screenshots 1080/BCC_BlackTemple_Entrance.jpg')",
                  }}
                />
                <div className="relative glass border-wow-gold/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold wow-gradient-text">
                      {t("deletedCharacters")}
                    </h2>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <img
                        alt="Soul Shard"
                        className="w-3.5 h-3.5"
                        src="/img/icons/soul-shard.svg"
                      />
                      {t("restoreCost", { cost: restoreCost })}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <Table
                      aria-label="Deleted Characters"
                      classNames={{
                        wrapper: "bg-transparent shadow-none p-0",
                        th: "bg-wow-darker/60 text-wow-gold text-xs uppercase tracking-wider border-b border-wow-gold/10",
                        td: "border-b border-white/5 py-3",
                        tr: "hover:bg-white/[0.02] transition-colors",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>{t("name")}</TableColumn>
                        <TableColumn>{t("level")}</TableColumn>
                        <TableColumn>{t("race")}</TableColumn>
                        <TableColumn>{t("class")}</TableColumn>
                        <TableColumn>{t("deletedOn")}</TableColumn>
                        <TableColumn>{""}</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {deletedCharacters.map((char) => {
                          const faction = ALLIANCE_RACES.includes(char.race)
                            ? "alliance"
                            : "horde";

                          return (
                            <TableRow key={char.guid}>
                              <TableCell>
                                <span className="font-semibold text-gray-500 line-through">
                                  {char.name}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-400">
                                  {char.level}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  classNames={{
                                    base: `${faction === "alliance" ? "bg-wow-alliance/10 border border-wow-alliance/20" : "bg-wow-horde/10 border border-wow-horde/20"}`,
                                    content: `text-xs font-medium ${faction === "alliance" ? "text-wow-alliance" : "text-wow-horde"}`,
                                  }}
                                  size="sm"
                                  variant="flat"
                                >
                                  {RACE_NAMES[char.race] || `Race ${char.race}`}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                <span
                                  className="font-medium text-sm"
                                  style={{
                                    color:
                                      CLASS_COLORS[char.class] || "#ffffff",
                                  }}
                                >
                                  {CLASS_NAMES[char.class] ||
                                    `Class ${char.class}`}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-gray-400 text-sm">
                                    {new Date(
                                      char.deleteDate * 1000,
                                    ).toLocaleDateString(locale)}
                                  </span>
                                  <span className="text-red-400 text-xs">
                                    {t("daysRemaining", {
                                      days: Math.max(
                                        0,
                                        30 -
                                          Math.floor(
                                            (Date.now() / 1000 -
                                              char.deleteDate) /
                                              86400,
                                          ),
                                      ),
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  className={
                                    characters.length >= 10
                                      ? "bg-default-100 text-gray-500 text-xs"
                                      : "bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold text-xs"
                                  }
                                  isDisabled={characters.length >= 10}
                                  size="sm"
                                  onPress={() => {
                                    setSelectedDeletedChar(char);
                                    setRestoreModalOpen(true);
                                  }}
                                >
                                  {characters.length >= 10
                                    ? t("tooManyCharacters")
                                    : t("restoreCharacter")}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "purchases" && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            id="purchases"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative overflow-hidden rounded-2xl glow-gold">
              <div className="relative glass border-wow-gold/15 rounded-2xl p-6">
                {purchases.length > 0 ? (
                  <PurchaseHistory locale={locale} purchases={purchases} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-sm">{t("noPurchases")}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Restore Character Modal */}
        <RestoreCharacterModal
          balance={soulShards}
          character={selectedDeletedChar}
          characterCount={characters.length}
          isOpen={restoreModalOpen}
          restoreCost={restoreCost}
          onClose={() => {
            setRestoreModalOpen(false);
            setSelectedDeletedChar(null);
          }}
          onRestore={handleRestore}
        />
      </div>
    </div>
  );
}

function BanCard({
  type,
  bandate,
  unbandate,
  banreason,
  locale,
  t,
}: {
  type: "account" | "ip";
  bandate: number;
  unbandate: number;
  banreason: string;
  locale: string;
  t: (key: string) => string;
}) {
  const isPermanent = unbandate === 0;
  const banDateStr = new Date(bandate * 1000).toLocaleString(locale);
  const unbanDateStr = isPermanent
    ? null
    : new Date(unbandate * 1000).toLocaleString(locale);

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-950/30 backdrop-blur-sm p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">&#9888;</span>
        <div className="flex-1 space-y-2">
          <h3 className="text-red-400 font-bold text-lg">
            {type === "account" ? t("banned") : t("ipBanned")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div>
              <span className="text-gray-400">{t("banReason")}:</span>{" "}
              <span className="text-gray-200">{banreason}</span>
            </div>
            <div>
              <span className="text-gray-400">{t("banDate")}:</span>{" "}
              <span className="text-gray-200">{banDateStr}</span>
            </div>
            <div>
              <span className="text-gray-400">{t("banExpires")}:</span>{" "}
              <span
                className={
                  isPermanent ? "text-red-400 font-semibold" : "text-gray-200"
                }
              >
                {isPermanent ? t("permanent") : unbanDateStr}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
  children,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-400 text-xs uppercase tracking-wider">
        {label}
      </span>
      {children || (
        <span
          className={`text-sm font-medium ${highlight ? "text-wow-gold" : "text-gray-200"}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
