import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";

import { CodexContent } from "./codex-content";

import { buildPageMetadata } from "@/lib/seo";
import { isCodexKind, isCodexSource } from "@/lib/codex-types";
import { pageParam } from "@/lib/queries/realm-search";
import { DEFAULT_REALM, REALMS, realmBySlug } from "@/lib/realms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; realm: string }>;
}): Promise<Metadata> {
  const { locale, realm } = await params;
  const t = await getTranslations({ locale, namespace: "codex" });
  const name = realmBySlug(realm)?.name ?? REALMS[DEFAULT_REALM].name;

  return buildPageMetadata(locale, `/${realm}/codex`, {
    title: t("metaTitle", { realm: name }),
    description: t("metaDescription", { realm: name }),
  });
}

export default async function CodexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; realm: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, realm } = await params;
  const q = await searchParams;
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? null;
  const t = await getTranslations({ locale, namespace: "codex" });
  const info = realmBySlug(realm) ?? REALMS[DEFAULT_REALM];
  const kind = one(q.kind);
  const source = one(q.source);
  const phase = one(q.phase);
  const origin = one(q.origin);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold wow-gradient-text sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-gray-400 sm:text-base">
          {t(info.slug === "rimeheart" ? "subtitleCustom" : "subtitle", {
            realm: info.name,
          })}
        </p>
        <div className="shimmer-line mx-auto mt-3 w-24" />
      </div>
      <CodexContent
        initial={{
          text: (one(q.q) ?? "").slice(0, 60),
          kind: isCodexKind(kind) ? kind : null,
          source: isCodexSource(source) ? source : null,
          phase: phase && /^[0-5]$/.test(phase) ? Number(phase) : null,
          origin: origin === "custom" || origin === "blizzard" ? origin : null,
          page: pageParam(one(q.page)),
        }}
      />
    </div>
  );
}
