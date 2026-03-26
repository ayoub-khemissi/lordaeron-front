"use client";

import Image from "next/image";
import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";

interface ShopHeaderProps {
  balance: number;
  onBuyShards?: () => void;
}

export function ShopHeader({ balance, onBuyShards }: ShopHeaderProps) {
  const t = useTranslations("shop");

  return (
    <div className="relative overflow-hidden rounded-2xl glass-gold p-8 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-wow-gold/10" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading wow-gradient-text mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">{t("subtitle")}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
          {onBuyShards && (
            <Button
              className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold h-auto py-3 px-5 w-full sm:w-auto"
              onPress={onBuyShards}
            >
              {t("buyShards")}
            </Button>
          )}
          <div className="glass rounded-xl px-6 py-4 flex items-center gap-3 glow-pulse-gold">
            <Image
              alt="Soul Shards"
              height={28}
              src="/img/icons/soul-shard.svg"
              width={28}
            />
            <p className="text-2xl font-bold text-purple-400">
              {balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
