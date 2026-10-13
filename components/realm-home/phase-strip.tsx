import NextLink from "next/link";

/* A progressive realm's phases at a glance (Rimeheart's home): one card per phase, its icon, number, name and length; a row that scrolls
   sideways on a phone, six columns on a desktop; the full timeline is on the realm's features page. The Burning Crusade raid a phase
   brings to level 80 sits at the foot of its card in a gold capsule (Ayoub, 13/10/2026: stylish, little room), "planned" until built. */
export type PhaseCard = {
  n: string;
  tag: string;
  title: string;
  length: string;
  icon: string;
  lines: string[];
  classic?: { icon: string; name: string; planned?: boolean };
};

export function PhaseStrip({
  eyebrow,
  title,
  phases,
  more,
  classic,
}: {
  eyebrow: string;
  title: string;
  phases: PhaseCard[];
  more: { label: string; href: string };
  // the capsule's eyebrow, its "planned" tag and the legend under the row
  classic?: { label: string; planned: string; legend: string };
}) {
  return (
    <section className="relative overflow-hidden border-y border-wow-blue-ice/10 bg-[linear-gradient(180deg,rgba(4,16,28,0.0),rgba(4,16,28,0.85)_30%,rgba(4,16,28,0.85)_70%,rgba(4,16,28,0))] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-wow-blue-ice">
              {eyebrow}
            </p>
            <h2 className="font-heading text-3xl text-white sm:text-4xl">
              {title}
            </h2>
          </div>
          <NextLink
            className="text-sm font-semibold uppercase tracking-[0.15em] text-wow-blue-ice underline-offset-4 hover:underline"
            href={more.href}
          >
            {more.label} →
          </NextLink>
        </div>
        <ol className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {phases.map((p, i) => (
            <li
              key={p.n}
              className={`relative flex w-[70%] shrink-0 snap-start flex-col rounded-xl border p-4 sm:w-auto ${
                i === 0
                  ? "border-wow-blue-ice/50 bg-wow-blue-ice/[0.08] shadow-[0_0_30px_-10px_rgba(79,195,247,0.7)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  alt=""
                  className="h-10 w-10 rounded-lg border border-wow-blue-ice/40 object-cover"
                  height={40}
                  loading="lazy"
                  src={p.icon}
                  width={40}
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wow-blue-ice/90">
                  {p.tag}
                </span>
              </div>
              <p className="mt-3 font-heading text-lg leading-tight text-white">
                {p.title}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                {p.length}
              </p>
              <ul className="mt-3 flex-1 space-y-1 text-sm leading-snug text-gray-400">
                {p.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              {p.classic && classic && (
                <div className="mt-4 flex items-center gap-2 rounded-full border border-wow-gold/45 bg-gradient-to-r from-wow-gold/20 via-wow-gold/[0.07] to-transparent py-1 pl-1 pr-2.5 shadow-[0_8px_24px_-12px_rgba(199,156,62,0.8)]">
                  <img
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full border border-wow-gold/70 object-cover"
                    height={32}
                    loading="lazy"
                    src={p.classic.icon}
                    width={32}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-wow-gold/80">
                      {classic.label}
                    </span>
                    <span className="block truncate font-heading text-sm leading-tight text-wow-gold-light">
                      {p.classic.name}
                    </span>
                  </span>
                  {p.classic.planned && (
                    <span className="shrink-0 rounded-full border border-wow-gold/35 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-wow-gold-light/80">
                      {classic.planned}
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
        {classic && phases.some((p) => p.classic) && (
          <p className="mt-4 flex items-center gap-2 text-xs text-white/55">
            <span className="h-2 w-2 shrink-0 rounded-full bg-wow-gold shadow-[0_0_8px_rgba(199,156,62,0.9)]" />
            {classic.legend}
          </p>
        )}
      </div>
    </section>
  );
}
