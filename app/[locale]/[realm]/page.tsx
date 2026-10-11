import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { LordaeronHome, lordaeronHomeMetadata } from "./lordaeron-home";

import { LANGS, type Lang, meta } from "@/components/rimeheart/content";
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
