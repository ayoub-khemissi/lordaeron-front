"use client";

import type { DeletedCharacter } from "@/types";

import { useState } from "react";
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
import Image from "next/image";

import {
  RACE_NAMES,
  CLASS_NAMES,
  CLASS_COLORS,
  ALLIANCE_RACES,
} from "@/lib/shop-utils";

interface RestoreCharacterModalProps {
  character: DeletedCharacter | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (
    guid: number,
  ) => Promise<{ success: boolean; error?: string; name?: string }>;
  balance: number;
  restoreCost: number;
  characterCount: number;
}

export function RestoreCharacterModal({
  character,
  isOpen,
  onClose,
  onRestore,
  balance,
  restoreCost,
  characterCount,
}: RestoreCharacterModalProps) {
  const t = useTranslations("account");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [restoredName, setRestoredName] = useState("");

  if (!character) return null;

  const canAfford = balance >= restoreCost;
  const isFull = characterCount >= 10;
  const faction = ALLIANCE_RACES.includes(character.race)
    ? "alliance"
    : "horde";

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res = await onRestore(character.guid);

      if (res.success) {
        setResult("success");
        setRestoredName(res.name || character.name);
      } else if (res.error === "originalNameTaken") {
        setResult("error");
        setErrorMsg(t("originalNameTaken"));
      } else if (res.error === "insufficientBalance") {
        setResult("error");
        setErrorMsg(t("insufficientShards"));
      } else if (res.error === "tooManyCharacters") {
        setResult("error");
        setErrorMsg(t("tooManyCharacters"));
      } else {
        setResult("error");
        setErrorMsg(t("restoreError"));
      }
    } catch {
      setResult("error");
      setErrorMsg(t("restoreError"));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setErrorMsg("");
    setRestoredName("");
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
        <ModalHeader>{t("restoreCharacterTitle")}</ModalHeader>
        <ModalBody className="py-6">
          {result === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">&#x2705;</div>
              <h3 className="text-lg font-medium text-green-400 mb-1">
                {t("restoreSuccess")}
              </h3>
              <p className="text-gray-400 text-sm">{restoredName}</p>
            </div>
          ) : result === "error" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">&#x274C;</div>
              <p className="text-red-400">{errorMsg}</p>
            </div>
          ) : (
            <>
              {/* Character info */}
              <div className="bg-[#161b22] rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-gray-200 font-semibold text-lg">
                      {character.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-sm">
                        Lv. {character.level}
                      </span>
                      <Chip
                        classNames={{
                          base: `${faction === "alliance" ? "bg-wow-alliance/10 border border-wow-alliance/20" : "bg-wow-horde/10 border border-wow-horde/20"}`,
                          content: `text-xs font-medium ${faction === "alliance" ? "text-wow-alliance" : "text-wow-horde"}`,
                        }}
                        size="sm"
                        variant="flat"
                      >
                        {RACE_NAMES[character.race] || `Race ${character.race}`}
                      </Chip>
                      <span
                        className="font-medium text-sm"
                        style={{
                          color: CLASS_COLORS[character.class] || "#ffffff",
                        }}
                      >
                        {CLASS_NAMES[character.class] ||
                          `Class ${character.class}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div className="bg-[#161b22] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">
                  {t("restoreCost", { cost: restoreCost })}
                </p>
                <div className="flex items-center gap-1.5">
                  <Image
                    alt="Soul Shard"
                    height={16}
                    src="/img/icons/soul-shard.svg"
                    width={16}
                  />
                  <span className="text-purple-400 font-medium">
                    {balance.toLocaleString()}
                  </span>
                </div>
                {!canAfford && (
                  <p className="text-red-400 text-sm mt-2">
                    {t("insufficientShards")}
                  </p>
                )}
                {isFull && (
                  <p className="text-red-400 text-sm mt-2">
                    {t("tooManyCharacters")}
                  </p>
                )}
              </div>

              {/* Confirm message */}
              <p className="text-gray-300 text-sm mb-4">
                {t("confirmRestore")}
              </p>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {result ? (
            <Button
              className="bg-wow-gold text-black font-bold"
              onPress={handleClose}
            >
              OK
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
                isDisabled={!canAfford || isFull}
                isLoading={loading}
                onPress={handleRestore}
              >
                {t("restoreCharacter")}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
