"use client";

import { FormEvent, useCallback, useEffect, useId, useState } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const CODE_LENGTH = 6;

type Step =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "enrol"; qr: string; secret: string }
  | { kind: "verify" }
  | { kind: "done" };

/*
 * The second-factor screen's body (app/[locale]/verification-2fa): enrol an authenticator app (QR code, or the key typed by hand)
 * and confirm it with a first code, or, once enrolled, type the current code. factor admin: the admin space's rights, then `next`;
 * factor account: a game master's game account, whose code the game asks at every login once enrolled.
 */
export function SecondFactorForm({
  factor,
  next,
}: {
  factor: "admin" | "account";
  next: string;
}) {
  const t = useTranslations("secondFactor");
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [understood, setUnderstood] = useState(factor === "admin");
  const inputId = useId();
  const hintId = useId();

  const load = useCallback(async () => {
    setStep({ kind: "loading" });
    try {
      const res = await fetch(`/api/auth/second-factor?for=${factor}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      if (data.step === "verified") {
        window.location.href = next;

        return;
      }
      if (data.step === "enrol")
        setStep({ kind: "enrol", qr: data.qr, secret: data.secret });
      else if (data.step === "verify") setStep({ kind: "verify" });
      else setStep({ kind: "done" });
    } catch {
      setStep({ kind: "unavailable" });
    }
  }, [factor, next]);

  useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH || verifying || !understood) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/second-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ for: factor, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCode("");
        setError(
          data.error === "invalidCode" ||
            data.error === "tooManyAttempts" ||
            data.error === "tooManyAttemptsIp"
            ? data.error
            : "serverError",
        );

        return;
      }
      if (factor === "admin") {
        // a full load: the admin space reads its session again
        window.location.href = next;

        return;
      }
      setStep({ kind: "done" });
    } catch {
      setError("serverError");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-wow-darker">
      <div className="relative container mx-auto max-w-7xl px-6 py-16 flex items-center justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-4 bg-gradient-to-r from-wow-gold/5 via-wow-blue/5 to-wow-gold/5 rounded-3xl blur-2xl" />
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative glass glow-gold rounded-2xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-wow-gold/80">
              {t(factor === "admin" ? "eyebrowAdmin" : "eyebrowAccount")}
            </p>
            <h1 className="mt-2 font-heading text-2xl wow-gradient-text">
              {t("title")}
            </h1>

            {step.kind === "loading" && (
              <div
                className="flex flex-col items-center gap-3 py-10"
                role="status"
              >
                <Spinner color="warning" />
                <p className="text-sm text-gray-400">{t("loading")}</p>
              </div>
            )}

            {step.kind === "unavailable" && (
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-sm text-danger" role="alert">
                  {t("errors.setupFailed")}
                </p>
                <Button
                  className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
                  onPress={load}
                >
                  {t("retry")}
                </Button>
              </div>
            )}

            {step.kind === "done" && (
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-gray-300">
                  {t("accountDone")}
                </p>
                <a
                  className="text-center text-sm text-wow-gold hover:underline"
                  href={next}
                >
                  {t("back")}
                </a>
              </div>
            )}

            {(step.kind === "enrol" || step.kind === "verify") && (
              <form
                noValidate
                className="mt-6 flex flex-col gap-5"
                onSubmit={onSubmit}
              >
                {step.kind === "enrol" ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-gray-300">
                      {t(
                        factor === "admin"
                          ? "enrolIntroAdmin"
                          : "enrolIntroAccount",
                      )}
                    </p>
                    {factor === "account" && (
                      <div className="rounded-lg border border-wow-gold/30 bg-wow-gold/5 p-3 text-sm leading-relaxed text-wow-gold-light">
                        <p>{t("gameWarning")}</p>
                        <label className="mt-3 flex items-start gap-2 text-gray-200">
                          <input
                            checked={understood}
                            className="mt-1 accent-[#c79c3e]"
                            type="checkbox"
                            onChange={(e) => setUnderstood(e.target.checked)}
                          />
                          <span>{t("gameWarningConfirm")}</span>
                        </label>
                      </div>
                    )}
                    <p className="text-sm font-semibold text-white">
                      {t("stepScan")}
                    </p>
                    {/* a data URL made by the server: next/image has nothing to optimise */}
                    <img
                      alt={t("qrAlt")}
                      className="mx-auto size-48 rounded-lg border border-wow-gold/30 bg-white p-2"
                      height={192}
                      src={step.qr}
                      width={192}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">
                        {t("secretLabel")}
                      </p>
                      <code className="select-all break-all rounded-md border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-gray-200">
                        {step.secret}
                      </code>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {t("stepCode")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-gray-300">
                    {t("verifyIntro")}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-400" htmlFor={inputId}>
                    {t("codeLabel")}
                  </label>
                  <input
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    aria-describedby={hintId}
                    aria-invalid={error ? true : undefined}
                    autoComplete="one-time-code"
                    className="h-12 rounded-lg border border-white/10 bg-white/[0.03] text-center font-mono text-xl tracking-[0.5em] text-white outline-none focus:border-wow-gold/60"
                    id={inputId}
                    inputMode="numeric"
                    maxLength={CODE_LENGTH}
                    name="code"
                    pattern="[0-9]*"
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(
                        e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH),
                      )
                    }
                  />
                  <p className="text-xs text-gray-500" id={hintId}>
                    {t("codeHint")}
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-danger" role="alert">
                    {t(`errors.${error}`)}
                  </p>
                )}

                <Button
                  className="h-12 bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
                  isDisabled={code.length !== CODE_LENGTH || !understood}
                  isLoading={verifying}
                  type="submit"
                >
                  {t(step.kind === "enrol" ? "submitEnrol" : "submit")}
                </Button>
                {factor === "admin" && (
                  <p className="text-center text-xs text-gray-500">
                    {t("lostPhone")}
                  </p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/*
 * The account page's entry for game masters: whether their game account is protected, and the way to protect it.
 */
export function AccountSecondFactorCard({ locale }: { locale: string }) {
  const t = useTranslations("secondFactor");
  const [state, setState] = useState<{
    allowed: boolean;
    enrolled: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/second-factor?for=account&status=1")
      .then((res) => res.json())
      .then((data) =>
        setState({ allowed: !!data.allowed, enrolled: !!data.enrolled }),
      )
      .catch(() => setState(null));
  }, []);

  if (!state?.allowed) return null;

  return (
    <div className="glass rounded-xl border border-wow-gold/20 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wow-gold/80">
        {t("eyebrowAccount")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">
        {t(state.enrolled ? "cardEnrolled" : "cardIntro")}
      </p>
      {!state.enrolled && (
        <a
          className="mt-3 inline-block rounded-lg bg-gradient-to-r from-wow-gold to-wow-gold-light px-4 py-2 text-sm font-bold text-black"
          href={`/${locale}/verification-2fa?for=account`}
        >
          {t("cardAction")}
        </a>
      )}
    </div>
  );
}
