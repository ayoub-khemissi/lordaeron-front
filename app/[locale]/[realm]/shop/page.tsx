import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import ShopContent from "./shop-content";

import { JsonLd } from "@/components/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "meta.shop" });

  return buildPageMetadata(locale, `/${realm}/shop`, {
    title: t("title"),
    description: t("description"),
  });
}

export default async function ShopPage({
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
              name: "Shop",
              item: `${siteConfig.baseUrl}/${locale}/${realm}/shop`,
            },
          ],
        }}
      />
      <ShopContent />
    </>
  );
}
