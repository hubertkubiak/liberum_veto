import { useMemo, useState } from 'react';
import { Coat } from '../art/heraldry';
import { BannerIcon, DucatIcon, VetoIcon } from '../art/icons';
import { CHECK_VALUES, HOUSES } from '../engine/data';
import { roleName } from '../engine/game';
import {
  activeHouses,
  attackChance,
  effectiveResistance,
  isCourtier,
  mag,
  maxMuster,
  musterCost,
  strength,
  vetoBanned,
  vetoCost,
} from '../engine/rules';
import type { Decision, GameState, HouseId, Role } from '../engine/types';
import { BenefitCardView, CheckView, GrantCardView, LawCardView } from './Cards';
import { PHASE_HELP, PHASE_TITLE, SPEECHES } from './text';

interface Props {
  s: GameState;
  humanTurn: boolean;
  act: (d: Decision) => void;
  next: () => void;
  canNext: boolean;
  auto: boolean;
}

export function ActionPanel(p: Props) {
  const { s, humanTurn } = p;
  const body = humanTurn ? <Decide s={s} act={p.act} /> : <Status {...p} />;
  return (
    <div className={`action ${humanTurn ? 'is-turn' : ''}`}>
      <div className="action-head">
        <span className="action-title">{PHASE_TITLE[s.phase]}</span>
        {humanTurn && <span className="your-turn">Twoja decyzja</span>}
      </div>
      {body}
    </div>
  );
}

function Status({ s, next, canNext, auto }: Props) {
  const waiting = s.waitingFor.filter((r) => !s.pending[r]);
  return (
    <div className="status">
      <p className="help">{PHASE_HELP[s.phase]}</p>
      <div className="status-foot">
        {waiting.length > 0 && <span className="waiting">Czekamy na: {waiting.map(roleName).join(', ')}</span>}
        {s.phase !== 'gameOver' && (
          <button className="btn btn-primary" onClick={next} disabled={!canNext}>
            {auto ? 'Dalej (auto)' : 'Dalej ▸'}
          </button>
        )}
      </div>
    </div>
  );
}

function Decide({ s, act }: { s: GameState; act: (d: Decision) => void }) {
  const h = s.human!;
  switch (s.phase) {
    case 'agenda':
      return <AgendaDecision s={s} act={act} />;
    case 'draft1':
    case 'draft2':
      return <DraftDecision s={s} h={h as HouseId} act={act} />;
    case 'offers':
      return <OffersDecision s={s} act={act} />;
    case 'negotiation':
      return <NegotiationDecision s={s} h={h} act={act} />;
    case 'voting':
      return <VoteDecisionView s={s} h={h as HouseId} act={act} />;
    case 'muster':
      return <MusterDecision s={s} h={h} act={act} />;
    case 'conflictDeclare':
      return <DeclareDecision s={s} h={h} act={act} />;
    case 'rokoszSides':
      return <SideDecision s={s} h={h as HouseId} act={act} />;
    case 'conflictCommit':
      return <CommitDecision s={s} h={h} act={act} />;
    default:
      return null;
  }
}

