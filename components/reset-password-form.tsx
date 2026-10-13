"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { motion } from "framer-motion";

export const ResetPasswordForm = () => {
  const t = useTranslations("resetPassword");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(!token);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.password) errs.password = t("errors.passwordRequired");
    else if (form.password.length < 6 || form.password.length > 16)
      errs.password = t("errors.passwordLength");
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = t("errors.passwordMismatch");
    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (
          data.error === "invalidToken" ||
          data.error === "invalidOrExpiredToken"
        ) {
          setExpired(true);
        } else if (data.error === "passwordLength") {
          setErrors({ password: t("errors.passwordLength") });
        } else {
          setErrors({ server: t("errors.serverError") });
        }

        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ server: t("errors.serverError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-wow-blue/5 via-wow-gold/5 to-wow-blue/5 rounded-3xl blur-2xl" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative glass glow-blue rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
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
          {expired ? (
            <div className="text-center py-4">
              <p className="text-red-400 text-sm mb-4">{t("expired")}</p>
              <NextLink
                className="text-wow-gold hover:text-wow-gold-light hover:underline transition-colors text-sm"
                href={`/${locale}/forgot-password`}
              >
                {t("requestNewLink")}
              </NextLink>
            </div>
          ) : success ? (
            <div className="text-center py-4">
              <p className="text-green-400 text-sm mb-4">{t("success")}</p>
              <NextLink
                className="text-wow-gold hover:text-wow-gold-light hover:underline transition-colors text-sm"
                href={`/${locale}/login`}
              >
                {t("backToLogin")}
              </NextLink>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                isRequired
                classNames={{
                  inputWrapper:
                    "border-white/10 bg-white/[0.03] hover:border-wow-blue/30 focus-within:!border-wow-blue/50",
                  label: "text-gray-400",
                }}
                errorMessage={errors.password}
                isInvalid={!!errors.password}
                label={t("password")}
                type="password"
                validationBehavior="aria"
                value={form.password}
                variant="bordered"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Input
                isRequired
                classNames={{
                  inputWrapper:
                    "border-white/10 bg-white/[0.03] hover:border-wow-blue/30 focus-within:!border-wow-blue/50",
                  label: "text-gray-400",
                }}
                errorMessage={errors.confirmPassword}
                isInvalid={!!errors.confirmPassword}
                label={t("confirmPassword")}
                type="password"
                validationBehavior="aria"
                value={form.confirmPassword}
                variant="bordered"
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />

              {errors.server && (
                <p className="text-danger text-sm text-center">
                  {errors.server}
                </p>
              )}

              <Button
                className="bg-gradient-to-r from-wow-blue to-wow-blue-ice text-black font-bold mt-2 h-12 glow-blue-strong hover:shadow-[0_0_40px_rgba(79,195,247,0.4)] transition-all"
                isLoading={loading}
                size="lg"
                type="submit"
              >
                {t("submit")}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
