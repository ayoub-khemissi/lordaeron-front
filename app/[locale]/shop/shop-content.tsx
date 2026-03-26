"use client";

import type {
  ShopItemLocalized,
  ShopSetLocalized,
  Character,
  ShopCategory,
  ShopPurchaseWithItem,
} from "@/types";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import Image from "next/image";

import { useAuth } from "@/lib/auth-context";
import { ShopHeader } from "@/components/shop/shop-header";
import { RealmCharacterSelector } from "@/components/shop/realm-character-selector";
import { CategoryNav } from "@/components/shop/category-nav";
import { ItemGrid } from "@/components/shop/item-grid";
import { SetGrid } from "@/components/shop/set-grid";
import { HighlightsCarousel } from "@/components/shop/highlights-carousel";
import { ItemDetailModal } from "@/components/shop/item-detail-modal";
import { SetDetailModal } from "@/components/shop/set-detail-modal";
import { PurchaseModal } from "@/components/shop/purchase-modal";
import { GiftModal } from "@/components/shop/gift-modal";
import { PurchaseHistory } from "@/components/shop/purchase-history";
import { CategoryFilterBar } from "@/components/shop/category-filter-bar";
import { BuyShardsModal } from "@/components/shop/buy-shards-modal";

export default function ShopContent() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<ShopItemLocalized[]>([]);
  const [sets, setSets] = useState<ShopSetLocalized[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(
    null,
  );
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [activeTab, setActiveTab] = useState("shop");
  const [showSetFilter, setShowSetFilter] = useState(true);
  const [showItemFilter, setShowItemFilter] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Modal states
  const [detailItem, setDetailItem] = useState<ShopItemLocalized | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<ShopItemLocalized | null>(
    null,
  );
  const [giftItem, setGiftItem] = useState<ShopItemLocalized | null>(null);
  const [detailSet, setDetailSet] = useState<ShopSetLocalized | null>(null);
  const [purchaseSet, setPurchaseSet] = useState<ShopSetLocalized | null>(null);
  const [giftSet, setGiftSet] = useState<ShopSetLocalized | null>(null);
  const [purchases, setPurchases] = useState<ShopPurchaseWithItem[]>([]);

  // Buy Shards states
  const [buyShardOpen, setBuyShardOpen] = useState(false);
  const [recommendedShards, setRecommendedShards] = useState<
    number | undefined
  >(undefined);
  const [checkoutResult, setCheckoutResult] = useState<
    "success" | "cancelled" | null
  >(null);
  const checkoutHandled = useRef(false);

  // Refund states
  const [refundTarget, setRefundTarget] = useState<ShopPurchaseWithItem | null>(
    null,
  );
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundResult, setRefundResult] = useState<"success" | "error" | null>(
    null,
  );
  const [refundError, setRefundError] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ locale });

      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedCharacter) {
        params.set("race_id", String(selectedCharacter.race));
        params.set("class_id", String(selectedCharacter.class));
        params.set("level", String(selectedCharacter.level));
      }

      const hasMaxLevel = characters.some((c) => c.level >= 80);

      params.set("has_max_level", String(hasMaxLevel));

      const setParams = new URLSearchParams({ locale });

      if (selectedCharacter) {
        setParams.set("race_id", String(selectedCharacter.race));
        setParams.set("class_id", String(selectedCharacter.class));
        setParams.set("level", String(selectedCharacter.level));
      }

      const [itemsRes, setsRes, charsRes, accountRes] = await Promise.all([
        fetch(`/api/shop/items?${params}`),
        fetch(`/api/shop/sets?${setParams}`),
        fetch("/api/shop/characters"),
        fetch("/api/account"),
      ]);

      const itemsData = await itemsRes.json();
      const setsData = await setsRes.json();
      const charsData = await charsRes.json();
      const accountData = await accountRes.json();

      const chars = charsData.characters || [];

      setItems(itemsData.items || []);
      setSets(setsData.sets || []);
      setCharacters(chars);
      if (!selectedCharacter && chars.length > 0) {
        setSelectedCharacter(chars[0]);
      }
      setBalance(accountData.soulShards || 0);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [user, locale, selectedCategory, selectedCharacter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchPurchases = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/shop/purchases");
      const data = await res.json();

      setPurchases(data.purchases || []);
    } catch {
      // Silent fail
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history") fetchPurchases();
  }, [activeTab, fetchPurchases]);

  // Restore preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lordaeron_shop_prefs");

      if (saved) {
        const prefs = JSON.parse(saved);

        if (prefs.sortBy) setSortBy(prefs.sortBy);
        if (typeof prefs.showSets === "boolean")
          setShowSetFilter(prefs.showSets);
        if (typeof prefs.showItems === "boolean")
          setShowItemFilter(prefs.showItems);
        if (typeof prefs.showUnavailable === "boolean")
          setShowUnavailable(prefs.showUnavailable);
      }
    } catch {
      // Ignore parse errors
    }
    setPrefsLoaded(true);
  }, []);

  // Persist preferences to localStorage on change
  useEffect(() => {
    if (!prefsLoaded) return;
    try {
      localStorage.setItem(
        "lordaeron_shop_prefs",
        JSON.stringify({
          sortBy,
          showSets: showSetFilter,
          showItems: showItemFilter,
          showUnavailable,
        }),
      );
    } catch {
      // Ignore storage errors
    }
  }, [sortBy, showSetFilter, showItemFilter, showUnavailable, prefsLoaded]);

  // Handle checkout return from Stripe
  useEffect(() => {
    if (checkoutHandled.current) return;
    const checkout = searchParams.get("checkout");

    if (checkout === "success" || checkout === "cancelled") {
      checkoutHandled.current = true;
      setCheckoutResult(checkout);
      // Clean URL
      router.replace(`/${locale}/shop`, { scroll: false });
      if (checkout === "success") {
        // Refetch balance after successful payment
        fetchData();
      }
      // Auto-dismiss banner after 6 seconds
      const timer = setTimeout(() => setCheckoutResult(null), 6000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router, locale, fetchData]);

  const handleBuyShards = (deficit?: number) => {
    setRecommendedShards(deficit);
    setBuyShardOpen(true);
  };

  const handlePurchase = async () => {
    if (!purchaseItem || !selectedCharacter) return;
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: purchaseItem.id,
        character_guid: selectedCharacter.guid,
        character_name: selectedCharacter.name,
        realm_id: 1,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "serverError");
    fetchData();
  };

  const handleSetPurchase = async () => {
    if (!purchaseSet || !selectedCharacter) return;
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        set_id: purchaseSet.id,
        character_guid: selectedCharacter.guid,
        character_name: selectedCharacter.name,
        realm_id: 1,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "serverError");
    fetchData();
  };

  const handleGift = async (giftToName: string, giftMessage: string) => {
    if (!giftItem || !selectedCharacter) return;
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: giftItem.id,
        character_guid: selectedCharacter.guid,
        character_name: selectedCharacter.name,
        realm_id: 1,
        is_gift: true,
        gift_to_character_name: giftToName,
        gift_message: giftMessage,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "serverError");
    fetchData();
  };

  const handleSetGift = async (giftToName: string, giftMessage: string) => {
    if (!giftSet || !selectedCharacter) return;
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        set_id: giftSet.id,
        character_guid: selectedCharacter.guid,
        character_name: selectedCharacter.name,
        realm_id: 1,
        is_gift: true,
        gift_to_character_name: giftToName,
        gift_message: giftMessage,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "serverError");
    fetchData();
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    setRefundLoading(true);
    try {
      const res = await fetch(`/api/shop/purchases/${refundTarget.id}/refund`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setRefundResult("error");
        setRefundError(data.error || "serverError");
      } else {
        setRefundResult("success");
        fetchPurchases();
        fetchData();
      }
    } catch {
      setRefundResult("error");
      setRefundError("serverError");
    } finally {
      setRefundLoading(false);
    }
  };

  const handleRefundClose = () => {
    setRefundTarget(null);
    setRefundResult(null);
    setRefundError("");
  };

  // Sort function shared between items and sets
  const sortFn = <
    T extends {
      discounted_price: number;
      id: number;
      name: string;
      quality?: number | null;
    },
  >(
    a: T,
    b: T,
  ) => {
    switch (sortBy) {
      case "price_asc":
        return a.discounted_price - b.discounted_price;
      case "price_desc":
        return b.discounted_price - a.discounted_price;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "quality_asc":
        return (a.quality ?? 0) - (b.quality ?? 0);
      case "quality_desc":
        return (b.quality ?? 0) - (a.quality ?? 0);
      case "newest":
        return b.id - a.id;
      case "oldest":
        return a.id - b.id;
      default:
        return 0;
    }
  };

  // Filter & sort items
  const filteredItems = items
    .filter((item) => {
      if (!showUnavailable && item.eligible === false) return false;
      if (!search) return true;

      return item.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort(sortFn);

  // Filter & sort sets
  const filteredSets = sets
    .filter((s) => {
      if (!showUnavailable && s.eligible === false) return false;
      if (!search) return true;

      return s.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort(sortFn);

  const highlightedItems = items.filter(
    (i) => i.is_highlighted && (showUnavailable || i.eligible !== false),
  );
  const highlightedSets = sets.filter(
    (s) => s.is_highlighted && (showUnavailable || s.eligible !== false),
  );
  // Show sets only on the transmog category, combined with user filter
  const showSetsSection = selectedCategory === "transmog" && showSetFilter;

  // Build a virtual ShopItemLocalized for the PurchaseModal/GiftModal when buying a set
  const setAsPurchaseItem: ShopItemLocalized | null = purchaseSet
    ? {
        id: purchaseSet.id,
        category: "transmog",
        service_type: null,
        item_id: null,
        name: purchaseSet.name,
        description: purchaseSet.description,
        price: purchaseSet.price,
        discounted_price: purchaseSet.discounted_price,
        discount_percentage: purchaseSet.discount_percentage,
        realm_ids: null,
        race_ids: null,
        class_ids: purchaseSet.class_ids,
        faction: purchaseSet.faction,
        icon_url: purchaseSet.icon_url,
        quality: 4, // Epic purple for sets
        is_highlighted: purchaseSet.is_highlighted,
        is_refundable: false,
        min_level: purchaseSet.min_level,
        sort_order: purchaseSet.sort_order,
      }
    : null;

  const setAsGiftItem: ShopItemLocalized | null = giftSet
    ? {
        id: giftSet.id,
        category: "transmog",
        service_type: null,
        item_id: null,
        name: giftSet.name,
        description: giftSet.description,
        price: giftSet.price,
        discounted_price: giftSet.discounted_price,
        discount_percentage: giftSet.discount_percentage,
        realm_ids: null,
        race_ids: null,
        class_ids: giftSet.class_ids,
        faction: giftSet.faction,
        icon_url: giftSet.icon_url,
        quality: 4,
        is_highlighted: giftSet.is_highlighted,
        is_refundable: false,
        min_level: giftSet.min_level,
        sort_order: giftSet.sort_order,
      }
    : null;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-heading wow-gradient-text mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-400">{t("errors.unauthorized")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {checkoutResult && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between ${
            checkoutResult === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
          }`}
        >
          <span>
            {checkoutResult === "success"
              ? t("checkoutSuccess")
              : t("checkoutCancelled")}
          </span>
          <button
            className="text-current opacity-60 hover:opacity-100"
            type="button"
            onClick={() => setCheckoutResult(null)}
          >
            &#x2715;
          </button>
        </div>
      )}

      <ShopHeader balance={balance} onBuyShards={() => handleBuyShards()} />

      <RealmCharacterSelector
        characters={characters}
        selectedCharacter={selectedCharacter}
        onCharacterSelect={setSelectedCharacter}
      />

      <Tabs
        classNames={{
          tabList:
            "gap-4 w-full relative rounded-none p-0 border-b border-wow-gold/10 mb-6",
          cursor: "w-full bg-wow-gold",
          tab: "max-w-fit px-0 h-10",
          tabContent: "group-data-[selected=true]:text-wow-gold text-gray-400",
        }}
        selectedKey={activeTab}
        variant="underlined"
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab key="shop" title={t("title")} />
        <Tab key="history" title={t("history")} />
      </Tabs>

      {activeTab === "shop" ? (
        <>
          {!selectedCategory &&
            (highlightedItems.length > 0 || highlightedSets.length > 0) && (
              <HighlightsCarousel
                items={highlightedItems}
                sets={highlightedSets}
                onItemClick={setDetailItem}
                onSetClick={setDetailSet}
              />
            )}

          <CategoryNav
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <CategoryFilterBar
            search={search}
            showUnavailable={showUnavailable}
            sortBy={sortBy}
            onSearchChange={setSearch}
            onShowUnavailableChange={setShowUnavailable}
            onSortChange={setSortBy}
            {...(selectedCategory === "transmog"
              ? {
                  showSets: showSetFilter,
                  onShowSetsChange: setShowSetFilter,
                  showItems: showItemFilter,
                  onShowItemsChange: setShowItemFilter,
                }
              : {})}
          />

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner color="warning" size="lg" />
            </div>
          ) : (
            <>
              {/* Item sets section */}
              {showSetsSection && filteredSets.length > 0 && (
                <div className="mb-8 pb-6 border-b border-wow-gold/10">
                  <h2 className="text-lg font-heading text-purple-400 mb-4">
                    {t("itemSets")}
                  </h2>
                  <SetGrid sets={filteredSets} onSetClick={setDetailSet} />
                </div>
              )}

              {/* Individual items — on transmog, respect showItemFilter; other categories always show */}
              {(selectedCategory !== "transmog" || showItemFilter) && (
                <div>
                  {showSetsSection && filteredSets.length > 0 && (
                    <h2 className="text-lg font-heading text-wow-gold mb-4 mt-6">
                      {t("allItems")}
                    </h2>
                  )}
                  <ItemGrid items={filteredItems} onItemClick={setDetailItem} />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <PurchaseHistory
          locale={locale}
          purchases={purchases}
          onRefund={setRefundTarget}
        />
      )}

      <ItemDetailModal
        hasCharacter={!!selectedCharacter}
        isOpen={!!detailItem}
        item={detailItem}
        onBuy={() => {
          setPurchaseItem(detailItem);
          setDetailItem(null);
        }}
        onClose={() => setDetailItem(null)}
        onGift={() => {
          setGiftItem(detailItem);
          setDetailItem(null);
        }}
      />

      <SetDetailModal
        hasCharacter={!!selectedCharacter}
        isOpen={!!detailSet}
        set={detailSet}
        onBuy={() => {
          setPurchaseSet(detailSet);
          setDetailSet(null);
        }}
        onClose={() => setDetailSet(null)}
        onGift={() => {
          setGiftSet(detailSet);
          setDetailSet(null);
        }}
      />

      <PurchaseModal
        balance={balance}
        character={selectedCharacter}
        isOpen={!!purchaseItem}
        item={purchaseItem}
        onBuyShards={handleBuyShards}
        onClose={() => setPurchaseItem(null)}
        onConfirm={handlePurchase}
      />

      {/* Set Purchase Modal — reuse PurchaseModal with virtual item */}
      <PurchaseModal
        balance={balance}
        character={selectedCharacter}
        isOpen={!!purchaseSet}
        item={setAsPurchaseItem}
        onBuyShards={handleBuyShards}
        onClose={() => setPurchaseSet(null)}
        onConfirm={handleSetPurchase}
      />

      <GiftModal
        balance={balance}
        character={selectedCharacter}
        isOpen={!!giftItem}
        item={giftItem}
        onBuyShards={handleBuyShards}
        onClose={() => setGiftItem(null)}
        onConfirm={handleGift}
      />

      {/* Set Gift Modal — reuse GiftModal with virtual item */}
      <GiftModal
        balance={balance}
        character={selectedCharacter}
        isOpen={!!giftSet}
        item={setAsGiftItem}
        onBuyShards={handleBuyShards}
        onClose={() => setGiftSet(null)}
        onConfirm={handleSetGift}
      />

      {/* Refund Modal */}
      <Modal
        classNames={{
          base: "bg-[#0d1117] border border-wow-gold/20",
          header: "border-b border-wow-gold/10",
          footer: "border-t border-wow-gold/10",
        }}
        isOpen={!!refundTarget}
        onClose={handleRefundClose}
      >
        <ModalContent>
          <ModalHeader>{t("confirmRefund")}</ModalHeader>
          <ModalBody className="py-6">
            {refundResult === "success" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">&#x2705;</div>
                <h3 className="text-lg font-medium text-green-400 mb-1">
                  {t("refundSuccess")}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t("refundSuccessDesc")}
                </p>
              </div>
            ) : refundResult === "error" ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">&#x274C;</div>
                <p className="text-red-400">{t(`errors.${refundError}`)}</p>
              </div>
            ) : refundTarget ? (
              <>
                <p className="text-gray-300 text-sm mb-4">
                  {t("confirmRefundDesc")}
                </p>
                <div className="bg-[#161b22] rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-1">{t("item")}</p>
                  <div className="flex items-center gap-2">
                    {refundTarget.item_icon_url && (
                      <img
                        alt=""
                        className="w-6 h-6 rounded"
                        src={refundTarget.item_icon_url}
                      />
                    )}
                    <p className="text-gray-100 font-medium">
                      {(refundTarget[
                        `item_name_${locale}` as keyof ShopPurchaseWithItem
                      ] as string) || refundTarget.item_name_en}
                    </p>
                  </div>
                </div>
                <div className="bg-[#161b22] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">{t("pricePaid")}</p>
                  <div className="flex items-center gap-1">
                    <Image
                      alt=""
                      height={18}
                      src="/img/icons/soul-shard.svg"
                      width={18}
                    />
                    <span className="text-lg text-purple-400 font-bold">
                      {refundTarget.price_paid}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {refundResult ? (
              <Button
                className="bg-wow-gold text-black font-bold"
                onPress={handleRefundClose}
              >
                {t("close")}
              </Button>
            ) : (
              <>
                <Button
                  className="text-gray-400"
                  variant="light"
                  onPress={handleRefundClose}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-400 text-black font-bold"
                  isLoading={refundLoading}
                  onPress={handleRefund}
                >
                  {t("confirmRefund")}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <BuyShardsModal
        isOpen={buyShardOpen}
        recommendedShards={recommendedShards}
        onClose={() => {
          setBuyShardOpen(false);
          setRecommendedShards(undefined);
        }}
      />
    </div>
  );
}
