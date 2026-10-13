"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

import {
  ADMIN_PREVIEW_COOKIE,
  DEFAULT_REALM,
  REALMS,
  isRealmSlug,
  realmView,
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

// an administrator's view of the realms (lib/realms.ts realmView), known after the first render (the cookie is the browser's)
export function useRealmPreview(): boolean {
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setPreview(
      document.cookie
        .split("; ")
        .some((c) => c === `${ADMIN_PREVIEW_COOKIE}=1`),
    );
  }, []);

  return preview;
}

// the clock the realms' openings (and name reservations) are read on (lib/realms.ts realmAt): 0 until mounted, so the server render and
// the first client render match (both show the configured status); then the time, read again at the next of those instants, so a page
// left open switches by itself
export function useLaunchClock(): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const t = Date.now();
      const next = Object.values(REALMS)
        .flatMap((r) => [r.reservationAt, r.launchAt])
        .map((at) => (at ? Date.parse(at) : NaN))
        .filter((at) => at > t)
        .sort((a, b) => a - b)[0];

      setNow(t);
      // (setTimeout holds 24 days at most: a farther opening is read again then)
      if (next !== undefined)
        timer = setTimeout(tick, Math.min(next - t + 250, 2_000_000_000));
    };

    tick();

    return () => clearTimeout(timer);
  }, []);

  return now;
}

// a realm as the visitor sees it now (its opening reached, an administrator's preview)
export function useRealmAt(slug: RealmSlug): RealmInfo {
  return realmView(slug, useRealmPreview(), useLaunchClock());
}

export function useRealm(): RealmInfo {
  const fromContext = useContext(RealmContext);
  const fromPath = usePathRealm();

  return useRealmAt(fromContext ?? fromPath ?? DEFAULT_REALM);
}

// the realm a visitor signs up for (Ayoub, 13/10/2026: Rimeheart's players keep their realm through the signup): ?realm=<slug>, else the
// realm page they came from; null for none. In the browser only (an effect, an event).
export function readSignupRealm(): RealmSlug | null {
  const param = new URLSearchParams(window.location.search).get("realm");

  if (isRealmSlug(param)) return param;
  try {
    const ref = new URL(document.referrer);
    const segment = ref.pathname.split("/")[2];

    if (ref.host === window.location.host && isRealmSlug(segment))
      return segment;
  } catch {
    // no referrer
  }

  return null;
}

// readSignupRealm, known after the first render (like the preview)
export function useSignupRealm(): RealmSlug | null {
  const [realm, setRealm] = useState<RealmSlug | null>(null);

  useEffect(() => setRealm(readSignupRealm()), []);

  return realm;
}

// a page of the current realm: href("/shop/mounts") -> "/fr/rimeheart/shop/mounts"
export function useRealmHref() {
  const locale = useLocale();
  const realm = useRealm();

  return (path = "") => realmPath(locale, realm.slug, path);
}
