"use client";

import { useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface ContactFormProps {
  username: string;
  email: string;
}

export const ContactForm = ({ username, email }: ContactFormProps) => {
  const t = useTranslations("contact");
  const [form, setForm] = useState({ subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.subject.trim()) errs.subject = t("errors.subjectRequired");
    else if (form.subject.length > 255)
      errs.subject = t("errors.subjectTooLong");
    if (!form.message.trim()) errs.message = t("errors.messageRequired");
    else if (form.message.length > 5000)
      errs.message = t("errors.messageTooLong");
    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "unauthorized") {
          setErrors({ server: t("errors.unauthorized") });
        } else if (data.error === "subjectRequired") {
          setErrors({ subject: t("errors.subjectRequired") });
        } else if (data.error === "messageRequired") {
          setErrors({ message: t("errors.messageRequired") });
        } else {
          setErrors({ server: t("errors.serverError") });
        }

        return;
      }

      setSuccess(true);
      setForm({ subject: "", message: "" });
    } catch {
      setErrors({ server: t("errors.serverError") });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass glow-gold rounded-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl mb-4">&#10003;</div>
        <p className="text-wow-gold font-bold text-lg">{t("success")}</p>
      </motion.div>
    );
  }

  return (
    <div className="relative max-w-lg mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-wow-gold/5 via-wow-blue/5 to-wow-gold/5 rounded-3xl blur-2xl" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative glass glow-gold rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative h-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_008_1080p_png_jpgcopy.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,14,20,0.95)]" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl font-bold wow-gradient-text">
              {t("title")}
            </h1>
            <p className="text-gray-400 text-sm">{t("subtitle")}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
            <p className="text-gray-400 text-sm">
              {t("sendingAs", { username, email })}
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
                label: "text-gray-400",
              }}
              errorMessage={errors.subject}
              isInvalid={!!errors.subject}
              label={t("subject")}
              placeholder={t("subjectPlaceholder")}
              validationBehavior="aria"
              value={form.subject}
              variant="bordered"
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <Textarea
              isRequired
              classNames={{
                inputWrapper:
                  "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
                label: "text-gray-400",
              }}
              errorMessage={errors.message}
              isInvalid={!!errors.message}
              label={t("message")}
              minRows={5}
              placeholder={t("messagePlaceholder")}
              validationBehavior="aria"
              value={form.message}
              variant="bordered"
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />

            {errors.server && (
              <p className="text-danger text-sm text-center">{errors.server}</p>
            )}

            <Button
              className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold mt-2 h-12 glow-gold hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all"
              isLoading={loading}
              size="lg"
              type="submit"
            >
              {t("submit")}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
