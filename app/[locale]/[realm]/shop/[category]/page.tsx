import type { Metadata } from "next";
import type { ShopCategory } from "@/types";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import ShopContent from "../shop-content";

import { buildPageMetadata } from "@/lib/seo";
import { SHOP_CATEGORIES } from "@/lib/shop-utils";

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

// a category of the shop: the shop itself, opened on it (an unknown category: the whole shop)
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; realm: string; category: string }>;
}) {
  const { locale, realm, category } = await params;

  if (!(SHOP_CATEGORIES as readonly string[]).includes(category))
    redirect(`/${locale}/${realm}/shop`);

  return <ShopContent initialCategory={category as ShopCategory} />;
}
