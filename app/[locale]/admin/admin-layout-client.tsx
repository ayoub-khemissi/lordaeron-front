"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Spinner } from "@heroui/spinner";

import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { admin, mfaRequired, loading } = useAdminAuth();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const isLoginPage = pathname.endsWith("/admin/login");

  useEffect(() => {
    if (loading || admin || isLoginPage) return;
    // signed in but the second factor not verified: its screen, then back here
    router.push(
      mfaRequired
        ? `/${locale}/verification-2fa?next=${encodeURIComponent(pathname)}`
        : `/${locale}/admin/login`,
    );
  }, [admin, mfaRequired, loading, isLoginPage, locale, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0d1117] flex items-center justify-center">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 bg-[#010409]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
