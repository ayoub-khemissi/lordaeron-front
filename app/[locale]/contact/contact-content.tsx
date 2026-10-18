"use client";

import type { AccountInfo } from "@/types";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

import { useAuth } from "@/lib/auth-context";
import { ContactForm } from "@/components/contact-form";
import { FormSkeleton } from "@/components/skeleton";

export const ContactContent = () => {
  const t = useTranslations("contact");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace(`/${locale}/login`);

      return;
    }

    const fetchAccount = async () => {
      try {
        const res = await fetch("/api/account?summary=1");

        if (res.status === 401) {
          router.replace(`/${locale}/login`);

          return;
        }

        const data = await res.json();

        setAccount(data.account);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [user, authLoading, router, locale]);

  if (authLoading || loading) {
    return <FormSkeleton fields={3} />;
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">{t("loginRequired")}</p>
        <NextLink
          className="text-wow-gold hover:text-wow-gold-light hover:underline transition-colors"
          href={`/${locale}/login`}
        >
          {t("loginLink")}
        </NextLink>
      </div>
    );
  }

  if (!account) {
    return <FormSkeleton fields={3} />;
  }

  return <ContactForm email={account.email} username={account.username} />;
};
