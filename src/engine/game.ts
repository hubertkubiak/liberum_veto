import { BENEFITS, COURT_THRESHOLDS, ENVOYS, ERA_NAMES, GRANTS, HOUSE_ORDER, HOUSES, LAWS, TRACK_MAX } from './data';
import { hashSeed, makeRand, mulberry32, shuffle } from './rng';
import {
  acceptsOffer,
  activeHouses,
  effectiveResistance,
  failedLawDeputies,
  grantsToDraw,
  isCourtier,
  kingUpkeepPer,
  mag,
  magnateScore,
  musterAllowed,
  musterCost,
  strength,
  tallyLaws,
  vetoBanned,
  vetoCost,
} from './rules';
import type {
  BenefitCard,
  Commitment,
  Decision,
  Era,
  GameOptions,
  GameResult,
  GameState,
  HouseId,
  LogEntry,
  MagnateState,
  Phase,
  Role,
  Standing,
  VoteDecision,
} from './types';

export function roleName(r: Role): string {
  return r === 'king' ? 'Król' : HOUSES[r].name;
}

function log(s: GameState, text: string, kind: LogEntry['kind'] = 'info', role?: Role) {
  s.log.push({ sejm: s.sejm, text, kind, role });
}

function rand(s: GameState): number {
  const [v, n] = mulberry32(s.rngState);
  s.rngState = n;
  return v;
}

function d6(s: GameState): number {
  return 1 + Math.floor(rand(s) * 6);
}

function clone(s: GameState): GameState {
  return structuredClone(s);
}

// ---------------------------------------------------------------- setup

export function createGame(opts: GameOptions): GameState {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const r = makeRand(seed);
  let houses = [...HOUSE_ORDER];
  if (opts.players === 4) {
    const candidates = houses.filter((h) => h !== opts.human);
    const out = candidates[Math.floor(r() * candidates.length)];
    houses = houses.filter((h) => h !== out);
  }
  const magDeputies = opts.players === 4 ? 20 : 15;
  const grantDeck = shuffle(GRANTS, r);
  const magnates: Partial<Record<HouseId, MagnateState>> = {};
  for (const h of houses) {
    magnates[h] = {
      id: h,
      deputies: magDeputies,
      ducats: HOUSES[h].ducats,
      banners: HOUSES[h].banners,
      esteemTokens: 0,
      hand: [],
      played: [],
      grants: [],
      eliminated: false,
    };
  }
  const traits: GameState['traits'] = {};
  for (const role of ['king', ...houses] as Role[]) {
    traits[role] = { greed: 0.3 + r() * 0.7, boldness: r(), honesty: 0.3 + r() * 0.6 };
  }
  const s: GameState = {
    seed,
    rngState: hashSeed(seed, 'game'),
    human: opts.human,
    houses,
    king: {
      deputies: 15,
      ducats: 15,
      banners: 6,
      track: 0,
      grantHand: grantDeck.splice(0, 4),
      thresholdsReached: [],
    },
    magnates,
    pool: 100 - 15 - magDeputies * houses.length,
    sejm: 1,
    era: 1,
    phase: 'income',
    waitingFor: [],
    pending: {},
    lawDecks: {
      1: shuffle(LAWS.filter((l) => l.era === 1), r),
      2: shuffle(LAWS.filter((l) => l.era === 2), r),
      3: shuffle(LAWS.filter((l) => l.era === 3), r),
    },
    grantDeck,
    benefitDeck: [],
    envoyDeck: shuffle(ENVOYS, r),
    envoy: null,
    agendaOptions: [],
    agenda: [],
    directives: [],
    draftDraw: {},
    draftReceived: {},
    offers: {},
    peeks: {},
    speeches: [],
    reveal: null,
    vetoesThisEra: 0,
    trackAtSejmStart: 0,
    rokoszUsed: false,
    conflict: null,
    traits,
    log: [],
    result: null,
  };
  log(s, `Zasiadają: Król, ${houses.map((h) => HOUSES[h].name).join(', ')}.`, 'info');
  enter(s, 'income');
  return s;
}

