import NextLink from "next/link";

/* A progressive realm's phases at a glance (Rimeheart's home): one card per phase, its icon, number, name and length; a row that scrolls
   sideways on a phone, six columns on a desktop; the full timeline is on the realm's features page. */
export type PhaseCard = {
  n: string;
  tag: string;
  title: string;
  length: string;
  icon: string;
  lines: string[];
};

export function PhaseStrip({
  eyebrow,
  title,
  phases,
  more,
}: {
  eyebrow: string;
  title: string;
  phases: PhaseCard[];
  more: { label: string; href: string };
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
              className={`relative w-[70%] shrink-0 snap-start rounded-xl border p-4 sm:w-auto ${
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
              <ul className="mt-3 space-y-1 text-sm leading-snug text-gray-400">
                {p.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
