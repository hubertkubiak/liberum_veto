import type {
  Commitment,
  GameState,
  HouseId,
  LawCard,
  LawDirective,
  MagnateState,
  Role,
  VoteDecision,
} from './types';

export function activeHouses(s: GameState): HouseId[] {
  return s.houses.filter((h) => !s.magnates[h]!.eliminated);
}

export function mag(s: GameState, h: HouseId): MagnateState {
  return s.magnates[h]!;
}

export function isCourtier(m: MagnateState): boolean {
  return m.grants.length > 0;
}

function directiveSum(s: GameState, key: keyof LawDirective): number {
  return s.directives.reduce((acc, l) => acc + ((l.directive[key] as number | undefined) ?? 0), 0);
}

function directiveFlag(s: GameState, key: keyof LawDirective): boolean {
  return s.directives.some((l) => Boolean(l.directive[key]));
}

export function kingIncome(s: GameState): number {
  if (s.envoy?.noKingIncome) return 0;
  return 4 + directiveSum(s, 'kingIncome');
}

export function grantsToDraw(s: GameState): number {
  return 2 + Math.floor(s.king.track / 5) + directiveSum(s, 'extraGrants') + (s.envoy?.kingExtraGrants ?? 0);
}

export function vetoBanned(s: GameState): boolean {
  return directiveFlag(s, 'vetoBanned');
}

export function potockiBonusActive(s: GameState): boolean {
  return !directiveFlag(s, 'potockiBonusOff');
}

export function failedLawDeputies(s: GameState): number {
  return Math.max(1, ...s.directives.map((l) => l.directive.failedLawDeputies ?? 1));
}

export function trackStrengthDiv(s: GameState): number {
  return Math.min(3, ...s.directives.map((l) => l.directive.trackStrengthDiv ?? 3));
}

export function kingUpkeepPer(s: GameState): number {
  return Math.max(3, ...s.directives.map((l) => l.directive.kingUpkeepPer ?? 3));
}

/** Resistance actually applied this sejm (capped by the pool). */
export function effectiveResistance(s: GameState, law: LawCard): number {
  let r = law.resistance + (s.envoy?.resistance ?? 0) + directiveSum(s, 'resistanceMod');
  if (law.tag === 'military') r += s.envoy?.militaryResistance ?? 0;
  if (law.tag === 'tax') r += s.envoy?.taxResistance ?? 0;
  return Math.max(0, Math.min(r, s.pool));
}

export function voteWeight(s: GameState, h: HouseId, law: LawCard): number {
  const m = mag(s, h);
  let w = m.deputies;
  if (h === 'potocki' && law.tag === 'military' && potockiBonusActive(s)) w += 3;
  return w;
}

export function tallyLaws(s: GameState, votes: Partial<Record<HouseId, VoteDecision>>) {
  return s.agenda.map((law, i) => {
    let za = s.king.deputies;
    let przeciw = 0;
    for (const h of activeHouses(s)) {
      const v = votes[h];
      const w = voteWeight(s, h, law);
      if (v && v.votes[i]) za += w;
      else przeciw += w;
    }
    const resistance = effectiveResistance(s, law);
    return { za, przeciw, resistance, passed: za > przeciw + resistance };
  });
}

/**
 * Minimum magnate vote weight that must vote ZA for the law to pass,
 * together with the total magnate weight available. `need > total` means impossible.
 */
export function supportNeeded(s: GameState, law: LawCard): { need: number; total: number } {
  const total = activeHouses(s).reduce((a, h) => a + voteWeight(s, h, law), 0);
  const res = effectiveResistance(s, law);
  const need = Math.max(0, Math.floor((total + res - s.king.deputies) / 2) + 1);
  return { need, total };
}

/** Esteem everyone can see: base + tokens + grants (cards and ducats are hidden). */
export function publicEsteem(m: MagnateState): number {
  return 3 + m.esteemTokens + m.grants.reduce((a, g) => a + g.esteem, 0);
}

export function acceptsOffer(v: VoteDecision): boolean {
  return v.votes.every(Boolean);
}

/** Cost of a veto for a house, given how many vetoes already happened this era. */
export function vetoCost(s: GameState, h: HouseId, earlier = s.vetoesThisEra): number {
  let c = 5 + 2 * earlier + directiveSum(s, 'vetoCost') + (s.envoy?.vetoCostMod ?? 0);
  if (h === 'lubomirski') c -= 2;
  return Math.max(0, c);
}

