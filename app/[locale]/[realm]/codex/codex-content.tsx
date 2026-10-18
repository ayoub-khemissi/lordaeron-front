"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@heroui/input";
import clsx from "clsx";

import { CodexRowsSkeleton } from "./codex-skeleton";

import { CodexRow } from "@/components/codex/codex-row";
import { Pager } from "@/components/search/pager";
import { ToolSelect } from "@/components/tools/tool-select";
import { ToolTabs } from "@/components/tools/tool-tabs";
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
      <ToolTabs
        label={t("all")}
        options={[null, ...(result?.kinds ?? [])].map((k) => ({
          value: k ?? "all",
          label: k ? t(`kinds.${k}`) : t("all"),
        }))}
        value={query.kind ?? "all"}
        onChange={(k) =>
          set({ kind: k === "all" ? null : (k as CodexQuery["kind"]) })
        }
      />

      <div
        className={clsx(
          "grid gap-2",
          // phones: the source on its own line, the phase and the origin side by side
          result?.phases && result.custom
            ? "grid-cols-2 sm:grid-cols-3 [&>*:first-child]:col-span-2 sm:[&>*:first-child]:col-span-1"
            : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        <ToolSelect
          showLabel
          label={t("source")}
          options={[
            { value: "", label: t("allSources") },
            ...(result?.sources ?? []).map((s) => ({
              value: s,
              label: t(`sourceFilters.${s}`),
            })),
          ]}
          value={query.source ?? ""}
          onChange={(v) =>
            set({ source: (v || null) as CodexSourceType | null })
          }
        />
        {result?.phases && (
          <ToolSelect
            showLabel
            label={t("phaseLabel")}
            options={[
              { value: "", label: t("allPhases") },
              ...CODEX_PHASES.map((p) => ({
                value: String(p),
                label: t("phase", { phase: p }),
              })),
            ]}
            value={
              query.phase === null || query.phase === undefined
                ? ""
                : String(query.phase)
            }
            onChange={(v) => set({ phase: v === "" ? null : Number(v) })}
          />
        )}
        {result?.custom && (
          <ToolSelect
            showLabel
            label={t("origin")}
            options={[
              { value: "", label: t("allOrigins") },
              {
                value: "custom",
                label: t("originCustom", { realm: realm.name }),
              },
              { value: "blizzard", label: t("originBlizzard") },
            ]}
            value={query.origin ?? ""}
            onChange={(v) =>
              set({ origin: (v || null) as CodexQuery["origin"] })
            }
          />
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
