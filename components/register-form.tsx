"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useTranslations, useLocale } from "next-intl";
import NextLink from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";

import { useSignupRealm } from "@/lib/realm-context";
import { DEFAULT_REALM, REALMS, realmPath } from "@/lib/realms";

export const RegisterForm = () => {
  const t = useTranslations("register");
  const locale = useLocale();
  // the realm this signup is for (?realm=, or the realm page the visitor came from): its name, its colors, its how-to as the next step
  const signupRealm = useSignupRealm();
  const realm = REALMS[signupRealm ?? DEFAULT_REALM];
  const realmSignup = !!signupRealm && signupRealm !== DEFAULT_REALM;
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.username) errs.username = t("errors.usernameRequired");
    else if (form.username.length < 3 || form.username.length > 16)
      errs.username = t("errors.usernameLength");
    else if (!/^[a-zA-Z0-9]+$/.test(form.username))
      errs.username = t("errors.usernameAlphanumeric");

    if (!form.email) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t("errors.emailInvalid");

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "usernameTaken") {
          setErrors({ username: t("errors.usernameTaken") });
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

  if (success) {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="glass glow-gold rounded-2xl max-w-md mx-auto p-10 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
      >
        <div className="text-5xl mb-4">&#9989;</div>
        <p className="text-green-400 text-lg mb-6">{t("success")}</p>
        {realmSignup && (
          <div className="mb-6 rounded-xl border border-wow-blue-ice/30 bg-wow-blue-ice/10 p-4">
            <p className="mb-3 text-sm text-wow-blue-ice">
              {t("nextStep", { realm: realm.name })}
            </p>
            <Button
              as={NextLink}
              className="border-2 border-wow-blue-ice/70 bg-[#06121f]/80 font-bold text-wow-blue-ice"
              href={realmPath(locale, realm.slug, "/how-to")}
            >
              {t("nextStepButton")}
            </Button>
          </div>
        )}
        <Button
          as={NextLink}
          className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold glow-gold"
          href={`/${locale}/login`}
        >
          {t("loginLink")}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto">
      {/* Background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-wow-gold/5 via-wow-blue/5 to-wow-gold/5 rounded-3xl blur-2xl" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative glass glow-gold rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top accent image */}
        <div className="relative h-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(3).jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,14,20,0.95)]" />
          <div className="absolute bottom-4 left-6">
            <h1
              className={clsx(
                "text-2xl font-bold",
                realm.accent === "ice" ? "wow-ice-text" : "wow-gradient-text",
              )}
            >
              {t("title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("subtitle", { realm: realm.name })}
            </p>
          </div>
        </div>

        <div className="p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
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
                  "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
                label: "text-gray-400",
              }}
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label={t("email")}
              type="email"
              value={form.email}
              variant="bordered"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
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
            <Input
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
                label: "text-gray-400",
              }}
              errorMessage={errors.confirmPassword}
              isInvalid={!!errors.confirmPassword}
              label={t("confirmPassword")}
              type="password"
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
              className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold mt-2 h-12 glow-gold-strong hover:shadow-[0_0_40px_rgba(199,156,62,0.5)] transition-all"
              isLoading={loading}
              size="lg"
              type="submit"
            >
              {t("submit")}
            </Button>

            <p className="text-center text-gray-400 text-sm mt-1">
              {t("haveAccount")}{" "}
              <NextLink
                className="text-wow-blue hover:text-wow-blue-ice hover:underline transition-colors"
                href={`/${locale}/login`}
              >
                {t("loginLink")}
              </NextLink>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
