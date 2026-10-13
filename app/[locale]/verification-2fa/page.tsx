import type { Metadata } from "next";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SecondFactorForm } from "@/components/second-factor-form";
import { readAdminSession } from "@/lib/admin-auth";
import { verifySession } from "@/lib/auth";
import { gmLevel } from "@/lib/second-factor";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "secondFactor" });

  return { title: t("title"), robots: { index: false, follow: false } };
}

// an address of this site only (no //host, no backslash), else null
function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;

  return next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\")
    ? next
    : null;
}

/*
 * The second-factor screen (majaliss's principle, Ayoub 13/10/2026): an administrator signed in enrols an authenticator app or types
 * its code, then goes on to `next`; a game master enrols their game account (?for=account). Anyone else has no business here.
 */
export default async function SecondFactorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[]; for?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const next = safeNext(query.next);
  const admin = await readAdminSession();

  if (query.for !== "account" && (query.for === "admin" || admin)) {
    if (!admin) redirect(`/${locale}/admin/login`);
    if (admin.mfa) redirect(next ?? `/${locale}/admin`);

    return (
      <SecondFactorForm factor="admin" next={next ?? `/${locale}/admin`} />
    );
  }

  const player = await verifySession();

  if (!player) redirect(`/${locale}/login`);
  if ((await gmLevel(player.id)) < 1) redirect(`/${locale}/account`);

  return (
    <SecondFactorForm factor="account" next={next ?? `/${locale}/account`} />
  );
}
