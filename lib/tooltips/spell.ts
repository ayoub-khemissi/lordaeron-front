import type { Dbcs, Rec } from "./dbc";
import type { DbcName } from "./dbc-schema";

import { cleanText, fmt, num, trimBlank, type TipLine } from "./format";
import { str, type LocaleConfig } from "./locales";

/*
 * Spell tooltips and descriptions (3.3.5 layout and wordings), from Spell.dbc and its satellite DBCs. Descriptions resolve every $ token
 * of the client ($s1, $o2, $d, ${...}, $?s123[..][..], $<var>, $@spelldesc123, $l / $g plurals and genders...) for a level 80 player
 * with no gear: character-dependent values ($AP, $SP, stats...) count as 0, so formulas show their base value. Nothing throws on odd
 * data: an unknown token renders as nothing (and is reported in `warnings`).
 */

export const SPELL_DBCS: readonly DbcName[] = [
  "Spell",
  "SpellIcon",
  "SpellDescriptionVariables",
  "SpellDuration",
  "SpellRadius",
  "SpellRange",
  "SpellCastTimes",
  "SpellRuneCost",
  "SpellShapeshiftForm",
];

const PLAYER_LEVEL = 80;
const MAX_DEPTH = 20;

// values of the character-dependent tokens (a level 80 character without gear or buffs)
const CHARACTER_TOKENS: Record<string, number> = {
  PL: PLAYER_LEVEL,
  pl: PLAYER_LEVEL,
};
const CHARACTER_TOKEN =
  /^(RAP|AP|SPFI|SPFR|SPH|SPS|SPA|SPN|SP|MWS|mws|MWB|mwb|MW|mw|PL|pl|SPI|spi|STA|sta|INT|int|AGI|agi|STR|str|HND|hnd|ap|rap|sp)(?![a-zA-Z])/;

type Value = number | { text: string; value: number };

export function spellIconName(dbcs: Dbcs, iconId: number): string {
  const r = dbcs("SpellIcon").rec(iconId);

  return r ? iconFile(r.str("Texture")) : "inv_misc_questionmark";
}

