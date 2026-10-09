"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

import {
  DEFAULT_REALM,
  REALMS,
  isRealmSlug,
  realmPath,
  type RealmInfo,
  type RealmSlug,
} from "@/lib/realms";

/* The realm a page belongs to (app/[locale]/[realm]/layout.tsx provides it); outside a realm (the portal, the account) it is read from
   the address, else the default realm. */
const RealmContext = createContext<RealmSlug | null>(null);

export function RealmProvider({
  realm,
  children,
}: {
  realm: RealmSlug;
  children: ReactNode;
}) {
  return (
    <RealmContext.Provider value={realm}>{children}</RealmContext.Provider>
  );
}

// the realm of the address (/fr/rimeheart/... -> rimeheart), null outside a realm
export function usePathRealm(): RealmSlug | null {
  const segment = usePathname()?.split("/")[2];

  return isRealmSlug(segment) ? segment : null;
}

export function useRealm(): RealmInfo {
  const fromContext = useContext(RealmContext);
  const fromPath = usePathRealm();

  return REALMS[fromContext ?? fromPath ?? DEFAULT_REALM];
}

// a page of the current realm: href("/shop/mounts") -> "/fr/rimeheart/shop/mounts"
export function useRealmHref() {
  const locale = useLocale();
  const realm = useRealm();

  return (path = "") => realmPath(locale, realm.slug, path);
}
