"use client";

import { useTranslations } from "next-intl";

import { useRealm } from "@/lib/realm-context";

/* A realm that is not open yet: its shop shows the catalogue, purchases open with the realm (lib/realms.ts status) */
export function RealmSoonBanner() {
  const t = useTranslations("shop");
  const realm = useRealm();

  return (
    <div className="mb-6 flex items-center gap-4 rounded-xl border border-wow-blue-ice/30 bg-gradient-to-r from-[#06121f]/90 to-transparent px-5 py-4">
      <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-wow-blue-ice shadow-[0_0_12px_#4fc3f7]" />
      <div>
        <p className="font-heading text-lg text-wow-blue-ice">
          {t("realmSoonTitle", { realm: realm.name })}
        </p>
        <p className="text-sm text-white/65">
          {t("realmSoonText", { realm: realm.name })}
        </p>
      </div>
    </div>
  );
}
