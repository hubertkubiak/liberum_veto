import { HOUSES } from '../engine/data';
import { hashSeed, makeRand } from '../engine/rng';
import {
  activeHouses,
  attackChance,
  effectiveResistance,
  isCourtier,
  mag,
  magnateScore,
  maxMuster,
  strength,
  vetoBanned,
  vetoCost,
  voteWeight,
} from '../engine/rules';
import type {
  BenefitCard,
  Commitment,
  Decision,
  GameState,
  GrantCard,
  HouseId,
  MagnateState,
  Role,
} from '../engine/types';

/** Rough value of a benefit card for its owner (in Esteem-equivalents). */
export function cardValue(c: BenefitCard): number {
  return c.esteem * 1.5 + c.banners * 0.3 + c.reserve * 0.25;
}

export function grantValue(g: GrantCard): number {
  return g.esteem * 1.5 + g.deputies * 0.35 + g.banners * 0.3 + g.ducats * 0.25 + g.strength * 0.4;
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

/** Public estimate of a magnate's esteem (what a rival can guess). */
function guessEsteem(m: MagnateState): number {
  return 3 + m.esteemTokens + m.grants.reduce((a, g) => a + g.esteem, 0) + m.played.length * 0.5 + 2;
}

function bestRivalEsteem(s: GameState, exclude?: HouseId): number {
  const vals = activeHouses(s)
    .filter((h) => h !== exclude)
    .map((h) => guessEsteem(mag(s, h)));
  return vals.length ? Math.max(...vals) : 0;
}

export function botDecide(s: GameState, role: Role): Decision | null {
  const r = makeRand(hashSeed(s.seed, s.sejm, s.phase, role, s.log.length));
  switch (s.phase) {
    case 'agenda':
      return kingAgenda(s, r);
    case 'draft1':
    case 'draft2':
      return draft(s, role as HouseId, r);
    case 'offers':
      return kingOffers(s, r);
    case 'negotiation':
      return negotiate(s, role, r);
    case 'voting':
      return vote(s, role as HouseId, r);
    case 'muster':
      return muster(s, role, r);
    case 'conflictDeclare':
      return declare(s, role, r);
    case 'rokoszSides':
      return side(s, role as HouseId, r);
    case 'conflictCommit':
      return commit(s, role, r);
    default:
      return null;
  }
}

// ---------------------------------------------------------------- king

function kingAgenda(s: GameState, r: () => number): Decision {
  const opts = s.agendaOptions;
  const scored = opts.map((l, i) => ({ i, v: l.track * 1.2 - effectiveResistance(s, l) * 0.25 + r() * 0.8 }));
  scored.sort((a, b) => b.v - a.v);
  const keep = scored.slice(0, 2).map((x) => x.i).sort() as [number, number];
  if (keep.length < 2) keep.push(keep[0] === 0 ? 1 : 0);
  return { kind: 'agenda', keep };
}

function kingOffers(s: GameState, r: () => number): Decision {
  const act = activeHouses(s);
  const t = s.traits.king!;
  // Swing value: magnates with many votes (and Potocki on military laws) are worth buying.
  const swing = act
    .map((h) => ({
      h,
      w: Math.max(...s.agenda.map((l) => voteWeight(s, h, l))) + r() * 6,
    }))
    .sort((a, b) => b.w - a.w);
  const grants = [...s.king.grantHand].sort((a, b) => grantValue(b) - grantValue(a));
  const budget = Math.max(0, s.king.ducats - 2);
  const checks = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  const offers: Record<string, { grantId: string | null; check: number }> = {};
  const targets = Math.min(act.length, 1 + Math.round(t.greed * 1.5));
  let spent = 0;
  const used = new Set<number>();
  // Targets get grants and solid checks; the rest get small checks (or bluff screens).
  const plan = swing.map((x, idx) => {
    const target = idx < targets;
    const ideal = target ? 4 + Math.round(r() * 5) : Math.round(r() * 3);
    return { h: x.h, target, ideal };
  });
  for (const p of plan) {
    let check = checks.filter((c) => !used.has(c) && c <= p.ideal && spent + c <= budget)[0];
    if (check === undefined) check = [...checks].reverse().find((c) => !used.has(c) && spent + c <= budget) ?? 0;
    if (used.has(check)) check = checks.find((c) => !used.has(c))!;
    used.add(check);
    spent += check;
    const grant = p.target && grants.length ? grants.shift()! : !p.target && grants.length > 3 && r() < 0.4 ? grants.pop()! : null;
    offers[p.h] = { grantId: grant?.id ?? null, check };
  }
  return { kind: 'offers', offers };
}

// ---------------------------------------------------------------- magnates

function draft(s: GameState, h: HouseId, r: () => number): Decision {
  const cards = s.phase === 'draft1' ? s.draftDraw[h]! : s.draftReceived[h]!;
  const t = s.traits[h]!;
  const scored = cards.map((c) => ({
    c,
    v: cardValue(c) + (c.faction === 'foreign' ? t.boldness * 1.2 : 0) + r() * 0.6,
  }));
  scored.sort((a, b) => b.v - a.v);
  return { kind: 'draft', keepId: scored[0].c.id };
}

/** Bot's plan for this sejm, computed deterministically so speech and vote can share it. */
function magnatePlan(s: GameState, h: HouseId) {
  const m = mag(s, h);
  const t = s.traits[h]!;
  const r = makeRand(hashSeed(s.seed, s.sejm, 'plan', h));
  const offer = s.offers[h];
  const hand = [...m.hand].sort((a, b) => cardValue(a) - cardValue(b));
  const worst = hand[0];
  const best = hand[hand.length - 1];

  const offerValue = offer ? offer.check * 0.3 + (offer.grant ? grantValue(offer.grant) : 0) : 0;
  const acceptCost = worst ? Math.max(0, cardValue(worst)) : 0;
  const rejectGain = best ? Math.max(0, cardValue(best)) * 0.4 : 0;

  // How dangerous is the king? Compare his track (+ laws on the table) to the best esteem.
  const lawTrack = s.agenda.reduce((a, l) => a + l.track, 0);
  const myEsteem = magnateScore(m).total;
  const kingThreat = (s.king.track + lawTrack + 1 - Math.max(myEsteem, bestRivalEsteem(s, h))) / 4;

  // Would the laws fail without me? Estimate others blocking (free-riding).
  const others = activeHouses(s).filter((x) => x !== h);
  const blockChance = s.agenda.map((l) => {
    const resistance = effectiveResistance(s, l);
    const mine = voteWeight(s, h, l);
    const othersAgainst = others.reduce((a, x) => a + voteWeight(s, x, l), 0) * 0.65;
    const za = s.king.deputies + others.reduce((a, x) => a + voteWeight(s, x, l), 0) * 0.35;
    return za + mine > othersAgainst + resistance ? 0.4 : 0.85;
  });
  const blockBonus = Math.max(...blockChance) * 1.0;

  const acceptScore = offerValue - acceptCost + t.greed * 0.8 + (r() - 0.5) * 1.5;
  const rejectScore = rejectGain + blockBonus + Math.max(0, kingThreat) * 1.2 + (1 - t.greed) * 0.6;
  const accept = acceptScore > rejectScore;

  const vetoCostNow = vetoCost(s, h);
  const veto =
    !accept &&
    !vetoBanned(s) &&
    m.ducats >= vetoCostNow + 1 &&
    kingThreat > 0.5 &&
    lawTrack >= 5 &&
    r() < 0.25 + t.boldness * 0.35;

  return { accept, veto, worst, best, kingThreat };
}

function vote(s: GameState, h: HouseId, _r: () => number): Decision {
  const p = magnatePlan(s, h);
  return {
    kind: 'vote',
    vote: {
      votes: [p.accept, p.accept],
      veto: p.veto,
      cardId: p.accept ? (p.worst?.id ?? null) : (p.best?.id ?? null),
    },
  };
}

const MAG_LINES_BLOCK = [
  'Nie pozwolimy na absolutum dominium! Głosujemy przeciw.',
  'Złota wolność ponad wszystko — przeciw obu ustawom.',
  'Wiem, co król szykuje. Panowie bracia, blokujmy razem!',
  'Żadne starostwo nie kupi naszych głosów.',
];
const MAG_LINES_SUPPORT = [
  'Ustawy rozsądne, Rzeczpospolita potrzebuje skarbu…',
  'Może warto wysłuchać Jego Królewskiej Mości.',
  'Wstrzymujemy się od deklaracji. Zobaczymy przy urnie.',
];
const MAG_LINES_VETO = ['Jeśli trzeba, zerwiemy ten sejm!', 'Liberum veto jest źrenicą wolności!'];
const KING_LINES = [
  'Ustawy te wzmocnią Rzeczpospolitą. Lojalni nie pożałują.',
  'Kto poprze tron, nie wyjdzie z pustymi rękami.',
  'Buława czeka na godnego. Wiecie, o kim mówię.',
  'Skarb jest pełny, a łaska królewska hojna.',
];

function negotiate(s: GameState, role: Role, r: () => number): Decision {
  if (role === 'king') {
    let line = pick(KING_LINES, r);
    const act = activeHouses(s);
    if (r() < 0.4 && act.length) line = `Obiecuję ${HOUSES[pick(act, r)].name} buławę, jeśli poprą ustawy.`;
    return { kind: 'negotiation', speech: line };
  }
  const h = role as HouseId;
  const p = magnatePlan(s, h);
  const t = s.traits[h]!;
  const truthful = r() < t.honesty;
  // Supporters usually pretend to block (to keep the table blaming others).
  const showsBlock = p.accept ? !truthful : true;
  let speech = showsBlock ? pick(MAG_LINES_BLOCK, r) : pick(MAG_LINES_SUPPORT, r);
  if (p.veto && r() < 0.5) speech = pick(MAG_LINES_VETO, r);
  let peek: HouseId | undefined;
  if (h === 'czartoryski') {
    const others = activeHouses(s).filter((x) => x !== h);
    if (others.length) peek = pick(others, r);
  }
  return { kind: 'negotiation', speech, peek };
}

function muster(s: GameState, role: Role, r: () => number): Decision {
  const t = s.traits[role]!;
  if (role === 'king') {
    const reserve = 10;
    const spare = Math.max(0, s.king.ducats - reserve);
    const wantsWar = s.sejm >= 3 && t.boldness > 0.5;
    const budget = wantsWar ? s.king.ducats - 4 : s.era >= 2 ? spare * 0.5 : 0;
    return { kind: 'muster', buy: maxMuster(s, 'king', Math.max(0, Math.floor(budget))) };
  }
  const m = mag(s, role);
  // Arm when the king arms; otherwise save ducats for foundations.
  const kingArmy = s.king.banners;
  const myArmy = m.banners;
  const threatened = s.sejm >= 2 && kingArmy > myArmy * 2 + 4;
  const budget = threatened ? (m.ducats - 4) * (0.3 + t.boldness * 0.4) : t.boldness > 0.75 && r() < 0.3 ? 3 : 0;
  return { kind: 'muster', buy: maxMuster(s, role, Math.max(0, Math.floor(budget))) };
}

function fullCommit(s: GameState, role: Role, defending: boolean): Commitment {
  if (role === 'king') return { banners: s.king.banners, cardIds: [], ducats: s.king.ducats };
  const m = mag(s, role);
  return {
    banners: m.banners,
    cardIds: m.played.filter((p) => p.banners > 0 && (!p.defenseOnly || defending)).map((p) => p.id),
    ducats: m.ducats,
  };
}

/** Rough public estimate of a magnate's maximum defensive strength. */
function estMagnateStrength(s: GameState, h: HouseId, defending: boolean): number {
  const m = mag(s, h);
  return m.banners + m.played.length * 2.5 * (defending ? 1 : 0.8) + Math.floor(m.deputies / 5) + 2 +
    (m.grants.some((g) => g.strength) ? 2 : 0);
}

function declare(s: GameState, role: Role, r: () => number): Decision {
  const t = s.traits[role]!;
  const act = activeHouses(s);
  if (role === 'king') {
    const mine = strength(s, 'king', fullCommit(s, 'king', false)).total;
    // Magnates won't all commit everything — assume ~70%.
    const theirs = act.reduce((a, h) => a + estMagnateStrength(s, h, true), 0) * 0.7;
    const chance = attackChance(Math.round(mine - theirs));
    const best = Math.max(...act.map((h) => guessEsteem(mag(s, h))));
    const losing = s.sejm === 6 && s.king.track <= best;
    const need = losing ? 0.45 : 0.8 - t.boldness * 0.1;
    return { kind: 'declare', declare: chance >= need && r() < 0.85 };
  }
  const h = role as HouseId;
  const mine = strength(s, h, fullCommit(s, h, false), { rokoszanin: true }).total + 3;
  const king = strength(s, 'king', fullCommit(s, 'king', false)).total;
  const courtiers = act.filter((x) => x !== h && isCourtier(mag(s, x)));
  const defenders = king + courtiers.reduce((a, x) => a + estMagnateStrength(s, x, true), 0) * 0.3;
  const chance = attackChance(Math.round(mine - defenders));
  return { kind: 'declare', declare: chance >= 0.75 - t.boldness * 0.1 && r() < 0.7 };
}

function side(s: GameState, h: HouseId, r: () => number): Decision {
  const c = s.conflict!;
  const init = c.initiator as HouseId;
  const mine = strength(s, h, fullCommit(s, h, false), { rokoszanin: true }).total;
  const initStr = strength(s, init, fullCommit(s, init, false), { rokoszanin: true }).total + 3;
  const king = strength(s, 'king', fullCommit(s, 'king', false)).total;
  const chance = attackChance(Math.round(initStr + mine - king));
  if (mine > initStr && chance > 0.55) return { kind: 'side', side: 'join' };
  // A successful rokosz ends the game with the initiator winning: courtiers may defend.
  if (isCourtier(mag(s, h)) && attackChance(Math.round(initStr - king)) > 0.5 && r() < 0.6) {
    return { kind: 'side', side: 'defend' };
  }
  return { kind: 'side', side: 'neutral' };
}

function commit(s: GameState, role: Role, r: () => number): Decision {
  const c = s.conflict!;
  const defending = c.defenders.includes(role);
  const full = fullCommit(s, role, defending);
  if (role === 'king' || (c.type === 'rokosz' && c.attackers.includes(role))) {
    return { kind: 'commit', commit: full };
  }
  // Magnates defending: commit a share; prefer banners and negative-esteem cards, keep ducats.
  const m = mag(s, role as HouseId);
  const t = s.traits[role]!;
  const share = c.type === 'zamach' ? 0.55 + (1 - t.greed) * 0.4 + r() * 0.1 : 0.6;
  const cards = m.played
    .filter((p) => p.banners > 0)
    .sort((a, b) => a.esteem - b.esteem)
    .filter((p, i, arr) => p.esteem <= 0 || i < Math.ceil(arr.length * share));
  return {
    kind: 'commit',
    commit: {
      banners: m.banners,
      cardIds: cards.map((p) => p.id),
      ducats: Math.floor((m.ducats * share * 0.6) / 3) * 3,
    },
  };
}
