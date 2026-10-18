"use client";

import type { AccountBan } from "@/types/account";

import clsx from "clsx";
import { useTranslations } from "next-intl";

import { WarningIcon } from "@/components/account/account-icons";

/* The account page's shared pieces: its panels, the realms' status dot, the play time, the ban notices */

// a panel of a section: its title, a line that says what it is for, its actions on the right, its content
export function AccountPanel({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  // false: the content runs to the panel's edges (a list of rows)
  padded?: boolean;
}) {
  return (
    <section
      className={clsx(
        "glass rounded-2xl border border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold text-gray-100">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-gray-400">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      <div className={padded ? "p-5 sm:p-6" : undefined}>{children}</div>
    </section>
  );
}

// a section's heading above its panels
export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-gray-50 sm:text-2xl">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}

export function StatusDot({
  online,
  pulse = false,
}: {
  online: boolean;
  pulse?: boolean;
}) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {online && pulse && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      )}
      <span
        className={clsx(
          "relative inline-flex h-2 w-2 rounded-full",
          online ? "bg-emerald-400" : "bg-gray-500",
        )}
      />
    </span>
  );
}

// "3d 4h", "5h 12m"
export function formatPlayTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;

  return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// the account's or its address's ban: why, since when, until when
export function BanAlert({
  type,
  ban,
  locale,
}: {
  type: "account" | "ip";
  ban: AccountBan;
  locale: string;
}) {
  const t = useTranslations("account");
  const permanent = ban.unbandate === 0 || ban.unbandate <= ban.bandate;

  return (
    <div
      className="flex gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 sm:p-5"
      role="alert"
    >
      <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-red-300">
          {type === "account" ? t("banned") : t("ipBanned")}
        </h3>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-400">{t("banReason")}</dt>
            <dd className="text-gray-200">{ban.banreason || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">{t("banDate")}</dt>
            <dd className="text-gray-200">
              {new Date(ban.bandate * 1000).toLocaleString(locale)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">{t("banExpires")}</dt>
            <dd
              className={
                permanent ? "font-semibold text-red-300" : "text-gray-200"
              }
            >
              {permanent
                ? t("permanent")
                : new Date(ban.unbandate * 1000).toLocaleString(locale)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
