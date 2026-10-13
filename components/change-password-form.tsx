"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export const ChangePasswordForm = () => {
  const t = useTranslations("changePassword");
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.currentPassword)
      errs.currentPassword = t("errors.currentPasswordRequired");
    if (!form.newPassword) errs.newPassword = t("errors.newPasswordRequired");
    else if (form.newPassword.length < 6 || form.newPassword.length > 16)
      errs.newPassword = t("errors.passwordLength");
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = t("errors.passwordMismatch");
    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "invalidCurrentPassword") {
          setErrors({
            currentPassword: t("errors.invalidCurrentPassword"),
          });
        } else if (data.error === "passwordLength") {
          setErrors({ newPassword: t("errors.passwordLength") });
        } else {
          setErrors({ server: t("errors.serverError") });
        }

        return;
      }

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setErrors({ server: t("errors.serverError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.3 }}
    >
      <div className="glass border-wow-gold/15 rounded-2xl p-6 glow-gold">
        <h2 className="text-lg font-bold wow-gradient-text mb-5">
          {t("title")}
        </h2>

        {success && (
          <p className="text-green-400 text-sm mb-4">{t("success")}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            isRequired
            classNames={{
              inputWrapper:
                "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
              label: "text-gray-400",
            }}
            errorMessage={errors.currentPassword}
            isInvalid={!!errors.currentPassword}
            label={t("currentPassword")}
            type="password"
            validationBehavior="aria"
            value={form.currentPassword}
            variant="bordered"
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
          />
          <Input
            isRequired
            classNames={{
              inputWrapper:
                "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
              label: "text-gray-400",
            }}
            errorMessage={errors.newPassword}
            isInvalid={!!errors.newPassword}
            label={t("newPassword")}
            type="password"
            validationBehavior="aria"
            value={form.newPassword}
            variant="bordered"
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <Input
            isRequired
            classNames={{
              inputWrapper:
                "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
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
            <p className="text-danger text-sm text-center">{errors.server}</p>
          )}

          <Button
            className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold mt-1 h-11 glow-gold-strong hover:shadow-[0_0_40px_rgba(199,156,62,0.4)] transition-all"
            isLoading={loading}
            size="md"
            type="submit"
          >
            {t("submit")}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};
