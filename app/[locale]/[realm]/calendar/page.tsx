import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { CalendarContent } from "./calendar-content";

import { ToolHeader } from "@/components/tools/tool-page";
import { buildPageMetadata } from "@/lib/seo";
import { DEFAULT_REALM, REALMS, realmBySlug } from "@/lib/realms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "calendar" });
  const name = realmBySlug(realm)?.name ?? REALMS[DEFAULT_REALM].name;

  return buildPageMetadata(locale, `/${realm}/calendar`, {
    title: t("metaTitle", { realm: name }),
    description: t("metaDescription", { realm: name }),
  });
}

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "calendar" });
  const name = realmBySlug(realm)?.name ?? REALMS[DEFAULT_REALM].name;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <ToolHeader lede={t("lede", { realm: name })} title={t("title")} />
      <CalendarContent />
    </div>
  );
}
