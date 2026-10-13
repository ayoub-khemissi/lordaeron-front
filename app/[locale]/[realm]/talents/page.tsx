import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { TalentCalculator } from "@/components/talents/talent-calculator";
import { buildPageMetadata } from "@/lib/seo";
import { classTalents, talentClasses } from "@/lib/talents";
import { CLASS_IDS, MAX_LEVEL, isClassKey } from "@/lib/talent-build";
import { DEFAULT_REALM, REALMS, isRealmSlug, realmBySlug } from "@/lib/realms";
import { tooltipLocale } from "@/lib/tooltips/http";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "talents" });
  const name = realmBySlug(realm)?.name ?? REALMS[DEFAULT_REALM].name;

  return buildPageMetadata(locale, `/${realm}/talents`, {
    title: t("metaTitle", { realm: name }),
    description: t("metaDescription", { realm: name }),
  });
}

// the trees are the realm's DBC (read at the request, kept 10 minutes by lib/talents.ts); the build is the address's
export const dynamic = "force-dynamic";

export default async function TalentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; realm: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, realm } = await params;
  const query = await searchParams;

  if (!isRealmSlug(realm)) notFound();
  const lang = tooltipLocale(locale);
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const asked = one(query.class);
  const key = isClassKey(asked) ? asked : "warrior";
  const build = one(query.build) ?? null;
  const level = Math.min(
    MAX_LEVEL,
    Math.max(10, Number(one(query.level)) || MAX_LEVEL),
  );
  const [t, classes, initial] = await Promise.all([
    getTranslations({ locale, namespace: "talents" }),
    talentClasses(realm, lang),
    classTalents(realm, CLASS_IDS[key], lang),
  ]);

  if (!initial) notFound();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold wow-gradient-text sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-gray-400 sm:text-base">
          {t("subtitle", { realm: realmBySlug(realm)?.name ?? realm })}
        </p>
        <div className="shimmer-line mx-auto mt-3 w-24" />
      </div>
      <TalentCalculator
        classes={classes}
        initial={initial}
        initialBuild={build && /^[0-9-]{1,120}$/.test(build) ? build : null}
        initialLevel={level}
      />
    </div>
  );
}