// ---------------------------------------------------------------- public API

export function canAdvance(s: GameState): boolean {
  return s.phase !== 'gameOver' && s.waitingFor.every((r) => s.pending[r] !== undefined);
}

export function submit(state: GameState, role: Role, d: Decision): GameState {
  if (!state.waitingFor.includes(role)) return state;
  const s = clone(state);
  s.pending[role] = d;
  return s;
}

export function advance(state: GameState): GameState {
  if (!canAdvance(state)) return state;
  const s = clone(state);
  switch (s.phase) {
    case 'income':
      enter(s, 'agenda');
      break;
    case 'agenda':
      resolveAgenda(s);
      enter(s, s.sejm % 2 === 1 ? 'draft1' : 'offers');
      break;
    case 'draft1':
      resolveDraft1(s);
      enter(s, 'draft2');
      break;
    case 'draft2':
      resolveDraft2(s);
      enter(s, 'offers');
      break;
    case 'offers':
      resolveOffers(s);
      enter(s, 'negotiation');
      break;
    case 'negotiation':
      resolveNegotiation(s);
      enter(s, 'voting');
      break;
    case 'voting':
      enter(s, 'reveal');
      break;
    case 'reveal':
      enter(s, 'settlement');
      break;
    case 'settlement':
      if (musterAllowed(s)) enter(s, 'muster');
      else {
        log(s, 'Traktat pokojowy: w tym sejmie nikt się nie zbroi.');
        afterMuster(s);
      }
      break;
    case 'muster':
      resolveMuster(s);
      afterMuster(s);
      break;
    case 'conflictDeclare':
      resolveDeclare(s);
      break;
    case 'rokoszSides':
      resolveSides(s);
      enter(s, 'conflictCommit');
      break;
    case 'conflictCommit':
      enter(s, 'conflictResult');
      break;
    case 'conflictResult':
      if (s.result) enter(s, 'gameOver');
      else afterSejm(s);
      break;
    case 'eraEnd':
      nextSejm(s);
      break;
  }
  return s;
}

// ---------------------------------------------------------------- phase entry

function enter(s: GameState, phase: Phase) {
  s.phase = phase;
  // Decisions of the previous phase are still needed by phases that resolve on entry.
  const prevPending = s.pending;
  s.pending = {};
  s.waitingFor = [];
  const act = activeHouses(s);
  switch (phase) {
    case 'income': {
      s.trackAtSejmStart = s.king.track;
      s.agenda = [];
      s.offers = {};
      s.peeks = {};
      s.speeches = [];
      s.reveal = null;
      s.conflict = null;
      log(s, `Sejm ${s.sejm} · Epoka ${roman(s.era)}: ${ERA_NAMES[s.era]}`, 'phase');
      if (s.envoyDeck.length === 0) s.envoyDeck = shuffle(ENVOYS, () => rand(s));
      s.envoy = s.envoyDeck.shift()!;
      const inc = s.envoy.noKingIncome ? 0 : 4 + s.directives.reduce((a, l) => a + (l.directive.kingIncome ?? 0), 0);
      s.king.ducats += inc;
      log(s, `Król pobiera ${inc} dukatów dochodu.`, 'info', 'king');
      log(s, `Przybywa: ${s.envoy.name} — ${s.envoy.text}.`, 'drama');
      if (s.envoy.magnatesDucats) for (const h of act) mag(s, h).ducats += s.envoy.magnatesDucats;
      if (s.envoy.everyoneBanner) {
        s.king.banners += s.envoy.everyoneBanner;
        for (const h of act) mag(s, h).banners += s.envoy.everyoneBanner;
      }
      break;
    }
    case 'agenda': {
      const deck = s.lawDecks[s.era];
      s.agendaOptions = deck.splice(0, Math.min(3, deck.length));
      s.waitingFor = ['king'];
      break;
    }
    case 'draft1': {
      const inUse = new Set(act.flatMap((h) => mag(s, h).played.map((c) => c.id)));
      s.benefitDeck = shuffle(
        BENEFITS.filter((b) => !inUse.has(b.id)),
        () => rand(s),
      );
      s.draftDraw = {};
      s.draftReceived = {};
      for (const h of act) s.draftDraw[h] = s.benefitDeck.splice(0, 3);
      s.waitingFor = [...act];
      log(s, 'Początek epoki: magnaci w tajemnicy wybierają karty korzyści.');
      break;
    }
    case 'draft2':
      s.waitingFor = [...act];
      break;
    case 'offers': {
      const n = grantsToDraw(s);
      for (let i = 0; i < n; i++) drawGrant(s);
      log(s, `Król dobiera ${n} nadania i przygotowuje zakryte oferty.`, 'info', 'king');
      s.waitingFor = ['king'];
      break;
    }
    case 'negotiation':
      s.waitingFor = ['king', ...act];
      break;
    case 'voting':
      s.waitingFor = [...act];
      break;
    case 'reveal':
      s.pending = prevPending;
      computeReveal(s);
      s.pending = {};
      break;
    case 'settlement':
      settle(s);
      break;
    case 'muster':
      s.waitingFor = ['king', ...act];
      break;
    case 'conflictDeclare': {
      s.waitingFor = ['king'];
      if (!s.rokoszUsed && s.sejm <= 5) s.waitingFor.push(...act);
      break;
    }
    case 'rokoszSides':
      s.waitingFor = act.filter((h) => h !== s.conflict!.initiator);
      break;
    case 'conflictCommit':
      s.waitingFor = [...s.conflict!.attackers, ...s.conflict!.defenders];
      break;
    case 'conflictResult':
      s.pending = prevPending;
      resolveConflict(s);
      s.pending = {};
      break;
    case 'eraEnd':
      endEra(s);
      break;
    case 'gameOver':
      break;
  }
}

