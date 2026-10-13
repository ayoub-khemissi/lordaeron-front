import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { LordaeronJsonLd, lordaeronHomeMetadata } from "./lordaeron-home";

import { LANGS, type Lang, meta } from "@/components/rimeheart/content";
import { REALM_HOMES, RealmHome } from "@/components/realm-home";
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

  const lang: Lang = (LANGS as readonly string[]).includes(locale)
    ? (locale as Lang)
    : "en";

  return buildPageMetadata(locale, "/rimeheart", {
    title: meta.title[lang],
    description: meta.description[lang],
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

// a realm's home, drawn by the realm-home template from the realm's definition (components/realm-home; Ayoub, 13/10/2026); Rimeheart's
// long showcase moved to /<locale>/rimeheart/features
export default async function RealmHomePage({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { locale, realm } = await params;

  if (!isRealmSlug(realm)) notFound();
  const definition = await REALM_HOMES[realm](locale);

  return (
    <>
      {realm === "lordaeron" && <LordaeronJsonLd />}
      <RealmHome definition={definition} />
    </>
  );
}
