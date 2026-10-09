"use client";

import type { ShopItemLocalized } from "@/types";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useTranslations } from "next-intl";

import { PriceDisplay } from "./price-display";

import { GameTipLink } from "@/components/game-tooltip";
import { RACE_NAMES, getQualityColor } from "@/lib/shop-utils";
import { useRealm } from "@/lib/realm-context";

interface ItemDetailModalProps {
  item: ShopItemLocalized | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => void;
  onGift: () => void;
  hasCharacter: boolean;
}

export function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onBuy,
  onGift,
  hasCharacter,
}: ItemDetailModalProps) {
  const t = useTranslations("shop");
  // a realm not open yet: the catalogue only (lib/realms.ts)
  const realmClosed = useRealm().status !== "open";

  if (!item) return null;

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
      size="lg"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          {item.icon_url && (
            <div className="w-12 h-12 rounded-lg bg-wow-dark/50 border border-wow-gold/20 flex items-center justify-center overflow-hidden">
              {item.item_id ? (
                <GameTipLink
                  className="flex items-center justify-center"
                  itemId={item.item_id}
                >
                  <img
                    alt={item.name}
                    className="w-10 h-10 object-contain"
                    src={item.icon_url}
                  />
                </GameTipLink>
              ) : (
                <img
                  alt={item.name}
                  className="w-10 h-10 object-contain"
                  src={item.icon_url}
                />
              )}
            </div>
          )}
          <div>
            <h3
              className={`text-lg font-medium ${getQualityColor(item.quality)}`}
            >
              {item.item_id ? (
                <GameTipLink
                  className="text-inherit hover:text-wow-gold"
                  itemId={item.item_id}
                >
                  {item.name}
                </GameTipLink>
              ) : (
                item.name
              )}
            </h3>
            <p className="text-xs text-gray-400">
              {t(`categories.${item.category}`)}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          {item.description && (
            <p className="text-gray-300 text-sm mb-4">{item.description}</p>
          )}

          <div className="mb-4">
            <PriceDisplay
              discountPercentage={item.discount_percentage}
              discountedPrice={item.discounted_price}
              price={item.price}
              size="lg"
            />
          </div>

          {/* Restrictions */}
          {(item.realm_ids ||
            item.race_ids ||
            item.class_ids ||
            item.faction !== "both") && (
            <div className="bg-[#161b22] rounded-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {t("restrictions")}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.faction !== "both" && (
                  <Chip
                    className={
                      item.faction === "alliance"
                        ? "bg-wow-alliance/20 text-blue-300"
                        : "bg-wow-horde/20 text-red-300"
                    }
                    size="sm"
                  >
                    {t("factionRestriction")}: {item.faction}
                  </Chip>
                )}
                {item.race_ids && (
                  <Chip className="bg-orange-500/10 text-orange-300" size="sm">
                    {t("raceRestriction")}:{" "}
                    {item.race_ids.map((id) => RACE_NAMES[id]).join(", ")}
                  </Chip>
                )}
                {item.class_ids && (
                  <Chip className="bg-cyan-500/10 text-cyan-300" size="sm">
                    {t("classRestriction")}:{" "}
                    {item.class_ids
                      .map((id) => t(`className_${id}`))
                      .join(", ")}
                  </Chip>
                )}
              </div>
            </div>
          )}

          <div className="mt-3">
            <Chip
              className={
                item.is_refundable
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }
              size="sm"
            >
              {item.is_refundable ? t("refundable") : t("nonRefundable")}
            </Chip>
            {item.is_refundable && item.category !== "services" && (
              <p className="text-xs text-gray-400 mt-1">{t("refundPolicy")}</p>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex-col items-stretch gap-3">
          {!hasCharacter && (
            <p className="text-xs text-yellow-400/80 text-center">
              {t("noCharacterSelected")}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button className="text-gray-400" variant="light" onPress={onClose}>
              {t("close")}
            </Button>
            {item.category !== "services" && (
              <Button
                className="border-purple-500/30 text-purple-400"
                isDisabled={
                  realmClosed || !hasCharacter || item.eligible === false
                }
                variant="bordered"
                onPress={onGift}
              >
                {t("gift")}
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
              isDisabled={
                realmClosed || !hasCharacter || item.eligible === false
              }
              onPress={onBuy}
            >
              {realmClosed ? t("comingSoon") : t("buyNow")}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
