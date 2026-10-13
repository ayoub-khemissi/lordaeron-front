import { useTranslations } from "next-intl";

import { GuildsContent } from "./guilds-content";

export default function GuildsPage() {
  const t = useTranslations("guilds");

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold wow-gradient-text sm:text-4xl">
          {t("title")}
        </h1>
        <div className="shimmer-line mx-auto mt-3 w-24" />
      </div>
      <GuildsContent />
    </div>
  );
}
