"use client";

import type { ShopItemLocalized } from "@/types";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useTranslations } from "next-intl";

import { PriceDisplay } from "./price-display";

import { WowheadLink } from "@/components/wowhead-link";
import { getQualityColor } from "@/lib/shop-utils";

interface ItemCardProps {
  item: ShopItemLocalized;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const t = useTranslations("shop");
  const tHome = useTranslations("home");
  const isIneligible = item.eligible === false;

  return (
    <Card
      className={`glass border-wow-gold/10 hover:border-wow-gold/30 transition-all duration-300 hover:glow-gold group ${isIneligible ? "opacity-75 saturate-[0.25]" : ""}`}
      isPressable={!isIneligible}
      onPress={onClick}
    >
      <CardBody className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1">
            {item.icon_url && (
              <div className="w-12 h-12 rounded-lg bg-wow-dark/50 border border-wow-gold/20 flex items-center justify-center mb-2 overflow-hidden">
                {item.item_id ? (
                  <WowheadLink
                    className="flex items-center justify-center"
                    itemId={item.item_id}
                  >
                    <img
                      alt={item.name}
                      className="w-10 h-10 object-contain"
                      src={item.icon_url}
                    />
                  </WowheadLink>
                ) : (
                  <img
                    alt={item.name}
                    className="w-10 h-10 object-contain"
                    src={item.icon_url}
                  />
                )}
              </div>
            )}
            <h3
              className={`font-medium ${getQualityColor(item.quality)} ${item.quality == null ? "group-hover:text-wow-gold" : ""} transition-colors line-clamp-2`}
            >
              {item.item_id ? (
                <WowheadLink
                  className="text-inherit hover:text-wow-gold"
                  itemId={item.item_id}
                >
                  {item.name}
                </WowheadLink>
              ) : (
                item.name
              )}
            </h3>
          </div>
          {item.discount_percentage > 0 && (
            <Chip
              className="bg-green-500/20 text-green-400 border-green-500/30"
              size="sm"
              variant="bordered"
            >
              -{item.discount_percentage}%
            </Chip>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {isIneligible &&
            item.restriction_reason &&
            item.restriction_reason !== "level" && (
              <Chip
                className="bg-red-500/20 text-red-400 border-red-500/30"
                size="sm"
                variant="bordered"
              >
                {item.restriction_reason === "heirloom_max_level"
                  ? t("restrictionHeirloomMaxLevel")
                  : item.restriction_reason === "class"
                    ? t("restrictionClass")
                    : item.restriction_reason === "race"
                      ? t("restrictionRace")
                      : t("restrictionFaction")}
              </Chip>
            )}
          {item.faction !== "both" && (
            <Chip
              className={
                item.faction === "alliance"
                  ? "bg-wow-alliance/20 text-blue-300"
                  : "bg-wow-horde/20 text-red-300"
              }
              size="sm"
            >
              {item.faction === "alliance" ? tHome("alliance") : tHome("horde")}
            </Chip>
          )}
          {item.min_level > 0 && (
            <Chip className="bg-orange-500/10 text-orange-300" size="sm">
              {t("reqLevel", { level: item.min_level })}
            </Chip>
          )}
          {!item.is_refundable && (
            <Chip className="bg-red-500/10 text-red-400" size="sm">
              {t("nonRefundable")}
            </Chip>
          )}
        </div>
      </CardBody>

      <CardFooter className="px-4 pb-4 pt-2">
        <PriceDisplay
          discountPercentage={item.discount_percentage}
          discountedPrice={item.discounted_price}
          price={item.price}
          size="sm"
        />
      </CardFooter>
    </Card>
  );
}
