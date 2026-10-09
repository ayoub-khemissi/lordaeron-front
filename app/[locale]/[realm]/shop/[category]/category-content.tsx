"use client";

import type { ShopItemLocalized, Character, ShopCategory } from "@/types";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";

import { useAuth } from "@/lib/auth-context";
import { ShopHeader } from "@/components/shop/shop-header";
import { RealmCharacterSelector } from "@/components/shop/realm-character-selector";
import { ItemGrid } from "@/components/shop/item-grid";
import { ItemDetailModal } from "@/components/shop/item-detail-modal";
import { PurchaseModal } from "@/components/shop/purchase-modal";
import { GiftModal } from "@/components/shop/gift-modal";
import { CategoryFilterBar } from "@/components/shop/category-filter-bar";
import {
  NO_FACETS,
  SHOP_CATEGORIES,
  compareShopEntries,
  matchesFacets,
  type ShopFacets as ShopFacetsState,
} from "@/lib/shop-utils";
import { ShopFacets } from "@/components/shop/shop-facets";
import { useRealm, useRealmHref } from "@/lib/realm-context";

export default function CategoryContent() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const realmHref = useRealmHref();
  const realm = useRealm();
  const router = useRouter();
  const params = useParams();
  const category = params.category as ShopCategory;
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<ShopItemLocalized[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("price_desc");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [facets, setFacets] = useState<ShopFacetsState>(NO_FACETS);

  const [detailItem, setDetailItem] = useState<ShopItemLocalized | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<ShopItemLocalized | null>(
    null,
  );
  const [giftItem, setGiftItem] = useState<ShopItemLocalized | null>(null);

  // Validate category
  useEffect(() => {
    if (
      !SHOP_CATEGORIES.includes(category as (typeof SHOP_CATEGORIES)[number])
    ) {
      router.push(realmHref("/shop"));
    }
  }, [category, locale, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        locale,
        category,
        realm: realm.slug,
      });

      if (selectedCharacter) {
        searchParams.set("race_id", String(selectedCharacter.race));
        searchParams.set("class_id", String(selectedCharacter.class));
      }

      const [itemsRes, charsRes, accountRes] = await Promise.all([
        fetch(`/api/shop/items?${searchParams}`),
        realm.status === "open"
          ? fetch(`/api/shop/characters?realm=${realm.slug}`)
          : Promise.resolve(Response.json({ characters: [] })),
        fetch("/api/account"),
      ]);

      const itemsData = await itemsRes.json();
      const charsData = await charsRes.json();
      const accountData = await accountRes.json();

      const chars = charsData.characters || [];

      setItems(itemsData.items || []);
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
  }, [user, locale, realm, category, selectedCharacter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePurchase = async () => {
    if (!purchaseItem || !selectedCharacter) return;
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: purchaseItem.id,
        character_guid: selectedCharacter.guid,
        character_name: selectedCharacter.name,
        realm_id: realm.realmId,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "serverError");
    fetchData();
  };

  const handleGift = async (giftToName: string) => {
    if (!giftItem || !selectedCharacter) return;
    const res = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: giftItem.id,
        character_guid: selectedCharacter.guid,
        character_name: selectedCharacter.name,
        realm_id: realm.realmId,
        is_gift: true,
        gift_to_character_name: giftToName,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "serverError");
    fetchData();
  };

  const filteredItems = items
    .filter((item) => {
      if (!showUnavailable && item.eligible === false) return false;
      if (!matchesFacets(item, facets)) return false;
      if (!search) return true;

      return item.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort(compareShopEntries(sortBy));

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
      <ShopHeader balance={balance} />

      <RealmCharacterSelector
        characters={characters}
        selectedCharacter={selectedCharacter}
        onCharacterSelect={setSelectedCharacter}
      />

      <div className="flex items-center gap-3 mb-6">
        <Button
          className="text-gray-400 hover:text-wow-gold"
          size="sm"
          variant="light"
          onPress={() => router.push(realmHref("/shop"))}
        >
          ← {t("allItems")}
        </Button>
        <h2 className="text-xl font-heading wow-gradient-text">
          {t(`categories.${category}`)}
        </h2>
      </div>

      <CategoryFilterBar
        search={search}
        showUnavailable={showUnavailable}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onShowUnavailableChange={setShowUnavailable}
        onSortChange={setSortBy}
      />
      <ShopFacets entries={items} facets={facets} onChange={setFacets} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner color="warning" size="lg" />
        </div>
      ) : (
        <ItemGrid items={filteredItems} onItemClick={setDetailItem} />
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

      <PurchaseModal
        balance={balance}
        character={selectedCharacter}
        isOpen={!!purchaseItem}
        item={purchaseItem}
        onClose={() => setPurchaseItem(null)}
        onConfirm={handlePurchase}
      />

      <GiftModal
        balance={balance}
        character={selectedCharacter}
        isOpen={!!giftItem}
        item={giftItem}
        onClose={() => setGiftItem(null)}
        onConfirm={handleGift}
      />
    </div>
  );
}
