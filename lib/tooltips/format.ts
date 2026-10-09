import type { LocaleConfig } from "./locales";

export interface TipLine {
  left: string;
  right?: string;
  color?: string;
}

// a number as the client prints it: at most `decimals` decimals, no trailing zeros, the locale's separator
export function num(v: number, lc: LocaleConfig, decimals = 2): string {
  const r = Math.round(v * 10 ** decimals) / 10 ** decimals;
  const s = Number.isInteger(r)
    ? String(r)
    : r.toFixed(decimals).replace(/0+$/, "");

  return lc.decimalComma ? s.replace(".", ",") : s;
}

// Russian plural forms (one / few / many)
function pluralRu(n: number, forms: string[]) {
  const [one, few, many] = [
    forms[0],
    forms[1] ?? forms[0],
    forms[2] ?? forms[1] ?? forms[0],
  ];
  const m10 = n % 10;
  const m100 = n % 100;

  if (!Number.isInteger(n)) return few;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;

  return many;
}

/*
 * The client's string.format on a GlobalStrings wording: %d %s %c %.Nf %.3g, positional %1$d, %%; then its escapes: |4one:many; (the
 * plural of the number before it) and the French |2 (de / d'). A string given to %d is printed as is (an already formatted number).
 */
export function fmt(
  lc: LocaleConfig,
  pattern: string,
  ...args: unknown[]
): string {
  let next = 0;
  let out = pattern.replace(
    /%(?:(\d+)\$)?([-+ 0#]*)(\d*)(?:\.(\d+))?([dsfgc%])/g,
    (
      m,
      pos: string | undefined,
      _flags,
      _width,
      prec: string | undefined,
      conv: string,
    ) => {
      if (conv === "%") return "%";
      const arg = args[pos ? Number(pos) - 1 : next++];

      if (typeof arg === "string" || conv === "s" || conv === "c")
        return String(arg ?? "");
      const v = Number(arg ?? 0);

      if (conv === "d") return String(Math.trunc(v));
      if (conv === "f") {
        const s = v.toFixed(prec ? Number(prec) : 6);

        return lc.decimalComma ? s.replace(".", ",") : s;
      }

      // %g: significant digits, no trailing zeros
      return num(Number(v.toPrecision(prec ? Number(prec) || 1 : 6)), lc, 6);
    },
  );

  out = out.replace(/\|2 (\S)/g, (_m, c: string) =>
    /[aeiouyéèêàâîôûh]/i.test(c) ? `d'${c}` : `de ${c}`,
  );
  out = out.replace(
    /(\d+(?:[.,]\d+)?)([^|\d]*)\|4([^;]*);/g,
    (_m, n: string, mid: string, forms: string) => {
      const v = Number(n.replace(",", "."));
      const list = forms.split(":");
      const word =
        lc.locale === "ru"
          ? pluralRu(v, list)
          : v === 1
            ? list[0]
            : (list[1] ?? list[0]);

      return `${n}${mid}${word}`;
    },
  );

  return out;
}

// the client's text escapes: colors (|cAARRGGBB ... |r), new lines (|n), carriage returns
export const cleanText = (s: string) =>
  s
    .replace(/\r/g, "")
    .replace(/\|c[0-9a-fA-F]{8}/g, "")
    .replace(/\|r/g, "")
    .replace(/\|n/g, "\n");

// no blank lines at the end, no double blank lines
export function trimBlank(lines: TipLine[]): TipLine[] {
  const out: TipLine[] = [];
  const blank = (l?: TipLine) => !!l && !l.left && !l.right;

  for (const l of lines) {
    if (blank(l) && (!out.length || blank(out[out.length - 1]))) continue;
    out.push(l);
  }
  while (out.length && blank(out[out.length - 1])) out.pop();

  return out;
}
