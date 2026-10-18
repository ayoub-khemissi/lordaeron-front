"use client";

import { Card } from "@heroui/card";
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import {
  SOUL_SHARD_PACKAGES,
  getSmallestPackageCoveringDeficit,
} from "@/lib/stripe";

interface BuyShardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedShards?: number;
}

export function BuyShardsModal({
  isOpen,
  onClose,
  recommendedShards,
}: BuyShardsModalProps) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const recommendedPkg = recommendedShards
    ? getSmallestPackageCoveringDeficit(recommendedShards)
    : null;

  const handleSelect = async (packageId: string) => {
    setLoadingId(packageId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, locale }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingId(null);
      }
    } catch {
      setLoadingId(null);
    }
  };

  const handleClose = () => {
    if (!loadingId) onClose();
  };

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);

  return (
    <Modal
      classNames={{
        base: "bg-[#0d1117] border border-wow-gold/20 max-w-2xl max-h-[90dvh]",
        header: "border-b border-wow-gold/10",
        body: "overflow-y-auto",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span className="wow-gradient-text">{t("buyShardsTitle")}</span>
          <span className="text-sm text-gray-400 font-normal">
            {t("buyShardsSubtitle")}
          </span>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOUL_SHARD_PACKAGES.map((pkg) => {
              const isRecommended = recommendedPkg?.id === pkg.id;
              const isLoading = loadingId === pkg.id;
              const isDisabled = loadingId !== null && !isLoading;

              return (
                <Card
                  key={pkg.id}
                  isPressable
                  className={`relative flex flex-col items-center gap-2 overflow-visible rounded-xl bg-transparent p-4 shadow-none transition-all
                    ${isRecommended ? "glass-gold glow-pulse-gold ring-1 ring-wow-gold/40" : "glass data-[hover=true]:border-wow-gold/30 data-[hover=true]:bg-white/[0.03]"}
                    ${isDisabled ? "opacity-50" : ""}
                  `}
                  isDisabled={isDisabled}
                  onPress={() => handleSelect(pkg.id)}
                >
                  {isRecommended && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-wow-gold text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                      {t("recommended")}
                    </span>
                  )}
                  {pkg.id === "shards_1000" && !isRecommended && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-sky-400 text-black text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                      {t("popular")}
                    </span>
                  )}
                  {pkg.id === "shards_10000" && !isRecommended && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full tracking-wider whitespace-nowrap">
                      {t("bestValue")}
                    </span>
                  )}
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Spinner color="warning" size="sm" />
                      <span className="text-xs text-gray-400">
                        {t("redirectingToStripe")}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Image
                        alt="Soul Shards"
                        height={32}
                        src="/img/icons/soul-shard.svg"
                        width={32}
                      />
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-purple-400">
                          {pkg.shards.toLocaleString()}
                        </span>
                        {pkg.bonusPercent > 0 && (
                          <span className="text-xs text-gray-500 line-through">
                            {pkg.baseShards.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        {t("soulShards")}
                      </span>
                      {pkg.bonusPercent > 0 && (
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                          +{pkg.bonusPercent}%
                        </span>
                      )}
                      <span className="text-lg font-bold text-wow-gold mt-1">
                        {formatEur(pkg.priceEurCents)}
                      </span>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
