import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import CategoryContent from "./category-content";

import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string; category: string }>;
}): Promise<Metadata> {
  const { locale, realm, category } = await params;
  const t = await getTranslations({ locale, namespace: "meta.shopCategory" });
  const tShop = await getTranslations({ locale, namespace: "shop.categories" });

  const categoryLabel = tShop.has(category) ? tShop(category) : category;

  return buildPageMetadata(locale, `/${realm}/shop/${category}`, {
    title: t("title", { category: categoryLabel }),
    description: t("description", { category: categoryLabel }),
  });
}

export default function CategoryPage() {
  return <CategoryContent />;
}
