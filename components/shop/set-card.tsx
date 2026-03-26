"use client";

import type { ShopSetLocalized } from "@/types";

import { Chip } from "@heroui/chip";
import { useTranslations } from "next-intl";

import { PriceDisplay } from "./price-display";

import { WowheadLink } from "@/components/wowhead-link";

interface SetCardProps {
  set: ShopSetLocalized;
  onClick: () => void;
}

export function SetCard({ set, onClick }: SetCardProps) {
  const t = useTranslations("shop");
  const isIneligible = set.eligible === false;

  return (
    <button
      className={`glass border-wow-gold/10 hover:border-wow-gold/30 rounded-xl p-4 text-left transition-all duration-200 cursor-pointer group w-full ${isIneligible ? "opacity-75 saturate-[0.25]" : ""}`}
      disabled={isIneligible}
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 mb-3">
        {set.icon_url && (
          <div className="w-12 h-12 rounded-lg bg-wow-dark/50 border border-wow-gold/20 flex items-center justify-center overflow-hidden shrink-0">
            <img
              alt={set.name}
              className="w-10 h-10 object-contain"
              src={set.icon_url}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-purple-400 group-hover:text-wow-gold transition-colors truncate">
            {set.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("setPieces", { count: set.items.length })}
          </p>
        </div>
        {set.discount_percentage > 0 && (
          <Chip className="bg-green-500/10 text-green-400 shrink-0" size="sm">
            -{set.discount_percentage}%
          </Chip>
        )}
      </div>

      {set.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {set.description}
        </p>
      )}

      {/* Mini piece icons with Wowhead tooltips */}
      <div className="flex flex-wrap gap-1 mb-3">
        {set.items.slice(0, 9).map((piece) => (
          <div
            key={piece.id}
            className={`w-7 h-7 rounded border border-gray-700/50 bg-wow-dark/30 flex items-center justify-center overflow-hidden ${
              piece.icon_url ? "" : "text-[10px] text-gray-600"
            }`}
          >
            {piece.icon_url && piece.item_id ? (
              <WowheadLink
                className="flex items-center justify-center"
                itemId={piece.item_id}
              >
                <img
                  alt=""
                  className="w-6 h-6 object-contain"
                  src={piece.icon_url}
                />
              </WowheadLink>
            ) : piece.icon_url ? (
              <img
                alt=""
                className="w-6 h-6 object-contain"
                src={piece.icon_url}
              />
            ) : (
              "?"
            )}
          </div>
        ))}
      </div>

      {/* Restriction chips */}
      {(isIneligible ||
        set.class_ids ||
        set.faction !== "both" ||
        set.min_level > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {isIneligible && set.restriction_reason && set.restriction_reason !== "level" && (
            <Chip
              className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
              size="sm"
              variant="bordered"
            >
              {set.restriction_reason === "class"
                ? t("restrictionClass")
                : t("restrictionFaction")}
            </Chip>
          )}
          {set.min_level > 0 && (
            <Chip
              className="bg-orange-500/10 text-orange-300 text-[10px]"
              size="sm"
            >
              {t("reqLevel", { level: set.min_level })}
            </Chip>
          )}
          {set.class_ids && (
            <Chip
              className="bg-cyan-500/10 text-cyan-300 text-[10px]"
              size="sm"
            >
              {set.class_ids.map((id) => t(`className_${id}`)).join(", ")}
            </Chip>
          )}
          {set.faction !== "both" && (
            <Chip
              className={
                set.faction === "alliance"
                  ? "bg-wow-alliance/20 text-blue-300 text-[10px]"
                  : "bg-wow-horde/20 text-red-300 text-[10px]"
              }
              size="sm"
            >
              {set.faction}
            </Chip>
          )}
        </div>
      )}

      <PriceDisplay
        discountPercentage={set.discount_percentage}
        discountedPrice={set.discounted_price}
        price={set.price}
        size="sm"
      />
    </button>
  );
}
