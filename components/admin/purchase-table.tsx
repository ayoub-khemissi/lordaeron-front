"use client";

import type { ShopPurchaseWithItem } from "@/types";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { GameTipLink } from "@/components/game-tooltip";
import { realmSlugById } from "@/lib/realms";
import { getLocalizedName } from "@/lib/shop-utils";

interface PurchaseTableProps {
  purchases: ShopPurchaseWithItem[];
  onRefund: (purchase: ShopPurchaseWithItem) => void;
  onRetry: (purchase: ShopPurchaseWithItem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500/10 text-green-400",
  refunded: "bg-orange-500/10 text-orange-400",
  pending_refund: "bg-yellow-500/10 text-yellow-400",
  pending_delivery: "bg-blue-500/10 text-blue-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const REASON_STYLES: Record<string, string> = {
  itemNotRefundable: "text-red-400/70",
  refundExpired: "text-orange-400/70",
  itemNotInInventory: "text-yellow-400/70",
  characterOnline: "text-blue-400/70",
};

export function PurchaseTable({
  purchases,
  onRefund,
  onRetry,
}: PurchaseTableProps) {
  const t = useTranslations("admin.purchases");
  const locale = useLocale();

  return (
    <Table
      aria-label="Purchases"
      classNames={{
        wrapper: "bg-[#161b22] border border-gray-800",
        th: "bg-[#0d1117] text-gray-500 border-b border-gray-800",
        td: "text-gray-300",
      }}
    >
      <TableHeader>
        <TableColumn>ID</TableColumn>
        <TableColumn>{t("account")}</TableColumn>
        <TableColumn>{t("character")}</TableColumn>
        <TableColumn>{t("item")}</TableColumn>
        <TableColumn>{t("price")}</TableColumn>
        <TableColumn>{t("status")}</TableColumn>
        <TableColumn>{t("date")}</TableColumn>
        <TableColumn>{t("actions")}</TableColumn>
      </TableHeader>
      <TableBody>
        {purchases.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="text-gray-500">#{p.id}</TableCell>
            <TableCell>{p.account_id}</TableCell>
            <TableCell>
              {p.character_name}
              {!!p.is_gift && (
                <span className="text-purple-400 text-xs ml-1">
                  &rarr; {p.gift_to_character_name}
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {p.item_icon_url && (
                  <img
                    alt=""
                    className="w-5 h-5 rounded"
                    src={p.item_icon_url}
                  />
                )}
                {p.wow_item_id ? (
                  <GameTipLink
                    className="text-sm text-gray-300 hover:text-wow-gold"
                    itemId={p.wow_item_id}
                    realm={realmSlugById(p.realm_id)}
                  >
                    {getLocalizedName(p, locale, "item_name")}
                  </GameTipLink>
                ) : (
                  <span className="text-sm">
                    {getLocalizedName(p, locale, "item_name")}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Image
                  alt=""
                  height={14}
                  src="/img/icons/soul-shard.svg"
                  width={14}
                />
                <span className="text-purple-400">{p.price_paid}</span>
                {p.discount_applied > 0 && (
                  <span className="text-xs text-gray-500 line-through ml-1">
                    {p.original_price}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Chip className={STATUS_COLORS[p.status]} size="sm">
                {t(`status_${p.status}`)}
              </Chip>
            </TableCell>
            <TableCell className="text-sm text-gray-400">
              {new Date(p.created_at).toLocaleString(locale, {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {p.status === "completed" &&
                  (p.refund_blocked_reason ? (
                    <Tooltip content={t(`reason_${p.refund_blocked_reason}`)}>
                      <span
                        className={`text-xs ${REASON_STYLES[p.refund_blocked_reason] || "text-gray-500"}`}
                      >
                        {t(`reason_${p.refund_blocked_reason}`)}
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      className="text-orange-400 hover:text-orange-300"
                      size="sm"
                      variant="light"
                      onPress={() => onRefund(p)}
                    >
                      {t("refund")}
                    </Button>
                  ))}
                {p.status === "pending_delivery" && (
                  <Button
                    className="text-blue-400 hover:text-blue-300"
                    size="sm"
                    variant="light"
                    onPress={() => onRetry(p)}
                  >
                    {t("retry")}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
