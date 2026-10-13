/* A guild's members by faction (a cross-faction realm's guilds mix them): a chip per faction that has some */
export function FactionCounts({
  alliance,
  horde,
}: {
  alliance: number;
  horde: number;
}) {
  return (
    <span className="flex shrink-0 flex-col items-end gap-1 sm:flex-row">
      {alliance > 0 && (
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
          Alliance {alliance}
        </span>
      )}
      {horde > 0 && (
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
          Horde {horde}
        </span>
      )}
    </span>
  );
}
