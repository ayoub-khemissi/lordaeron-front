import clsx from "clsx";

/* The sign that a card opens something, visible without hovering (Ayoub, 13/10/2026: on a phone nothing told the cards were links):
   a small arrow in a ring at the card's top right corner, which slides a little when the card is hovered. The card is `relative group`
   and presses in when touched (`active:scale-[0.98]`). */
export function CardArrow({
  tone = "gold",
  inline = false,
  className,
}: {
  tone?: "gold" | "ice" | "purple";
  // in the flow (a card's footer row) rather than at its corner
  inline?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "pointer-events-none grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[13px] leading-none transition-transform duration-300 group-hover:translate-x-0.5",
        !inline && "absolute right-2.5 top-2.5",
        tone === "ice" &&
          "border-wow-blue-ice/35 bg-wow-blue-ice/10 text-wow-blue-ice",
        tone === "gold" &&
          "border-wow-gold/35 bg-wow-gold/10 text-wow-gold-light",
        tone === "purple" &&
          "border-purple-400/35 bg-purple-500/10 text-purple-300",
        className,
      )}
    >
      →
    </span>
  );
}
