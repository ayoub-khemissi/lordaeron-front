"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { useTranslations } from "next-intl";

interface LegalAccordionProps {
  namespace: "cgu" | "cgv" | "rgpd";
  sectionKeys: string[];
}

export const LegalAccordion = ({
  namespace,
  sectionKeys,
}: LegalAccordionProps) => {
  const t = useTranslations(namespace);
  // which version prevails, for every legal text (Ayoub, 13/10/2026: the English one)
  const tNotice = useTranslations("legalNotice");

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_008_1080p_png_jpgcopy.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />

      <div className="relative container mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black wow-gradient-text mb-3">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-lg">{t("subtitle")}</p>
          <div className="shimmer-line max-w-xs mx-auto mt-4" />
          <p className="text-gray-500 text-sm mt-4">{t("lastUpdated")}</p>
        </div>

        <Accordion
          className="gap-4"
          itemClasses={{
            base: "glass !bg-white/[0.03] border border-white/10 rounded-xl mb-3",
            title: "text-wow-gold font-bold text-base",
            trigger:
              "px-5 py-4 hover:bg-white/[0.03] rounded-xl transition-colors",
            indicator: "text-wow-gold",
            content: "px-5 pb-5 pt-0",
          }}
          variant="splitted"
        >
          {sectionKeys.map((key) => (
            <AccordionItem
              key={key}
              aria-label={t(`sections.${key}.title`)}
              title={t(`sections.${key}.title`)}
            >
              <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                {t(`sections.${key}.content`)
                  .split("\n\n")
                  .map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-center text-xs italic text-gray-500">
          {tNotice("authoritative")}
        </p>
      </div>
    </div>
  );
};
