"use client";

import type { ShopPurchaseWithItem } from "@/types";
import type { AccountBan, AccountRealm } from "@/types/account";
import type { AccountSecurity as SecurityState } from "@/components/account/account-header";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";

import { AccountSkeleton } from "./account-skeleton";

import { useAuth } from "@/lib/auth-context";
import { AccountHeader } from "@/components/account/account-header";
import {
  ACCOUNT_TABS,
  AccountNav,
  type AccountTab,
} from "@/components/account/account-nav";
import { AccountOverview } from "@/components/account/account-overview";
import { AccountCharacters } from "@/components/account/account-characters";
import { AccountSecurity } from "@/components/account/account-security";
import { AccountPurchases } from "@/components/account/account-purchases";
import { BanAlert } from "@/components/account/account-ui";

interface AccountData {
  account: { id: number; username: string; email: string; joindate: string };
  soulShards: number;
  realms: AccountRealm[];
  restoreCost: number;
  accountBan: AccountBan | null;
  ipBan: AccountBan | null;
}

// the section in the address (#characters...), so a link opens it and a reload keeps it; #purchases from the shop's links
function tabFromHash(): AccountTab {
  if (typeof window === "undefined") return "overview";
  const hash = window.location.hash.slice(1) as AccountTab;

  return ACCOUNT_TABS.includes(hash) ? hash : "overview";
}

/* The account (Ayoub, 18/10/2026: laid out again, every realm in it): its identity at the top, its sections on the left (on top on a
   phone): the overview (security to finish, each realm with its state and the account's characters, the last purchases), the
   characters realm by realm, the security, the purchases */
export default function AccountPage() {
  const t = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [data, setData] = useState<AccountData | null>(null);
  const [purchases, setPurchases] = useState<ShopPurchaseWithItem[]>([]);
  const [security, setSecurity] = useState<SecurityState | null>(null);
  const [loading, setLoading] = useState(true);
  // the account could not be read (not a lost session: that one goes to the sign-in): said, with a retry, never a loop to the sign-in
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<AccountTab>("overview");
  const [realm, setRealm] = useState<AccountRealm["slug"]>("lordaeron");

  const loadAccount = useCallback(async () => {
    const res = await fetch(`/api/account?locale=${locale}`);

    if (res.status === 401) {
      router.replace(`/${locale}/login`);

      return null;
    }
    if (!res.ok) throw new Error(`account ${res.status}`);
    const next = (await res.json()) as AccountData;

    setData(next);

    return next;
  }, [locale, router]);

  const loadPurchases = useCallback(async () => {
    const res = await fetch("/api/shop/purchases");

    if (res.ok) setPurchases((await res.json()).purchases || []);
  }, []);

  // the overview's security at a glance (the cards of the security section read them again themselves)
  const loadSecurity = useCallback(async () => {
    const [email, factor] = await Promise.all([
      fetch("/api/account/email").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/auth/second-factor?for=account&status=1").then((r) =>
        r.ok ? r.json() : null,
      ),
    ]);

    setSecurity({
      email: email?.email ?? null,
      emailVerified: !!email?.emailVerified,
      twoFactor: factor?.allowed ? !!factor.enrolled : null,
    });
  }, []);

  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());

    window.addEventListener("hashchange", onHash);

    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace(`/${locale}/login`);

      return;
    }
    setFailed(false);
    Promise.all([
      loadAccount(),
      loadPurchases().catch(() => undefined),
      loadSecurity().catch(() => undefined),
    ])
      .then(([account]) => {
        // the characters' realm: the first where the account has some
        const first = account?.realms?.find((r) => r.characters.length);

        if (first) setRealm(first.slug);
      })
      .catch((e) => {
        console.error("Account:", e);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [
    authUser,
    authLoading,
    locale,
    router,
    loadAccount,
    loadPurchases,
    loadSecurity,
  ]);

  const navigate = (next: AccountTab, nextRealm?: AccountRealm["slug"]) => {
    setTab(next);
    if (nextRealm) setRealm(nextRealm);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (authLoading || loading) return <AccountSkeleton />;
  if (failed || !data?.account)
    return (
      <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <p className="text-lg font-semibold text-gray-100">{t("loadError")}</p>
        <p className="mt-1 text-sm text-gray-400">{t("loadErrorHint")}</p>
        <Button
          className="mt-5 bg-wow-gold/15 font-semibold text-wow-gold-light"
          variant="flat"
          onPress={() => window.location.reload()}
        >
          {t("retry")}
        </Button>
      </div>
    );

  const characterCount = data.realms.reduce(
    (sum, r) => sum + r.characters.length,
    0,
  );
  const securityTodo =
    !!security &&
    (!security.email ||
      !security.emailVerified ||
      security.twoFactor === false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-wow-darker">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-cover bg-center opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage:
            "url('/img/World of Warcraft Classic 1920x1080/ClassicLaunch_WoW_Andorhal_1920x1080.jpg')",
        }}
      />

      <div className="relative container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 12 }}
        >
          <AccountHeader
            joindate={data.account.joindate}
            locale={locale}
            security={security}
            soulShards={data.soulShards}
            username={data.account.username}
            onSecurity={() => navigate("security")}
          />
        </motion.div>

        {(data.accountBan || data.ipBan) && (
          <div className="mt-4 space-y-3">
            {data.accountBan && (
              <BanAlert ban={data.accountBan} locale={locale} type="account" />
            )}
            {data.ipBan && (
              <BanAlert ban={data.ipBan} locale={locale} type="ip" />
            )}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <aside>
            <AccountNav
              items={[
                { key: "overview", label: t("navOverview") },
                {
                  key: "characters",
                  label: t("navCharacters"),
                  count: characterCount,
                },
                {
                  key: "security",
                  label: t("navSecurity"),
                  warning: securityTodo,
                },
                {
                  key: "purchases",
                  label: t("navPurchases"),
                  count: purchases.length,
                },
              ]}
              label={t("title")}
              selected={tab}
              onSelect={(next) => navigate(next)}
            />
          </aside>

          <motion.main
            key={tab}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "overview" && (
              <AccountOverview
                locale={locale}
                purchases={purchases}
                realms={data.realms}
                security={security}
                onNavigate={navigate}
              />
            )}
            {tab === "characters" && (
              <AccountCharacters
                locale={locale}
                realm={realm}
                realms={data.realms}
                restoreCost={data.restoreCost}
                soulShards={data.soulShards}
                onChanged={async () => {
                  await loadAccount();
                }}
                onRealm={setRealm}
              />
            )}
            {tab === "security" && <AccountSecurity locale={locale} />}
            {tab === "purchases" && (
              <AccountPurchases
                locale={locale}
                purchases={purchases}
                onRefunded={async () => {
                  await Promise.all([loadPurchases(), loadAccount()]);
                }}
              />
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
