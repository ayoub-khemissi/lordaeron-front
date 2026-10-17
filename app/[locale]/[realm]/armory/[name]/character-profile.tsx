"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Tabs, Tab } from "@heroui/tabs";
import { Switch } from "@heroui/switch";
import dynamic from "next/dynamic";

import {
  LevelRaceClass,
  RaceClassIcons,
} from "@/components/character-identity";
import { CLASS_COLORS, ALLIANCE_RACES } from "@/lib/armory-constants";
import { GuildInfo } from "@/components/armory/guild-info";
import { EquipmentPanel } from "@/components/armory/equipment-panel";
import { CharacterSkeleton } from "@/components/armory/character-skeleton";
import { type GameTooltipData } from "@/components/game-tooltip";
import { useRealm, useRealmHref } from "@/lib/realm-context";
import { ChallengeBadge } from "@/components/challenges/challenge-parts";
import { type CharacterChallenge } from "@/types/challenges";
import { StatsPanel } from "@/components/armory/stats-panel";
import { PvpPanel } from "@/components/armory/pvp-panel";
import { ProfessionsPanel } from "@/components/armory/professions-panel";
import { SpecsPanel, type ArmorySpecs } from "@/components/armory/specs-panel";
import {
  ArmoryCharacter,
  ArmoryStats,
  ArmoryProfession,
  ArenaTeamInfo,
  EquipmentSlot,
} from "@/types/armory";

const ModelViewer = dynamic(
  () =>
    import("@/components/armory/model-viewer").then((mod) => mod.ModelViewer),
  { ssr: false },
);

interface CharacterProfileProps {
  name: string;
}

interface ProfileData {
  character: ArmoryCharacter;
  stats: ArmoryStats | null;
  professions: ArmoryProfession[];
  arenaTeams: ArenaTeamInfo[];
  achievementCount: number;
  // its specializations (lib/talents.ts), null when unreadable
  specs?: ArmorySpecs | null;
  // its WotLK+ challenge, in progress or completed (lib/queries/challenges.ts), on a realm whose challenges are open
  challenge?: CharacterChallenge | null;
  equipment: EquipmentSlot[];
  // what the 3D viewer draws (lib/armory-model.ts), and the same without the transmogs (null when there are none)
  model?: {
    items: [number, number, number?][];
    defaulted: number[];
    missing: number[];
    failed?: boolean;
  };
  modelBase?: {
    items: [number, number, number?][];
    defaulted: number[];
    missing: number[];
    failed?: boolean;
  } | null;
  // the tooltips of the items the character wears, by equipment slot (lib/tooltips/instance.ts)
  tooltips?: Record<number, GameTooltipData>;
}

function formatPlayTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;

  return `${hours}h`;
}

