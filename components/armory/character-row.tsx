"use client";

import type { ArmorySearchResult } from "@/types/armory";

import { Card, CardBody } from "@heroui/card";
import NextLink from "next/link";

import { ALLIANCE_RACES } from "@/lib/armory-constants";
import {
  CharacterBlock,
  FactionCrest,
  GmBadge,
} from "@/components/character-identity";

/* A character in a list (the armory's search, a guild's members): the site's character block with its guild rank when given, its
   faction's crest; a game master's (only a site administrator gets them) carries a GM badge. The whole card opens its armory page, its
   name underlined on hover. */
export function CharacterRow({
  character,
  href,
  rankName,
}: {
  character: ArmorySearchResult;
  href: string;
  rankName?: string | null;
}) {
  const isAlliance = ALLIANCE_RACES.includes(character.race);

  return (
    <Card
      isPressable
      as={NextLink}
      className="glass group group/char w-full border border-white/5 bg-transparent shadow-none data-[hover=true]:border-wow-gold/30"
      href={href}
      radius="lg"
    >
      <CardBody className="flex flex-row items-center gap-3 overflow-visible px-3 py-2.5 sm:gap-4 sm:px-4">
        <CharacterBlock
          badges={character.gm && <GmBadge />}
          character={character}
          className="flex-1"
          online={!!character.online}
          size={40}
        >
          {rankName && (
            <span className="mt-0.5 block truncate text-xs text-wow-gold/80">
              {rankName}
            </span>
          )}
        </CharacterBlock>
        <FactionCrest alliance={isAlliance} />
        <svg
          aria-hidden
          className="h-4 w-4 shrink-0 text-gray-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-wow-gold"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </CardBody>
    </Card>
  );
}
