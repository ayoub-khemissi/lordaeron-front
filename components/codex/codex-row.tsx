"use client";

import type { CodexItem, CodexPrice, CodexSource } from "@/lib/codex-types";

import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";

import {
  GameTipLink,
  WowItemIcon,
  zamimgIcon,
} from "@/components/game-tooltip";
import { QUALITY_COLORS } from "@/components/game-tooltip/store";
import { useRealm, useRealmHref } from "@/lib/realm-context";

/* An item of the codex: its icon and name (the realm's own tooltip), its kind and phase, and every way to get it with its price. */

function Money({ copper }: { copper: number }) {
  const locale = useLocale();
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;

  return (
    <span className="whitespace-nowrap">
      {g > 0 && (
        <span className="text-[#ffd100]">{g.toLocaleString(locale)}g </span>
      )}
      {s > 0 && <span className="text-[#c7c7cf]">{s}s </span>}
      {c > 0 && <span className="text-[#c27c48]">{c}c</span>}
    </span>
  );
}

function Price({ price }: { price: CodexPrice }) {
  const t = useTranslations("codex");
  const parts: React.ReactNode[] = [];

  if (price.copper) parts.push(<Money key="c" copper={price.copper} />);
  if (price.honor)
    parts.push(
      <span key="h" className="whitespace-nowrap text-[#ff8a3d]">
        {t("honor", { count: price.honor })}
      </span>,
    );
  if (price.arena)
    parts.push(
      <span key="a" className="whitespace-nowrap text-[#b98bff]">
        {t("arena", { count: price.arena })}
      </span>,
    );
  for (const i of price.items ?? [])
    parts.push(
      <GameTipLink
        key={`i${i.id}`}
        className="inline-flex items-center gap-1 whitespace-nowrap text-gray-100"
        itemId={i.id}
      >
        {i.count > 1 && <span>{i.count} ×</span>}
        <img
          alt=""
          className="h-4 w-4 rounded-[3px]"
          src={zamimgIcon(i.icon, 18)}
        />
        <span className="underline decoration-white/20 underline-offset-2">
          {i.name}
        </span>
      </GameTipLink>,
    );
  if (price.rating)
    parts.push(
      <span key="r" className="whitespace-nowrap text-gray-400">
        {t("rating", { rating: price.rating })}
      </span>,
    );

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {parts}
    </span>
  );
}

const SOURCE_ICONS: Record<string, string> = {
  vendor: "inv_misc_coin_02",
  drop: "inv_misc_bag_10",
  object: "inv_box_01",
  container: "inv_misc_bag_17",
  quest: "inv_misc_note_01",
  craft: "trade_blacksmithing",
  achievement: "achievement_general",
  blackMarket: "inv_misc_coin_17",
  shop: "inv_misc_gem_amethyst_02",
};

function Source({ source }: { source: CodexSource }) {
  const t = useTranslations("codex");
  const realmHref = useRealmHref();
  const hasBlackMarket = useRealm().sections.includes("black-market");
  const who = source.world
    ? t("worldDrop")
    : [
        source.names.join(", "),
        source.more ? t("andMore", { count: source.more }) : "",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <li className="flex items-start gap-2 text-[13px] leading-snug">
      <img
        alt=""
        className="mt-px h-4 w-4 shrink-0 rounded-[3px] opacity-90"
        src={zamimgIcon(SOURCE_ICONS[source.type], 18)}
      />
      <span className="min-w-0">
        {/* the black market's own page (lib/realms.ts section "black-market") */}
        {source.type === "blackMarket" && hasBlackMarket ? (
          <NextLink
            className="font-semibold text-wow-gold-light underline decoration-wow-gold/30 underline-offset-2 hover:text-wow-gold"
            href={realmHref("/black-market")}
          >
            {t(`sources.${source.type}`)}
          </NextLink>
        ) : (
          <span className="font-semibold text-wow-gold-light">
            {t(`sources.${source.type}`)}
          </span>
        )}
        {source.type === "craft" ? (
          <>
            {" "}
            <GameTipLink
              className="text-gray-200 underline decoration-white/20 underline-offset-2"
              spellId={source.spell}
            >
              {source.names[0]}
            </GameTipLink>
            {source.rank ? (
              <span className="text-gray-400"> ({source.rank})</span>
            ) : null}
          </>
        ) : source.achievement ? (
          <>
            {" "}
            <GameTipLink
              achievementId={source.achievement}
              className="text-gray-200 underline decoration-white/20 underline-offset-2"
            >
              {source.names[0]}
            </GameTipLink>
          </>
        ) : (
          who && (
            <span className="text-gray-200">
              {" "}
              {who}
              {source.title && (
                <span className="text-gray-400"> &lt;{source.title}&gt;</span>
              )}
            </span>
          )
        )}
        {source.price && (
          <span className="ml-2 inline-block">
            <Price price={source.price} />
          </span>
        )}
        {source.type === "shop" && source.shards !== undefined && (
          <>
            {" "}
            <NextLink
              className="whitespace-nowrap text-purple-300 underline decoration-purple-300/30 underline-offset-2 hover:text-purple-200"
              href={realmHref(`/shop/${source.category ?? ""}`)}
            >
              {t("shards", { count: source.shards })}
            </NextLink>
          </>
        )}
      </span>
    </li>
  );
}

export function CodexRow({
  item,
  realmName,
}: {
  item: CodexItem;
  realmName: string;
}) {
  const t = useTranslations("codex");

  return (
    <div className="glass rounded-xl border border-white/5 px-3 py-3 sm:px-4">
      <div className="flex items-start gap-3">
        <WowItemIcon
          fallbackSrc={zamimgIcon(item.icon, 40)}
          itemId={item.id}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <GameTipLink className="font-semibold leading-tight" itemId={item.id}>
            <span style={{ color: QUALITY_COLORS[item.quality] ?? "#fff" }}>
              {item.name}
            </span>
          </GameTipLink>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-px text-gray-300">
              {t(`kind.${item.kind}`)}
            </span>
            {item.custom && (
              <span className="rounded-full border border-wow-blue-ice/40 bg-wow-blue-ice/10 px-2 py-px font-semibold text-wow-blue-ice">
                {realmName}
              </span>
            )}
            {item.phase !== null && (
              <span className="rounded-full border border-wow-gold/30 bg-wow-gold/10 px-2 py-px text-wow-gold-light">
                {t("phase", { phase: item.phase })}
              </span>
            )}
          </div>
        </div>
      </div>
      <ul className="mt-2.5 space-y-1.5 border-t border-white/5 pt-2.5">
        {item.sources.length ? (
          item.sources.map((s, i) => <Source key={i} source={s} />)
        ) : (
          <li className="text-[13px] text-gray-500">{t("sourceUnknown")}</li>
        )}
      </ul>
    </div>
  );
}
