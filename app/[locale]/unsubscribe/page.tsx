"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { EmailLinkPanel } from "@/components/email-link-panel";

// a news e-mail's unsubscribe link (app/api/email/unsubscribe): one click stops the dispatches; account e-mails still come
function Unsubscribe() {
  const t = useTranslations("emailPrefs");
  const locale = useLocale();
  const params = useSearchParams();
  const [state, setState] = useState<"ask" | "busy" | "done" | "invalid">(
    "ask",
  );

  const confirm = async () => {
    setState("busy");
    try {
      const res = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u: params.get("u"), t: params.get("t") }),
      });

      setState(res.ok ? "done" : "invalid");
    } catch {
      setState("invalid");
    }
  };

  return (
    <EmailLinkPanel title={t("unsubTitle")}>
      {state === "done" || state === "invalid" ? (
        <>
          <p
            className={`mb-6 leading-relaxed ${state === "done" ? "text-green-400" : "text-orange-300"}`}
          >
            {state === "done" ? t("unsubDone") : t("unsubInvalid")}
          </p>
          <Button
            as={NextLink}
            className="border border-wow-gold/40 text-wow-gold-light"
            href={`/${locale}/account`}
            variant="bordered"
          >
            {t("goAccount")}
          </Button>
        </>
      ) : (
        <>
          <p className="mb-6 leading-relaxed text-gray-300">{t("unsubText")}</p>
          <Button
            className="bg-gradient-to-r from-wow-gold to-wow-gold-light font-bold text-black glow-gold"
            isLoading={state === "busy"}
            onPress={confirm}
          >
            {t("unsubButton")}
          </Button>
        </>
      )}
    </EmailLinkPanel>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner color="warning" size="lg" />
        </div>
      }
    >
      <Unsubscribe />
    </Suspense>
  );
}
