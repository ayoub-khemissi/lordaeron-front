"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import { ResetPasswordForm } from "@/components/reset-password-form";
import { useAuth } from "@/lib/auth-context";
import { FormSkeleton } from "@/components/skeleton";

function ResetPasswordContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!loading && user) {
      router.replace(`/${locale}/account`);
    }
  }, [user, loading, router, locale]);

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
        <ResetPasswordForm />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={2} />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