function roman(e: number) {
  return ['', 'I', 'II', 'III'][e];
}

function drawGrant(s: GameState) {
  if (s.grantDeck.length === 0) {
    const used = new Set([
      ...s.king.grantHand.map((g) => g.id),
      ...s.houses.flatMap((h) => mag(s, h).grants.map((g) => g.id)),
    ]);
    s.grantDeck = shuffle(
      GRANTS.filter((g) => !used.has(g.id)),
      () => rand(s),
    );
  }
  const g = s.grantDeck.shift();
  if (g) s.king.grantHand.push(g);
}

// ---------------------------------------------------------------- resolvers

function decision<K extends Decision['kind']>(s: GameState, r: Role, kind: K) {
  const d = s.pending[r];
  return d && d.kind === kind ? (d as Extract<Decision, { kind: K }>) : undefined;
}

function resolveAgenda(s: GameState) {
  const d = decision(s, 'king', 'agenda');
  const opts = s.agendaOptions;
  let keep = d?.keep ?? [0, 1];
  if (opts.length <= 2) keep = [0, 1];
  const [a, b] = keep;
  s.agenda = [opts[a], opts[b]].filter(Boolean);
  const rejected = opts.filter((_, i) => i !== a && i !== b);
  s.lawDecks[s.era].push(...rejected);
  for (const r of rejected) log(s, `Król odkłada pod stos: ${r.code} ${r.name}.`, 'info', 'king');
  log(s, `Na obradach: ${s.agenda.map((l) => `${l.code} ${l.name} (opór ${effectiveResistance(s, l)}, tor +${l.track})`).join(' oraz ')}.`, 'info', 'king');
}

function leftNeighbor(s: GameState, h: HouseId): HouseId {
  const act = activeHouses(s);
  return act[(act.indexOf(h) + 1) % act.length];
}

function resolveDraft1(s: GameState) {
  for (const h of activeHouses(s)) {
    const draw = s.draftDraw[h]!;
    const keepId = decision(s, h, 'draft')?.keepId ?? draw[0].id;
    const kept = draw.find((c) => c.id === keepId) ?? draw[0];
    mag(s, h).hand = [kept];
    s.draftReceived[leftNeighbor(s, h)] = draw.filter((c) => c.id !== kept.id);
  }
}