function AgendaDecision({ s, act }: { s: GameState; act: (d: Decision) => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const toggle = (i: number) => setSel((x) => (x.includes(i) ? x.filter((y) => y !== i) : x.length < 2 ? [...x, i] : [x[1], i]));
  const need = Math.min(2, s.agendaOptions.length);
  return (
    <div className="decide">
      <p className="help">Wybierz 2 ustawy na obrady. Trzecia trafi pod spód stosu. Opór uwzględnia poselstwo i dyrektywy.</p>
      <div className="choice-cards">
        {s.agendaOptions.map((l, i) => (
          <LawCardView key={l.id} law={l} size="md" resistance={effectiveResistance(s, l)} selected={sel.includes(i)} onClick={() => toggle(i)} />
        ))}
      </div>
      <button className="btn btn-primary" disabled={sel.length !== need} onClick={() => act({ kind: 'agenda', keep: [sel[0] ?? 0, sel[1] ?? 1].sort() as [number, number] })}>
        Wyłóż na obrady
      </button>
    </div>
  );
}

function DraftDecision({ s, h, act }: { s: GameState; h: HouseId; act: (d: Decision) => void }) {
  const cards = s.phase === 'draft1' ? s.draftDraw[h]! : s.draftReceived[h]!;
  const [sel, setSel] = useState<string | null>(null);
  const first = s.phase === 'draft1';
  return (
    <div className="decide">
      <p className="help">
        {first
          ? 'Dobrałeś 3 karty korzyści. Zatrzymaj 1 — pozostałe 2 trafią zakryte do sąsiada z lewej.'
          : 'Sąsiad podał Ci 2 karty. Zatrzymaj 1, drugą odrzucasz.'}
        {s.phase === 'draft2' && mag(s, h).hand.length > 0 && ` Masz już: ${mag(s, h).hand.map((c) => c.name).join(', ')}.`}
      </p>
      <div className="choice-cards">
        {cards.map((c) => (
          <BenefitCardView key={c.id} card={c} size="md" selected={sel === c.id} onClick={() => setSel(c.id)} />
        ))}
      </div>
      <button className="btn btn-primary" disabled={!sel} onClick={() => sel && act({ kind: 'draft', keepId: sel })}>
        {first ? 'Zatrzymaj i podaj dalej' : 'Zatrzymaj'}
      </button>
    </div>
  );
}

function OffersDecision({ s, act }: { s: GameState; act: (d: Decision) => void }) {
  const act_ = activeHouses(s);
  const [offers, setOffers] = useState<Record<string, { grantId: string | null; check: number | null }>>(() =>
    Object.fromEntries(act_.map((h) => [h, { grantId: null, check: null }])),
  );
  const usedGrants = new Set(Object.values(offers).map((o) => o.grantId).filter(Boolean));
  const usedChecks = new Set(Object.values(offers).map((o) => o.check).filter((c) => c !== null));
  const total = Object.values(offers).reduce((a, o) => a + (o.check ?? 0), 0);
  const ready = Object.values(offers).every((o) => o.check !== null);
  const set = (h: string, patch: Partial<{ grantId: string | null; check: number | null }>) =>
    setOffers((x) => ({ ...x, [h]: { ...x[h], ...patch } }));

  return (
    <div className="decide">
      <p className="help">
        Przed każdym magnatem połóż nadanie (albo „brak nadania”) i czek — każda wartość czeku tylko raz. Czek wypłaca się tylko, jeśli
        magnat ani razu nie zagłosuje przeciw. Skarb: <b>{s.king.ducats} d</b>
        {total > s.king.ducats && <span className="warn"> · Uwaga: czeki ({total} d) przekraczają skarb — grozi czek bez pokrycia!</span>}
      </p>
      <div className="offer-rows">
        {act_.map((h) => (
          <div key={h} className="offer-row" style={{ ['--house' as string]: HOUSES[h].color }}>
            <div className="offer-who">
              <Coat role={h} size={34} />
              <div>
                <b>{HOUSES[h].name}</b>
                <div className="small">
                  {mag(s, h).deputies} posłów{h === 'potocki' ? ' (+3 przy ⚔)' : ''}
                </div>
              </div>
            </div>
            <div className="offer-grants">
              <GrantCardView grant={null} size="sm" selected={offers[h].grantId === null} onClick={() => set(h, { grantId: null })} />
              {s.king.grantHand.map((g) => (
                <GrantCardView
                  key={g.id}
                  grant={g}
                  size="sm"
                  selected={offers[h].grantId === g.id}
                  dim={usedGrants.has(g.id) && offers[h].grantId !== g.id}
                  onClick={usedGrants.has(g.id) && offers[h].grantId !== g.id ? undefined : () => set(h, { grantId: g.id })}
                />
              ))}
            </div>
            <div className="offer-checks">
              {CHECK_VALUES.map((v) => {
                const taken = usedChecks.has(v) && offers[h].check !== v;
                return (
                  <button
                    key={v}
                    className={`check-btn ${offers[h].check === v ? 'is-on' : ''}`}
                    disabled={taken}
                    onClick={() => set(h, { check: v })}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary"
        disabled={!ready}
        onClick={() =>
          act({
            kind: 'offers',
            offers: Object.fromEntries(Object.entries(offers).map(([h, o]) => [h, { grantId: o.grantId, check: o.check ?? 0 }])),
          })
        }
      >
        Połóż zakryte oferty
      </button>
    </div>
  );
}

function NegotiationDecision({ s, h, act }: { s: GameState; h: Role; act: (d: Decision) => void }) {
  const others = activeHouses(s).filter((x) => x !== h);
  const [peek, setPeek] = useState<HouseId | undefined>(others[0]);
  const lines = SPEECHES[h === 'king' ? 'king' : 'magnate'];
  return (
    <div className="decide">
      <p className="help">
        Powiedz coś na głos przy całym stole — obietnice nie wiążą, można blefować. Wypowiedzi innych graczy widać w ich panelach.
      </p>
      {h !== 'king' && s.offers[h as HouseId] && (
        <div className="own-offer">
          <span>Twoja zakryta oferta:</span>
          <GrantCardView grant={s.offers[h as HouseId]!.grant} size="sm" />
          <CheckView value={s.offers[h as HouseId]!.check} size="sm" />
        </div>
      )}
      {h === 'czartoryski' && (
        <div className="peek">
          <span>Dostęp do dworu — podejrzyj ofertę:</span>
          {others.map((o) => (
            <button key={o} className={`peek-btn ${peek === o ? 'is-on' : ''}`} onClick={() => setPeek(o)}>
              <Coat role={o} size={22} /> {HOUSES[o].name}
            </button>
          ))}
        </div>
      )}
      <div className="speech-options">
        {lines.map((l) => (
          <button key={l} className="speech-btn" onClick={() => act({ kind: 'negotiation', speech: l, peek })}>
            „{l}”
          </button>
        ))}
        <button className="speech-btn quiet" onClick={() => act({ kind: 'negotiation', speech: '', peek })}>
          (milczę)
        </button>
      </div>
    </div>
  );
}

function VoteDecisionView({ s, h, act }: { s: GameState; h: HouseId; act: (d: Decision) => void }) {
  const m = mag(s, h);
  const [votes, setVotes] = useState<[boolean, boolean]>([false, false]);
  const [veto, setVeto] = useState(false);
  const [card, setCard] = useState<string | null>(m.hand[0]?.id ?? null);
  const accept = votes.every(Boolean);
  const offer = s.offers[h]!;
  const cost = vetoCost(s, h);
  const canVeto = !vetoBanned(s) && m.ducats >= cost;
  const peeked = s.peeks.czartoryski;

  return (
    <div className="decide">
      <div className="vote-grid">
        <div className="vote-laws">
          {s.agenda.map((l, i) => (
            <div key={l.id} className="vote-law">
              <LawCardView law={l} size="sm" resistance={effectiveResistance(s, l)} />
              <div className="vote-toggle">
                <button className={`vt za ${votes[i] ? 'is-on' : ''}`} onClick={() => setVotes((v) => (i === 0 ? [true, v[1]] : [v[0], true]))}>
                  ZA
                </button>
                <button className={`vt przeciw ${!votes[i] ? 'is-on' : ''}`} onClick={() => setVotes((v) => (i === 0 ? [false, v[1]] : [v[0], false]))}>
                  PRZECIW
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="vote-side">
          <div className="own-offer">
            <span>Twoja oferta:</span>
            <GrantCardView grant={offer.grant} size="sm" />
            <CheckView value={offer.check} size="sm" />
          </div>
          {h === 'czartoryski' && peeked && s.offers[peeked] && (
            <div className="peek-result">
              Podejrzana oferta dla {HOUSES[peeked].name}: <b>{s.offers[peeked]!.grant?.name ?? 'brak nadania'}</b> + czek{' '}
              <b>{s.offers[peeked]!.check}</b>
            </div>
          )}
          <div className={`verdict ${accept ? 'accept' : 'reject'}`}>
            {accept
              ? 'Ani razu przeciw → PRZYJMUJESZ ofertę: nadanie jawnie przed sobą, dukaty z czeku, odrzucasz 1 kartę korzyści.'
              : 'Choć raz przeciw → ODRZUCASZ ofertę: zagrywasz 1 kartę korzyści; jeśli ustawa upadnie — premia za blokadę.'}
          </div>
          {m.hand.length > 0 && (
            <div className="card-pick">
              <span>{accept ? 'Karta do odrzucenia:' : 'Karta do zagrania:'}</span>
              <div className="choice-cards">
                {m.hand.map((c) => (
                  <BenefitCardView key={c.id} card={c} size="sm" selected={card === c.id} onClick={() => setCard(c.id)} />
                ))}
              </div>
            </div>
          )}
          <label className={`veto-check ${!canVeto ? 'disabled' : ''}`}>
            <input type="checkbox" checked={veto} disabled={!canVeto} onChange={(e) => setVeto(e.target.checked)} />
            <VetoIcon size={20} />
            <span>
              Dołóż kartę <b>weta</b> — zerwij sejm ({vetoBanned(s) ? 'weto zniesione' : `${cost} d, oddajesz 3 posłów do puli`})
            </span>
          </label>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => act({ kind: 'vote', vote: { votes, veto: veto && canVeto, cardId: card } })}>
        Połóż zakryte głosy
      </button>
    </div>
  );
}

function MusterDecision({ s, h, act }: { s: GameState; h: Role; act: (d: Decision) => void }) {
  const ducats = h === 'king' ? s.king.ducats : mag(s, h).ducats;
  const max = maxMuster(s, h, ducats);
  const [n, setN] = useState(0);
  const cost = musterCost(s, h, n);
  return (
    <div className="decide">
      <p className="help">
        Kup jawne chorągwie z banku. Masz {ducats} d. Pamiętaj o żołdzie na koniec epoki
        {h === 'king' ? ' (1 d za każde 3 chorągwie)' : ' (1 d za każde 2 chorągwie)'}.
      </p>
      <div className="stepper">
        <button className="btn" onClick={() => setN(Math.max(0, n - 1))} disabled={n === 0}>
          −
        </button>
        <span className="stepper-val">
          <BannerIcon size={26} /> {n}
        </span>
        <button className="btn" onClick={() => setN(Math.min(max, n + 1))} disabled={n >= max}>
          +
        </button>
        <span className="stepper-cost">
          koszt <DucatIcon size={18} /> {cost}
        </span>
      </div>
      <button className="btn btn-primary" onClick={() => act({ kind: 'muster', buy: n })}>
        {n ? `Zaciągnij ${n}` : 'Nie zbroję się'}
      </button>
    </div>
  );
}

function DeclareDecision({ s, h, act }: { s: GameState; h: Role; act: (d: Decision) => void }) {
  const info = useMemo(() => {
    if (h === 'king') {
      const mine = strength(s, 'king', { banners: s.king.banners, cardIds: [], ducats: s.king.ducats }).total;
      const theirs = activeHouses(s).reduce((a, x) => a + mag(s, x).banners + Math.floor(mag(s, x).deputies / 5), 0);
      return { mine, theirs, label: 'jawna siła magnatów (bez ukrytych kart i dukatów)' };
    }
    const m = mag(s, h);
    const mine =
      strength(s, h, { banners: m.banners, cardIds: m.played.map((c) => c.id), ducats: m.ducats }, { rokoszanin: true }).total + 3;
    const theirs = strength(s, 'king', { banners: s.king.banners, cardIds: [], ducats: s.king.ducats }).total;
    return { mine, theirs, label: 'maksymalna siła króla' };
  }, [s, h]);
  const chance = Math.round(attackChance(info.mine - info.theirs) * 100);
  return (
    <div className="decide">
      <p className="help">
        {h === 'king'
          ? 'Zamach: atakujesz wszystkich magnatów. Wygrana = absolutum dominium i zwycięstwo. Przegrana = koniec gry i ostatnie miejsce.'
          : 'Rokosz: ogłaszasz bunt przeciw królowi (raz na grę). Wygrana = wygrywasz grę (jeśli masz największą siłę wśród rokoszan). Przegrana = odpadasz.'}
      </p>
      <div className="odds">
        Twoja maks. siła <b>{info.mine}</b> vs {info.label} <b>{info.theirs}</b> → orientacyjna szansa <b>{chance}%</b>
      </div>
      <div className="row-buttons">
        <button className="btn btn-danger" onClick={() => act({ kind: 'declare', declare: true })}>
          {h === 'king' ? 'Ogłaszam zamach!' : 'Ogłaszam rokosz!'}
        </button>
        <button className="btn btn-ghost" onClick={() => act({ kind: 'declare', declare: false })}>
          Nie teraz
        </button>
      </div>
    </div>
  );
}

function SideDecision({ s, h, act }: { s: GameState; h: HouseId; act: (d: Decision) => void }) {
  const court = isCourtier(mag(s, h));
  return (
    <div className="decide">
      <p className="help">
        {roleName(s.conflict!.initiator)} ogłaszają rokosz. Jeśli rokosz wygra, zwycięża rokoszanin z największą siłą (inicjator ma +3). Jeśli
        przegra — wszyscy rokoszanie odpadają.
      </p>
      <div className="row-buttons">
        <button className="btn btn-danger" onClick={() => act({ kind: 'side', side: 'join' })}>
          Przyłączam się
        </button>
        <button className="btn" disabled={!court} onClick={() => act({ kind: 'side', side: 'defend' })} title={court ? '' : 'Tylko stronnicy dworu'}>
          Bronię króla (−1 Estymy)
        </button>
        <button className="btn btn-ghost" onClick={() => act({ kind: 'side', side: 'neutral' })}>
          Neutralność
        </button>
      </div>
    </div>
  );
}

function CommitDecision({ s, h, act }: { s: GameState; h: Role; act: (d: Decision) => void }) {
  const c = s.conflict!;
  const defending = c.defenders.includes(h);
  const isKing = h === 'king';
  const banners = isKing ? s.king.banners : mag(s, h).banners;
  const ducats = isKing ? s.king.ducats : mag(s, h).ducats;
  const played = isKing ? [] : mag(s, h).played;
  const [b, setB] = useState(banners);
  const [d, setD] = useState(0);
  const [cards, setCards] = useState<string[]>(played.filter((p) => p.banners > 0).map((p) => p.id));
  const st = strength(s, h, { banners: b, cardIds: cards, ducats: d }, { rokoszanin: c.type === 'rokosz' && !defending, defending });
  return (
    <div className="decide">
      <p className="help">
        Zaangażuj siły w tajemnicy. Po starciu tracisz połowę zaangażowanych chorągwi, wydane dukaty i zaangażowane karty (razem z ich Estymą).
      </p>
      <div className="commit-grid">
        <label>
          Chorągwie jawne: <b>{b}</b> / {banners}
          <input type="range" min={0} max={banners} value={b} onChange={(e) => setB(+e.target.value)} />
        </label>
        <label>
          Dukaty na szybki zaciąg (3 = 1): <b>{d}</b> / {ducats}
          <input type="range" min={0} max={ducats} step={1} value={d} onChange={(e) => setD(+e.target.value)} />
        </label>
      </div>
      {played.length > 0 && (
        <div className="card-pick">
          <span>Zagrane karty korzyści do zaangażowania:</span>
          <div className="choice-cards">
            {played.map((p) => (
              <BenefitCardView
                key={p.id}
                card={p}
                size="sm"
                selected={cards.includes(p.id)}
                onClick={() => setCards((x) => (x.includes(p.id) ? x.filter((y) => y !== p.id) : [...x, p.id]))}
              />
            ))}
          </div>
        </div>
      )}
      <div className="odds">
        Siła: chorągwie {st.banners} + ukryte {st.hidden} + posłowie {st.deputies} + dukaty {st.ducats}
        {isKing ? ` + tor ${st.track}` : ''}
        {st.mace ? ` + buława ${st.mace}` : ''}
        {c.type === 'rokosz' && h === c.initiator ? ' + inicjator 3' : ''} = <b>{st.total + (c.type === 'rokosz' && h === c.initiator ? 3 : 0)}</b>
      </div>
      <button className="btn btn-primary" onClick={() => act({ kind: 'commit', commit: { banners: b, cardIds: cards, ducats: d } })}>
        Zaciśnij dłoń
      </button>
    </div>
  );
}
