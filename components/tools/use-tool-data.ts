"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { useRealm } from "@/lib/realm-context";

/*
 * A Tools page's data (app/api/<tool>): fetched for the page's realm and language with `params`, again every `refreshMs` (the live ones)
 * and on reload(); the previous data stays on screen while a new one loads.
 */
export function useToolData<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  refreshMs = 0,
) {
  const realm = useRealm();
  const locale = useLocale();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const query = new URLSearchParams({ realm: realm.slug, locale });

  for (const [k, v] of Object.entries(params))
    if (v !== undefined) query.set(k, String(v));
  const url = `${endpoint}?${query}`;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as T;

        if (!cancelled) {
          setData(json);
          setError(false);
        }
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [url, tick]);

  useEffect(() => {
    if (!refreshMs) return;
    const id = setInterval(() => setTick((n) => n + 1), refreshMs);

    return () => clearInterval(id);
  }, [refreshMs]);

  const reload = useCallback(() => setTick((n) => n + 1), []);

  return { data, error, loading, reload };
}