function resolveDraft2(s: GameState) {
  for (const h of activeHouses(s)) {
    const got = s.draftReceived[h] ?? [];
    if (!got.length) continue;
    const keepId = decision(s, h, 'draft')?.keepId ?? got[0].id;
    const kept = got.find((c) => c.id === keepId) ?? got[0];
    mag(s, h).hand.push(kept);
  }
  log(s, 'Każdy magnat ma w ręce 2 karty korzyści na tę epokę.');
}

function resolveOffers(s: GameState) {
  const d = decision(s, 'king', 'offers');
  const usedChecks = new Set<number>();
  for (const h of activeHouses(s)) {
    const o = d?.offers[h];
    let check = o?.check ?? 0;
    if (usedChecks.has(check) || check < 0 || check > 10) {
      check = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((c) => !usedChecks.has(c))!;
    }
    usedChecks.add(check);
    let grant = null;
    if (o?.grantId) {
      const idx = s.king.grantHand.findIndex((g) => g.id === o.grantId);
      if (idx >= 0) grant = s.king.grantHand.splice(idx, 1)[0];
    }
    s.offers[h] = { grant, check };
  }
  log(s, 'Przed każdym magnatem leży zakryty stosik: nadanie albo „brak nadania” i czek.', 'info', 'king');
}

function resolveNegotiation(s: GameState) {
  const order: Role[] = ['king', ...activeHouses(s)];
  for (const r of order) {
    const d = decision(s, r, 'negotiation');
    if (d?.speech) {
      s.speeches.push({ role: r, text: d.speech });
      log(s, `„${d.speech}”`, 'speech', r);
    }
    if (r === 'czartoryski' && d?.peek && d.peek !== 'czartoryski' && s.offers[d.peek]) {
      s.peeks.czartoryski = d.peek;
      log(s, `Czartoryscy zaglądają dyskretnie do oferty dla: ${HOUSES[d.peek].name}.`, 'info', 'czartoryski');
    }
  }
}

function computeReveal(s: GameState) {
  const votes: Partial<Record<HouseId, VoteDecision>> = {};
  for (const h of activeHouses(s)) {
    votes[h] = decision(s, h, 'vote')?.vote ?? { votes: [false, false], veto: false, cardId: null };
  }
  const tallies = tallyLaws(s, votes);
  const vetoers: HouseId[] = [];
  if (!vetoBanned(s)) {
    let earlier = s.vetoesThisEra;
    for (const h of activeHouses(s)) {
      if (!votes[h]!.veto) continue;
      if (mag(s, h).ducats >= vetoCost(s, h, earlier)) {
        vetoers.push(h);
        earlier++;
      } else log(s, `${HOUSES[h].name} chcą zerwać sejm, ale brak im dukatów — weto nieważne.`, 'info', h);
    }
  }
  const broken = vetoers.length > 0;
  const accepted = broken ? [] : activeHouses(s).filter((h) => acceptsOffer(votes[h]!));
  s.reveal = { tallies, votes, vetoers, broken, accepted };
  for (const [i, t] of tallies.entries()) {
    const l = s.agenda[i];
    log(
      s,
      `${l.code} ${l.name}: ZA ${t.za} · PRZECIW ${t.przeciw} + opór ${t.resistance} → ${broken ? 'sejm zerwany' : t.passed ? 'PRZECHODZI' : 'upada'}.`,
      broken ? 'info' : 'drama',
    );
  }
  if (broken) log(s, `Nie pozwalam! ${vetoers.map((h) => HOUSES[h].name).join(', ')} zrywają sejm liberum veto.`, 'drama');
}

function takeFromPool(s: GameState, n: number): number {
  const t = Math.min(n, s.pool);
  s.pool -= t;
  return t;
}

function benefitValue(c: BenefitCard) {
  return c.esteem * 1.5 + c.banners * 0.3 + c.reserve * 0.25;
}

