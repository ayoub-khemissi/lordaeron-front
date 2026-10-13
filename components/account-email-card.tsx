"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Switch } from "@heroui/switch";

/*
 * The account page's e-mail cards (Ayoub, 13/10/2026; app/api/account/email, app/api/account/preferences): the address, confirmed or
 * not, with its new address waiting for its link, or a clear request for one when the account has none; and the news consent
 * ("Lordaeron's dispatches"), changeable at any time.
 */

type EmailState = {
  email: string | null;
  emailVerified: boolean;
  pendingEmail: string | null;
  newsConsent: boolean;
  newsConsentAt: string | null;
};

const field = {
  inputWrapper:
    "border-white/10 bg-white/[0.03] hover:border-wow-gold/30 focus-within:!border-wow-gold/50",
  label: "text-gray-400",
};

export function AccountEmailCards({ locale }: { locale: string }) {
  const t = useTranslations("emailPrefs");
  const [state, setState] = useState<EmailState | null>(null);
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/account/email");

    if (res.ok) setState(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const errorText = (code?: string) =>
    code === "emailInvalid"
      ? t("errorEmailInvalid")
      : code === "emailSame"
        ? t("errorEmailSame")
        : code === "rateLimited"
          ? t("errorRateLimited")
          : t("errorServer");

  const requestChange = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, locale }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(errorText(data.error));

        return;
      }
      setNotice(t("sentChange", { email: data.pendingEmail }));
      setEditing(false);
      setNewEmail("");
      await load();
    } catch {
      setError(t("errorServer"));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resend: true, locale }),
      });
      const data = await res.json();

      if (!res.ok) setError(errorText(data.error));
      else setNotice(t("resent"));
    } catch {
      setError(t("errorServer"));
    } finally {
      setBusy(false);
    }
  };

  const setNews = async (value: boolean) => {
    if (!state) return;
    setState({ ...state, newsConsent: value });
    try {
      const res = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsConsent: value, locale }),
      });

      if (!res.ok) throw new Error();
      await load();
    } catch {
      setState({ ...state, newsConsent: !value });
      setError(t("errorServer"));
    }
  };

  if (!state) return null;

  const noEmail = !state.email;

  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.25 }}
      >
        <div
          className={`glass rounded-2xl p-6 ${noEmail ? "border-2 border-wow-gold/50 glow-gold-strong" : "border-wow-gold/15 glow-gold"}`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold wow-gradient-text">
              {t("emailTitle")}
            </h2>
            {!noEmail && (
              <Chip
                className={
                  state.emailVerified
                    ? "bg-green-500/15 text-green-400"
                    : "bg-orange-500/15 text-orange-300"
                }
                size="sm"
              >
                {state.emailVerified
                  ? t("emailVerified")
                  : t("emailUnverified")}
              </Chip>
            )}
          </div>

          {noEmail ? (
            <p className="mb-4 text-sm leading-relaxed text-wow-gold-light">
              {t("emailNone")}
            </p>
          ) : (
            <p className="mb-3 break-all font-medium text-gray-100">
              {state.email}
            </p>
          )}

          {!noEmail && !state.emailVerified && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <span>{t("emailUnverifiedHint")}</span>
              <Button
                className="h-8 border border-wow-gold/40 text-wow-gold-light"
                isDisabled={busy}
                size="sm"
                variant="bordered"
                onPress={resend}
              >
                {t("resend")}
              </Button>
            </div>
          )}

          {state.pendingEmail && (
            <p className="mb-4 rounded-lg border border-wow-blue-ice/30 bg-wow-blue-ice/10 px-3 py-2 text-sm text-wow-blue-ice">
              {t("pending", { email: state.pendingEmail })}
            </p>
          )}

          {notice && <p className="mb-3 text-sm text-green-400">{notice}</p>}
          {error && <p className="mb-3 text-sm text-danger">{error}</p>}

          {editing || noEmail ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                requestChange();
              }}
            >
              <Input
                classNames={field}
                label={t("newEmail")}
                type="email"
                value={newEmail}
                variant="bordered"
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-wow-gold to-wow-gold-light font-bold text-black glow-gold-strong"
                  isDisabled={!newEmail}
                  isLoading={busy}
                  type="submit"
                >
                  {t("send")}
                </Button>
                {!noEmail && (
                  <Button
                    className="text-gray-400"
                    variant="light"
                    onPress={() => setEditing(false)}
                  >
                    {t("cancel")}
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <Button
              className="border border-wow-gold/30 text-wow-gold-light"
              size="sm"
              variant="bordered"
              onPress={() => setEditing(true)}
            >
              {t("emailChange")}
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.28 }}
      >
        <div className="glass border-wow-blue/15 rounded-2xl p-6 glow-blue">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mb-1 text-lg font-bold wow-ice-text">
                {t("newsTitle")}
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                {t("newsText")}
              </p>
            </div>
            <Switch
              aria-label={t("newsTitle")}
              color="primary"
              isSelected={state.newsConsent}
              onValueChange={setNews}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {state.newsConsent ? t("newsOn") : t("newsOff")}
            {state.newsConsent && state.newsConsentAt && (
              <>
                {" · "}
                {t("newsSince", {
                  date: new Date(state.newsConsentAt).toLocaleDateString(
                    locale,
                  ),
                })}
              </>
            )}
            {state.newsConsent && !state.emailVerified && (
              <>
                {" · "}
                <span className="text-orange-300">
                  {t("newsNeedsVerified")}
                </span>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </>
  );
}
