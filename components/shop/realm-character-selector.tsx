"use client";

import type { Character } from "@/types";

import { Select, SelectItem } from "@heroui/select";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import { RACE_NAMES, CLASS_NAMES } from "@/lib/shop-utils";

interface RealmCharacterSelectorProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
}

export function RealmCharacterSelector({
  characters,
  selectedCharacter,
  onCharacterSelect,
}: RealmCharacterSelectorProps) {
  const t = useTranslations("shop");
  const locale = useLocale();

  if (characters.length === 0) {
    return (
      <div className="sticky top-16 z-30 glass rounded-xl p-4 mb-6 border border-wow-gold/10">
        <p className="text-sm text-yellow-400/80 text-center">
          {t("noCharacters")}
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-30 glass rounded-xl p-4 mb-6 border border-wow-gold/10">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Select
          className="flex-1 sm:max-w-sm"
          classNames={{
            trigger:
              "glass border-wow-gold/20 hover:border-wow-gold/40 data-[open=true]:border-wow-gold/40",
            popoverContent: "bg-[#161b22] border border-wow-gold/15",
          }}
          label={t("selectCharacter")}
          placeholder={t("selectCharacter")}
          renderValue={(items) => {
            const char = selectedCharacter;

            if (!char) return null;

            return (
              <div className="flex items-center gap-2">
                <span className="font-medium text-wow-gold">{char.name}</span>
                <span className="text-xs text-wow-gold/60">
                  Lv.{char.level} {RACE_NAMES[char.race]}{" "}
                  {CLASS_NAMES[char.class]}
                </span>
              </div>
            );
          }}
          selectedKeys={
            selectedCharacter ? [String(selectedCharacter.guid)] : []
          }
          size="sm"
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            const char = characters.find((c) => String(c.guid) === key);

            if (char) onCharacterSelect(char);
          }}
        >
          {characters.map((char) => (
            <SelectItem
              key={String(char.guid)}
              textValue={`${char.name} Lv.${char.level} ${RACE_NAMES[char.race]} ${CLASS_NAMES[char.class]}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-wow-gold">{char.name}</span>
                <span className="text-xs text-gray-400">
                  Lv.{char.level} {RACE_NAMES[char.race]}{" "}
                  {CLASS_NAMES[char.class]}
                </span>
              </div>
            </SelectItem>
          ))}
        </Select>

        <Link
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-wow-gold/20 hover:border-wow-gold/40 text-xs text-gray-400 hover:text-wow-gold transition-all whitespace-nowrap"
          href={`/${locale}/account#purchases`}
        >
          <span>{"\uD83D\uDCDC"}</span>
          <span>{t("history")}</span>
        </Link>
      </div>
    </div>
  );
}