function settle(s: GameState) {
  const rv = s.reveal!;
  const act = activeHouses(s);
  let trackGained = 0;
  const moveTrack = (n: number) => {
    const before = s.king.track;
    s.king.track = Math.max(0, Math.min(TRACK_MAX, s.king.track + n));
    trackGained += s.king.track - before;
  };

  if (rv.broken) {
    let earlier = s.vetoesThisEra;
    for (const h of rv.vetoers) {
      const m = mag(s, h);
      const cost = vetoCost(s, h, earlier);
      m.ducats -= cost;
      const back = Math.min(3, m.deputies);
      m.deputies -= back;
      s.pool += back;
      earlier++;
      const bonus = s.agenda.some((l) => l.resistance >= 12);
      if (bonus) m.esteemTokens += 1;
      log(s, `${m && HOUSES[h].name} płacą ${cost} d za weto i oddają ${back} posłów do puli${bonus ? ', zyskują +1 Estymy' : ''}.`, 'info', h);
    }
    s.vetoesThisEra = earlier;
    const took = takeFromPool(s, s.agenda.length);
    s.king.deputies += took;
    log(s, `Król bierze z puli ${took} posłów za zerwane ustawy. Brak pola za niezerwany sejm.`, 'info', 'king');
    for (const h of act) {
      const o = s.offers[h];
      if (o?.grant) s.king.grantHand.push(o.grant);
      playCard(s, h, null);
    }
    log(s, 'Oferty wracają do króla; każdy magnat zagrywa kartę korzyści.');
  } else {
    // 1. passed laws
    s.agenda.forEach((law, i) => {
      if (!rv.tallies[i].passed) return;
      const im = law.immediate;
      if (im.kingBanners) s.king.banners += im.kingBanners;
      if (im.kingDucats) s.king.ducats += im.kingDucats;
      if (im.kingDeputies) s.king.deputies += takeFromPool(s, im.kingDeputies);
      if (im.kingDrawGrants) for (let k = 0; k < im.kingDrawGrants; k++) drawGrant(s);
      for (const h of act) {
        const m = mag(s, h);
        if (im.magnatesPayBank) m.ducats -= Math.min(m.ducats, im.magnatesPayBank);
        if (im.magnatesPayKing) {
          const p = Math.min(m.ducats, im.magnatesPayKing);
          m.ducats -= p;
          s.king.ducats += p;
        }
      }
      s.directives.push(law);
      moveTrack(law.track);
      log(s, `${law.code} ${law.name} przyjęta: król +${law.track} na torze. ${law.immediateText !== '—' ? law.immediateText + '.' : ''}`, 'drama', 'king');
    });
    // 2. failed laws
    const failed = rv.tallies.filter((t) => !t.passed).length;
    if (failed) {
      const took = takeFromPool(s, failed * failedLawDeputies(s));
      s.king.deputies += took;
      log(s, `Upadłe ustawy zniechęcają drobną szlachtę: król bierze ${took} posłów z puli.`, 'info', 'king');
    }
    // 3. blockade bonus
    for (const h of act) {
      const v = rv.votes[h]!;
      const blocked = s.agenda.some((_, i) => !v.votes[i] && !rv.tallies[i].passed);
      if (blocked) {
        const m = mag(s, h);
        m.esteemTokens += 1;
        if (m.deputies > 0) {
          m.deputies -= 1;
          s.king.deputies += 1;
        }
        log(s, `${HOUSES[h].name}: premia za blokadę +1 Estymy, 1 poseł przechodzi do króla.`, 'info', h);
      }
    }
    // 4. offers
    let badCheck = false;
    for (const h of act) {
      const o = s.offers[h]!;
      const m = mag(s, h);
      if (rv.accepted.includes(h)) {
        if (o.grant) {
          m.grants.push(o.grant);
          m.deputies += takeFromPool(s, o.grant.deputies);
          m.banners += o.grant.banners;
          m.ducats += o.grant.ducats;
        }
        let paid = o.check;
        if (s.king.ducats < o.check) {
          paid = s.king.ducats;
          const missing = o.check - paid;
          m.esteemTokens += Math.ceil(missing / 4);
          badCheck = true;
          log(s, `Czek bez pokrycia! Król oddaje cały skarb, ${HOUSES[h].name} dostają ${Math.ceil(missing / 4)} Estymy.`, 'drama', 'king');
        }
        s.king.ducats -= paid;
        m.ducats += paid;
        log(s, `${HOUSES[h].name} przyjmują ofertę: ${o.grant ? o.grant.name : 'brak nadania'} i czek na ${o.check} d.`, 'drama', h);
        discardCard(s, h, rv.votes[h]!.cardId);
      } else {
        if (o.grant) s.king.grantHand.push(o.grant);
        playCard(s, h, rv.votes[h]!.cardId);
      }
    }
    // 5. sejm not broken
    moveTrack(1);
    log(s, 'Sejm nie został zerwany: król +1 na torze.', 'info', 'king');
    if (badCheck) {
      const lose = trackGained + 3;
      s.king.track = Math.max(0, s.king.track - lose);
      log(s, `Kara za czek bez pokrycia: król traci ${lose} pól toru.`, 'drama', 'king');
    }
  }
  // 6. court party thresholds
  for (const t of COURT_THRESHOLDS) {
    if (s.king.deputies >= t && !s.king.thresholdsReached.includes(t)) {
      s.king.thresholdsReached.push(t);
      s.king.banners += 3;
      log(s, `Stronnictwo dworskie rośnie (${t} posłów): król bierze 3 chorągwie.`, 'info', 'king');
    }
  }
}

