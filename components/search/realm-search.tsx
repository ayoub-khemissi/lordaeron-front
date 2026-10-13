"use client";

import type { SearchKind } from "@/lib/search-text";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Input } from "@heroui/input";

import { Pager } from "./pager";

import { SkeletonRows } from "@/components/skeleton";
import { useRealm } from "@/lib/realm-context";
import { SEARCH_MIN, searchText } from "@/lib/search-text";

/* A realm's name search (Ayoub, 13/10/2026: one real search for the armory and the guilds): any case or accent, the text cleaned as the
   server reads it (lib/search-text.ts), the exact name then the prefix first, 20 a page with the total; the search and the page live in
   the address (?q=&page=) so the back button and a shared link find them again. `endpoint` answers { [listKey]: T[], total, pageSize };
   with `browse`, under SEARCH_MIN letters it lists everything (the guilds, few enough to look through). */
export function RealmSearch<T>({
  endpoint,
  listKey,
  kind,
  placeholder,
  noResults,
  countLabel,
  itemKey,
  renderItem,
  browse = false,
}: {
  endpoint: string;
  listKey: string;
  kind: SearchKind;
  placeholder: string;
  noResults: string;
  countLabel: (count: number) => string;
  itemKey: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
  browse?: boolean;
}) {
  const realm = useRealm();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const text = searchText(query, kind);

  // the search of the address, once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setQuery(params.get("q") ?? "");
    setPage(Math.max(1, Number(params.get("page")) || 1));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const filtered = text.length >= SEARCH_MIN;

    if (!filtered && !browse) {
      setItems([]);
      setTotal(0);
      setSearched(false);

      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${endpoint}?q=${filtered ? encodeURIComponent(text) : ""}&page=${page}&realm=${realm.slug}`,
        );
        const data = await res.json();

        setItems(data[listKey] || []);
        setTotal(Number(data.total) || 0);
        setPageSize(Number(data.pageSize) || 20);
        setSearched(true);
        const url = new URL(window.location.href);

        if (filtered) url.searchParams.set("q", text);
        else url.searchParams.delete("q");
        if (page > 1) url.searchParams.set("page", String(page));
        else url.searchParams.delete("page");
        window.history.replaceState(null, "", url);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, page, realm.slug, endpoint, listKey, browse]);

  return (
    <div className="space-y-6">
      <Input
        classNames={{
          inputWrapper:
            "glass border border-wow-gold/20 hover:border-wow-gold/40",
          input: "text-white placeholder:text-gray-500",
        }}
        placeholder={placeholder}
        size="lg"
        type="text"
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
      />

      {!loading && searched && total > 0 && (
        <p className="text-sm text-gray-400">{countLabel(total)}</p>
      )}

      {/* the rows to come, as many as the page shows (the guilds listed before a name is typed: from the start) */}
      {(loading || (browse && !searched)) && (
        <SkeletonRows
          count={Math.min(pageSize, items.length || 8)}
          lead={
            kind === "guild" ? "h-11 w-11 rounded-full" : "h-[22px] w-[46px]"
          }
          trail={
            kind === "guild" ? "h-6 w-20 rounded-full" : "h-6 w-16 rounded-full"
          }
        />
      )}

      {!loading && searched && items.length === 0 && (
        <p className="py-8 text-center text-gray-400">{noResults}</p>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={itemKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      )}

      {!loading && <Pager page={page} pages={pages} onPage={setPage} />}
    </div>
  );
}
