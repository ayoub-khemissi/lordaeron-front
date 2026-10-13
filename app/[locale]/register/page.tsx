"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { RegisterForm } from "@/components/register-form";
import { useAuth } from "@/lib/auth-context";
import { readSignupRealm } from "@/lib/realm-context";
import { DEFAULT_REALM, realmPath } from "@/lib/realms";
import { FormSkeleton } from "@/components/skeleton";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  // already signed in: the account, or the realm's how-to for a realm's signup (Rimeheart: the client and the patch come next)
  useEffect(() => {
    if (!loading && user) {
      const realm = readSignupRealm();

      router.replace(
        realm && realm !== DEFAULT_REALM
          ? realmPath(locale, realm, "/how-to")
          : `/${locale}/account`,
      );
    }
  }, [user, loading, router, locale]);

  if (loading || user) {
    return <FormSkeleton fields={5} />;
  }

  return (
    <div
      className="relative min-h-[calc(100vh-64px)] bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('/img/Burning Crusade Classic  The Gods of ZulAman Screenshots 1080p/BCC_Zul_Aman_Raid_001_1920x1080_png_jpgcopy.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />
      <div className="relative container mx-auto max-w-7xl px-6 py-16 flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}
