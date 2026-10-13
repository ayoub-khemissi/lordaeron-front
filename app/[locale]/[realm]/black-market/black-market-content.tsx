"use client";

import type {
  BlackMarketCharacter,
  BlackMarketShowcase,
  BlackMarketView,
  ShelfState,
} from "@/lib/queries/black-market";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

import {
  GameTipLink,
  WowItemIcon,
  useGameTooltip,
} from "@/components/game-tooltip";
import { QUALITY_COLORS } from "@/components/game-tooltip/store";
import { Money } from "@/components/tools/money";
import {
  Countdown,
  Day,
  When,
  ZoneNote,
  useNow,
} from "@/components/tools/time";
import { ToolError, ToolLoading } from "@/components/tools/tool-page";
import { useToolData } from "@/components/tools/use-tool-data";
import { CLASS_COLORS } from "@/lib/armory-constants";
import { useRealm } from "@/lib/realm-context";

interface BlackMarketData extends BlackMarketShowcase {
  signedIn: boolean;
  characters: BlackMarketCharacter[];
  view: BlackMarketView | null;
}

const STATE_STYLE: Record<ShelfState, string> = {
  available: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  bought: "border-white/15 bg-white/5 text-gray-400",
  owned: "border-sky-400/40 bg-sky-500/10 text-sky-300",
};

function ItemName({ item }: { item: number }) {
  const tip = useGameTooltip(`item:${item}`);

  return (
    <GameTipLink itemId={item}>
      <span
        className="font-semibold leading-snug"
        style={{
          color:
            tip?.quality !== undefined
              ? QUALITY_COLORS[tip.quality]
              : undefined,
        }}
      >
        {tip?.name ?? "…"}
      </span>
    </GameTipLink>
  );
}

/* Zar'haam's black market (Ayoub, 13/10/2026: a player out and about checks on the phone what is still for them, and the time left):
   the delivery's showcase, its countdown to the next one, and for a signed-in player each item's state for one of their characters
   (app/api/black-market). */
export function BlackMarketContent() {
  const t = useTranslations("blackMarket");
  const tt = useTranslations("tools");
  const locale = useLocale();
  const pathname = usePathname();
  const realm = useRealm();
  const now = useNow();
  const [character, setCharacter] = useState<number | undefined>();
  const { data, error } = useToolData<BlackMarketData>(
    "/api/black-market",
    { character },
    60_000,
  );

  if (!data)
    return error ? <ToolError message={tt("error")} /> : <ToolLoading />;
  if (!data.open) return <ToolError message={t("closed")} />;

  const view = data.view;
  const available = view
    ? data.shelves.filter((s) => view.states[s.item] === "available").length
    : 0;

  return (
    <div className="space-y-6">
      {/* the next delivery */}
      {data.nextDelivery && (
        <section className="glass rounded-2xl border border-wow-gold/25 p-5 text-center sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wow-gold/80">
            {t("nextDelivery")}
          </p>
          <Countdown
            at={data.nextDelivery}
            className="mt-2 block font-heading text-3xl text-white sm:text-4xl"
            now={now}
          />
          <When
            at={data.nextDelivery}
            className="mt-1 block text-sm text-gray-300"
          />
          {data.deliveredAt && (
            <p className="mt-2 text-xs text-gray-500">
              {t("delivered")} <Day at={data.deliveredAt} />
            </p>
          )}
        </section>
      )}

      {/* the reader's characters */}
      {!data.signedIn ? (
        <section className="glass flex flex-col items-center gap-3 rounded-xl border border-white/10 p-4 text-center sm:flex-row sm:text-left">
          <p className="flex-1 text-sm text-gray-300">{t("signIn")}</p>
          <NextLink
            className="rounded-lg border border-wow-gold/50 bg-wow-gold/15 px-4 py-2 text-sm font-semibold text-wow-gold-light transition hover:bg-wow-gold/25"
            href={`/${locale}/login?next=${encodeURIComponent(pathname)}`}
          >
            {t("signInCta")}
          </NextLink>
        </section>
      ) : !data.characters.length ? (
        <p className="glass rounded-xl border border-white/10 p-4 text-center text-sm text-gray-400">
          {t("noCharacter", { realm: realm.name })}
        </p>
      ) : (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("pickCharacter")}
          </p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {data.characters.map((c) => {
              const selected = view?.character.guid === c.guid;

              return (
                <button
                  key={c.guid}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
                    selected
                      ? "border-wow-gold/70 bg-wow-gold/15"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                  type="button"
                  onClick={() => setCharacter(c.guid)}
                >
                  <span
                    className="font-semibold"
                    style={{ color: CLASS_COLORS[c.class] || "#fff" }}
                  >
                    {c.name}
                  </span>
                  <span className="ml-1.5 text-xs text-gray-400">
                    {c.level}
                  </span>
                </button>
              );
            })}
          </div>
          {view && (
            <div
              className={`rounded-xl border p-3 text-sm ${
                view.member
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-400/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              {view.member
                ? t("member", {
                    name: view.character.name,
                    available,
                    total: data.shelves.length,
                  })
                : t("notMember", {
                    name: view.character.name,
                    quest: data.quest.title,
                  })}
            </div>
          )}
        </section>
      )}

      {/* the showcase */}
      <section>
        <ul className="space-y-2">
          {data.shelves.map((s) => {
            const state = view?.states[s.item];

            return (
              <li
                key={s.item}
                className={`glass flex items-center gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4 ${
                  s.jackpot
                    ? "border-wow-gold/50 shadow-[0_0_24px_rgba(255,209,0,0.12)]"
                    : "border-white/5"
                } ${state && state !== "available" ? "opacity-70" : ""}`}
              >
                <WowItemIcon itemId={s.item} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <ItemName item={s.item} />
                    {s.quantity > 1 && (
                      <span className="text-xs text-gray-400">
                        ×{s.quantity}
                      </span>
                    )}
                    {s.jackpot && (
                      <span className="rounded border border-wow-gold/50 bg-wow-gold/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-wow-gold-light">
                        {t("jackpot")}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm">
                    <Money copper={s.price} />
                  </div>
                </div>
                {state && (
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATE_STYLE[state]}`}
                  >
                    {t(`states.${state}`)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-center text-xs text-gray-500">{t("rules")}</p>
      </section>
      <ZoneNote />
    </div>
  );
}