function playCard(s: GameState, h: HouseId, cardId: string | null) {
  const m = mag(s, h);
  if (!m.hand.length) return;
  let idx = m.hand.findIndex((c) => c.id === cardId);
  if (idx < 0) {
    idx = m.hand.reduce((best, c, i) => (benefitValue(c) > benefitValue(m.hand[best]) ? i : best), 0);
  }
  m.played.push(m.hand.splice(idx, 1)[0]);
}

function discardCard(s: GameState, h: HouseId, cardId: string | null) {
  const m = mag(s, h);
  if (!m.hand.length) return;
  let idx = m.hand.findIndex((c) => c.id === cardId);
  if (idx < 0) {
    idx = m.hand.reduce((worst, c, i) => (benefitValue(c) < benefitValue(m.hand[worst]) ? i : worst), 0);
  }
  m.hand.splice(idx, 1);
}

function resolveMuster(s: GameState) {
  for (const r of s.waitingFor) {
    const buy = Math.max(0, Math.floor(decision(s, r, 'muster')?.buy ?? 0));
    if (!buy) continue;
    const cost = musterCost(s, r, buy);
    if (r === 'king') {
      if (cost > s.king.ducats) continue;
      s.king.ducats -= cost;
      s.king.banners += buy;
    } else {
      const m = mag(s, r);
      if (cost > m.ducats) continue;
      m.ducats -= cost;
      m.banners += buy;
    }
    log(s, `${roleName(r)} zaciągają ${buy} chorągwi za ${cost} d.`, 'info', r);
  }
}

function afterMuster(s: GameState) {
  if (s.sejm >= 3) enter(s, 'conflictDeclare');
  else afterSejm(s);
}

function resolveDeclare(s: GameState) {
  const act = activeHouses(s);
  const rebels = act.filter((h) => decision(s, h, 'declare')?.declare);
  if (rebels.length) {
    const initiator = rebels[Math.floor(rand(s) * rebels.length)];
    s.rokoszUsed = true;
    s.conflict = { type: 'rokosz', initiator, sides: {}, attackers: [initiator], defenders: ['king'], commits: {} };
    log(s, `ROKOSZ! ${HOUSES[initiator].name} podnoszą bunt przeciw królowi.`, 'drama', initiator);
    enter(s, 'rokoszSides');
    return;
  }
  if (decision(s, 'king', 'declare')?.declare) {
    s.conflict = { type: 'zamach', initiator: 'king', sides: {}, attackers: ['king'], defenders: [...act], commits: {} };
    log(s, 'ZAMACH STANU! Król sięga po absolutum dominium. Wszyscy magnaci stają do obrony.', 'drama', 'king');
    enter(s, 'conflictCommit');
    return;
  }
  afterSejm(s);
}

