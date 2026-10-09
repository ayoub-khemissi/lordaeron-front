import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { FeaturesGrid } from "@/components/features-grid";
import { RatesSection } from "@/components/rates-table";
import { JsonLd } from "@/components/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "meta.features" });

  return buildPageMetadata(locale, `/${realm}/features`, {
    title: t("title"),
    description: t("description"),
  });
}

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;

  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/img/Burning Crusade Classic  Black Temple Screenshots 1080/BCC_Hyjal_Archimonde.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />

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
              name: "Features",
              item: `${siteConfig.baseUrl}/${locale}/${realm}/features`,
            },
          ],
        }}
      />

      <div className="relative container mx-auto max-w-7xl px-6 py-16 space-y-20">
        <RatesSection />
        <FeaturesGrid />
      </div>
    </div>
  );
}
