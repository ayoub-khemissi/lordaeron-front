"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import NextLink from "next/link";

import {
  RACE_NAMES,
  CLASS_NAMES,
  CLASS_COLORS,
  ALLIANCE_RACES,
} from "@/lib/armory-constants";
import { ArmorySearchResult } from "@/types/armory";
import { useRealm, useRealmHref } from "@/lib/realm-context";

export function ArmoryContent() {
  const realmHref = useRealmHref();
  const realm = useRealm();
  const t = useTranslations("armory");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArmorySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);

      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/armory/search?q=${encodeURIComponent(query.trim())}&realm=${realm.slug}`,
        );
        const data = await res.json();

        setResults(data.characters || []);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, realm.slug]);

  return (
    <div className="space-y-6">
      <Input
        classNames={{
          inputWrapper:
            "glass border border-wow-gold/20 hover:border-wow-gold/40",
          input: "text-white placeholder:text-gray-500",
        }}
        placeholder={t("searchPlaceholder")}
        size="lg"
        type="text"
        value={query}
        onValueChange={setQuery}
      />

      {loading && (
        <div className="flex justify-center py-8">
          <Spinner color="warning" size="lg" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-center text-gray-400 py-8">{t("noResults")}</p>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((char) => {
            const isAlliance = ALLIANCE_RACES.includes(char.race);

            return (
              <NextLink
                key={char.guid}
                className="block group"
                href={realmHref(`/armory/${char.name}`)}
              >
                <div className="glass rounded-xl px-4 py-3 border border-white/5 hover:border-wow-gold/30 transition-colors flex items-center gap-4">
                  {/* Online indicator */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      char.online ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />

                  {/* Name + class color */}
                  <span
                    className="font-semibold text-base group-hover:brightness-125 transition-all"
                    style={{ color: CLASS_COLORS[char.class] || "#FFFFFF" }}
                  >
                    {char.name}
                  </span>

                  {/* Level + Race + Class */}
                  <span className="text-sm text-gray-400">
                    {t("level")} {char.level}{" "}
                    {RACE_NAMES[char.race] || "Unknown"}{" "}
                    {CLASS_NAMES[char.class] || "Unknown"}
                  </span>

                  {/* Faction chip */}
                  <span
                    className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                      isAlliance
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {isAlliance ? "Alliance" : "Horde"}
                  </span>
                </div>
              </NextLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
