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

// the letters of a search (a character's name has nothing else), as the API reads it
const searchText = (text: string) =>
  text
    .normalize("NFC")
    .replace(/[^\p{L}]/gu, "")
    .slice(0, 12);

/* The armory's search (Ayoub, 13/10/2026: a real one): any case or accent, spaces and signs dropped, the exact name first, then the
   names starting with the text; 20 a page with the total; the search and the page live in the address (?q=&page=), so the back
   button and a shared link find them again. */
export function ArmoryContent() {
  const realmHref = useRealmHref();
  const realm = useRealm();
  const t = useTranslations("armory");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ArmorySearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const text = searchText(query);

  // the search of the address, once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setQuery(params.get("q") ?? "");
    setPage(Math.max(1, Number(params.get("page")) || 1));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 2) {
      setResults([]);
      setTotal(0);
      setSearched(false);

      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/armory/search?q=${encodeURIComponent(text)}&page=${page}&realm=${realm.slug}`,
        );
        const data = await res.json();

        setResults(data.characters || []);
        setTotal(Number(data.total) || 0);
        setPageSize(Number(data.pageSize) || 20);
        setSearched(true);
        const url = new URL(window.location.href);

        url.searchParams.set("q", text);
        if (page > 1) url.searchParams.set("page", String(page));
        else url.searchParams.delete("page");
        window.history.replaceState(null, "", url);
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, page, realm.slug]);

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
        onValueChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
      />

      {!loading && searched && total > 0 && (
        <p className="text-sm text-gray-400">
          {t("resultsCount", { count: total })}
        </p>
      )}

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
                <div className="glass rounded-xl px-4 py-3 border border-white/5 hover:border-wow-gold/30 transition-all flex items-center gap-4 active:scale-[0.99]">
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
                  <span
                    aria-hidden
                    className="text-lg leading-none text-gray-500 transition-colors group-hover:text-wow-gold"
                  >
                    ›
                  </span>
                </div>
              </NextLink>
            );
          })}
        </div>
      )}

      {!loading && pages > 1 && (
        <nav
          aria-label={t("pageOf", { page, pages })}
          className="flex items-center justify-between gap-3"
        >
          <button
            className="rounded-lg border border-wow-gold/25 px-4 py-2 text-sm text-wow-gold-light transition-colors hover:border-wow-gold/50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1}
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← {t("previous")}
          </button>
          <span className="text-sm text-gray-400">
            {t("pageOf", { page, pages })}
          </span>
          <button
            className="rounded-lg border border-wow-gold/25 px-4 py-2 text-sm text-wow-gold-light transition-colors hover:border-wow-gold/50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= pages}
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            {t("next")} →
          </button>
        </nav>
      )}
    </div>
  );
}
