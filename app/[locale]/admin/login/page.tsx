"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const locale = useLocale();
  const router = useRouter();
  const { refresh } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        setError(
          data.error === "tooManyAttempts" || data.error === "tooManyAttemptsIp"
            ? t("locked")
            : t("error"),
        );

        return;
      }

      await refresh();
      // the admin rights wait for the second factor (enrolment or code)
      router.push(
        `/${locale}/verification-2fa?next=${encodeURIComponent(`/${locale}/admin`)}`,
      );
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1117] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-wow-gold to-wow-gold-dark flex items-center justify-center mb-4">
            <span className="text-black font-black text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-heading wow-gradient-text">
            {t("title")}
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            classNames={{ inputWrapper: "bg-[#161b22] border-gray-700" }}
            label={t("username")}
            value={username}
            onValueChange={setUsername}
          />
          <Input
            classNames={{ inputWrapper: "bg-[#161b22] border-gray-700" }}
            label={t("password")}
            type="password"
            value={password}
            onValueChange={setPassword}
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            className="w-full bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
            isLoading={loading}
            type="submit"
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
