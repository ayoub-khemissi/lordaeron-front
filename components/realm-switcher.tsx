"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

import { usePathRealm, useRealmPreview } from "@/lib/realm-context";
import {
  REALMS,
  REALM_SLUGS,
  realmPath,
  realmView,
  type RealmSection,
  type RealmSlug,
} from "@/lib/realms";

const ACCENT = {
  gold: "border-wow-gold/40 text-wow-gold-light bg-wow-gold/10 hover:border-wow-gold/70",
  ice: "border-wow-blue-ice/40 text-wow-blue-ice bg-wow-blue-ice/10 hover:border-wow-blue-ice/70",
};

/* The realm being browsed, and the way to the other one: the same section when it has it, else its home; the portal at the end. */
export function RealmSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("realms");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const current = usePathRealm();
  const preview = useRealmPreview();

  if (!current) return null;
  const realm = REALMS[current];
  // the section after /<locale>/<realm>
  const rest = pathname.split("/").slice(3).join("/");
  const section = (rest.split("/")[0] || "home") as RealmSection;

  const go = (key: string) => {
    onNavigate?.();
    if (key === "portal") return router.push(`/${locale}`);
    const target = key as RealmSlug;

    router.push(
      realmView(target, preview).sections.includes(section) && rest
        ? realmPath(locale, target, `/${rest}`)
        : realmPath(locale, target),
    );
  };

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <button
          className={clsx(
            "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition",
            ACCENT[realm.accent],
          )}
          type="button"
        >
          <span
            className={clsx(
              "h-1.5 w-1.5 rounded-full",
              realm.accent === "ice" ? "bg-wow-blue-ice" : "bg-wow-gold",
            )}
          />
          {realm.name}
          {/* an administrator's view: the realm as on its opening day */}
          {preview && realm.status !== "open" && (
            <span
              className="rounded bg-wow-gold/20 px-1 py-px text-[9px] tracking-wider text-wow-gold-light"
              title={t("adminPreview")}
            >
              Admin
            </span>
          )}
          <svg
            aria-hidden
            className="h-3 w-3 opacity-70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("switch")}
        onAction={(key) => go(String(key))}
      >
        {[
          ...REALM_SLUGS.map((slug) => (
            <DropdownItem
              key={slug}
              description={t(`${slug}.tagline`)}
              endContent={
                REALMS[slug].status === "soon" ? (
                  <span className="rounded border border-wow-blue-ice/30 px-1.5 py-0.5 text-[10px] uppercase text-wow-blue-ice">
                    {t("soon")}
                  </span>
                ) : null
              }
            >
              {REALMS[slug].name}
            </DropdownItem>
          )),
          <DropdownItem key="portal" className="text-default-500">
            {t("allRealms")}
          </DropdownItem>,
        ]}
      </DropdownMenu>
    </Dropdown>
  );
}
