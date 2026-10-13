/* An amount of copper in the game's colours: gold, silver, copper (the codex's way) */
export function Money({ copper }: { copper: number }) {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;

  return (
    <span className="whitespace-nowrap font-semibold tabular-nums">
      {g > 0 && <span className="text-[#ffd100]">{g.toLocaleString()}g </span>}
      {s > 0 && <span className="text-[#c7c7cf]">{s}s </span>}
      {c > 0 && <span className="text-[#c27c48]">{c}c</span>}
    </span>
  );
}
