import { Spinner } from "@heroui/spinner";

/* The frame of a Tools page: its title and line, then its content; a spinner while it loads, a message when it could not */
export function ToolHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="mb-8 text-center sm:mb-10">
      <h1 className="mb-3 text-3xl font-bold wow-gradient-text sm:text-4xl">
        {title}
      </h1>
      {lede && (
        <p className="mx-auto max-w-2xl text-sm text-gray-400 sm:text-base">
          {lede}
        </p>
      )}
      <div className="shimmer-line mx-auto mt-4 w-24" />
    </div>
  );
}

export function ToolLoading() {
  return (
    <div className="flex justify-center py-20">
      <Spinner color="warning" size="lg" />
    </div>
  );
}

export function ToolError({ message }: { message: string }) {
  return <p className="py-16 text-center text-gray-400">{message}</p>;
}

// a game icon (wow.zamimg.com)
export function GameIcon({
  icon,
  size = 40,
  className = "",
  dim = false,
}: {
  icon: string | null | undefined;
  size?: number;
  className?: string;
  dim?: boolean;
}) {
  return (
    <img
      alt=""
      className={`shrink-0 rounded-md border ${dim ? "border-white/10 opacity-40 grayscale" : "border-wow-gold/40"} ${className}`}
      height={size}
      loading="lazy"
      src={`https://wow.zamimg.com/images/wow/icons/${size > 36 ? "large" : "medium"}/${(icon || "inv_misc_questionmark").toLowerCase()}.jpg`}
      style={{ width: size, height: size }}
      width={size}
    />
  );
}
