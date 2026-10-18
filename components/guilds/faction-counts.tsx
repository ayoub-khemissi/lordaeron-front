import { FactionCrest } from "@/components/character-identity";

/* A guild's members by faction (a cross-faction realm's guilds mix them): each faction's crest and count, for the factions that have
   some (laid out again on 18/10/2026: crests instead of the "Alliance 12" pills) */
export function FactionCounts({
  alliance,
  horde,
}: {
  alliance: number;
  horde: number;
}) {
  return (
    <span className="flex shrink-0 items-center gap-2.5 text-xs tabular-nums text-gray-300">
      {alliance > 0 && (
        <span className="inline-flex items-center gap-1">
          <FactionCrest alliance size={18} />
          {alliance}
        </span>
      )}
      {horde > 0 && (
        <span className="inline-flex items-center gap-1">
          <FactionCrest alliance={false} size={18} />
          {horde}
        </span>
      )}
    </span>
  );
}
