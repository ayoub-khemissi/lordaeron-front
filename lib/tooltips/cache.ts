/* A small LRU with a time to live: the least recently used entry goes first when full, an entry older than its TTL is a miss. */

export class LruCache<V> {
  private readonly map = new Map<string, { value: V; expires: number }>();

  constructor(
    private readonly max: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string): V | undefined {
    const e = this.map.get(key);

    if (!e) return undefined;
    this.map.delete(key);
    if (e.expires <= Date.now()) return undefined;
    this.map.set(key, e);

    return e.value;
  }

  has(key: string) {
    return this.get(key) !== undefined;
  }

  set(key: string, value: V, ttlMs = this.ttlMs) {
    this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + ttlMs });
    while (this.map.size > this.max) {
      const oldest = this.map.keys().next().value;

      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  get size() {
    return this.map.size;
  }
}
