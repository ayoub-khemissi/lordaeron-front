"use client";

import type { ShopItemLocalized, Character } from "@/types";

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { PriceDisplay } from "./price-display";

import { RACE_NAMES, CLASS_NAMES, getQualityColor } from "@/lib/shop-utils";

interface GiftModalProps {
  item: ShopItemLocalized | null;
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (giftToName: string, giftMessage: string) => Promise<void>;
  balance: number;
  onBuyShards?: (deficit: number) => void;
}

export function GiftModal({
  item,
  character,
  isOpen,
  onClose,
  onConfirm,
  balance,
  onBuyShards,
}: GiftModalProps) {
  const t = useTranslations("shop");
  const [query, setQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [giftMessage, setGiftMessage] = useState(t("giftDefaultMessage"));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (selectedCharacter) return;
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);

      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/shop/characters/search?name=${encodeURIComponent(query)}`,
        );
        const data = await res.json();

        setSuggestions(data.characters || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedCharacter]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!item || !character) return null;

  const finalPrice = item.discounted_price;
  const canAfford = balance >= finalPrice;

  const handleSelect = (char: Character) => {
    setSelectedCharacter(char);
    setQuery(char.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (selectedCharacter) {
      setSelectedCharacter(null);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCharacter) return;
    setLoading(true);
    try {
      await onConfirm(selectedCharacter.name, giftMessage);
      setResult("success");
    } catch (err: unknown) {
      setResult("error");
      setErrorMsg(err instanceof Error ? err.message : "serverError");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setErrorMsg("");
    setQuery("");
    setSelectedCharacter(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setGiftMessage(t("giftDefaultMessage"));
    onClose();
  };

  return (
    <Modal
      classNames={{
        base: "bg-[#0d1117] border border-wow-gold/20 max-h-[90dvh]",
        header: "border-b border-wow-gold/10",
        body: "overflow-y-auto",
        footer: "border-t border-wow-gold/10",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader>{t("confirmGift")}</ModalHeader>
        <ModalBody className="py-6">
          {result === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">&#x1F381;</div>
              <h3 className="text-lg font-medium text-green-400 mb-1">
                {t("giftSuccess")}
              </h3>
              <p className="text-gray-400 text-sm">{t("giftSuccessDesc")}</p>
            </div>
          ) : result === "error" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">&#x274C;</div>
              <p className="text-red-400">{t(`errors.${errorMsg}`)}</p>
            </div>
          ) : (
            <>
              <div className="bg-[#161b22] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">{t("item")}</p>
                <p className={`${getQualityColor(item.quality)} font-medium`}>
                  {item.name}
                </p>
              </div>

              {/* Character search autocomplete */}
              <div ref={wrapperRef} className="relative mb-4">
                <Input
                  isRequired
                  classNames={{
                    inputWrapper: "bg-[#161b22] border-wow-gold/20",
                  }}
                  endContent={
                    searching ? (
                      <Spinner color="warning" size="sm" />
                    ) : undefined
                  }
                  label={t("giftCharacterName")}
                  placeholder={t("giftSearchPlaceholder")}
                  validationBehavior="aria"
                  value={query}
                  onFocus={() => {
                    if (suggestions.length > 0 && !selectedCharacter)
                      setShowSuggestions(true);
                  }}
                  onValueChange={handleQueryChange}
                />

                {/* Selected character info */}
                {selectedCharacter && (
                  <div className="flex items-center gap-2 mt-2 px-1 text-sm">
                    <span className="text-wow-gold font-medium">
                      {selectedCharacter.name}
                    </span>
                    <span className="text-gray-500">-</span>
                    <span className="text-gray-400">
                      Lv.{selectedCharacter.level}{" "}
                      {RACE_NAMES[selectedCharacter.race]}{" "}
                      {CLASS_NAMES[selectedCharacter.class]}
                    </span>
                  </div>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && !selectedCharacter && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-[#161b22] border border-wow-gold/15 rounded-lg overflow-hidden shadow-lg">
                    {searching ? (
                      <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                        <Spinner color="warning" size="sm" />
                        {t("giftSearching")}
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        {t("giftNoResults")}
                      </div>
                    ) : (
                      suggestions.map((char) => (
                        <button
                          key={char.guid}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-wow-gold/10 transition-colors text-left"
                          type="button"
                          onClick={() => handleSelect(char)}
                        >
                          <span className="text-wow-gold font-medium text-sm">
                            {char.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            Lv.{char.level} {RACE_NAMES[char.race]}{" "}
                            {CLASS_NAMES[char.class]}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Gift message */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1.5">
                  {t("giftMessageLabel")}
                </label>
                <textarea
                  className="w-full rounded-lg bg-[#161b22] border border-wow-gold/20 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-wow-gold/40 resize-none"
                  maxLength={200}
                  placeholder={t("giftMessagePlaceholder")}
                  rows={3}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {giftMessage.length}/200
                </p>
              </div>

              <div className="bg-[#161b22] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">{t("price")}</p>
                <PriceDisplay
                  discountPercentage={item.discount_percentage}
                  discountedPrice={item.discounted_price}
                  price={item.price}
                  size="md"
                />
                {!canAfford && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm flex items-center gap-1.5">
                      <Image
                        alt=""
                        height={14}
                        src="/img/icons/soul-shard.svg"
                        width={14}
                      />
                      {t("needMoreShards", { count: finalPrice - balance })}
                    </p>
                    {onBuyShards && (
                      <Button
                        className="mt-2 w-full bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold text-sm"
                        size="sm"
                        onPress={() => {
                          handleClose();
                          onBuyShards(finalPrice - balance);
                        }}
                      >
                        {t("buyShards")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {result ? (
            <Button
              className="bg-wow-gold text-black font-bold"
              onPress={handleClose}
            >
              {t("close")}
            </Button>
          ) : (
            <>
              <Button
                className="text-gray-400"
                variant="light"
                onPress={handleClose}
              >
                {t("cancel")}
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold"
                isDisabled={!canAfford || !selectedCharacter}
                isLoading={loading}
                onPress={handleConfirm}
              >
                {t("confirm")}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