export function musterAllowed(s: GameState): boolean {
  return !s.envoy?.noMuster;
}

/** Exchange rates [ducats, banners] available to a role. */
export function musterRates(s: GameState, role: Role): [number, number][] {
  const rates: [number, number][] = [[2, 1]];
  if (role === 'radziwill') rates.push([3, 2]);
  if (role === 'king') {
    for (const l of s.directives) if (l.directive.kingMusterRate) rates.push(l.directive.kingMusterRate);
  }
  return rates;
}

/** Cheapest ducat cost of buying n banners using the available rates. */
export function musterCost(s: GameState, role: Role, n: number): number {
  const rates = musterRates(s, role);
  const best = new Array(n + 1).fill(Infinity);
  best[0] = 0;
  for (let i = 1; i <= n; i++) {
    for (const [d, b] of rates) {
      const prev = Math.max(0, i - b);
      best[i] = Math.min(best[i], best[prev] + d);
    }
  }
  return best[n];
}

export function maxMuster(s: GameState, role: Role, ducats: number): number {
  let n = 0;
  while (musterCost(s, role, n + 1) <= ducats && n < 40) n++;
  return n;
}

export function ducatsOf(s: GameState, role: Role): number {
  return role === 'king' ? s.king.ducats : mag(s, role).ducats;
}

export function bannersOf(s: GameState, role: Role): number {
  return role === 'king' ? s.king.banners : mag(s, role).banners;
}

export function deputiesOf(s: GameState, role: Role): number {
  return role === 'king' ? s.king.deputies : mag(s, role).deputies;
}

export interface StrengthCtx {
  rokoszanin?: boolean;
  defending?: boolean;
}

export interface StrengthBreakdown {
  banners: number;
  hidden: number;
  deputies: number;
  ducats: number;
  track: number;
  mace: number;
  total: number;
}

export function strength(s: GameState, role: Role, c: Commitment, ctx: StrengthCtx = {}): StrengthBreakdown {
  if (role === 'king') {
    const b = {
      banners: c.banners,
      hidden: 0,
      deputies: Math.floor(s.king.deputies / 5),
      ducats: Math.floor(c.ducats / 3),
      track: Math.floor(s.king.track / trackStrengthDiv(s)),
      mace: 0,
    };
    return { ...b, total: b.banners + b.deputies + b.ducats + b.track };
  }
  const m = mag(s, role);
  const cards = m.played.filter((p) => c.cardIds.includes(p.id));
  const hidden = cards.reduce((a, p) => a + (p.defenseOnly && !ctx.defending ? 0 : p.banners), 0);
  const reserve = cards.reduce((a, p) => a + p.reserve, 0);
  const b = {
    banners: c.banners,
    hidden,
    deputies: Math.floor(m.deputies / (ctx.rokoszanin ? 3 : 5)),
    ducats: Math.floor((c.ducats + reserve) / 3),
    track: 0,
    mace: m.grants.some((g) => g.strength > 0) ? Math.max(...m.grants.map((g) => g.strength)) : 0,
  };
  return { ...b, total: b.banners + b.hidden + b.deputies + b.ducats + b.mace };
}

export interface ScoreBreakdown {
  base: number;
  tokens: number;
  cards: number;
  grants: number;
  foundations: number;
  total: number;
}

export function magnateScore(m: MagnateState): ScoreBreakdown {
  const cards = m.played.reduce((a, p) => a + p.esteem, 0);
  const grants = m.grants.reduce((a, g) => a + g.esteem, 0);
  const reserve = m.played.reduce((a, p) => a + p.reserve, 0);
  const foundations = Math.floor((m.ducats + reserve) / 4);
  const r = { base: 3, tokens: m.esteemTokens, cards, grants, foundations };
  return { ...r, total: r.base + r.tokens + r.cards + r.grants + r.foundations };
}

/** Probability that the attacker wins given strength difference (diff + d6 - d6 > 0). */
export function attackChance(diff: number): number {
  let wins = 0;
  for (let a = 1; a <= 6; a++) for (let d = 1; d <= 6; d++) if (diff + a - d > 0) wins++;
  return wins / 36;
}
