import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { PopulationContent } from "./population-content";

import { buildPageMetadata } from "@/lib/seo";
import { realmPopulation } from "@/lib/queries/population";
import { viewerSeesGm } from "@/lib/queries/realm-search";
import { DEFAULT_REALM, REALMS, realmBySlug, requestRealm } from "@/lib/realms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "population" });
  const name = realmBySlug(realm)?.name ?? REALMS[DEFAULT_REALM].name;

  return buildPageMetadata(locale, `/${realm}/population`, {
    title: t("metaTitle", { realm: name }),
    description: t("metaDescription", { realm: name }),
  });
}

// the counts of the moment, at each request
export const dynamic = "force-dynamic";

export default async function PopulationPage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "population" });
  const stats = await realmPopulation(
    requestRealm(realm),
    await viewerSeesGm(),
  ).catch((error) => {
    console.error("Population error:", error);

    return null;
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="mb-3 text-3xl font-bold wow-gradient-text sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-gray-400">
          {t("subtitle", { realm: realmBySlug(realm)?.name ?? "" })}
        </p>
        <div className="shimmer-line mx-auto mt-3 w-24" />
      </div>
      <PopulationContent stats={stats} />
    </div>
  );
}
