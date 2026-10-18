"use client";

import { useTranslations } from "next-intl";

import { SectionHeading } from "@/components/account/account-ui";
import { AccountEmailCards } from "@/components/account-email-card";
import { AccountSecondFactorCard } from "@/components/second-factor-form";
import { ChangePasswordForm } from "@/components/change-password-form";

/* The account's security: its e-mail address and the news, the authenticator app, the password. The cards keep their own forms; laid
   out in two columns from a laptop's width (their own top margins taken back on the first of each column) */
export function AccountSecurity({ locale }: { locale: string }) {
  const t = useTranslations("account");

  return (
    <div>
      <SectionHeading
        description={t("securityIntro")}
        title={t("navSecurity")}
      />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="[&>*:first-child]:mt-0">
          <AccountEmailCards locale={locale} />
        </div>
        <div className="[&>*:first-child]:mt-0">
          <AccountSecondFactorCard locale={locale} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
