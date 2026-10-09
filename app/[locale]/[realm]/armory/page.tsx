import { useTranslations } from "next-intl";

import { ArmoryContent } from "./armory-content";

export default function ArmoryPage() {
  const t = useTranslations("armory");

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold wow-gradient-text mb-3">
          {t("title")}
        </h1>
        <div className="shimmer-line w-24 mx-auto mt-3" />
      </div>
      <ArmoryContent />
    </div>
  );
}
