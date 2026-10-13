import clsx from "clsx";

// a shop section's game icon (public/img/shop/categories, Blizzard's icons), round in a gold ring
export function CategoryIcon({
  category,
  size = 28,
  className,
}: {
  category: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-block shrink-0 overflow-hidden rounded-full border border-wow-gold/60 bg-black shadow-[0_0_8px_rgba(0,0,0,0.6)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        alt=""
        className="h-full w-full scale-[1.12] object-cover"
        height={size}
        loading="lazy"
        src={`/img/shop/categories/${category}.jpg`}
        width={size}
      />
    </span>
  );
}
