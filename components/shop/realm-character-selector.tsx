"use client";

import type { Character } from "@/types";

import { Select, SelectItem } from "@heroui/select";
import { Tab, Tabs } from "@heroui/tabs";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { OVERLAY_POPOVER } from "@/lib/overlay-motion";
import { CharacterLine } from "@/components/character-identity";
import { useRealm } from "@/lib/realm-context";
import {
  REALMS,
  REALM_SLUGS,
  isRealmOpen,
  isRealmSlug,
  realmAt,
  realmHasSection,
  type RealmSlug,
} from "@/lib/realms";

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
  const realm = useRealm();
  const router = useRouter();
  const pathname = usePathname();

  // the realm this shop sells on, and the other realms' shops, the same page (Ayoub, 25/10/2026: a player bought on Lordaeron's shop
  // what he meant for his Rimeheart character, of the same name)
  const shopRealms = REALM_SLUGS.filter(
    (slug) => realmHasSection(slug, "shop") && isRealmOpen(realmAt(slug)),
  );
  const realmSwitch =
    shopRealms.length > 1 ? (
      <Tabs
        aria-label={t("selectRealm")}
        classNames={{
          tabList: "glass border border-wow-gold/20",
          cursor: "bg-wow-gold/20",
          tabContent:
            "text-gray-400 group-data-[selected=true]:text-wow-gold font-semibold",
        }}
        selectedKey={realm.slug}
        size="sm"
        variant="bordered"
        onSelectionChange={(key) => {
          const slug = String(key);

          if (!isRealmSlug(slug) || slug === realm.slug) return;
          const rest = pathname.split("/").slice(3).join("/");

          router.push(`/${locale}/${slug as RealmSlug}/${rest}`);
        }}
      >
        {shopRealms.map((slug) => (
          <Tab key={slug} title={REALMS[slug].name} />
        ))}
      </Tabs>
    ) : null;

  if (characters.length === 0) {
    return (
      <div className="sticky top-16 z-30 glass rounded-xl p-4 mb-6 border border-wow-gold/10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {realmSwitch}
          <p className="text-sm text-yellow-400/80 text-center flex-1">
            {t("noCharacters")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-30 glass rounded-xl p-4 mb-6 border border-wow-gold/10">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {realmSwitch}
        <Select
          aria-label={t("selectCharacter")}
          className="flex-1 sm:max-w-sm"
          classNames={{
            // the character's portrait and two lines: room for them, no label over them (the placeholder says it)
            trigger:
              "glass h-14 min-h-14 border-wow-gold/20 hover:border-wow-gold/40 data-[open=true]:border-wow-gold/40",
            popoverContent: "bg-[#161b22] border border-wow-gold/15",
          }}
          placeholder={t("selectCharacter")}
          popoverProps={OVERLAY_POPOVER}
          renderValue={(_items) => {
            const char = selectedCharacter;

            if (!char) return null;

            return <CharacterLine char={char} size={28} />;
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
            <SelectItem key={String(char.guid)} textValue={char.name}>
              <CharacterLine char={char} />
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
