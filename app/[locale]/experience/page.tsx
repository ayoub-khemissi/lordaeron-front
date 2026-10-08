import type { Metadata } from "next";

import ExperienceContent from "./experience-content";

// The realm showcase: hidden for now (no link, not in the sitemap, not indexed)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "fr"
        ? "Lordaeron · Le Norfendre comme jamais vécu"
        : "Lordaeron · Northrend as never lived before",
    robots: { index: false, follow: false },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ExperienceContent locale={locale} />;
}
