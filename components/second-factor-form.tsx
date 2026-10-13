"use client";

import { FormEvent, useCallback, useEffect, useId, useState } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import clsx from "clsx";

import {
  GameTipLink,
  WowItemIcon,
  useGameTooltip,
} from "@/components/game-tooltip";
import { QUALITY_COLORS } from "@/components/game-tooltip/store";
import { REALM_SLUGS, REALMS } from "@/lib/realms";

const CODE_LENGTH = 6;
// the Core Hound Pup (lib/second-factor-reward.ts): its tooltip from Lordaeron's data, the icon shown until it arrives
const REWARD_ITEM = 49646;
const REWARD_REALM = "lordaeron";
const REWARD_ICON = "/img/rewards/core-hound-pup.jpg";

// lib/second-factor-reward.ts rewardState: the characters served, per realm, and those waiting for the next delivery
type Reward = {
  served: { realm: string; name: string }[];
  waiting: number;
};

type Step =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "enrol"; qr: string; secret: string }
  | { kind: "verify" }
  | { kind: "done" };

/*
 * The second-factor screen's body (app/[locale]/verification-2fa): enrol an authenticator app (QR code, or the key typed by hand)
 * and confirm it with a first code, or, once enrolled, type the current code. factor admin: the admin space's rights, then `next`;
 * factor account: the player's game account (a game master's first), whose code the game asks at every login once enrolled, and its reward.
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
  // a game account: a game master's or a player's (the wording), and its reward
  const [gm, setGm] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  // the pups mailed right after the enrolment
  const [sentNow, setSentNow] = useState(0);
  const inputId = useId();
  const hintId = useId();

  const load = useCallback(async () => {
    setStep({ kind: "loading" });
    try {
      const res = await fetch(`/api/auth/second-factor?for=${factor}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setGm(!!data.gm);
      if (data.reward) setReward(data.reward);
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
      setSentNow(Number(data.rewardsSent) || 0);
      // the screen again: protected, and the reward's state
      await load();
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
              {t(
                factor === "admin"
                  ? "eyebrowAdmin"
                  : gm
                    ? "eyebrowAccount"
                    : "eyebrowPlayer",
              )}
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
                {sentNow > 0 && (
                  <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                    {t("rewardSentNow", { count: sentNow })}
                  </p>
                )}
                {reward && <RewardStatus reward={reward} />}
                <a
                  className="text-center text-sm text-wow-gold hover:underline"
                  href={next}
                >
                  {t(next.endsWith("/account") ? "back" : "continue")}
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
                          : gm
                            ? "enrolIntroAccount"
                            : "enrolIntroPlayer",
                      )}
                    </p>
                    {factor === "account" && <RewardBanner />}
                    {factor === "account" && (
                      <div className="rounded-lg border border-wow-gold/30 bg-wow-gold/5 p-3 text-sm leading-relaxed text-wow-gold-light">
                        <p>{t("gameWarning")}</p>
                        <label className="mt-3 flex items-start gap-2 text-gray-200">
                          <input
                            aria-required
                            checked={understood}
                            className="mt-1 accent-[#c79c3e]"
                            type="checkbox"
                            onChange={(e) => setUnderstood(e.target.checked)}
                          />
                          <span>
                            {t("gameWarningConfirm")}
                            <span aria-hidden className="ms-0.5 text-danger">
                              *
                            </span>
                          </span>
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
                    <span aria-hidden className="ms-0.5 text-danger">
                      *
                    </span>
                  </label>
                  <input
                    aria-required
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

/* The Core Hound Pup's name in its quality color, with its in-game tooltip (the realm's own data). */
function RewardName() {
  const t = useTranslations("secondFactor");
  const tip = useGameTooltip(`item:${REWARD_ITEM}`, { realm: REWARD_REALM });

  return (
    <GameTipLink
      className="cursor-help font-semibold"
      itemId={REWARD_ITEM}
      realm={REWARD_REALM}
    >
      <span style={{ color: QUALITY_COLORS[tip?.quality ?? 3] }}>
        [{tip?.name ?? t("rewardPet")}]
      </span>
    </GameTipLink>
  );
}

