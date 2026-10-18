"use client";

import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import { AVATAR_GROUPS } from "@/lib/avatars";
import { OVERLAY_POPOVER } from "@/lib/overlay-motion";

const iconUrl = (icon: string, size: number) =>
  `https://wow.zamimg.com/images/wow/icons/${size > 36 ? "large" : "medium"}/${icon}.jpg`;

/* The account's avatar: the game icon its player chose (lib/avatars.ts) in a gilded frame, as the game frames its icons; without one,
   the account's initial */
export function AccountAvatar({
  icon,
  name,
  size = 40,
  className,
}: {
  icon?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-wow-gold/50 bg-gradient-to-br from-wow-gold/25 to-wow-gold-dark/10 shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_0_14px_rgba(199,156,62,0.18)]",
        size >= 48 ? "rounded-xl" : "rounded-md",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {icon ? (
        <img
          alt=""
          className="h-full w-full scale-[1.08] object-cover"
          draggable={false}
          src={iconUrl(icon, size)}
        />
      ) : (
        <span
          className="font-black wow-gradient-text"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      {/* the icon's inner shadow, as the game's own frames */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_6px_rgba(0,0,0,0.7)]"
      />
    </span>
  );
}

/* The avatar's choice: the icons by group, the current one lit; saved at once, the bar and the page take it after (onSaved). Mounted
   only while open (its choice starts from the current avatar) */
export function AvatarPicker({
  isOpen,
  onClose,
  current,
  name,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  current: string | null;
  name: string;
  onSaved: (icon: string | null) => Promise<void> | void;
}) {
  const t = useTranslations("account");
  const [selected, setSelected] = useState<string | null>(current);
  const [group, setGroup] = useState(AVATAR_GROUPS[0].key);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(false);
    try {
      const res = await fetch("/api/account/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icon: selected }),
      });

      if (!res.ok) throw new Error();
      await onSaved(selected);
      onClose();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const icons = AVATAR_GROUPS.find((g) => g.key === group)?.icons ?? [];

  return (
    <Modal
      classNames={{
        base: "bg-[#0d1117] border border-wow-gold/20",
        header: "border-b border-white/[0.06]",
        footer: "border-t border-white/[0.06]",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <AccountAvatar icon={selected} name={name} size={44} />
          <div>
            <p className="text-base font-semibold text-gray-50">
              {t("avatarTitle")}
            </p>
            <p className="text-xs font-normal text-gray-400">
              {t("avatarHint")}
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="py-4">
          {/* the group: a dropdown (Ayoub, 18/10/2026: tabs took the room of the icons) */}
          <Select
            disallowEmptySelection
            aria-label={t("avatarTitle")}
            className="max-w-xs"
            classNames={{
              trigger:
                "border border-white/[0.08] bg-black/30 data-[hover=true]:bg-black/40",
              value: "text-sm text-wow-gold-light",
            }}
            popoverProps={OVERLAY_POPOVER}
            selectedKeys={[group]}
            size="sm"
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];

              if (key) setGroup(String(key));
            }}
          >
            {AVATAR_GROUPS.map((g) => (
              <SelectItem key={g.key}>{t(`avatarGroups.${g.key}`)}</SelectItem>
            ))}
          </Select>
          {/* the icons at their own size (56 px, Wowhead's large ones): stretched, they showed their pixels */}
          <div className="flex flex-wrap gap-2">
            {icons.map((icon) => {
              const active = icon === selected;

              return (
                <button
                  key={icon}
                  aria-pressed={active}
                  className={clsx(
                    "group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-all",
                    active
                      ? "border-wow-gold shadow-[0_0_0_2px_rgba(199,156,62,0.45),0_0_16px_rgba(199,156,62,0.35)]"
                      : "border-white/10 hover:border-wow-gold/50",
                  )}
                  type="button"
                  onClick={() => setSelected(icon)}
                >
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                    loading="lazy"
                    src={iconUrl(icon, 56)}
                  />
                </button>
              );
            })}
          </div>
          {error && <p className="text-sm text-red-400">{t("avatarError")}</p>}
        </ModalBody>
        <ModalFooter className="justify-between">
          <Button
            className="text-gray-400"
            isDisabled={!selected}
            size="sm"
            variant="light"
            onPress={() => setSelected(null)}
          >
            {t("avatarInitial")}
          </Button>
          <div className="flex gap-2">
            <Button
              className="text-gray-400"
              size="sm"
              variant="light"
              onPress={onClose}
            >
              {t("cancel")}
            </Button>
            <Button
              className="bg-gradient-to-r from-wow-gold to-wow-gold-light font-bold text-black"
              isDisabled={selected === current}
              isLoading={saving}
              size="sm"
              onPress={save}
            >
              {t("avatarSave")}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
