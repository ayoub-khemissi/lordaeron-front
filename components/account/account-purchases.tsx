"use client";

import type { ShopPurchaseWithItem } from "@/types";

import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Tab, Tabs } from "@heroui/tabs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { AccountPanel, SectionHeading } from "@/components/account/account-ui";
import { PurchaseHistory } from "@/components/shop/purchase-history";
import { realmById } from "@/lib/realms";

const ALL = "__all__";

/* The account's purchases, all realms or one (when it bought on several), and the refund of one still refundable */
export function AccountPurchases({
  purchases,
  locale,
  onRefunded,
}: {
  purchases: ShopPurchaseWithItem[];
  locale: string;
  onRefunded: () => Promise<void>;
}) {
  const t = useTranslations("account");
  const tShop = useTranslations("shop");
  const [realm, setRealm] = useState<string>(ALL);
  const [target, setTarget] = useState<ShopPurchaseWithItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [error, setError] = useState("");

  const realmIds = [...new Set(purchases.map((p) => p.realm_id))];
  const shown =
    realm === ALL
      ? purchases
      : purchases.filter((p) => String(p.realm_id) === realm);

  const refund = async () => {
    if (!target) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/purchases/${target.id}/refund`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setResult("error");
        setError(data.error || "serverError");
      } else {
        setResult("success");
        await onRefunded();
      }
    } catch {
      setResult("error");
      setError("serverError");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setTarget(null);
    setResult(null);
    setError("");
  };

  return (
    <div id="purchases">
      <SectionHeading
        description={t("purchasesIntro")}
        title={t("navPurchases")}
      />

      {realmIds.length > 1 && (
        <Tabs
          aria-label={t("realm")}
          className="mb-4"
          classNames={{
            tabList:
              "gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1",
            cursor: "bg-white/[0.08] shadow-none",
            tab: "h-9 px-4",
            tabContent:
              "text-sm text-gray-400 group-data-[selected=true]:text-gray-50",
          }}
          selectedKey={realm}
          variant="solid"
          onSelectionChange={(key) => setRealm(String(key))}
        >
          {[
            <Tab key={ALL} title={t("allRealms")} />,
            ...realmIds.map((id) => (
              <Tab key={String(id)} title={realmById(id)?.name ?? String(id)} />
            )),
          ]}
        </Tabs>
      )}

      <AccountPanel padded={shown.length === 0}>
        {shown.length > 0 ? (
          <div className="overflow-x-auto px-2 py-2">
            <PurchaseHistory
              locale={locale}
              purchases={shown}
              showRealm={realmIds.length > 1 && realm === ALL}
              onRefund={setTarget}
            />
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-gray-400">
            {t("noPurchases")}
          </p>
        )}
      </AccountPanel>

      <Modal
        classNames={{
          base: "bg-[#0d1117] border border-wow-gold/20",
          header: "border-b border-wow-gold/10",
          footer: "border-t border-wow-gold/10",
        }}
        isOpen={!!target}
        onClose={close}
      >
        <ModalContent>
          <ModalHeader>{tShop("confirmRefund")}</ModalHeader>
          <ModalBody className="py-6">
            {result === "success" ? (
              <div className="py-4 text-center">
                <h3 className="mb-1 text-lg font-medium text-emerald-400">
                  {tShop("refundSuccess")}
                </h3>
                <p className="text-sm text-gray-400">
                  {tShop("refundSuccessDesc")}
                </p>
              </div>
            ) : result === "error" ? (
              <p className="py-4 text-center text-red-400">
                {tShop(`errors.${error}`)}
              </p>
            ) : target ? (
              <>
                <p className="mb-4 text-sm text-gray-300">
                  {tShop("confirmRefundDesc")}
                </p>
                <div className="mb-3 rounded-lg bg-[#161b22] p-4">
                  <p className="mb-1 text-sm text-gray-400">{tShop("item")}</p>
                  <div className="flex items-center gap-2">
                    {target.item_icon_url && (
                      <img
                        alt=""
                        className="h-6 w-6 rounded"
                        src={target.item_icon_url}
                      />
                    )}
                    <p className="font-medium text-gray-100">
                      {(target[
                        `item_name_${locale}` as keyof ShopPurchaseWithItem
                      ] as string) || target.item_name_en}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-[#161b22] p-4">
                  <p className="mb-2 text-sm text-gray-400">
                    {tShop("pricePaid")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Image
                      alt=""
                      height={18}
                      src="/img/icons/soul-shard.svg"
                      width={18}
                    />
                    <span className="text-lg font-bold text-purple-400">
                      {target.price_paid}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {result ? (
              <Button
                className="bg-wow-gold font-bold text-black"
                onPress={close}
              >
                {tShop("close")}
              </Button>
            ) : (
              <>
                <Button
                  className="text-gray-400"
                  variant="light"
                  onPress={close}
                >
                  {tShop("cancel")}
                </Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-400 font-bold text-black"
                  isLoading={loading}
                  onPress={refund}
                >
                  {tShop("confirmRefund")}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
