import clsx from "clsx";

/* The sign that a card opens something, visible without hovering (Ayoub, 13/10/2026: on a phone nothing told the cards were links):
   a chevron in a ring at the card's top right corner (or in its footer row), which fills a little and slides when the card is hovered.
   A drawn chevron since 18/10/2026 (Ayoub: the font's "→" looked poor). The card is `relative group` and presses in when touched. */
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
        "pointer-events-none grid h-7 w-7 shrink-0 place-items-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300",
        !inline && "absolute right-2.5 top-2.5",
        tone === "ice" &&
          "border-wow-blue-ice/40 bg-wow-blue-ice/10 text-wow-blue-ice group-hover:border-wow-blue-ice/70 group-hover:bg-wow-blue-ice/20",
        tone === "gold" &&
          "border-wow-gold/40 bg-wow-gold/10 text-wow-gold-light group-hover:border-wow-gold/70 group-hover:bg-wow-gold/20",
        tone === "purple" &&
          "border-purple-400/40 bg-purple-500/10 text-purple-300 group-hover:border-purple-400/70 group-hover:bg-purple-500/20",
        className,
      )}
    >
      <svg
        className="h-3.5 w-3.5 translate-x-px transition-transform duration-300 group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </span>
  );
}
