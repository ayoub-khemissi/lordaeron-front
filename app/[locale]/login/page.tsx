"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/lib/auth-context";
import { FormSkeleton } from "@/components/skeleton";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const locale = useLocale();

  useEffect(() => {
    if (!loading && user) {
      // a full load (a tab opened before a deploy: its old build cannot reach the new account page)
      window.location.replace(`/${locale}/account`);
    }
  }, [user, loading, locale]);

  if (loading || user) {
    return <FormSkeleton fields={2} />;
  }

  return (
    <div
      className="relative min-h-[calc(100vh-64px)] bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('/img/Burning Crusade Classic Overlords of Outland Screenshots 1080p/BCC_Overlords_of_Outland_Lady_Vashj_1920x1080.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />
      <div className="relative container mx-auto max-w-7xl px-6 py-16 flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
