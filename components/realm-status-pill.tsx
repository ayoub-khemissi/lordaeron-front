"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";

import { launchParts } from "@/lib/launch";
import { useRealmAt } from "@/lib/realm-context";
import { REALMS, type RealmSlug } from "@/lib/realms";

/* A realm's state in one pill (Ayoub, 13/10/2026): before its opening, "Opens Oct 16 · 19:00 CEST", then "Name reservation open" from
   its reservationAt; once open, online or offline from its worldserver (/api/server/status, read every 30 s).
   withName: "Rimeheart · Online". */
export function RealmStatusPill({
  realm: slug,
  withName = false,
  className,
}: {
  realm: RealmSlug;
  withName?: boolean;
  className?: string;
}) {
  const t = useTranslations("common");
  const tr = useTranslations("realms");
  const tl = useTranslations("launch");
  const locale = useLocale();
  const realm = useRealmAt(slug);
  const open = realm.status === "open";
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    const read = async () => {
      try {
        const res = await fetch(`/api/server/status?realm=${slug}`);
        const data = await res.json();

        if (alive) setOnline(!!data.online);
      } catch {
        if (alive) setOnline(false);
      }
    };

    read();
    const id = setInterval(read, 30_000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [open, slug]);

  const at = REALMS[slug].launchAt;
  let label: string;
  let dot: string;

  if (realm.reservation) {
    label = tr("reservation");
    dot = "bg-emerald-300 shadow-[0_0_10px_#6ee7b7] animate-pulse";
  } else if (!open) {
    const p = at ? launchParts(at, locale) : null;

    label = p ? tl("opensOn", { date: `${p.short} · ${p.time}` }) : tr("soon");
    dot = "bg-wow-blue-ice shadow-[0_0_10px_#4fc3f7] animate-pulse";
  } else if (online === null) {
    label = t("loading");
    dot = "bg-white/40";
  } else if (online) {
    label = t("online");
    dot = "bg-green-400 shadow-[0_0_10px_#4ade80]";
  } else {
    label = t("offline");
    dot = "bg-red-500 shadow-[0_0_10px_#ef4444]";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/85 backdrop-blur-sm",
        className,
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {open && online && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        )}
        <span className={clsx("relative h-2 w-2 rounded-full", dot)} />
      </span>
      {withName && `${realm.name} · `}
      {label}
    </span>
  );
}
