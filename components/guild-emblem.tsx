import type { GuildEmblem as Emblem } from "@/types/armory";

import clsx from "clsx";

const n2 = (n: number) => String(n).padStart(2, "0");

/* A guild's crest: the front of its tabard as the 3.3.5 client draws it (Ayoub, 13/10/2026: the real patterns and colours), its
   background, border and emblem layers stacked (public/img/guild-emblems, scripts/build-guild-emblems.py). Each layer is the chest's
   right half, the middle on its left edge, drawn beside its mirror as the model does: 4:3, `size` its width.
   A guild that never designed its tabard keeps the server's default, every field 0: a blank tabard rather than an emblem it never chose. */
export function GuildEmblem({
  emblem,
  size = 48,
  className,
}: {
  emblem: Emblem;
  size?: number;
  className?: string;
}) {
  const designed = Object.values(emblem).some((value) => value > 0);
  const layers = [
    `background_${n2(emblem.background)}`,
    `border_${n2(emblem.borderStyle)}_${n2(emblem.borderColor)}`,
    `emblem_${n2(emblem.style)}_${n2(emblem.color)}`,
  ];

  return (
    <span
      aria-hidden
      className={clsx(
        "relative inline-block shrink-0 overflow-hidden rounded-md border border-wow-gold/40 bg-black/60 shadow-[0_4px_14px_rgba(0,0,0,0.6)]",
        className,
      )}
      style={{ width: size, height: Math.round(size * 0.75) }}
    >
      {designed ? (
        layers.flatMap((layer) =>
          [true, false].map((mirrored) => (
            <img
              key={`${layer}-${mirrored}`}
              alt=""
              className={clsx(
                "absolute top-0 h-full",
                // the flipped half 1px wider, under the other: no seam where a fractional pixel ratio splits the middle
                mirrored
                  ? "left-0 w-[calc(50%+1px)] -scale-x-100"
                  : "right-0 w-1/2",
              )}
              loading="lazy"
              src={`/img/guild-emblems/${layer}.png`}
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )),
        )
      ) : (
        <img
          alt=""
          className="absolute left-1/2 top-1/2 h-4/5 -translate-x-1/2 -translate-y-1/2 rounded opacity-60"
          loading="lazy"
          src="/img/nav/inv_shirt_guildtabard_01.jpg"
        />
      )}
    </span>
  );
}
