"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import dynamic from "next/dynamic";

import {
  RACE_NAMES,
  CLASS_NAMES,
  CLASS_COLORS,
  ALLIANCE_RACES,
} from "@/lib/armory-constants";
import { GuildInfo } from "@/components/armory/guild-info";
import { EquipmentPanel } from "@/components/armory/equipment-panel";
import { StatsPanel } from "@/components/armory/stats-panel";
import { PvpPanel } from "@/components/armory/pvp-panel";
import { ProfessionsPanel } from "@/components/armory/professions-panel";
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
  equipment: EquipmentSlot[];
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

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/armory/character/${encodeURIComponent(name)}`,
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
  }, [name]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

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
    equipment,
  } = data;
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
        <p className="text-gray-400 mt-1">
          {t("level")} {character.level}{" "}
          {RACE_NAMES[character.race] || "Unknown"}{" "}
          {CLASS_NAMES[character.class] || "Unknown"}
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
          {achievementCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/20 text-yellow-400">
              {achievementCount} {t("achievements")}
            </span>
          )}
        </div>
        <GuildInfo
          guildName={character.guildName}
          guildRankName={character.guildRankName}
        />
        {character.totaltime > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {t("played")}: {formatPlayTime(character.totaltime)}
          </p>
        )}
      </div>

      {/* Character model with equipment slots around it */}
      <div className="max-w-[500px] mx-auto mb-8">
        <EquipmentPanel equipment={equipment}>
          <ModelViewer
            equipment={equipment}
            face={character.face}
            facialStyle={character.facialStyle}
            gender={character.gender}
            hairColor={character.hairColor}
            hairStyle={character.hairStyle}
            race={character.race}
            skin={character.skin}
          />
        </EquipmentPanel>
      </div>

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
