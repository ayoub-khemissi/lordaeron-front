import { promises as fsp } from "fs";
import path from "path";

import { DBC_LAYOUTS, type DbcLayout, type DbcName } from "./dbc-schema";

/*
 * Read-only WDBC (3.3.5a) reader. A file is kept as one Buffer with an index id -> record offset (no copy per record). A store per DBC
 * folder (one per realm) loads the files on first use and reloads a file when it changes on disk (checked at most once a minute), so a
 * new DBC deploy shows up without a restart.
 */

const HEADER = 20;
const RECHECK_MS = 60_000;

export class Dbc {
  readonly name: string;
  readonly buf: Buffer;
  readonly layout: DbcLayout;
  private readonly recordSize: number;
  private readonly stringStart: number;
  private readonly index = new Map<number, number>();

  constructor(name: string, buf: Buffer, layout: DbcLayout) {
    if (buf.toString("ascii", 0, 4) !== "WDBC")
      throw new Error(`${name}.dbc: not a WDBC file`);
    const count = buf.readUInt32LE(4);
    const fieldCount = buf.readUInt32LE(8);

    if (fieldCount !== layout.fieldCount)
      throw new Error(
        `${name}.dbc: ${fieldCount} fields, ${layout.fieldCount} expected`,
      );
    this.name = name;
    this.buf = buf;
    this.layout = layout;
    this.recordSize = buf.readUInt32LE(12);
    this.stringStart = HEADER + count * this.recordSize;
    for (let i = 0; i < count; ++i) {
      const off = HEADER + i * this.recordSize;

      this.index.set(buf.readUInt32LE(off), off);
    }
  }

  rec(id: number): Rec | null {
    const off = id > 0 ? this.index.get(id) : undefined;

    return off === undefined ? null : new Rec(this, off);
  }

  readString(offset: number): string {
    const start = this.stringStart + offset;

    if (offset <= 0 || start >= this.buf.length) return "";

    return this.buf.toString("utf8", start, this.buf.indexOf(0, start));
  }
}

export class Rec {
  constructor(
    readonly dbc: Dbc,
    readonly off: number,
  ) {}

  get id() {
    return this.dbc.buf.readUInt32LE(this.off);
  }

  private index(field: string): number {
    const i = this.dbc.layout.fields[field];

    if (i === undefined)
      throw new Error(`${this.dbc.name}.dbc: unknown field ${field}`);

    return i;
  }

  // an int or float field (by the layout)
  get(field: string): number {
    const at = this.off + this.index(field) * 4;

    return this.dbc.layout.floats?.includes(field)
      ? this.dbc.buf.readFloatLE(at)
      : this.dbc.buf.readInt32LE(at);
  }

  str(field: string): string {
    const i = this.dbc.layout.strings?.[field];

    if (i === undefined)
      throw new Error(`${this.dbc.name}.dbc: unknown string field ${field}`);

    return this.dbc.readString(this.dbc.buf.readUInt32LE(this.off + i * 4));
  }

  // a localized string in locale `slot`, the enUS one when that slot is empty
  loc(field: string, slot: number): string {
    const base = this.dbc.layout.localized?.[field];

    if (base === undefined)
      throw new Error(`${this.dbc.name}.dbc: unknown localized field ${field}`);
    const read = (s: number) =>
      this.dbc.readString(this.dbc.buf.readUInt32LE(this.off + (base + s) * 4));

    return (slot && read(slot)) || read(0);
  }

  // raw bytes of packed records
  u8(byte: number) {
    return this.dbc.buf.readUInt8(this.off + byte);
  }

  u32(byte: number) {
    return this.dbc.buf.readUInt32LE(this.off + byte);
  }
}

interface Entry {
  dbc: Dbc;
  mtimeMs: number;
  size: number;
  checkedAt: number;
}

export type Dbcs = (name: DbcName) => Dbc;

export class DbcStore {
  private readonly entries = new Map<DbcName, Entry>();
  private readonly pending = new Map<DbcName, Promise<Entry>>();

  constructor(readonly dir: string) {}

  private file(name: DbcName) {
    return path.join(this.dir, `${name}.dbc`);
  }

  private async read(name: DbcName): Promise<Entry> {
    const file = this.file(name);
    const stat = await fsp.stat(file);
    const buf = await fsp.readFile(file);

    return {
      dbc: new Dbc(name, buf, DBC_LAYOUTS[name]),
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      checkedAt: Date.now(),
    };
  }

  private async fresh(name: DbcName): Promise<Entry> {
    const entry = this.entries.get(name);

    if (entry && Date.now() - entry.checkedAt < RECHECK_MS) return entry;
    let job = this.pending.get(name);

    if (!job) {
      job = (async () => {
        if (entry) {
          const stat = await fsp.stat(this.file(name)).catch(() => null);

          // unchanged (or briefly missing during a deploy): keep it
          if (
            !stat ||
            (stat.mtimeMs === entry.mtimeMs && stat.size === entry.size)
          ) {
            entry.checkedAt = Date.now();

            return entry;
          }
        }
        const next = await this.read(name);

        this.entries.set(name, next);

        return next;
      })().finally(() => this.pending.delete(name));
      this.pending.set(name, job);
    }

    return job;
  }

  // the files `names`, loaded and up to date; returns a synchronous accessor for the renderers
  async load(names: readonly DbcName[]): Promise<Dbcs> {
    const loaded = new Map<DbcName, Dbc>();

    await Promise.all(
      names.map(async (n) => loaded.set(n, (await this.fresh(n)).dbc)),
    );

    return (name) => {
      const d = loaded.get(name);

      if (!d) throw new Error(`${name}.dbc not loaded`);

      return d;
    };
  }
}

const stores = new Map<string, DbcStore>();

export function dbcStore(dir: string): DbcStore {
  let s = stores.get(dir);

  if (!s) {
    s = new DbcStore(dir);
    stores.set(dir, s);
  }

  return s;
}
