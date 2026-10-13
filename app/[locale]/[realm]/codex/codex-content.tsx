"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@heroui/input";
import clsx from "clsx";

import { CodexRowsSkeleton } from "./codex-skeleton";

import { CodexRow } from "@/components/codex/codex-row";
import { Pager } from "@/components/search/pager";
import { useRealm } from "@/lib/realm-context";
import {
  CODEX_PHASES,
  type CodexItem,
  type CodexKind,
  type CodexQuery,
  type CodexSourceType,
} from "@/lib/codex-types";

/* The codex (lib/codex.ts): a search with its filters (kind, source, phase, origin), kept in the address so a filtered list can be
   shared; pages of 20. */

interface Result {
  items: CodexItem[];
  total: number;
  page: number;
  pageSize: number;
  kinds: CodexKind[];
  sources: CodexSourceType[];
  phases: boolean;
  custom: boolean;
}

const SELECT =
  "w-full rounded-lg border border-wow-gold/20 bg-black/60 px-3 py-2 text-sm text-white outline-none transition-colors hover:border-wow-gold/40 focus:border-wow-gold/60";

export function CodexContent({ initial }: { initial: CodexQuery }) {
  const t = useTranslations("codex");
  const locale = useLocale();
  const realm = useRealm();
  const [query, setQuery] = useState(initial);
  const [text, setText] = useState(initial.text);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const request = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const set = (patch: Partial<CodexQuery>) =>
    setQuery((q) => ({ ...q, page: 1, ...patch }));

  // the typed text, a moment after the last key
  useEffect(() => {
    if (text === query.text) return;
    debounce.current = setTimeout(() => set({ text }), 300);

    return () => clearTimeout(debounce.current);
  }, [text, query.text]);

  useEffect(() => {
    const params = new URLSearchParams({
      realm: realm.slug,
      locale,
      page: String(query.page),
    });
    const shown = new URLSearchParams();

    for (const [k, v] of [
      ["q", query.text.trim()],
      ["kind", query.kind],
      ["source", query.source],
      ["phase", query.phase === null ? null : String(query.phase)],
      ["origin", query.origin],
    ] as const)
      if (v) {
        params.set(k, v);
        shown.set(k, v);
      }
    if (query.page > 1) shown.set("page", String(query.page));
    const url = new URL(window.location.href);

    url.search = shown.toString();
    window.history.replaceState(window.history.state, "", url);

    const id = ++request.current;

    setLoading(true);
    fetch(`/api/codex?${params}`)
      .then((r) => (r.ok ? (r.json() as Promise<Result>) : null))
      .then((r) => {
        if (id === request.current) setResult(r);
      })
      .catch(() => id === request.current && setResult(null))
      .finally(() => id === request.current && setLoading(false));
  }, [query, realm.slug, locale]);

  const pages = result
    ? Math.max(1, Math.ceil(result.total / result.pageSize))
    : 1;
  const page = (p: number) => {
    setQuery((q) => ({ ...q, page: p }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <Input
        classNames={{
          inputWrapper:
            "glass border border-wow-gold/20 hover:border-wow-gold/40",
          input: "text-white placeholder:text-gray-500",
        }}
        placeholder={t("searchPlaceholder")}
        size="lg"
        type="text"
        value={text}
        onValueChange={setText}
      />

      {/* the kinds */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">
          {[null, ...(result?.kinds ?? [])].map((k) => (
            <button
              key={k ?? "all"}
              className={clsx(
                "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors",
                query.kind === k
                  ? "border-wow-gold/60 bg-wow-gold/15 text-wow-gold-light"
                  : "border-white/10 bg-black/30 text-gray-300 hover:border-wow-gold/30",
              )}
              type="button"
              onClick={() => set({ kind: k })}
            >
              {k ? t(`kinds.${k}`) : t("all")}
            </button>
          ))}
        </div>
      </div>

      <div
        className={clsx(
          "grid gap-2",
          // phones: the source on its own line, the phase and the origin side by side
          result?.phases && result.custom
            ? "grid-cols-2 sm:grid-cols-3 [&>*:first-child]:col-span-2 sm:[&>*:first-child]:col-span-1"
            : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        <label className="block">
          <span className="mb-1 block text-xs text-gray-400">
            {t("source")}
          </span>
          <select
            className={SELECT}
            value={query.source ?? ""}
            onChange={(e) =>
              set({
                source: (e.target.value || null) as CodexSourceType | null,
              })
            }
          >
            <option value="">{t("allSources")}</option>
            {(result?.sources ?? []).map((s) => (
              <option key={s} value={s}>
                {t(`sourceFilters.${s}`)}
              </option>
            ))}
          </select>
        </label>
        {result?.phases && (
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">
              {t("phaseLabel")}
            </span>
            <select
              className={SELECT}
              value={query.phase ?? ""}
              onChange={(e) =>
                set({
                  phase: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            >
              <option value="">{t("allPhases")}</option>
              {CODEX_PHASES.map((p) => (
                <option key={p} value={p}>
                  {t("phase", { phase: p })}
                </option>
              ))}
            </select>
          </label>
        )}
        {result?.custom && (
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">
              {t("origin")}
            </span>
            <select
              className={SELECT}
              value={query.origin ?? ""}
              onChange={(e) =>
                set({
                  origin: (e.target.value || null) as CodexQuery["origin"],
                })
              }
            >
              <option value="">{t("allOrigins")}</option>
              <option value="custom">
                {t("originCustom", { realm: realm.name })}
              </option>
              <option value="blizzard">{t("originBlizzard")}</option>
            </select>
          </label>
        )}
      </div>

      {result && !loading && (
        <p className="text-sm text-gray-400">
          {t("resultsCount", { count: result.total })}
        </p>
      )}

      {loading && <CodexRowsSkeleton count={result?.items.length || 8} />}

      {!loading && (!result || result.items.length === 0) && (
        <p className="py-8 text-center text-gray-400">
          {result ? t("noResults") : t("error")}
        </p>
      )}

      {!loading && result && result.items.length > 0 && (
        <div className="space-y-2">
          {result.items.map((item) => (
            <CodexRow key={item.id} item={item} realmName={realm.name} />
          ))}
        </div>
      )}

      {!loading && result && (
        <Pager page={result.page} pages={pages} onPage={page} />
      )}
    </div>
  );
}
