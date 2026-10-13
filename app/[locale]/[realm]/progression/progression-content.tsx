"use client";

import type {
  GuildProgress,
  Progression,
  RaidInfo,
  RaidMode,
} from "@/lib/queries/progression";
import type { RealmFirst } from "@/lib/queries/realm-firsts";

import { useState } from "react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";

import { GuildEmblem } from "@/components/guild-emblem";
import { Day } from "@/components/tools/time";
import { GameIcon, ToolError, ToolLoading } from "@/components/tools/tool-page";
import { useToolData } from "@/components/tools/use-tool-data";
import { useRealmHref } from "@/lib/realm-context";

interface ProgressionData extends Progression {
  firsts: RealmFirst[];
}

const MODE_STYLE: Record<RaidMode, string> = {
  n10: "from-sky-500/60 to-sky-400",
  n25: "from-indigo-500/60 to-indigo-400",
  h10: "from-amber-500/60 to-amber-400",
  h25: "from-orange-600/60 to-orange-400",
};

function GuildCard({
  guild,
  rank,
  raids,
}: {
  guild: GuildProgress;
  rank: number;
  raids: Map<string, RaidInfo>;
}) {
  const t = useTranslations("progression");
  const realmHref = useRealmHref();
  const [open, setOpen] = useState(false);

  return (
    <li className="glass rounded-xl border border-white/5 p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <span className="w-8 shrink-0 text-center font-heading text-xl text-wow-gold">
          {rank}
        </span>
        <GuildEmblem emblem={guild.emblem} size={44} />
        <NextLink
          className="min-w-0 flex-1 truncate font-heading text-lg text-white hover:text-wow-gold"
          href={realmHref(`/guilds/${encodeURIComponent(guild.name)}`)}
        >
          &lt;{guild.name}&gt;
        </NextLink>
      </div>
      <div className="mt-3 space-y-3">
        {guild.raids.map((r) => {
          const raid = raids.get(r.key);

          return (
            <div key={r.key}>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-200">
                <GameIcon icon={raid?.icon} size={20} />
                {raid?.name}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {r.modes.map((m) => (
                  <div key={m.mode} className="text-xs">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-gray-300">
                        {t(`modes.${m.mode}`)}
                      </span>
                      <span className="tabular-nums text-gray-400">
                        {m.clearedAt ? (
                          <span className="text-wow-gold-light">
                            ✓ <Day at={m.clearedAt} />
                          </span>
                        ) : (
                          `${m.killed}/${m.total}`
                        )}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${MODE_STYLE[m.mode]}`}
                        style={{ width: `${(m.killed / m.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {open && raid && (
                <ul className="mt-2 grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-2">
                  {raid.bosses.map((name, i) => (
                    <li
                      key={name}
                      className={`flex justify-between gap-2 ${r.bosses[i].length ? "text-gray-200" : "text-gray-600"}`}
                    >
                      <span className="truncate">{name}</span>
                      <span className="shrink-0 text-gray-400">
                        {r.bosses[i].map((m) => t(`short.${m}`)).join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="mt-3 text-xs text-wow-gold/80 hover:text-wow-gold"
        type="button"
        onClick={() => setOpen(!open)}
      >
        {open ? t("hideBosses") : t("showBosses")}
      </button>
    </li>
  );
}

/* The guilds' raid progression (app/api/progression): the realm's first boss kills, then the guilds ranked by the bosses they killed,
   by raid and difficulty, their clears dated. */
export function ProgressionContent() {
  const t = useTranslations("progression");
  const tt = useTranslations("tools");
  const { data, error } = useToolData<ProgressionData>("/api/progression");

  if (!data)
    return error ? <ToolError message={tt("error")} /> : <ToolLoading />;
  const raids = new Map(data.raids.map((r) => [r.key, r]));
  const firsts = [...data.firsts].sort(
    (a, b) =>
      (a.date ?? Number.MAX_SAFE_INTEGER) - (b.date ?? Number.MAX_SAFE_INTEGER),
  );

  return (
    <div className="space-y-8">
      {/* the realm's first kills */}
      {firsts.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-xl text-white">
            {t("firstKills")}
          </h2>
          <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {firsts.map((f) => {
              const guild = f.earners.find((e) => e.guild)?.guild;

              return (
                <li
                  key={f.id}
                  className={`glass flex w-64 shrink-0 snap-start gap-3 rounded-xl border p-3 sm:w-auto ${f.date ? "border-wow-gold/25" : "border-white/5"}`}
                >
                  <GameIcon dim={!f.date} icon={f.icon} size={40} />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold leading-snug ${f.date ? "text-wow-gold-light" : "text-gray-300"}`}
                    >
                      {f.title}
                    </p>
                    {f.date ? (
                      <p className="text-xs text-gray-400">
                        {guild ? `<${guild}> · ` : ""}
                        <Day at={f.date} />
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">{t("notYet")}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* the guilds */}
      <section>
        <h2 className="mb-3 font-heading text-xl text-white">{t("ranking")}</h2>
        {data.guilds.length ? (
          <ol className="space-y-2">
            {data.guilds.map((g, i) => (
              <GuildCard key={g.guildid} guild={g} raids={raids} rank={i + 1} />
            ))}
          </ol>
        ) : (
          <div className="glass rounded-xl border border-white/5 p-5 text-center">
            <p className="text-gray-300">{t("empty")}</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {data.raids.map((r) => (
                <li
                  key={r.key}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-xs text-gray-300"
                >
                  <GameIcon icon={r.icon} size={20} />
                  {r.name}
                  <span className="text-gray-500">{r.bosses.length}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-center text-xs text-gray-500">
          {t("credit", { n10: data.credit.n10, n25: data.credit.n25 })}
        </p>
      </section>
    </div>
  );
}
