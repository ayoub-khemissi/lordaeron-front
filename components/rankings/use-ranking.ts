"use client";

import { useCallback, useEffect, useState } from "react";

import { useRealm } from "@/lib/realm-context";

/* A ranking's state (the PvP ladder, the hall of fame): its parameters (the board or the sort, ?faction=, ?class=, ?page=) read once
   from the address and kept in it (the back button and a shared link find them again), the page's data fetched from `endpoint` for
   the realm being browsed. Changing a filter goes back to page 1. */
export function useRanking<T>(
  endpoint: string,
  defaults: Record<string, string>,
) {
  const realm = useRealm();
  const [params, setParams] = useState<Record<string, string> | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // the address's parameters, once
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    const read: Record<string, string> = { ...defaults, page: "1" };

    for (const key of [...Object.keys(defaults), "page"]) {
      const value = url.get(key);

      if (value) read[key] = value;
    }
    setParams(read);
  }, []);

  useEffect(() => {
    if (!params) return;
    let cancelled = false;
    const query = new URLSearchParams({ ...params, realm: realm.slug });

    setLoading(true);
    fetch(`${endpoint}?${query}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    const url = new URL(window.location.href);

    for (const [key, value] of Object.entries(params)) {
      if (value && value !== (key === "page" ? "1" : defaults[key]))
        url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, "", url);

    return () => {
      cancelled = true;
    };
  }, [params, realm.slug, endpoint]);

  const set = useCallback((key: string, value: string) => {
    setParams((p) =>
      p ? { ...p, [key]: value, ...(key === "page" ? {} : { page: "1" }) } : p,
    );
  }, []);

  return {
    params: params ?? { ...defaults, page: "1" },
    set,
    data,
    loading,
    failed,
  };
}
