"use client";

import type { News } from "@/types";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import NextLink from "next/link";

const PAGE_SIZE = 10;

export function NewsList() {
  const locale = useLocale();
  const t = useTranslations("news");
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNews = async (offset: number, append: boolean) => {
    try {
      const res = await fetch(
        `/api/news?locale=${locale}&limit=${PAGE_SIZE}&offset=${offset}`,
      );
      const data = await res.json();

      if (append) {
        setNews((prev) => [...prev, ...(data.news || [])]);
      } else {
        setNews(data.news || []);
      }
      setTotal(data.total || 0);
    } catch {
      // Silent fail
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchNews(0, false);
      setLoading(false);
    };

    load();
  }, [locale]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchNews(news.length, true);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  if (news.length === 0) {
    return <p className="text-center text-gray-400 py-16">{t("noNews")}</p>;
  }

  return (
    <div className="space-y-6">
      {news.map((item) => (
        <NextLink
          key={item.id}
          className="block group"
          href={`/${locale}/news/${item.id}`}
        >
          <div className="glass rounded-2xl overflow-hidden border-wow-gold/10 hover:border-wow-gold/30 transition-all active:scale-[0.99]">
            <div className="flex flex-col md:flex-row">
              {item.image_url && (
                <div
                  className="w-full md:w-64 h-48 md:h-auto bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url('${item.image_url}')` }}
                />
              )}
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-wow-gold group-hover:text-wow-gold-light transition-colors mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                  <span>
                    {t("by")} {item.author_name}
                  </span>
                  <span>·</span>
                  <span>
                    {new Date(item.published_at).toLocaleDateString(locale)}
                  </span>
                </div>
                <p className="text-gray-300/80 text-sm line-clamp-3">
                  {item.content.replace(/[#*`>\-\[\]()!]/g, "").slice(0, 200)}
                  ...
                </p>
                <span className="inline-block mt-3 text-sm text-wow-gold/70 group-hover:text-wow-gold transition-colors">
                  {t("readMore")} →
                </span>
              </div>
            </div>
          </div>
        </NextLink>
      ))}

      {news.length < total && (
        <div className="flex justify-center pt-4">
          <Button
            className="text-wow-gold border-wow-gold/30"
            isLoading={loadingMore}
            variant="bordered"
            onPress={handleLoadMore}
          >
            {t("loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
