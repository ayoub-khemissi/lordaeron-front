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
import { useTranslations } from "next-intl";

import { getQualityColor } from "@/lib/shop-utils";

interface PurchaseHistoryProps {
  purchases: ShopPurchaseWithItem[];
  locale: string;
  onRefund?: (purchase: ShopPurchaseWithItem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500/10 text-green-400",
  refunded: "bg-orange-500/10 text-orange-400",
  pending_refund: "bg-yellow-500/10 text-yellow-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export function PurchaseHistory({
  purchases,
  locale,
  onRefund,
}: PurchaseHistoryProps) {
  const t = useTranslations("shop");

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("noHistory")}</p>
      </div>
    );
  }

  const getItemName = (p: ShopPurchaseWithItem) => {
    const key = `item_name_${locale}` as keyof ShopPurchaseWithItem;

    return (p[key] as string) || p.item_name_en;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      completed: t("statusCompleted"),
      refunded: t("statusRefunded"),
      pending_refund: t("statusPending"),
      cancelled: t("statusCancelled"),
    };

    return map[status] || status;
  };

  const getBlockedReasonLabel = (reason: string) => {
    const map: Record<string, string> = {
      itemNotRefundable: t("errors.itemNotRefundable"),
      refundExpired: t("errors.refundExpired"),
      characterOnline: t("errors.characterOnline"),
      itemNotInInventory: t("errors.itemNotInInventory"),
    };

    return map[reason] || reason;
  };

  return (
    <Table
      aria-label={t("history")}
      classNames={{
        wrapper: "glass border-wow-gold/10",
        th: "bg-wow-dark/50 text-gray-400 border-b border-wow-gold/10",
        td: "text-gray-300",
      }}
    >
      <TableHeader>
        <TableColumn>{t("date")}</TableColumn>
        <TableColumn>{t("item")}</TableColumn>
        <TableColumn>{t("character")}</TableColumn>
        <TableColumn>{t("pricePaid")}</TableColumn>
        <TableColumn>{t("status")}</TableColumn>
        <TableColumn>{t("actions")}</TableColumn>
      </TableHeader>
      <TableBody>
        {purchases.map((p) => {
          const canRefund =
            p.status === "completed" && !p.refund_blocked_reason;

          return (
            <TableRow key={p.id}>
              <TableCell className="text-sm">
                {new Date(p.created_at).toLocaleDateString(locale)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {p.item_icon_url && (
                    <img
                      alt=""
                      className="w-6 h-6 rounded hidden sm:block"
                      src={p.item_icon_url}
                    />
                  )}
                  <span
                    className={`text-sm ${getQualityColor(p.item_quality)}`}
                  >
                    {getItemName(p)}
                    {p.set_item_count != null && p.set_item_count > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({p.set_item_count} {t("setPiecesShort")})
                      </span>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {p.character_name}
                {!!p.is_gift && (
                  <span className="text-purple-400 text-xs ml-1">
                    → {p.gift_to_character_name}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Image
                    alt=""
                    height={14}
                    src="/img/icons/soul-shard.svg"
                    width={14}
                  />
                  <span className="text-sm text-purple-400">
                    {p.price_paid}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Chip className={STATUS_COLORS[p.status]} size="sm">
                  {getStatusLabel(p.status)}
                </Chip>
              </TableCell>
              <TableCell>
                {canRefund ? (
                  <Button
                    className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    size="sm"
                    variant="flat"
                    onPress={() => onRefund?.(p)}
                  >
                    {t("refund")}
                  </Button>
                ) : p.status === "completed" && p.refund_blocked_reason ? (
                  <Tooltip
                    content={getBlockedReasonLabel(p.refund_blocked_reason)}
                  >
                    <span className="text-xs text-gray-500 cursor-help">
                      {t("refund")}
                    </span>
                  </Tooltip>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
