import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import RaidScalingContent from "./raid-scaling-content";

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
    namespace: "meta.raidScaling",
  });

  return buildPageMetadata(locale, `/${realm}/raid-scaling`, {
    title: t("title"),
    description: t("description"),
  });
}

export default async function RaidScalingPage({
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
              name: "Raid Scaling",
              item: `${siteConfig.baseUrl}/${locale}/${realm}/raid-scaling`,
            },
          ],
        }}
      />
      <RaidScalingContent />
    </>
  );
}
