"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { useTranslations } from "next-intl";

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    account_id: number;
    reason: string;
    expires_at: string | null;
  }) => Promise<void>;
}

export function BanModal({ isOpen, onClose, onSubmit }: BanModalProps) {
  const t = useTranslations("admin.bans");
  const tc = useTranslations("admin.common");
  const [accountId, setAccountId] = useState("");
  const [reason, setReason] = useState("");
  const [isPermanent, setIsPermanent] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accountId || !reason) return;
    setLoading(true);
    try {
      await onSubmit({
        account_id: parseInt(accountId),
        reason,
        expires_at: isPermanent ? null : expiresAt || null,
      });
      setAccountId("");
      setReason("");
      setIsPermanent(true);
      setExpiresAt("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      classNames={{
        base: "bg-[#161b22] border border-gray-800 max-h-[90dvh]",
        body: "overflow-y-auto",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader>{t("addBan")}</ModalHeader>
        <ModalBody>
          <Input
            isRequired
            classNames={{ inputWrapper: "bg-[#0d1117] border-gray-700" }}
            label={t("accountId")}
            type="number"
            validationBehavior="aria"
            value={accountId}
            onValueChange={setAccountId}
          />
          <Input
            isRequired
            classNames={{ inputWrapper: "bg-[#0d1117] border-gray-700" }}
            label={t("reason")}
            validationBehavior="aria"
            value={reason}
            onValueChange={setReason}
          />
          <Switch isSelected={isPermanent} onValueChange={setIsPermanent}>
            <span className="text-gray-300 text-sm">{t("permanent")}</span>
          </Switch>
          {!isPermanent && (
            <Input
              isRequired
              classNames={{ inputWrapper: "bg-[#0d1117] border-gray-700" }}
              label={t("expiresAt")}
              type="datetime-local"
              validationBehavior="aria"
              value={expiresAt}
              onValueChange={setExpiresAt}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button className="text-gray-400" variant="light" onPress={onClose}>
            {tc("cancel")}
          </Button>
          <Button
            className="bg-red-500 text-white font-bold"
            isDisabled={!accountId || !reason}
            isLoading={loading}
            onPress={handleSubmit}
          >
            {t("addBan")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
