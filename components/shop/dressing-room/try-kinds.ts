"use client";

import { useEffect, useState } from "react";

/* Which items the dressing room shows, asked in batches (app/api/shop/dressing-room/kinds): the magnifiers of the pages whose tooltips
   carry no such mark (the features' prepared ones). Kept for the visit. */

type Kind = "gear" | "creature" | null;

const known = new Map<string, Kind>();
const waiting = new Map<string, ((kind: Kind) => void)[]>();
let queue: { realm: string; id: number }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  timer = null;
  const batch = queue;

  queue = [];
  const byRealm = new Map<string, number[]>();

  for (const { realm, id } of batch)
    byRealm.set(realm, [...(byRealm.get(realm) ?? []), id]);
  for (const [realm, ids] of byRealm) {
    const unique = [...new Set(ids)];

    fetch(
      `/api/shop/dressing-room/kinds?realm=${realm}&ids=${unique.join(",")}`,
    )
      .then((r) => (r.ok ? r.json() : { kinds: {} }))
      .catch(() => ({ kinds: {} }))
      .then((data: { kinds: Record<string, Kind> }) => {
        for (const id of unique) {
          const key = `${realm}:${id}`;
          const kind = data.kinds?.[id] ?? null;

          known.set(key, kind);
          for (const done of waiting.get(key) ?? []) done(kind);
          waiting.delete(key);
        }
      });
  }
}

export function useTryKind(
  realm: string,
  entry: number | null | undefined,
): Kind {
  const key = entry ? `${realm}:${entry}` : "";
  const [kind, setKind] = useState<Kind>(() =>
    key ? (known.get(key) ?? null) : null,
  );

  useEffect(() => {
    if (!entry || !key) return;
    if (known.has(key)) {
      setKind(known.get(key) ?? null);

      return;
    }
    waiting.set(key, [...(waiting.get(key) ?? []), setKind]);
    if (!queue.some((q) => q.realm === realm && q.id === entry))
      queue.push({ realm, id: entry });
    if (!timer) timer = setTimeout(flush, 30);
  }, [key, realm, entry]);

  return kind;
}
