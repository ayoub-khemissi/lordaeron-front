"use client";

import { useLocale, useTranslations } from "next-intl";

import { PROFESSION_SKILL_IDS } from "@/lib/armory-constants";
import { ArmoryProfession } from "@/types/armory";

// Blizzard's profession names in each of the site's languages (Ayoub, 13/10/2026), English for any other; their game icons are under
// public/img/professions/<skill id>.jpg
const PROFESSION_NAMES: Record<string, Record<number, string>> = {
  fr: {
    164: "Forge",
    165: "Travail du cuir",
    171: "Alchimie",
    182: "Herboristerie",
    186: "Minage",
    197: "Couture",
    202: "Ingénierie",
    333: "Enchantement",
    755: "Joaillerie",
    773: "Calligraphie",
    129: "Secourisme",
    356: "Pêche",
    185: "Cuisine",
  },
  de: {
    164: "Schmiedekunst",
    165: "Lederverarbeitung",
    171: "Alchemie",
    182: "Kräuterkunde",
    186: "Bergbau",
    197: "Schneiderei",
    202: "Ingenieurskunst",
    333: "Verzauberkunst",
    755: "Juwelierskunst",
    773: "Inschriftenkunde",
    129: "Erste Hilfe",
    356: "Angeln",
    185: "Kochkunst",
  },
  es: {
    164: "Herrería",
    165: "Peletería",
    171: "Alquimia",
    182: "Herboristería",
    186: "Minería",
    197: "Sastrería",
    202: "Ingeniería",
    333: "Encantamiento",
    755: "Joyería",
    773: "Inscripción",
    129: "Primeros auxilios",
    356: "Pesca",
    185: "Cocina",
  },
  it: {
    164: "Forgiatura",
    165: "Conciatura",
    171: "Alchimia",
    182: "Erbalismo",
    186: "Estrazione",
    197: "Sartoria",
    202: "Ingegneria",
    333: "Incantamento",
    755: "Oreficeria",
    773: "Runografia",
    129: "Primo soccorso",
    356: "Pesca",
    185: "Cucina",
  },
  pl: {
    164: "Kowalstwo",
    165: "Kaletnictwo",
    171: "Alchemia",
    182: "Zielarstwo",
    186: "Górnictwo",
    197: "Krawiectwo",
    202: "Inżynieria",
    333: "Zaklinanie",
    755: "Jubilerstwo",
    773: "Inskrypcja",
    129: "Pierwsza pomoc",
    356: "Wędkarstwo",
    185: "Gotowanie",
  },
  pt: {
    164: "Ferraria",
    165: "Couraria",
    171: "Alquimia",
    182: "Herborismo",
    186: "Mineração",
    197: "Alfaiataria",
    202: "Engenharia",
    333: "Encantamento",
    755: "Joalheria",
    773: "Escrivania",
    129: "Primeiros Socorros",
    356: "Pesca",
    185: "Culinária",
  },
  ru: {
    164: "Кузнечное дело",
    165: "Кожевничество",
    171: "Алхимия",
    182: "Травничество",
    186: "Горное дело",
    197: "Портняжное дело",
    202: "Инженерное дело",
    333: "Наложение чар",
    755: "Ювелирное дело",
    773: "Начертание",
    129: "Первая помощь",
    356: "Рыбная ловля",
    185: "Кулинария",
  },
};

interface ProfessionsPanelProps {
  professions: ArmoryProfession[];
}

export function ProfessionsPanel({ professions }: ProfessionsPanelProps) {
  const t = useTranslations("armory");
  const locale = useLocale();

  if (professions.length === 0) {
    return <p className="text-sm text-gray-500 italic">{t("noProfessions")}</p>;
  }

  return (
    <div className="space-y-3">
      {professions.map((prof) => {
        const name =
          PROFESSION_NAMES[locale]?.[prof.skill] ??
          PROFESSION_SKILL_IDS[prof.skill] ??
          `Skill ${prof.skill}`;
        const icon = PROFESSION_SKILL_IDS[prof.skill]
          ? `/img/professions/${prof.skill}.jpg`
          : null;
        const pct = prof.max > 0 ? (prof.value / prof.max) * 100 : 0;

        return (
          <div
            key={prof.skill}
            className="glass rounded-lg p-3 border border-white/5"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-2.5 text-sm font-medium text-white">
                {icon && (
                  <img
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-md border border-wow-gold/40 object-cover shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    height={32}
                    loading="lazy"
                    src={icon}
                    width={32}
                  />
                )}
                {name}
              </span>
              <span className="text-xs text-gray-400">
                {prof.value} / {prof.max}
              </span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wow-gold/70 to-wow-gold rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
