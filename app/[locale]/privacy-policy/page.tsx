import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { LegalAccordion } from "@/components/legal-accordion";
import { JsonLd } from "@/components/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

const sectionKeys = [
  "controller",
  "dataCollected",
  "purposes",
  "legalBasis",
  "storage",
  "thirdParties",
  "rights",
  "cookies",
  "emails",
  "secondFactor",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.rgpd" });

  return buildPageMetadata(locale, "/privacy-policy", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function RgpdPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
              name: "Privacy Policy",
              item: `${siteConfig.baseUrl}/${locale}/privacy-policy`,
            },
          ],
        }}
      />
      <LegalAccordion namespace="rgpd" sectionKeys={sectionKeys} />
    </>
  );
}
