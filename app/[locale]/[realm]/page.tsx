import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { LordaeronHome, lordaeronHomeMetadata } from "./lordaeron-home";

import ExperienceContent from "@/components/rimeheart/showcase";
import { isRealmSlug } from "@/lib/realms";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;

  if (realm === "lordaeron") return lordaeronHomeMetadata(locale);

  return buildPageMetadata(locale, "/rimeheart", {
    title:
      locale === "fr"
        ? "Rimeheart · Le Norfendre comme jamais vécu"
        : "Rimeheart · Northrend as never lived before",
    description:
      locale === "fr"
        ? "Rimeheart, le nouveau royaume progressif Wrath of the Lich King de Lordaeron : raids héroïques, qualité Artefact, boss du monde, métiers réinventés. En développement, ouverture prochaine."
        : "Rimeheart, Lordaeron's new progressive Wrath of the Lich King realm: heroic raids, Artifact quality, world bosses, reinvented professions. In development, coming soon.",
  });
}

// a realm's home: Lordaeron's (the former home), Rimeheart's showcase
export default async function RealmHomePage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;

  if (!isRealmSlug(realm)) notFound();
  if (realm === "lordaeron") return <LordaeronHome />;

  return <ExperienceContent locale={locale} />;
}
