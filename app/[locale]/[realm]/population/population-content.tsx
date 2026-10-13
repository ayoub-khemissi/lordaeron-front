import type { ReactNode } from "react";
import type { PopulationStats } from "@/types/rankings";

import { useFormatter, useTranslations } from "next-intl";

import { RankState } from "@/components/rankings/ranked-row";
import { ALLIANCE_RACES, CLASS_COLORS } from "@/lib/armory-constants";

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
const RACES = [1, 3, 4, 7, 11, 2, 5, 6, 8, 10];

/* The realm's population (lib/queries/population.ts), counts only: the characters, those online and the players, the faction balance,
   the classes (their colours), the races (their faction's), the level brackets, the players who joined each of the last 12 weeks.
   Each bar names its value on hover. */
export function PopulationContent({
  stats,
}: {
  stats: PopulationStats | null;
}) {
  const t = useTranslations("population");
  const tRank = useTranslations("rankings");
  const tShop = useTranslations("shop");
  const format = useFormatter();

  if (!stats) return <RankState>{tRank("error")}</RankState>;
  if (!stats.total) return <RankState>{t("empty")}</RankState>;
  const pct = (n: number) =>
    format.number(n / stats.total, {
      style: "percent",
      maximumFractionDigits: 0,
    });
  const counted = (list: { id: number; count: number }[], ids: number[]) =>
    ids
      .map((id) => ({ id, count: list.find((r) => r.id === id)?.count ?? 0 }))
      .sort((a, b) => b.count - a.count);
  const { alliance, horde } = stats.factions;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Tile label={t("characters")} value={format.number(stats.total)} />
        <Tile
          label={
            <>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500" />
              {t("online")}
            </>
          }
          value={format.number(stats.online)}
        />
        <Tile label={t("players")} value={format.number(stats.accounts)} />
      </div>

      <Card title={t("factions")}>
        <div className="mb-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
          <span>
            <span className="font-semibold text-blue-300">Alliance</span>{" "}
            <span className="tabular-nums text-gray-300">{pct(alliance)}</span>{" "}
            <span className="tabular-nums text-gray-500">
              · {format.number(alliance)}
            </span>
          </span>
          <span className="text-right">
            <span className="tabular-nums text-gray-500">
              {format.number(horde)} ·
            </span>{" "}
            <span className="tabular-nums text-gray-300">{pct(horde)}</span>{" "}
            <span className="font-semibold text-red-300">Horde</span>
          </span>
        </div>
        <div className="flex h-3 gap-0.5">
          {alliance > 0 && (
            <div
              className="rounded-full bg-blue-500"
              style={{ width: `${(alliance / stats.total) * 100}%` }}
              title={`Alliance: ${format.number(alliance)} (${pct(alliance)})`}
            />
          )}
          {horde > 0 && (
            <div
              className="rounded-full bg-red-500"
              style={{ width: `${(horde / stats.total) * 100}%` }}
              title={`Horde: ${format.number(horde)} (${pct(horde)})`}
            />
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title={t("classes")}>
          <BarList
            rows={counted(stats.classes, CLASSES).map((c) => ({
              key: c.id,
              label: tShop(`className_${c.id}`),
              color: CLASS_COLORS[c.id] ?? "#9ca3af",
              count: c.count,
            }))}
            share={pct}
            value={(n) => format.number(n)}
          />
        </Card>
        <Card title={t("races")}>
          <BarList
            rows={counted(stats.races, RACES).map((r) => ({
              key: r.id,
              label: tRank(`race_${r.id}`),
              color: ALLIANCE_RACES.includes(r.id) ? "#3b82f6" : "#ef4444",
              count: r.count,
            }))}
            share={pct}
            value={(n) => format.number(n)}
          />
        </Card>
      </div>

      <Card title={t("levels")}>
        <Columns
          columns={stats.levels.map((l) => {
            const range =
              l.from === l.to ? String(l.from) : `${l.from}-${l.to}`;

            return {
              key: l.from,
              label: range,
              count: l.count,
              title: t("levelBracket", { range, count: l.count }),
            };
          })}
          value={(n) => format.number(n)}
        />
      </Card>

      <Card note={t("weeksNote")} title={t("weeks")}>
        <Columns
          columns={stats.weeks.map((w, i) => {
            const day = new Date(`${w.start}T12:00:00`);
            const date = format.dateTime(day, {
              day: "numeric",
              month: "short",
            });

            return {
              key: w.start,
              // under the bar, the short form (a phone's columns are narrow)
              label: format.dateTime(day, { day: "numeric", month: "numeric" }),
              // on a phone, every other week named
              labelClass: i % 2 ? "invisible sm:visible" : "",
              count: w.count,
              title: t("week", { date, count: w.count }),
            };
          })}
          value={(n) => format.number(n)}
        />
      </Card>
    </div>
  );
}

function Tile({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="glass rounded-xl border border-white/5 px-2 py-3 text-center sm:px-4 sm:py-5">
      <div className="font-heading text-2xl tabular-nums text-wow-gold-light sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 flex items-center justify-center text-xs text-gray-400 sm:text-sm">
        {label}
      </div>
    </div>
  );
}

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="glass rounded-2xl border border-white/5 p-4 sm:p-6">
      <h2 className="mb-4 text-lg text-wow-gold-light">{title}</h2>
      {children}
      {note && <p className="mt-4 text-xs text-gray-500">{note}</p>}
    </section>
  );
}

// horizontal bars, the largest filling its track: a swatch and the name, the bar, the count and its share
function BarList({
  rows,
  value,
  share,
}: {
  rows: { key: number; label: string; color: string; count: number }[];
  value: (n: number) => string;
  share: (n: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li
          key={r.key}
          className="grid grid-cols-[7rem_1fr_4.75rem] items-center gap-3 text-sm sm:grid-cols-[8.5rem_1fr_5rem]"
          title={`${r.label}: ${value(r.count)} (${share(r.count)})`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: r.color }}
            />
            <span className="truncate text-gray-200">{r.label}</span>
          </span>
          <span className="h-2 rounded-full bg-white/5">
            {r.count > 0 && (
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.max(2, (r.count / max) * 100)}%`,
                  backgroundColor: r.color,
                }}
              />
            )}
          </span>
          <span className="text-right tabular-nums">
            <span className="text-gray-200">{value(r.count)}</span>{" "}
            <span className="text-xs text-gray-500">{share(r.count)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

// columns over an ordered axis (the level brackets, the weeks): the count over each, its label under it
function Columns({
  columns,
  value,
}: {
  columns: {
    key: number | string;
    label: string;
    labelClass?: string;
    count: number;
    title: string;
  }[];
  value: (n: number) => string;
}) {
  const max = Math.max(1, ...columns.map((c) => c.count));
  const HEIGHT = 112;

  return (
    <div>
      <div className="flex items-end gap-1 border-b border-white/10 sm:gap-2">
        {columns.map((c) => (
          <div
            key={c.key}
            className="flex h-32 min-w-0 flex-1 flex-col items-center justify-end"
            title={c.title}
          >
            {c.count > 0 && (
              <span className="mb-1 text-[11px] tabular-nums text-gray-300">
                {value(c.count)}
              </span>
            )}
            <span
              className="block w-full max-w-10 rounded-t bg-wow-gold"
              style={{
                height: c.count
                  ? Math.max(3, Math.round((c.count / max) * HEIGHT))
                  : 0,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1 sm:gap-2">
        {columns.map((c) => (
          <span key={c.key} className="relative h-4 min-w-0 flex-1">
            <span
              className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400 sm:text-xs ${c.labelClass ?? ""}`}
            >
              {c.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
