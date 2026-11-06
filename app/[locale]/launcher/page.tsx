import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { LauncherPage } from "@/components/launcher/launcher-page";
import { launcherInfo } from "@/lib/patches";
import { DEFAULT_REALM } from "@/lib/realms";
import { buildPageMetadata } from "@/lib/seo";

// the published build is read at each request (scripts/launcher-publish.sh writes launcher/latest.json): a new one shows at once
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.launcher" });

  return buildPageMetadata(locale, "/launcher", {
    title: t("title"),
    description: t("description"),
  });
}

// The Lordaeron launcher's page (Ayoub, 06/11/2026): what it does, its screens, its download and its questions
export default async function LauncherRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LauncherPage
      howTo={`/${locale}/${DEFAULT_REALM}/how-to`}
      launcher={await launcherInfo()}
    />
  );
}
