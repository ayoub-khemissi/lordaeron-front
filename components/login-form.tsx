"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/auth-context";

export const LoginForm = () => {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  // an account protected by an authenticator app (the game asks for it too): its code, asked after the password
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.username) errs.username = t("errors.usernameRequired");
    if (!form.password) errs.password = t("errors.passwordRequired");
    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(needCode ? { ...form, code } : form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "invalidCredentials") {
          setErrors({ server: t("errors.invalidCredentials") });
        } else if (data.error === "totpRequired") {
          setNeedCode(true);
        } else if (data.error === "totpInvalid") {
          setNeedCode(true);
          setCode("");
          setErrors({ server: t("errors.totpInvalid") });
        } else if (
          data.error === "tooManyAttempts" ||
          data.error === "tooManyAttemptsIp"
        ) {
          setErrors({ server: t(`errors.${data.error}`) });
        } else {
          setErrors({ server: t("errors.serverError") });
        }

        return;
      }

      await refresh();
      router.push(`/${locale}/account`);
    } catch {
      setErrors({ server: t("errors.serverError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      {/* Background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-wow-blue/5 via-wow-gold/5 to-wow-blue/5 rounded-3xl blur-2xl" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative glass glow-blue rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top accent image */}
        <div className="relative h-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_ArthasThrone_000_1080p_png_jpgcopy.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,14,20,0.95)]" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl font-bold wow-ice-text">{t("title")}</h1>
            <p className="text-gray-400 text-sm">{t("subtitle")}</p>
          </div>
        </div>

        <div className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-blue/30 focus-within:!border-wow-blue/50",
                label: "text-gray-400",
              }}
              errorMessage={errors.username}
              isInvalid={!!errors.username}
              label={t("username")}
              value={form.username}
              variant="bordered"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-blue/30 focus-within:!border-wow-blue/50",
                label: "text-gray-400",
              }}
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              label={t("password")}
              type="password"
              value={form.password}
              variant="bordered"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            {needCode && (
              <Input
                autoComplete="one-time-code"
                classNames={{
                  inputWrapper:
                    "border-wow-gold/30 bg-white/[0.03] hover:border-wow-gold/50 focus-within:!border-wow-gold/70",
                  label: "text-gray-400",
                  input: "text-center font-mono text-lg tracking-[0.5em]",
                }}
                description={t("codeHint")}
                inputMode="numeric"
                label={t("code")}
                maxLength={6}
                value={code}
                variant="bordered"
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            )}

            <div className="text-right -mt-1">
              <NextLink
                className="text-wow-gold/70 hover:text-wow-gold hover:underline transition-colors text-xs"
                href={`/${locale}/forgot-password`}
              >
                {t("forgotPassword")}
              </NextLink>
            </div>

            {errors.server && (
              <p className="text-danger text-sm text-center">{errors.server}</p>
            )}

            <Button
              className="bg-gradient-to-r from-wow-blue to-wow-blue-ice text-black font-bold mt-2 h-12 glow-blue-strong hover:shadow-[0_0_40px_rgba(79,195,247,0.4)] transition-all"
              isLoading={loading}
              size="lg"
              type="submit"
            >
              {t("submit")}
            </Button>

            <p className="text-center text-gray-400 text-sm mt-1">
              {t("noAccount")}{" "}
              <NextLink
                className="text-wow-gold hover:text-wow-gold-light hover:underline transition-colors"
                href={`/${locale}/register`}
              >
                {t("registerLink")}
              </NextLink>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