/* The reward offered for protecting the account: the Core Hound Pup (icon and tooltip) for every character, now and to come. */
export function RewardBanner({ className }: { className?: string }) {
  const t = useTranslations("secondFactor");

  return (
    <div
      className={clsx(
        "relative flex items-center gap-4 overflow-hidden rounded-xl border border-[#0070dd]/40 bg-gradient-to-br from-[#0070dd]/15 via-[#0b1424]/60 to-transparent p-4",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-6 -top-6 size-24 rounded-full bg-[#0070dd]/25 blur-2xl"
      />
      <WowItemIcon
        className="relative drop-shadow-[0_0_12px_rgba(0,112,221,0.55)]"
        fallbackSrc={REWARD_ICON}
        itemId={REWARD_ITEM}
        realm={REWARD_REALM}
        size={52}
      />
      <div className="relative min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">
          {t("rewardLabel")}
        </p>
        <p className="text-base leading-tight">
          <RewardName />
        </p>
        <p className="mt-1 text-xs leading-relaxed text-gray-300">
          {t("rewardText")}
        </p>
      </div>
    </div>
  );
}

/*
 * A protected account's reward: every character receives the pup by in-game mail, the ones served so far (per realm) and those
 * waiting for the next delivery (a few minutes).
 */
function RewardStatus({ reward }: { reward: Reward }) {
  const t = useTranslations("secondFactor");
  const realms = REALM_SLUGS.filter((slug) =>
    reward.served.some((s) => s.realm === slug),
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#0070dd]/40 bg-gradient-to-br from-[#0070dd]/10 to-transparent p-4">
      <div className="flex items-center gap-3">
        <WowItemIcon
          fallbackSrc={REWARD_ICON}
          itemId={REWARD_ITEM}
          realm={REWARD_REALM}
          size={40}
        />
        <p className="text-sm leading-snug text-gray-200">
          {t.rich("rewardEvery", { pet: () => <RewardName /> })}
        </p>
      </div>
      {realms.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {t("rewardServed")}
          </p>
          {realms.map((slug) => (
            <div key={slug} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs text-gray-500">
                {REALMS[slug].name}
              </span>
              {reward.served
                .filter((s) => s.realm === slug)
                .map((s) => (
                  <span
                    key={s.name}
                    className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs text-green-300"
                  >
                    {s.name}
                  </span>
                ))}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed text-gray-400">
        {reward.waiting > 0
          ? t("rewardWaiting", { count: reward.waiting })
          : realms.length === 0
            ? t("rewardNoneYet")
            : t("rewardFuture")}
      </p>
    </div>
  );
}

/*
 * The account page's entry: whether the game account is protected, the way to protect it (a discreet offer with its reward for a
 * player), the reward to claim, and the removal with a current code.
 */
export function AccountSecondFactorCard({ locale }: { locale: string }) {
  const t = useTranslations("secondFactor");
  const [state, setState] = useState<{
    allowed: boolean;
    enrolled: boolean;
    gm: boolean;
    reward: Reward | null;
  } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const codeId = useId();

  const load = useCallback(() => {
    fetch("/api/auth/second-factor?for=account&status=1")
      .then((res) => res.json())
      .then((data) =>
        setState({
          allowed: !!data.allowed,
          enrolled: !!data.enrolled,
          gm: !!data.gm,
          reward: data.reward ?? null,
        }),
      )
      .catch(() => setState(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!state?.allowed) return null;

  const remove = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/second-factor", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCode("");
        setError(
          ["invalidCode", "tooManyAttempts", "tooManyAttemptsIp"].includes(
            data.error,
          )
            ? data.error
            : "serverError",
        );

        return;
      }
      setRemoving(false);
      setCode("");
      setRemoved(true);
      load();
    } catch {
      setError("serverError");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass mt-6 flex flex-col gap-3 rounded-xl border border-wow-gold/20 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wow-gold/80">
        {t(state.gm ? "eyebrowAccount" : "title")}
      </p>
      <p className="text-sm leading-relaxed text-gray-300">
        {t(
          state.enrolled
            ? state.gm
              ? "cardEnrolled"
              : "cardEnrolledPlayer"
            : state.gm
              ? "cardIntro"
              : "cardIntroPlayer",
        )}
      </p>
      {removed && !state.enrolled && (
        <p className="text-xs text-green-300">{t("removed")}</p>
      )}
      {!state.enrolled && (
        <div className="flex flex-wrap items-center gap-3">
          <WowItemIcon
            fallbackSrc={REWARD_ICON}
            itemId={REWARD_ITEM}
            realm={REWARD_REALM}
            size={36}
          />
          <a
            className="inline-block rounded-lg bg-gradient-to-r from-wow-gold to-wow-gold-light px-4 py-2 text-sm font-bold text-black"
            href={`/${locale}/verification-2fa?for=account`}
          >
            {t("cardAction")}
          </a>
        </div>
      )}
      {state.enrolled && state.reward && <RewardStatus reward={state.reward} />}
      {state.enrolled &&
        (removing ? (
          <form className="flex flex-col gap-2" onSubmit={remove}>
            <label className="text-xs text-gray-400" htmlFor={codeId}>
              {t("removeIntro")}
              <span aria-hidden className="ms-0.5 text-danger">
                *
              </span>
            </label>
            <input
              aria-required
              autoComplete="one-time-code"
              className="h-10 rounded-lg border border-white/10 bg-white/[0.03] text-center font-mono text-lg tracking-[0.4em] text-white outline-none focus:border-wow-gold/60"
              id={codeId}
              inputMode="numeric"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
              }
            />
            {error && (
              <p className="text-xs text-danger" role="alert">
                {t(`errors.${error}`)}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                className="flex-1 border border-red-500/40 bg-red-500/10 text-red-300"
                isDisabled={code.length !== CODE_LENGTH}
                isLoading={busy}
                type="submit"
              >
                {t("removeConfirm")}
              </Button>
              <Button
                className="text-gray-400"
                variant="light"
                onPress={() => {
                  setRemoving(false);
                  setError(null);
                  setCode("");
                }}
              >
                {t("removeCancel")}
              </Button>
            </div>
          </form>
        ) : (
          <button
            className="self-start text-xs text-gray-500 underline-offset-2 hover:text-gray-300 hover:underline"
            type="button"
            onClick={() => setRemoving(true)}
          >
            {t("removeAction")}
          </button>
        ))}
    </div>
  );
}
