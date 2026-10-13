"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { EmailLinkPanel } from "@/components/email-link-panel";

// an e-mailed confirmation link (lib/account-email.ts): the page posts the token, so a mail scanner opening the link confirms nothing
function ConfirmEmail() {
  const t = useTranslations("emailPrefs");
  const locale = useLocale();
  const token = useSearchParams().get("token") ?? "";
  const [result, setResult] = useState<
    "working" | "verify" | "change" | "invalid"
  >("working");
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch("/api/account/email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();

        setResult(res.ok ? data.kind : "invalid");
      })
      .catch(() => setResult("invalid"));
  }, [token]);

  return (
    <EmailLinkPanel title={t("confirmTitle")}>
      {result === "working" ? (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Spinner color="warning" />
          {t("confirmWorking")}
        </div>
      ) : (
        <>
          <p
            className={`mb-6 leading-relaxed ${result === "invalid" ? "text-orange-300" : "text-green-400"}`}
          >
            {result === "verify"
              ? t("confirmVerified")
              : result === "change"
                ? t("confirmChanged")
                : t("confirmInvalid")}
          </p>
          <Button
            as={NextLink}
            className="bg-gradient-to-r from-wow-gold to-wow-gold-light font-bold text-black glow-gold"
            href={`/${locale}/account`}
          >
            {t("goAccount")}
          </Button>
        </>
      )}
    </EmailLinkPanel>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner color="warning" size="lg" />
        </div>
      }
    >
      <ConfirmEmail />
    </Suspense>
  );
}
