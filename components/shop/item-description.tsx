// a shop article's description (shop_items description_<locale>): paragraphs apart by a blank line, the lines starting with "• " drawn as a
// list (sql/shop_lootbot.sql); a one-line description stays one paragraph. The cards show its first paragraph only (firstParagraph).
export function firstParagraph(text: string) {
  return text.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, " ");
}

export function ItemDescription({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length);

  return (
    <div className="space-y-3 text-sm text-gray-300 mb-4">
      {blocks.map((lines, b) => {
        const intro = lines.filter((l) => !l.startsWith("• "));
        const bullets = lines.filter((l) => l.startsWith("• "));

        return (
          <div key={b} className={b === 0 ? "text-gray-200" : undefined}>
            {intro.map((line, i) => (
              <p
                key={i}
                className={
                  bullets.length ? "font-medium text-wow-gold/90 mb-1" : ""
                }
              >
                {line}
              </p>
            ))}
            {bullets.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 marker:text-wow-gold/60">
                {bullets.map((line, i) => (
                  <li key={i}>{line.slice(2)}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
