import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import HowToContent from "./how-to-content";

import { JsonLd } from "@/components/json-ld";
import { patchInfo } from "@/lib/patches";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { DEFAULT_REALM, REALMS, realmBySlug } from "@/lib/realms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "meta.howTo" });
  const name = realmBySlug(realm)?.name ?? REALMS[DEFAULT_REALM].name;

  return buildPageMetadata(locale, `/${realm}/how-to`, {
    title: t("title", { realm: name }),
    description: t("description", { realm: name }),
  });
}

// the client patches' manifest is read at each request (lib/patches.ts): a new patch shows without a rebuild
export const dynamic = "force-dynamic";

export default async function HowToPage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;
  // Rimeheart's client patches, published by nginx with their manifest: patch-W (its content) and patch-Z (shared with Lordaeron)
  const realmPatches =
    realm === "rimeheart"
      ? await Promise.all([patchInfo("patch-W.MPQ"), patchInfo("patch-Z.MPQ")])
      : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${siteConfig.baseUrl}/${locale}`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "How to Connect",
              item: `${siteConfig.baseUrl}/${locale}/${realm}/how-to`,
            },
          ],
        }}
      />
      <HowToContent
        realmPatch={realmPatches?.[0] ?? null}
        sharedPatch={realmPatches?.[1] ?? null}
      />
    </>
  );
}