function resolveSides(s: GameState) {
  const c = s.conflict!;
  for (const h of s.waitingFor as HouseId[]) {
    let side = decision(s, h, 'side')?.side ?? 'neutral';
    if (side === 'defend' && !isCourtier(mag(s, h))) side = 'neutral';
    c.sides[h] = side;
    if (side === 'join') c.attackers.push(h);
    if (side === 'defend') c.defenders.push(h);
    const label = side === 'join' ? 'przyłączają się do rokoszu' : side === 'defend' ? 'bronią króla' : 'zachowują neutralność';
    log(s, `${HOUSES[h].name} ${label}.`, 'info', h);
  }
}

function clampCommit(s: GameState, r: Role, c: Commitment | undefined): Commitment {
  if (!c) return { banners: 0, cardIds: [], ducats: 0 };
  if (r === 'king') {
    return {
      banners: Math.max(0, Math.min(c.banners, s.king.banners)),
      cardIds: [],
      ducats: Math.max(0, Math.min(c.ducats, s.king.ducats)),
    };
  }
  const m = mag(s, r);
  return {
    banners: Math.max(0, Math.min(c.banners, m.banners)),
    cardIds: c.cardIds.filter((id) => m.played.some((p) => p.id === id)),
    ducats: Math.max(0, Math.min(c.ducats, m.ducats)),
  };
}

function resolveConflict(s: GameState) {
  const c = s.conflict!;
  const strengths: Partial<Record<Role, number>> = {};
  let attack = 0;
  let defense = 0;
  for (const r of [...c.attackers, ...c.defenders]) {
    const cm = clampCommit(s, r, decision(s, r, 'commit')?.commit);
    c.commits[r] = cm;
    const isAttacker = c.attackers.includes(r);
    const st = strength(s, r, cm, {
      rokoszanin: c.type === 'rokosz' && isAttacker,
      defending: !isAttacker,
    }).total;
    const bonus = c.type === 'rokosz' && r === c.initiator ? 3 : 0;
    strengths[r] = st + bonus;
    if (isAttacker) attack += st + bonus;
    else defense += st;
  }
  c.strengths = strengths;
  c.attackPower = attack;
  c.defensePower = defense;
  c.diceAttack = d6(s);
  c.diceDefense = d6(s);
  c.attackerWon = attack - defense + c.diceAttack - c.diceDefense > 0;
  log(
    s,
    `Starcie: atak ${attack} + k6(${c.diceAttack}) wobec obrony ${defense} + k6(${c.diceDefense}) → ${c.attackerWon ? 'zwycięża atakujący' : 'obrona się utrzymuje'}.`,
    'drama',
  );

  // losses
  for (const r of [...c.attackers, ...c.defenders]) {
    const cm = c.commits[r]!;
    if (r === 'king') {
      s.king.banners -= Math.ceil(cm.banners / 2);
      s.king.ducats -= cm.ducats;
    } else {
      const m = mag(s, r);
      m.banners -= Math.ceil(cm.banners / 2);
      m.ducats -= cm.ducats;
      m.played = m.played.filter((p) => !cm.cardIds.includes(p.id));
      if (c.type === 'rokosz' && c.defenders.includes(r)) m.esteemTokens -= 1;
    }
  }

  if (c.type === 'zamach') {
    if (c.attackerWon) {
      log(s, 'Absolutum dominium! Król łamie opór magnatów i wygrywa grę.', 'drama', 'king');
      finish(s, 'zamachWon', 'king', { kingLast: false });
    } else {
      log(s, 'Zamach upadł. Złota wolność ocalona — król kończy na ostatnim miejscu.', 'drama', 'king');
      finish(s, 'zamachLost', null, { kingLast: true });
    }
    return;
  }
  // rokosz
  if (c.attackerWon) {
    const winner = (c.attackers as HouseId[]).reduce((best, h) =>
      (strengths[h] ?? 0) > (strengths[best] ?? 0) ? h : best,
    c.initiator as HouseId);
    log(s, `Rokosz zwycięski! Król obalony. Wygrywają ${HOUSES[winner].name}.`, 'drama', winner);
    finish(s, 'rokoszWon', winner, { kingLast: true });
  } else {
    for (const h of c.attackers as HouseId[]) {
      const m = mag(s, h);
      s.pool += m.deputies;
      m.deputies = 0;
      m.banners = 0;
      m.ducats = 0;
      m.hand = [];
      m.played = [];
      m.eliminated = true;
      log(s, `${HOUSES[h].name} przegrywają rokosz i odpadają z gry.`, 'drama', h);
    }
    if (activeHouses(s).length === 0) finish(s, 'freedom', 'king', { kingLast: false });
  }
}

