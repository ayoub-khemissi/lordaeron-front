import type { CSSProperties, ReactNode } from "react";

import clsx from "clsx";

/*
 * The placeholders of a page whose data loads (Ayoub, 13/10/2026: the footer rose up the page while it loaded): pulsing shapes of what
 * comes, as tall as it, in an area that holds most of the screen so the footer waits below. One kit for every page: their loading.tsx
 * (while the server answers) and their own loading state (while their data arrives), each page drawing its layout with these pieces.
 */

// one pulsing shape
export function Bone({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "block animate-pulse rounded-md bg-white/[0.07]",
        className,
      )}
      style={style}
    />
  );
}

// the loading area: tall enough for the footer to stay under the screen, announced as busy
export function SkeletonArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div aria-busy="true" className={clsx("min-h-[75vh]", className)}>
      {children}
    </div>
  );
}

// a page's title, its line and the gold rule (components/tools/tool-page.tsx ToolHeader)
export function SkeletonHeader({ lede = true }: { lede?: boolean }) {
  return (
    <div className="mb-8 flex flex-col items-center sm:mb-10">
      <Bone className="mb-3 h-9 w-56 sm:h-10 sm:w-72" />
      {lede && <Bone className="h-4 w-full max-w-md" />}
      <div className="shimmer-line mx-auto mt-4 w-24" />
    </div>
  );
}

// a whole page while its server answers (a loading.tsx): the page's frame (its width), its header, then its own skeleton
export function SkeletonPage({
  width = "max-w-4xl",
  header = true,
  lede = true,
  children,
}: {
  width?: string;
  header?: boolean;
  lede?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx("container mx-auto px-4 py-10 sm:px-6 sm:py-12", width)}
    >
      {header && <SkeletonHeader lede={lede} />}
      {children}
    </div>
  );
}

// a section's title
export function SkeletonHeading({ className }: { className?: string }) {
  return <Bone className={clsx("mb-3 h-6 w-40", className)} />;
}

// a name over a line (a row's or a card's text)
export function SkeletonLines({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-2/5 max-w-[12rem]", "w-3/5 max-w-[16rem]", "w-1/3"];

  return (
    <div className={clsx("min-w-0 flex-1 space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} className={clsx(i ? "h-3" : "h-4", widths[i % 3])} />
      ))}
    </div>
  );
}

// a list's row: its rank, what leads it (`lead`: an icon's or a crest's size), a name over a line, what ends it
export function SkeletonRow({
  lead = "h-9 w-9",
  rank = false,
  trail = "h-6 w-14 rounded-full",
  lines = 2,
  className,
}: {
  lead?: string | null;
  rank?: boolean;
  trail?: string | null;
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "glass flex items-center gap-3 rounded-xl border border-white/5 px-3 py-3 sm:gap-4 sm:px-4",
        className,
      )}
    >
      {rank && <Bone className="h-5 w-7 shrink-0" />}
      {lead && <Bone className={clsx("shrink-0", lead)} />}
      <SkeletonLines lines={lines} />
      {trail && <Bone className={clsx("shrink-0", trail)} />}
    </div>
  );
}

export function SkeletonRows({
  count = 8,
  className,
  ...row
}: Parameters<typeof SkeletonRow>[0] & { count?: number }) {
  return (
    <div className={clsx("space-y-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} {...row} />
      ))}
    </div>
  );
}

// a card: an icon beside a name and its lines
export function SkeletonTile({
  icon = "h-10 w-10",
  lines = 2,
  className,
}: {
  icon?: string | null;
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "glass flex gap-3 rounded-xl border border-white/5 p-3",
        className,
      )}
    >
      {icon && <Bone className={clsx("shrink-0", icon)} />}
      <SkeletonLines lines={lines} />
    </div>
  );
}

// cards in a grid (`grid`: its columns), each one `card()`
export function SkeletonGrid({
  count = 6,
  grid = "sm:grid-cols-2 lg:grid-cols-3",
  card = (i) => <SkeletonTile key={i} />,
  className,
}: {
  count?: number;
  grid?: string;
  card?: (i: number) => ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("grid gap-2", grid, className)}>
      {Array.from({ length: count }, (_, i) => card(i))}
    </div>
  );
}

// a row of chips (a page's boards, kinds, filters); sideways on a phone like theirs
export function SkeletonChips({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  const widths = ["w-24", "w-20", "w-28", "w-16", "w-24", "w-20"];

  return (
    <div
      className={clsx(
        "-mx-4 flex gap-2 overflow-hidden px-4 sm:mx-0 sm:flex-wrap sm:px-0",
        className,
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <Bone
          key={i}
          className={clsx("h-8 shrink-0 rounded-full", widths[i % 6])}
        />
      ))}
    </div>
  );
}

// a glass panel of the given size (`className`), pulsing within, or holding `children`
export function SkeletonPanel({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "glass overflow-hidden rounded-2xl border border-white/5",
        className,
      )}
    >
      {children ?? <Bone className="h-full w-full rounded-none opacity-60" />}
    </div>
  );
}

// a search field (the armory's, the guilds', the codex's)
export function SkeletonInput({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "glass flex h-12 items-center rounded-xl border border-wow-gold/20 px-4",
        className,
      )}
    >
      <Bone className="h-4 w-48" />
    </div>
  );
}

// a form in its panel (signing in, signing up, the contact form) while the session is read
export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <SkeletonArea className="flex items-start justify-center px-6 py-16">
      <div className="glass w-full max-w-md space-y-5 rounded-2xl border border-wow-gold/15 p-8">
        <Bone className="mx-auto h-8 w-48" />
        <Bone className="mx-auto h-3 w-64 max-w-full" />
        {Array.from({ length: fields }, (_, i) => (
          <Bone key={i} className="h-12 w-full rounded-xl" />
        ))}
        <Bone className="h-11 w-full rounded-xl bg-wow-gold/15" />
      </div>
    </SkeletonArea>
  );
}