export function CharacterProfile({ name }: CharacterProfileProps) {
  const t = useTranslations("armory");
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showTransmog, setShowTransmog] = useState(true);
  const realm = useRealm();
  const realmHref = useRealmHref();
  const locale = useLocale();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/armory/character/${encodeURIComponent(name)}?realm=${realm.slug}&locale=${locale}`,
        );

        if (res.status === 404) {
          setNotFound(true);

          return;
        }
        const json = await res.json();

        setData(json);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [name, realm.slug, locale]);

  if (loading) return <CharacterSkeleton />;

  if (notFound || !data) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-2xl text-gray-400">{t("notFound")}</p>
      </div>
    );
  }

  const {
    character,
    stats,
    professions,
    arenaTeams,
    achievementCount,
    specs,
    challenge,
    equipment,
    model,
    modelBase,
    tooltips,
  } = data;
  const shownModel = showTransmog || !modelBase ? model : modelBase;
  const isAlliance = ALLIANCE_RACES.includes(character.race);
  const classColor = CLASS_COLORS[character.class] || "#FFFFFF";

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold"
          style={{ color: classColor }}
        >
          {character.name}
        </h1>
        <p className="mt-2 flex items-center justify-center gap-2.5">
          <RaceClassIcons
            cls={character.class}
            gender={character.gender}
            race={character.race}
            size={28}
          />
          <LevelRaceClass
            className="text-base"
            cls={character.class}
            level={character.level}
            race={character.race}
          />
        </p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isAlliance
                ? "bg-blue-500/20 text-blue-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {isAlliance ? "Alliance" : "Horde"}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              character.online
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {character.online ? t("online") : t("offline")}
          </span>
          {/* a game master's character, which only a site administrator is shown */}
          {character.gm && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-600/25 text-red-300">
              {t("gm")}
            </span>
          )}
          {achievementCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/20 text-yellow-400">
              {achievementCount} {t("achievements")}
            </span>
          )}
        </div>
        {/* its WotLK+ challenge (only on a realm whose challenges are open, lib/realms.ts), to the Hall of Fame's Challenges tab */}
        {realm.challenges && challenge && (
          <div className="mt-3 flex justify-center">
            <ChallengeBadge
              challenge={challenge}
              href={realmHref("/hall-of-fame?tab=challenges")}
            />
          </div>
        )}
        <GuildInfo
          guildEmblem={character.guildEmblem}
          guildName={character.guildName}
          guildRankName={character.guildRankName}
          guildRole={character.guildRole}
        />
        {character.totaltime > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {t("played")}: {formatPlayTime(character.totaltime)}
          </p>
        )}
      </div>

      {/* Character model with equipment slots around it */}
      <div className="max-w-[500px] mx-auto mb-8">
        <EquipmentPanel equipment={equipment} tooltips={tooltips}>
          <ModelViewer
            defaulted={shownModel?.defaulted}
            face={character.face}
            facialStyle={character.facialStyle}
            gearFailed={!shownModel || shownModel.failed}
            gender={character.gender}
            hairColor={character.hairColor}
            hairStyle={character.hairStyle}
            items={shownModel?.items ?? []}
            missing={shownModel?.missing}
            race={character.race}
            skin={character.skin}
          />
        </EquipmentPanel>
        {/* the transmogs shown by default; off, the model is drawn again with the gear as it is (Ayoub, 13/10/2026). Always there, so
            it is found: greyed with its reason on a character wearing no transmog */}
        <div className="mt-3 flex flex-col items-center gap-1">
          <Switch
            color="warning"
            isDisabled={!modelBase}
            isSelected={!!modelBase && showTransmog}
            size="sm"
            onValueChange={setShowTransmog}
          >
            <span className="text-sm text-gray-300">{t("showTransmog")}</span>
          </Switch>
          {!modelBase && (
            <span className="text-xs text-gray-500">{t("noTransmog")}</span>
          )}
        </div>
      </div>

      {/* its specializations and their builds in the talent calculator */}
      {specs && specs.specs.length > 0 && (
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="mb-3 text-center text-lg text-wow-gold">
            {t("specializations")}
          </h2>
          <SpecsPanel level={character.level} specs={specs} />
        </div>
      )}

      {/* Tabs: Stats, PvP, Professions */}
      <div className="max-w-3xl mx-auto">
        <Tabs
          classNames={{
            tabList: "glass border border-white/10",
            cursor: "bg-wow-gold/20",
            tab: "text-gray-400 data-[selected=true]:text-wow-gold",
          }}
          variant="light"
        >
          {stats && (
            <Tab key="stats" title={t("stats")}>
              <div className="mt-4">
                <StatsPanel stats={stats} />
              </div>
            </Tab>
          )}
          <Tab key="pvp" title={t("pvp")}>
            <div className="mt-4">
              <PvpPanel arenaTeams={arenaTeams} character={character} />
            </div>
          </Tab>
          <Tab key="professions" title={t("professions")}>
            <div className="mt-4">
              <ProfessionsPanel professions={professions} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