// "Interface\Icons\Spell_Fire_FireBolt02" -> "spell_fire_firebolt02" (the name on wow.zamimg.com)
export const iconFile = (path: string) =>
  path.replace(/.*\\/, "").toLowerCase().replace(/'/g, "").trim() ||
  "inv_misc_questionmark";

export class SpellRenderer {
  readonly warnings: string[] = [];
  private readonly vars = new Map<number, Map<string, string>>();

  constructor(
    private readonly dbcs: Dbcs,
    private readonly lc: LocaleConfig,
  ) {}

  rec(id: number): Rec | null {
    return this.dbcs("Spell").rec(id);
  }

  private warn(msg: string) {
    if (this.warnings.length < 50) this.warnings.push(msg);
  }

  name(id: number): string {
    return this.rec(id)?.loc("Name", this.lc.slot) ?? "";
  }

  icon(id: number): string {
    const r = this.rec(id);

    return r
      ? spellIconName(this.dbcs, r.get("SpellIconID"))
      : "inv_misc_questionmark";
  }

  private durationMs(rec: Rec): number {
    const r = this.dbcs("SpellDuration").rec(rec.get("DurationIndex"));

    return r ? r.get("Duration") : 0;
  }

  private radius(rec: Rec, eff: number): number {
    const r = this.dbcs("SpellRadius").rec(rec.get(`EffectRadiusIndex_${eff}`));

    return r ? r.get("Radius") : 0;
  }

  private range(rec: Rec) {
    const id = rec.get("RangeIndex");
    const r = this.dbcs("SpellRange").rec(id);

    return r
      ? {
          id,
          min: r.get("RangeMin_1"),
          max: r.get("RangeMax_1"),
          maxFriend: r.get("RangeMax_2"),
        }
      : null;
  }

  // base points at level 80 (SpellEffectInfo::CalcValue): the min and max of the roll
  private points(rec: Rec, eff: number) {
    let bp = rec.get(`EffectBasePoints_${eff}`);
    const die = rec.get(`EffectDieSides_${eff}`);
    const perLevel = rec.get(`EffectRealPointsPerLevel_${eff}`);

    if (perLevel) {
      let level = PLAYER_LEVEL;
      const maxLevel = rec.get("MaxLevel");
      const baseLevel = rec.get("BaseLevel");

      if (maxLevel > 0 && level > maxLevel) level = maxLevel;
      else if (level < baseLevel) level = baseLevel;
      level -= rec.get("SpellLevel");
      bp += Math.trunc(level * perLevel);
    }

    return die > 0 ? { min: bp + 1, max: bp + die } : { min: bp, max: bp };
  }

  private formatDuration(ms: number): string {
    const lc = this.lc;

    if (ms >= 86400000)
      return fmt(
        lc,
        str(lc, "INT_SPELL_DURATION_DAYS"),
        num(ms / 86400000, lc, 1),
      );
    if (ms >= 3600000)
      return fmt(
        lc,
        str(lc, "INT_SPELL_DURATION_HOURS"),
        num(ms / 3600000, lc, 1),
      );
    if (ms >= 60000)
      return fmt(lc, str(lc, "INT_SPELL_DURATION_MIN"), num(ms / 60000, lc, 1));

    return fmt(lc, str(lc, "INT_SPELL_DURATION_SEC"), num(ms / 1000, lc, 1));
  }

  // description variables ($<name>) of a spell (SpellDescriptionVariables.dbc)
  private descVariables(id: number): Map<string, string> {
    let vars = this.vars.get(id);

    if (!vars) {
      vars = new Map();
      const r = this.dbcs("SpellDescriptionVariables").rec(id);

      for (const line of (r ? r.str("Variables") : "").split(/\r?\n/)) {
        const m = line.match(/^\$(\w+)=(.*)$/);

        if (m) vars.set(m[1].toLowerCase(), m[2]);
      }
      this.vars.set(id, vars);
    }

    return vars;
  }

  // a token's value: a number, or { text, value } for ranges and durations
  private tokenValue(spellId: number, letter: string, eff: number): Value {
    const rec = this.rec(spellId);

    if (!rec) {
      this.warn(`spell ${spellId}: not in Spell.dbc`);

      return 0;
    }
    const e = eff >= 1 && eff <= 3 ? eff : 1;

    switch (letter) {
      case "s":
      case "S": {
        const p = this.points(rec, e);
        const a = Math.abs(p.min);
        const b = Math.abs(p.max);

        return a === b
          ? a
          : {
              text: fmt(
                this.lc,
                str(this.lc, "_VALUE_RANGE"),
                num(Math.min(a, b), this.lc),
                num(Math.max(a, b), this.lc),
              ),
              value: Math.max(a, b),
            };
      }
      case "m":
        return Math.abs(this.points(rec, e).min);
      case "M":
        return Math.abs(this.points(rec, e).max);
      case "o":
      case "O": {
        const amp = rec.get(`EffectAuraPeriod_${e}`);
        const ticks = amp ? Math.floor(this.durationMs(rec) / amp) : 1;

        return Math.abs(this.points(rec, e).min) * ticks;
      }
      case "t":
      case "T":
        return rec.get(`EffectAuraPeriod_${e}`) / 1000;
      case "d":
      case "D": {
        const ms = this.durationMs(rec);

        if (ms <= 0)
          return {
            text: str(this.lc, "SPELL_DURATION_UNTIL_CANCELLED"),
            value: 0,
          };

        return { text: this.formatDuration(ms), value: ms / 1000 };
      }
      case "a":
      case "A":
        return this.radius(rec, e);
      case "h":
      case "H":
        return rec.get("ProcChance");
      case "n":
      case "N":
        return rec.get("ProcCharges");
      case "u":
      case "U":
        return rec.get("CumulativeAura");
      case "x":
      case "X":
        return rec.get(`EffectChainTargets_${e}`);
      case "q":
      case "Q":
        return rec.get(`EffectMiscValue_${e}`);
      case "e":
      case "E":
        return rec.get(`EffectMultipleValue_${e}`);
      case "f":
      case "F":
        return rec.get(`EffectChainAmplitude_${e}`);
      case "b":
      case "B":
        return Math.abs(rec.get(`EffectPointsPerCombo_${e}`));
      case "i":
      case "I":
        return rec.get("MaxTargets");
      case "v":
      case "V":
        return rec.get("MaxTargetLevel");
      case "r":
      case "R": {
        const r = this.range(rec);

        return r ? r.max : 0;
      }
      case "z":
        return { text: str(this.lc, "_SPELL_HOME"), value: 0 };
      default:
        this.warn(`spell ${spellId}: unknown token $${letter}`);

        return 0;
    }
  }

  // arithmetic of ${...} once its tokens are numbers (digits, operators, parentheses, min / max / floor): only those reach Function
  private evaluate(expr: string, spellId: number): number {
    const e = expr
      .replace(/\$?max\(/gi, "Math.max(")
      .replace(/\$?min\(/gi, "Math.min(")
      .replace(/\$?floor\(/gi, "Math.floor(")
      .replace(/\$?ceil\(/gi, "Math.ceil(")
      .replace(/\$?abs\(/gi, "Math.abs(");

    if (
      !e.trim() ||
      !/^[\d\s.+\-*/(),]*$/.test(
        e.replace(/Math\.(max|min|floor|ceil|abs)/g, ""),
      )
    ) {
      this.warn(`spell ${spellId}: cannot evaluate {${expr}}`);

      return 0;
    }
    try {
      const v = Function(`"use strict"; return (${e});`)() as unknown;

      return typeof v === "number" && Number.isFinite(v) ? v : 0;
    } catch {
      this.warn(`spell ${spellId}: cannot evaluate {${expr}}`);

      return 0;
    }
  }

  /*
   * Renders a description of spell `spellId`. `plain`: numbers only, with a decimal point (the inside of ${...}).
   */
  render(text: string, spellId: number, depth = 0, plain = false): string {
    if (depth > MAX_DEPTH) {
      this.warn(`spell ${spellId}: description recursion`);

      return "";
    }
    const lc = this.lc;
    const rec = this.rec(spellId);
    const vars = rec
      ? this.descVariables(rec.get("SpellDescriptionVariableID"))
      : new Map<string, string>();
    let out = "";
    let last: number | null = null; // the last number written, for $l
    let i = 0;
    const put = (v: Value) => {
      if (typeof v === "object") {
        out += plain ? String(v.value) : v.text;
        last = v.value;
      } else {
        out += plain ? String(v) : num(v, lc);
        last = v;
      }
    };
    // a bracketed group starting at s[j] === '[': [content, index after ']']
    const bracket = (s: string, j: number): [string, number] => {
      let level = 0;

      for (let k = j; k < s.length; ++k) {
        if (s[k] === "[") ++level;
        else if (s[k] === "]" && --level === 0)
          return [s.slice(j + 1, k), k + 1];
      }

      return [s.slice(j + 1), s.length];
    };

    while (i < text.length) {
      const c = text[i];

      if (c !== "$") {
        out += c;
        ++i;
        continue;
      }
      const rest = text.slice(i + 1);
      let m: RegExpMatchArray | null;

      if (rest[0] === "{") {
        // ${expr}, with an optional .N precision after it
        let level = 0;
        let k = 0;

        for (; k < rest.length; ++k) {
          if (rest[k] === "{") ++level;
          else if (rest[k] === "}" && --level === 0) break;
        }
        const inner = this.render(rest.slice(1, k), spellId, depth + 1, true);
        let v = this.evaluate(inner, spellId);

        i += 1 + k + 1;
        const prec = text.slice(i).match(/^\.(\d)/);

        if (prec) {
          v = Number(v.toFixed(Number(prec[1])));
          i += 2;
        } else v = Math.round(v * 100) / 100;
        put(Math.abs(v));
      } else if (rest[0] === "?") {
        // $?s123[a]?a456[b][c]: the player has none of the spells or auras: the last branch
        let j = i + 2;
        let branch = "";

        for (;;) {
          const cond = text.slice(j).match(/^!?[a-zA-Z]?\d*/);

          j += cond ? cond[0].length : 0;
          if (text[j] !== "[") {
            branch = "";
            break;
          }
          [branch, j] = bracket(text, j);
          if (text[j] === "?") {
            ++j;
            continue;
          }
          if (text[j] === "[") {
            [branch, j] = bracket(text, j);
            break;
          }
          branch = "";
          break;
        }
        out += this.render(branch, spellId, depth + 1, plain);
        i = Math.max(j, i + 2);
      } else if ((m = rest.match(/^([/*])([\d.]+);(\d*)([a-zA-Z])(\d?)/))) {
        // $/1000;S1 and $*5;s1
        let v = this.tokenValue(
          m[3] ? Number(m[3]) : spellId,
          m[4],
          Number(m[5]) || 1,
        );

        v = typeof v === "object" ? v.value : v;
        put(Math.abs(m[1] === "/" ? v / Number(m[2]) : v * Number(m[2])));
        i += 1 + m[0].length;
      } else if ((m = rest.match(/^<(\w+)>/))) {
        const expr = vars.get(m[1].toLowerCase());

        if (expr === undefined)
          this.warn(`spell ${spellId}: unknown variable $<${m[1]}>`);
        const v =
          expr === undefined
            ? ""
            : this.render(expr, spellId, depth + 1, plain);

        out += v;
        const n = Number(v.replace(",", "."));

        if (v && !Number.isNaN(n)) last = n;
        i += 1 + m[0].length;
      } else if (
        (m = rest.match(/^@(spelldesc|spellname|spellaura|spelltooltip)(\d+)/))
      ) {
        const otherId = Number(m[2]);
        const other = this.rec(otherId);

        if (other) {
          if (m[1] === "spellname") out += other.loc("Name", lc.slot);
          else {
            const field =
              m[1] === "spellaura" ? "AuraDescription" : "Description";

            out += this.render(
              cleanText(other.loc(field, lc.slot)),
              otherId,
              depth + 1,
              plain,
            );
          }
        } else
          this.warn(`spell ${spellId}: $@${m[1]}${otherId} not in Spell.dbc`);
        i += 1 + m[0].length;
      } else if ((m = rest.match(/^[lL]([^:;]*):([^;]*);/))) {
        out += last === 1 ? m[1] : m[2];
        i += 1 + m[0].length;
      } else if ((m = rest.match(/^[gG]([^:;]*):([^;]*);/))) {
        out += m[1];
        i += 1 + m[0].length;
      } else if ((m = rest.match(/^(max|min|floor|ceil|abs)\(/i))) {
        // $max(a,b) in a formula: evaluate() reads it
        out += m[1].toLowerCase() + "(";
        i += 1 + m[0].length;
      } else if ((m = rest.match(CHARACTER_TOKEN))) {
        put(CHARACTER_TOKENS[m[1]] ?? 0);
        i += 1 + m[0].length;
      } else if ((m = rest.match(/^(\d*)([a-zA-Z])(\d?)/))) {
        put(
          this.tokenValue(
            m[1] ? Number(m[1]) : spellId,
            m[2],
            Number(m[3]) || 1,
          ),
        );
        i += 1 + m[0].length;
      } else {
        // a lone $: dropped
        this.warn(`spell ${spellId}: stray $ at "${text.slice(i, i + 20)}"`);
        ++i;
      }
    }

    return out;
  }

  desc(
    id: number,
    field: "Description" | "AuraDescription" = "Description",
  ): string {
    const rec = this.rec(id);

    if (!rec) return "";

    return this.render(cleanText(rec.loc(field, this.lc.slot)), id).trim();
  }

  tooltip(id: number): { name: string; lines: TipLine[] } | null {
    const rec = this.rec(id);

    if (!rec) return null;
    const lc = this.lc;
    const lines: TipLine[] = [];
    const name = rec.loc("Name", lc.slot);
    const rank = rec.loc("NameSubtext", lc.slot);

    lines.push(
      rank
        ? { left: name, right: rank, color: "white" }
        : { left: name, color: "white" },
    );

    if (rec.get("Attributes") & 0x40)
      lines.push({ left: str(lc, "SPELL_PASSIVE_EFFECT"), color: "white" });
    else {
      // cost and range
      let cost = "";
      const power = rec.get("PowerType");
      const amount = rec.get("ManaCost");
      const pct = rec.get("ManaCostPct");
      const COST: Record<number, string> = {
        0: "MANA_COST",
        1: "RAGE_COST",
        2: "FOCUS_COST",
        3: "ENERGY_COST",
        6: "RUNIC_POWER_COST",
        [-2]: "HEALTH_COST",
      };

      if (pct && power === 0) cost = fmt(lc, str(lc, "_MANA_COST_PCT"), pct);
      else if (amount)
        cost = fmt(
          lc,
          str(lc, COST[power] ?? "MANA_COST"),
          [1, 6].includes(power) ? amount / 10 : amount,
        );
      const rr = this.dbcs("SpellRuneCost").rec(rec.get("RuneCostID"));

      if (rr) {
        const runes = (["Blood", "Unholy", "Frost"] as const)
          .filter((k) => rr.get(k))
          .map((k) =>
            fmt(lc, str(lc, `RUNE_COST_${k.toUpperCase()}`), rr.get(k)),
          );

        if (runes.length)
          cost = [cost, runes.join(" ")].filter(Boolean).join(" ");
      }
      let range = "";
      const r = this.range(rec);

      if (r && r.id !== 1) {
        const max = r.max || r.maxFriend;

        if (r.id === 2 || (max > 0 && max <= 5 && !r.min))
          range = str(lc, "MELEE_RANGE");
        else if (max >= 50000) range = str(lc, "SPELL_RANGE_UNLIMITED");
        else if (max > 0)
          range = fmt(
            lc,
            str(lc, "SPELL_RANGE"),
            r.min ? `${num(r.min, lc)}-${num(max, lc)}` : num(max, lc),
          );
      }
      if (cost || range)
        lines.push(
          range
            ? { left: cost, right: range, color: "white" }
            : { left: cost, color: "white" },
        );

      // cast time and cooldown
      const ct = this.dbcs("SpellCastTimes").rec(rec.get("CastingTimeIndex"));
      const castMs = ct ? ct.get("Base") : 0;
      let cast: string;

      if (rec.get("AttributesEx") & 0x44)
        cast = str(lc, "SPELL_CAST_CHANNELED");
      else if (rec.get("Attributes") & 0x404)
        cast = str(lc, "SPELL_ON_NEXT_SWING");
      else if (castMs > 0)
        cast =
          castMs >= 60000
            ? fmt(lc, str(lc, "SPELL_CAST_TIME_MIN"), castMs / 60000)
            : fmt(lc, str(lc, "SPELL_CAST_TIME_SEC"), castMs / 1000);
      else
        cast = str(
          lc,
          cost ? "SPELL_CAST_TIME_INSTANT" : "SPELL_CAST_TIME_INSTANT_NO_MANA",
        );
      const cdMs = Math.max(
        rec.get("RecoveryTime"),
        rec.get("CategoryRecoveryTime"),
      );
      let cd = "";

      if (cdMs > 1500)
        cd =
          cdMs >= 3600000 && cdMs % 3600000 === 0
            ? fmt(lc, str(lc, "_SPELL_RECAST_TIME_HOURS"), cdMs / 3600000)
            : cdMs >= 60000
              ? fmt(lc, str(lc, "SPELL_RECAST_TIME_MIN"), cdMs / 60000)
              : fmt(lc, str(lc, "SPELL_RECAST_TIME_SEC"), cdMs / 1000);
      lines.push(
        cd
          ? { left: cast, right: cd, color: "white" }
          : { left: cast, color: "white" },
      );

      // a required shapeshift form (Cat Form...)
      const forms = rec.get("ShapeshiftMask") >>> 0;

      if (forms && !(rec.get("AttributesEx2") & 0x80000)) {
        const sf = this.dbcs("SpellShapeshiftForm");
        const names: string[] = [];

        for (let f = 1; f < 32; ++f) {
          const fr = forms & (1 << (f - 1)) ? sf.rec(f) : null;

          if (fr) names.push(fr.loc("Name", lc.slot));
        }
        if (names.length)
          lines.push({
            left: fmt(lc, str(lc, "SPELL_REQUIRED_FORM"), names.join(", ")),
            color: "white",
          });
      }
    }
    for (const l of this.desc(id).split("\n"))
      lines.push({ left: l, color: "gold" });

    return { name, lines: trimBlank(lines) };
  }
}
