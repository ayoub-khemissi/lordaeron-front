import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import EpicProgressionContent from "./epic-progression-content";

import { JsonLd } from "@/components/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({
    locale,
    namespace: "meta.epicProgression",
  });

  return buildPageMetadata(locale, `/${realm}/epic-progression`, {
    title: t("title"),
    description: t("description"),
  });
}

export default async function EpicProgressionPage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;

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
              name: "Epic Progression",
              item: `${siteConfig.baseUrl}/${locale}/${realm}/epic-progression`,
            },
          ],
        }}
      />
      <EpicProgressionContent />
    </>
  );
}
