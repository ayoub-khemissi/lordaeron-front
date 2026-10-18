"use client";

import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div
      className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(3)_png_jpgcopy.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-wow-darker/80 via-wow-darker/90 to-wow-darker" />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <p className="text-[10rem] leading-none font-black text-red-500/80 drop-shadow-[0_0_40px_rgba(220,38,38,0.3)]">
          500
        </p>

        <div className="shimmer-line w-24 mx-auto my-6" />

        <h1 className="text-3xl font-heading text-gray-100 mb-3">
          {t("errorTitle")}
        </h1>
        <p className="text-gray-400 mb-10 leading-relaxed">{t("errorDesc")}</p>

        <Button
          className="h-auto min-w-0 glass-gold glow-gold-strong rounded-full px-10 py-3.5 text-wow-gold font-bold text-sm tracking-wide uppercase hover:brightness-125 transition-all duration-300 cursor-pointer"
          variant="light"
          onPress={reset}
        >
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
