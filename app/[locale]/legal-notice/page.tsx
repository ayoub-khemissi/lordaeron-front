import type { Metadata } from "next";
import type { ReactNode } from "react";

import NextLink from "next/link";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@/components/json-ld";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { legal, type LegalEntity } from "@/config/legal";

/*
 * The legal notice (mentions légales, Ayoub 13/10/2026): French law (LCEN art. 6 III and 19, Code de la consommation, RGPD), the English
 * text authoritative (Ayoub, 13/10/2026: for every legal text). The publisher is Lordaeron, an independent fan project, reached on Discord and by in-game tickets; the host and
 * the providers come from config/legal.ts.
 */

const sectionKeys = [
  "publisher",
  "host",
  "providers",
  "service",
  "ip",
  "data",
  "cookies",
  "report",
  "liability",
  "law",
  "credits",
] as const;

const COOKIES = [
  { name: "lordaeron_session", key: "session" },
  { name: "NEXT_LOCALE", key: "locale" },
  { name: "lordaeron_admin_session", key: "adminSession" },
  { name: "lordaeron_admin_preview", key: "adminPreview" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.legalNotice" });

  return buildPageMetadata(locale, "/legal-notice", {
    title: t("title"),
    description: t("description"),
  });
}

const linkClass =
  "text-wow-gold-light underline decoration-wow-gold/40 underline-offset-2 hover:text-wow-gold";

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalNotice" });
  const discord = siteConfig.links.discord;
  const internal = (path: string) =>
    function InternalLink(chunks: ReactNode) {
      return (
        <NextLink className={linkClass} href={`/${locale}${path}`}>
          {chunks}
        </NextLink>
      );
    };
  const external = (href: string) =>
    function ExternalLink(chunks: ReactNode) {
      return (
        <a
          className={linkClass}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {chunks}
        </a>
      );
    };
  const tags = {
    discord: external(discord),
    privacy: internal("/privacy-policy"),
    cgu: internal("/terms-of-use"),
    cgv: internal("/terms-of-sale"),
    contact: internal("/contact"),
    cnil: external("https://www.cnil.fr"),
    b: (chunks: ReactNode) => (
      <strong className="text-gray-100">{chunks}</strong>
    ),
  };
  // a section's paragraphs: its keys p1, p2... in order
  const paragraphs = (section: string) => {
    const raw = t.raw(`sections.${section}`) as Record<string, string>;

    return Object.keys(raw)
      .filter((k) => /^p\d+$/.test(k))
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
      .map((k) => <p key={k}>{t.rich(`sections.${section}.${k}`, tags)}</p>);
  };
  const row = (label: string, value: ReactNode) => (
    <div className="grid gap-0.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-200">{value}</dd>
    </div>
  );
  const entity = (e: LegalEntity, extra?: ReactNode) => (
    <dl className="glass !bg-white/[0.02] space-y-2 rounded-lg border border-white/10 p-4">
      {row(
        t("labels.name"),
        <strong className="text-gray-100">{e.name}</strong>,
      )}
      {e.legalForm && row(t("labels.legalForm"), e.legalForm)}
      {e.registration && row(t("labels.registration"), e.registration)}
      {row(t("labels.address"), e.address)}
      {e.phone && row(t("labels.phone"), e.phone)}
      {e.website &&
        row(
          t("labels.website"),
          external(e.website)(e.website.replace(/^https?:\/\//, "")),
        )}
      {extra}
    </dl>
  );

  const p = legal.publisher;
  const publisher = (
    <>
      <p>{t("sections.publisher.lead")}</p>
      <dl className="glass !bg-white/[0.02] space-y-2 rounded-lg border border-white/10 p-4">
        {row(
          t("labels.name"),
          <strong className="text-gray-100">
            {t("sections.publisher.name")}
          </strong>,
        )}
        {p.legalForm && row(t("labels.legalForm"), p.legalForm)}
        {p.registration && row(t("labels.registration"), p.registration)}
        {p.vatNumber && row(t("labels.vatNumber"), p.vatNumber)}
        {row(t("labels.director"), t("sections.publisher.director"))}
        {row(t("labels.contact"), t.rich("sections.publisher.contact", tags))}
      </dl>
      {paragraphs("publisher")}
    </>
  );

  const blocks: Record<(typeof sectionKeys)[number], ReactNode> = {
    publisher,
    host: (
      <>
        <p>{t("sections.host.lead")}</p>
        {entity(legal.host)}
        <p>{t("sections.host.location")}</p>
      </>
    ),
    providers: (
      <>
        <p>{t("sections.providers.lead")}</p>
        <div className="space-y-3">
          {legal.providers.map((provider) => (
            <div key={provider.name}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-wow-gold/80">
                {t(`sections.providers.roles.${provider.role}`)}
              </p>
              {entity(provider)}
            </div>
          ))}
        </div>
        {paragraphs("providers")}
      </>
    ),
    service: paragraphs("service"),
    ip: paragraphs("ip"),
    data: paragraphs("data"),
    cookies: (
      <>
        <p>{t("sections.cookies.lead")}</p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-white/[0.04] text-gray-400">
              <tr>
                <th className="px-3 py-2 font-semibold">
                  {t("sections.cookies.columns.name")}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {t("sections.cookies.columns.purpose")}
                </th>
                <th className="px-3 py-2 font-semibold">
                  {t("sections.cookies.columns.duration")}
                </th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-xs text-gray-200">
                    {c.name}
                  </td>
                  <td className="px-3 py-2">
                    {t(`sections.cookies.items.${c.key}.purpose`)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {t(`sections.cookies.items.${c.key}.duration`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paragraphs("cookies")}
      </>
    ),
    report: paragraphs("report"),
    liability: paragraphs("liability"),
    law: paragraphs("law"),
    credits: paragraphs("credits"),
  };

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
              name: "Legal notice",
              item: `${siteConfig.baseUrl}/${locale}/legal-notice`,
            },
          ],
        }}
      />
      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_008_1080p_png_jpgcopy.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-wow-darker/90" />

        <div className="relative container mx-auto max-w-4xl px-6 py-16">
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-4xl font-black wow-gradient-text md:text-5xl">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-400">{t("subtitle")}</p>
            <div className="shimmer-line mx-auto mt-4 max-w-xs" />
            <p className="mt-4 text-sm text-gray-500">{t("lastUpdated")}</p>
          </div>

          <div className="space-y-4">
            {sectionKeys.map((key) => (
              <section
                key={key}
                className="glass !bg-white/[0.03] rounded-xl border border-white/10 px-5 py-5"
                id={key}
              >
                <h2 className="mb-3 text-base font-bold text-wow-gold">
                  {t(`sections.${key}.title`)}
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-gray-300">
                  {blocks[key]}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-gray-500">
            {t("authoritative")}
          </p>
        </div>
      </div>
    </>
  );
}
