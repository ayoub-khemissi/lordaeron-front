"use client";

import type { ShopItemLocalized, Character } from "@/types";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { PriceDisplay } from "./price-display";

import { getQualityColor } from "@/lib/shop-utils";
import { CharacterLine } from "@/components/character-identity";

interface PurchaseModalProps {
  item: ShopItemLocalized | null;
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  balance: number;
  onBuyShards?: (deficit: number) => void;
}

export function PurchaseModal({
  item,
  character,
  isOpen,
  onClose,
  onConfirm,
  balance,
  onBuyShards,
}: PurchaseModalProps) {
  const t = useTranslations("shop");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!item || !character) return null;

  const finalPrice = item.discounted_price;
  const canAfford = balance >= finalPrice;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
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
        <ModalHeader>{t("confirmPurchase")}</ModalHeader>
        <ModalBody className="py-6">
          {result === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">&#x2705;</div>
              <h3 className="text-lg font-medium text-green-400 mb-1">
                {t("purchaseSuccess")}
              </h3>
              <p className="text-gray-400 text-sm">
                {t("purchaseSuccessDesc")}
              </p>
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
              <div className="bg-[#161b22] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">{t("purchaseFor")}</p>
                <CharacterLine char={character} />
              </div>
              <div className="bg-[#161b22] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">{t("price")}</p>
                <PriceDisplay
                  discountPercentage={item.discount_percentage}
                  discountedPrice={item.discounted_price}
                  price={item.price}
                  size="lg"
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
                {item.is_refundable && item.category !== "services" && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t("refundPolicyNote")}
                  </p>
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
                className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
                isDisabled={!canAfford}
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
