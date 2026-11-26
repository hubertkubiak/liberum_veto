/** mulberry32: tiny deterministic PRNG. Returns [value in [0,1), next state]. */
export function mulberry32(a: number): [number, number] {
  const next = (a + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

/** Stateless random source seeded from a number (used by bots so they never mutate game state). */
export function makeRand(seed: number): () => number {
  let s = seed | 0;
  return () => {
    const [v, n] = mulberry32(s);
    s = n;
    return v;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function hashSeed(...parts: (number | string)[]): number {
  let h = 2166136261;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= 0x9e37;
  }
  return h | 0;
}