function afterSejm(s: GameState) {
  if (s.sejm >= 6) {
    finish(s, 'freedom', null, { kingLast: false });
    enter(s, 'gameOver');
  } else if (s.sejm % 2 === 0) enter(s, 'eraEnd');
  else nextSejm(s);
}

function endEra(s: GameState) {
  log(s, `Koniec epoki ${roman(s.era)}: żołd dla wojska, przepadają karty z ręki.`, 'phase');
  const kUp = Math.ceil(s.king.banners / kingUpkeepPer(s));
  if (s.king.ducats >= kUp) s.king.ducats -= kUp;
  else {
    const keep = s.king.ducats * kingUpkeepPer(s);
    log(s, `Król nie ma na żołd: rozpuszcza ${s.king.banners - keep} chorągwi.`, 'info', 'king');
    s.king.banners = keep;
    s.king.ducats = 0;
  }
  for (const h of activeHouses(s)) {
    const m = mag(s, h);
    const up = Math.ceil(m.banners / 2);
    if (m.ducats >= up) m.ducats -= up;
    else {
      const keep = m.ducats * 2;
      log(s, `${HOUSES[h].name} nie mają na żołd: rozpuszczają ${m.banners - keep} chorągwi.`, 'info', h);
      m.banners = keep;
      m.ducats = 0;
    }
    m.hand = [];
  }
}

function nextSejm(s: GameState) {
  const prevEra = s.era;
  s.sejm += 1;
  s.era = Math.ceil(s.sejm / 2) as Era;
  if (s.era !== prevEra) s.vetoesThisEra = 0;
  enter(s, 'income');
}

// ---------------------------------------------------------------- scoring

export function roleScore(s: GameState, r: Role): number {
  return r === 'king' ? s.king.track : magnateScore(mag(s, r)).total;
}

export function standings(s: GameState, kingLast: boolean, forcedWinner: Role | null): Standing[] {
  const act = activeHouses(s);
  const elim = s.houses.filter((h) => mag(s, h).eliminated);
  const cmp = (a: Role, b: Role) => {
    const d = roleScore(s, b) - roleScore(s, a);
    if (d) return d;
    if (a === 'king') return 1;
    if (b === 'king') return -1;
    return mag(s, a).grants.length - mag(s, b).grants.length;
  };
  let order: Role[] = kingLast ? [...[...act].sort(cmp), 'king'] : ([...act, 'king'] as Role[]).sort(cmp);
  if (forcedWinner) order = [forcedWinner, ...order.filter((r) => r !== forcedWinner)];
  order.push(...elim.sort(cmp));
  return order.map((role, i) => ({
    role,
    score: roleScore(s, role),
    eliminated: role !== 'king' && mag(s, role).eliminated,
    place: i + 1,
  }));
}

function finish(s: GameState, reason: GameResult['reason'], winner: Role | null, o: { kingLast: boolean }) {
  const st = standings(s, o.kingLast, winner);
  s.result = { winner: st[0].role, reason, standings: st };
  if (reason === 'freedom') {
    const w = st[0].role;
    log(
      s,
      w === 'king'
        ? `Koniec gry. Tor absolutyzmu (${s.king.track}) przewyższa Estymę magnatów — wygrywa król!`
        : `Koniec gry. Złota wolność! ${HOUSES[w as HouseId].name} z Estymą ${roleScore(s, w)} wygrywają (król: ${s.king.track}).`,
      'drama',
      w,
    );
  }
}

export { HOUSES };
