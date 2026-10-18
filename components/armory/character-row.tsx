"use client";

import type { ArmorySearchResult } from "@/types/armory";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import { useTranslations } from "next-intl";

import { ALLIANCE_RACES } from "@/lib/armory-constants";
import {
  CharacterPortrait,
  FactionCrest,
  LevelRaceClass,
  classColor,
} from "@/components/character-identity";

/* A character in a list (the armory's search, a guild's members): its portrait (race, class in the corner, online or not), its name in
   its class colour, "Level · race · class" on one line, its guild rank when given, its faction's crest; a game master's (only a site
   administrator gets them) carries a GM badge. Opens its armory page. Laid out again on 18/10/2026 (Ayoub: the phone's rows wrapped). */
export function CharacterRow({
  character,
  href,
  rankName,
}: {
  character: ArmorySearchResult;
  href: string;
  rankName?: string | null;
}) {
  const t = useTranslations("armory");
  const isAlliance = ALLIANCE_RACES.includes(character.race);

  return (
    <Card
      isPressable
      as={NextLink}
      className="glass group w-full border border-white/5 bg-transparent shadow-none data-[hover=true]:border-wow-gold/30"
      href={href}
      radius="lg"
    >
      <CardBody className="flex flex-row items-center gap-3 overflow-visible px-3 py-2.5 sm:gap-4 sm:px-4">
        <CharacterPortrait
          cls={character.class}
          gender={character.gender}
          online={!!character.online}
          race={character.race}
        />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="truncate text-base font-semibold transition-all group-hover:brightness-125"
              style={{ color: classColor(character.class) }}
            >
              {character.name}
            </span>
            {character.gm && (
              <Chip
                className="h-5 shrink-0 text-[10px] font-bold uppercase"
                color="danger"
                size="sm"
                variant="flat"
              >
                {t("gm")}
              </Chip>
            )}
          </div>
          <LevelRaceClass
            separated
            className="block truncate text-xs sm:text-sm"
            cls={character.class}
            level={character.level}
            race={character.race}
          />
          {rankName && (
            <span className="block truncate text-xs text-wow-gold/80">
              {rankName}
            </span>
          )}
        </div>
        <FactionCrest alliance={isAlliance} />
        <span
          aria-hidden
          className="text-lg leading-none text-gray-500 transition-colors group-hover:text-wow-gold"
        >
          ›
        </span>
      </CardBody>
    </Card>
  );
}
