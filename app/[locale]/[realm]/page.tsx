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
        ? "Rimeheart, le nouveau royaume progressif Wrath of the Lich King de Lordaeron : raids héroïques, qualité Artefact, boss du monde, métiers réinventés. Ouverture le 16 octobre 2026 à 19h00 (heure de Paris)."
        : "Rimeheart, Lordaeron's new progressive Wrath of the Lich King realm: heroic raids, Artifact quality, world bosses, reinvented professions. Opens October 16, 2026 at 19:00 CEST (17:00 UTC).",
    // shared links show the timeline banner
    openGraph: {
      images: [
        {
          url: `/img/rimeheart/timeline-${locale === "fr" ? "fr" : "en"}.jpg`,
          width: 1920,
          height: 1080,
          alt: "Rimeheart",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/img/rimeheart/timeline-${locale === "fr" ? "fr" : "en"}.jpg`],
    },
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
