"use client";

import { FormEvent, useCallback, useEffect, useId, useState } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import clsx from "clsx";

import { REALM_SLUGS, REALMS, type RealmSlug } from "@/lib/realms";

const CODE_LENGTH = 6;
const REWARD_ICON = "/img/rewards/core-hound-pup.jpg";

type Reward = {
  status: "available" | "sending" | "failed" | "claimed";
  realm: string | null;
  characterName: string | null;
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
      setStep({ kind: "done" });
      setReward(
        (r) => r ?? { status: "available", realm: null, characterName: null },
      );
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
                {reward && <RewardClaim reward={reward} onChange={setReward} />}
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
                    {factor === "account" && reward?.status !== "claimed" && (
                      <RewardBanner />
                    )}
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

/* The reward offered for protecting the account: the Core Hound Pup, its icon and why. */
export function RewardBanner({ className }: { className?: string }) {
  const t = useTranslations("secondFactor");

  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg border border-purple-400/30 bg-purple-500/10 p-3",
        className,
      )}
    >
      <img
        alt=""
        className="size-11 shrink-0 rounded-md border border-purple-300/50"
        height={44}
        src={REWARD_ICON}
        width={44}
      />
      <div>
        <p className="text-sm font-semibold text-purple-200">
          {t("rewardTitle")}
        </p>
        <p className="text-xs leading-relaxed text-gray-300">
          {t("rewardText")}
        </p>
      </div>
    </div>
  );
}

/*
 * The reward's claim (app/api/auth/second-factor/reward): a realm, one of the account's characters there, then the in-game mail. Once
 * delivered, where it went; an account without a character keeps it for later.
 */
function RewardClaim({
  reward,
  onChange,
}: {
  reward: Reward;
  onChange: (reward: Reward) => void;
}) {
  const t = useTranslations("secondFactor");
  const [realm, setRealm] = useState<RealmSlug>(
    (REALM_SLUGS as readonly string[]).includes(reward.realm ?? "")
      ? (reward.realm as RealmSlug)
      : "lordaeron",
  );
  const [characters, setCharacters] = useState<
    { guid: number; name: string; level: number }[] | null
  >(null);
  const [guid, setGuid] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectId = useId();

  useEffect(() => {
    if (reward.status === "claimed") return;
    setCharacters(null);
    setGuid(null);
    fetch(`/api/shop/characters?realm=${realm}`)
      .then((res) => res.json())
      .then((data) => {
        const list = (data.characters ?? []) as {
          guid: number;
          name: string;
          level: number;
        }[];

        setCharacters(list);
        setGuid(list[0]?.guid ?? null);
      })
      .catch(() => setCharacters([]));
  }, [realm, reward.status]);

  if (reward.status === "claimed") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
        <img
          alt=""
          className="size-9 shrink-0 rounded-md"
          height={36}
          src={REWARD_ICON}
          width={36}
        />
        <p className="text-sm text-green-300">
          {reward.characterName
            ? t("rewardClaimed", {
                name: reward.characterName,
                realm:
                  REALMS[(reward.realm as RealmSlug) ?? "lordaeron"]?.name ??
                  "",
              })
            : t("rewardAlreadyClaimed")}
        </p>
      </div>
    );
  }

  const claim = async () => {
    if (!guid || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/second-factor/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realm, characterGuid: guid }),
      });
      const data = await res.json();

      if (res.ok) {
        onChange({
          status: "claimed",
          realm,
          characterName: characters?.find((c) => c.guid === guid)?.name ?? null,
        });

        return;
      }
      if (data.error === "alreadyClaimed")
        onChange({ status: "claimed", realm: null, characterName: null });
      setError(
        [
          "characterNotFound",
          "deliveryFailed",
          "inProgress",
          "notEnrolled",
          "alreadyClaimed",
        ].includes(data.error)
          ? data.error
          : "serverError",
      );
    } catch {
      setError("serverError");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-purple-400/30 bg-purple-500/10 p-4">
      <RewardBanner className="border-0 bg-transparent p-0" />
      {reward.status === "failed" && !error && (
        <p className="text-xs text-yellow-300">{t("rewardFailed")}</p>
      )}
      <div aria-label={t("rewardRealm")} className="flex gap-2" role="group">
        {REALM_SLUGS.map((slug) => (
          <button
            key={slug}
            aria-pressed={realm === slug}
            className={clsx(
              "flex-1 rounded-md border px-3 py-1.5 text-sm transition-colors",
              realm === slug
                ? "border-wow-gold/70 bg-wow-gold/15 text-wow-gold-light"
                : "border-white/10 text-gray-400 hover:border-white/30",
            )}
            type="button"
            onClick={() => setRealm(slug)}
          >
            {REALMS[slug].name}
          </button>
        ))}
      </div>
      {characters === null ? (
        <Spinner color="warning" size="sm" />
      ) : characters.length === 0 ? (
        <p className="text-xs leading-relaxed text-gray-400">
          {t("rewardNoCharacter")}
        </p>
      ) : (
        <>
          <label className="text-xs text-gray-400" htmlFor={selectId}>
            {t("rewardCharacter")}
          </label>
          <select
            className="h-10 rounded-md border border-white/10 bg-[#161b22] px-3 text-sm text-white outline-none focus:border-wow-gold/60"
            id={selectId}
            value={guid ?? ""}
            onChange={(e) => setGuid(Number(e.target.value))}
          >
            {characters.map((c) => (
              <option key={c.guid} value={c.guid}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
          <Button
            className="bg-gradient-to-r from-purple-500 to-purple-400 font-bold text-white"
            isDisabled={!guid}
            isLoading={sending}
            onPress={claim}
          >
            {t("rewardClaim")}
          </Button>
        </>
      )}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {t(`errors.${error}`)}
        </p>
      )}
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
    <div className="glass flex flex-col gap-3 rounded-xl border border-wow-gold/20 p-5">
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
          {state.reward?.status !== "claimed" && (
            <img
              alt=""
              className="size-9 rounded-md border border-purple-300/50"
              height={36}
              src={REWARD_ICON}
              title={t("rewardTitle")}
              width={36}
            />
          )}
          <a
            className="inline-block rounded-lg bg-gradient-to-r from-wow-gold to-wow-gold-light px-4 py-2 text-sm font-bold text-black"
            href={`/${locale}/verification-2fa?for=account`}
          >
            {t("cardAction")}
          </a>
        </div>
      )}
      {state.enrolled && state.reward && (
        <RewardClaim
          reward={state.reward}
          onChange={(reward) => setState({ ...state, reward })}
        />
      )}
      {state.enrolled &&
        (removing ? (
          <form className="flex flex-col gap-2" onSubmit={remove}>
            <label className="text-xs text-gray-400" htmlFor={codeId}>
              {t("removeIntro")}
            </label>
            <input
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
