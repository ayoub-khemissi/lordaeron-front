"use client";

import { Button } from "@heroui/button";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/auth-context";
import { useRealmHref } from "@/lib/realm-context";

export const HeroBannerContent = () => {
  const t = useTranslations("home");
  const locale = useLocale();
  const realmHref = useRealmHref();
  const { user } = useAuth();

  return (
    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
      {/* Decorative top line */}
      <motion.div
        animate={{ opacity: 1, scaleX: 1 }}
        className="shimmer-line w-32 mx-auto mb-8"
        initial={{ opacity: 0, scaleX: 0 }}
        transition={{ duration: 1 }}
      />

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="text-wow-blue text-sm uppercase tracking-[0.3em] font-semibold mb-4 drop-shadow-[0_0_10px_rgba(79,195,247,0.4)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
      >
        Epic Progressive Server
      </motion.p>

      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl sm:text-6xl md:text-8xl font-black wow-gradient-text mb-6 tracking-tight leading-tight drop-shadow-[0_0_30px_rgba(199,156,62,0.3)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        {t("title")}
      </motion.h1>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {t("subtitle")}
      </motion.p>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 0.45 }}
      >
        <Button
          as={NextLink}
          className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold text-lg px-10 h-14 glow-gold-strong hover:shadow-[0_0_40px_rgba(199,156,62,0.5)] transition-all duration-300"
          href={realmHref("/how-to")}
          size="lg"
        >
          {t("cta")}
        </Button>
        {!user && (
          <Button
            as={NextLink}
            className="border-wow-blue/30 text-wow-blue font-semibold text-lg px-10 h-14 hover:bg-wow-blue/10 hover:border-wow-blue/50 hover:shadow-[0_0_30px_rgba(79,195,247,0.15)] transition-all duration-300 backdrop-blur-sm"
            href={`/${locale}/register`}
            size="lg"
            variant="bordered"
          >
            {t("ctaRegister")}
          </Button>
        )}
      </motion.div>

      {/* Decorative bottom line */}
      <motion.div
        animate={{ opacity: 1, scaleX: 1 }}
        className="shimmer-line w-48 mx-auto mt-12"
        initial={{ opacity: 0, scaleX: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      />
    </div>
  );
};
