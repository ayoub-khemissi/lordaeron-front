"use client";

import type { News } from "@/types";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import NextLink from "next/link";
import { Button } from "@heroui/button";

import { MarkdownRenderer } from "@/components/markdown-renderer";

// Fallback images for news cards when no image_url
const fallbackImages = [
  "/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(1)_png_jpgcopy.jpg",
  "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_001_1080p_png_jpgcopy.jpg",
  "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Ulduar_000_1080p_png_jpgcopy.jpg",
];

export const NewsSection = () => {
  const t = useTranslations("home");
  const tNews = useTranslations("news");
  const locale = useLocale();
  const [article, setArticle] = useState<News | null>(null);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const collapsedHeight = 300;

  const updateHeight = useCallback(() => {
    if (!wrapperRef.current || !contentRef.current) return;
    if (expanded) {
      wrapperRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    } else {
      wrapperRef.current.style.height = `${collapsedHeight}px`;
    }
  }, [expanded]);

  useEffect(() => {
    updateHeight();
  }, [article, expanded, updateHeight]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news?locale=${locale}&limit=1`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setArticle(data[0]);
        }
      } catch {
        setArticle(null);
      }
    };

    fetchNews();
  }, [locale]);

  // no news yet: no empty block on the homes (Ayoub, 13/10/2026)
  if (!article) return null;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Section background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-15"
        style={{
          backgroundImage:
            "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_005_1080p_png_jpgcopy.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-wow-darker via-transparent to-wow-darker" />

      <div className="relative container mx-auto max-w-7xl px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold wow-gradient-text mb-3">
            {t("newsTitle")}
          </h2>
          <div className="shimmer-line w-24 mx-auto" />
        </motion.div>

        {!article ? (
          <p className="text-center text-gray-400">{t("noNews")}</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="relative overflow-hidden rounded-2xl glow-gold">
              {/* Card background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${article.image_url || fallbackImages[0]}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wow-darker via-wow-darker/90 to-wow-darker/60" />

              {/* Content */}
              <div className="relative glass border-wow-gold/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold wow-gradient-text mb-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                  <span>
                    {tNews("by")} {article.author_name}
                  </span>
                  <span>·</span>
                  <span>
                    {new Date(article.published_at).toLocaleDateString(locale)}
                  </span>
                </div>

                <div
                  ref={wrapperRef}
                  className="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ height: collapsedHeight }}
                >
                  <div ref={contentRef} className="overflow-hidden pb-1">
                    <MarkdownRenderer content={article.content} />
                  </div>
                  <AnimatePresence>
                    {!expanded && (
                      <motion.div
                        animate={{ opacity: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(10,14,20,0.95)] to-transparent"
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button
                    className="text-wow-gold border-wow-gold/30"
                    size="sm"
                    variant="bordered"
                    onPress={() => setExpanded(!expanded)}
                  >
                    {expanded ? tNews("collapse") : tNews("expand")}
                  </Button>
                  <Button
                    as={NextLink}
                    className="text-wow-gold border-wow-gold/30"
                    href={`/${locale}/news`}
                    size="sm"
                    variant="bordered"
                  >
                    {t("viewAllNews")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
