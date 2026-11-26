import { Coat } from '../art/heraldry';
import { BannerIcon, CrownIcon, DeputyIcon, DucatIcon, EsteemIcon, HandIcon, VetoIcon } from '../art/icons';
import { COURT_THRESHOLDS, ERA_NAMES, HOUSES, TRACK_MAX } from '../engine/data';
import { isCourtier, magnateScore, trackStrengthDiv } from '../engine/rules';
import type { GameState, HouseId, Role } from '../engine/types';
import { BenefitMini, CardBack, CheckView, GrantCardView } from './Cards';

export type Sees = (r: Role) => boolean;

function Stat({ icon, value, title, hidden }: { icon: React.ReactNode; value: React.ReactNode; title: string; hidden?: boolean }) {
  return (
    <span className={`stat ${hidden ? 'is-hidden' : ''}`} title={title}>
      {icon}
      <b>{hidden ? '?' : value}</b>
    </span>
  );
}

function statusOf(s: GameState, r: Role) {
  if (!s.waitingFor.includes(r)) return null;
  return s.pending[r] ? 'done' : 'thinking';
}

function speechOf(s: GameState, r: Role): string | null {
  if (s.phase === 'negotiation') {
    const d = s.pending[r];
    if (d?.kind === 'negotiation' && r !== s.human) return d.speech;
    return null;
  }
  if (s.phase === 'voting') return s.speeches.find((x) => x.role === r)?.text ?? null;
  return null;
}

export function MagnatePanel({ s, h, sees }: { s: GameState; h: HouseId; sees: Sees }) {
  const m = s.magnates[h]!;
  const info = HOUSES[h];
  const visible = sees(h);
  const st = statusOf(s, h);
  const offer = s.offers[h];
  const peeked = s.peeks.czartoryski === h && sees('czartoryski');
  const showOffer = offer && ['negotiation', 'voting', 'reveal'].includes(s.phase);
  const vote = s.reveal?.votes[h];
  const speech = speechOf(s, h);
  const accepted = s.reveal?.accepted.includes(h);

  return (
    <div
      className={`panel magnate ${s.human === h ? 'is-human' : ''} ${m.eliminated ? 'is-out' : ''}`}
      style={{ ['--house' as string]: info.color }}
    >
      <div className="panel-head">
        <Coat role={h} size={40} />
        <div className="panel-name">
          <div className="name">
            {info.name}
            {s.human === h && <span className="you">Ty</span>}
          </div>
          <div className="ability" title={info.abilityText}>
            {info.ability}
          </div>
        </div>
        <div className="panel-badges">
          {isCourtier(m) && !m.eliminated && <span className="badge badge-court" title="Ma nadanie od króla">stronnik dworu</span>}
          {m.eliminated && <span className="badge badge-out">odpadł</span>}
          {st === 'thinking' && <span className="badge badge-think">namyśla się…</span>}
          {st === 'done' && <span className="badge badge-done">✓ gotowe</span>}
        </div>
      </div>

      <div className="stats">
        <Stat icon={<DeputyIcon size={18} />} value={m.deputies} title="Posłowie" />
        <Stat icon={<BannerIcon size={18} color={info.color} />} value={m.banners} title="Chorągwie jawne" />
        <Stat icon={<DucatIcon size={18} />} value={m.ducats} title="Dukaty (za zasłonką)" hidden={!visible} />
        <Stat icon={<EsteemIcon size={18} />} value={magnateScore(m).total} title="Estyma (wynik)" hidden={!visible} />
        <Stat icon={<HandIcon size={18} />} value={m.hand.length} title="Karty korzyści w ręce" />
      </div>

      {m.grants.length > 0 && (
        <div className="grants">
          {m.grants.map((g) => (
            <span key={g.id} className="grant-tag" title={`${g.name}: +${g.deputies} posłów, +${g.banners} ch., +${g.esteem} E`}>
              {g.name}
            </span>
          ))}
        </div>
      )}

      <div className="panel-cards">
        {m.played.length > 0 && (
          <div className="cards-row">
            <span className="row-label">zagrane</span>
            {m.played.map((c) =>
              visible ? <BenefitMini key={c.id} card={c} /> : <CardBack key={c.id} size="xs" />,
            )}
          </div>
        )}
        {visible && m.hand.length > 0 && s.human !== h && (
          <div className="cards-row">
            <span className="row-label">ręka</span>
            {m.hand.map((c) => (
              <BenefitMini key={c.id} card={c} />
            ))}
          </div>
        )}
      </div>

      {showOffer && (
        <div className="offer-slot">
          <span className="row-label">oferta króla</span>
          {visible || peeked ? (
            <div className="offer-open">
              <GrantCardView grant={offer!.grant} size="sm" />
              <CheckView value={offer!.check} size="sm" />
              {peeked && !visible && <span className="peek-note">podejrzane przez Czartoryskich</span>}
            </div>
          ) : (
            <div className="offer-closed">
              <CardBack kind="offer" size="xs" />
              <CardBack kind="grant" size="xs" />
            </div>
          )}
        </div>
      )}

      {vote && (
        <div className="vote-row">
          {s.agenda.map((l, i) => (
            <span key={l.id} className={`vote-chip ${vote.votes[i] ? 'za' : 'przeciw'}`}>
              {l.code}: {vote.votes[i] ? 'ZA' : 'PRZECIW'}
            </span>
          ))}
          {vote.veto && s.reveal?.vetoers.includes(h) && (
            <span className="vote-chip veto">
              <VetoIcon size={14} /> WETO
            </span>
          )}
          {accepted && <span className="vote-chip accept">przyjmuje ofertę</span>}
        </div>
      )}

      {speech && <div className="speech">„{speech}”</div>}
    </div>
  );
}

export function KingPanel({ s, sees }: { s: GameState; sees: Sees }) {
  const k = s.king;
  const st = statusOf(s, 'king');
  const speech = speechOf(s, 'king');
  const visible = sees('king');
  return (
    <div className={`panel king ${s.human === 'king' ? 'is-human' : ''}`}>
      <div className="panel-head">
        <Coat role="king" size={44} />
        <div className="panel-name">
          <div className="name">
            Król {s.human === 'king' && <span className="you">Ty</span>}
          </div>
          <div className="ability">tor, oferty, ustawy</div>
        </div>
        <div className="panel-badges">
          {st === 'thinking' && <span className="badge badge-think">namyśla się…</span>}
          {st === 'done' && <span className="badge badge-done">✓ gotowe</span>}
        </div>
      </div>
      <div className="stats">
        <Stat icon={<CrownIcon size={18} />} value={k.track} title="Tor absolutyzmu" />
        <Stat icon={<DeputyIcon size={18} />} value={k.deputies} title="Posłowie (stronnictwo)" />
        <Stat icon={<BannerIcon size={18} color="#b07d12" />} value={k.banners} title="Chorągwie" />
        <Stat icon={<DucatIcon size={18} />} value={k.ducats} title="Skarb" />
        <Stat icon={<HandIcon size={18} />} value={k.grantHand.length} title="Nadania w ręce" />
      </div>
      <div className="court-thresholds">
        {COURT_THRESHOLDS.map((t) => (
          <span key={t} className={`thr ${k.thresholdsReached.includes(t) ? 'on' : ''}`} title={`Próg ${t} posłów: +3 chorągwie`}>
            {t}
          </span>
        ))}
        <span className="thr-label">progi stronnictwa</span>
      </div>
      {visible && k.grantHand.length > 0 && s.human !== 'king' && (
        <div className="grants">
          {k.grantHand.map((g) => (
            <span key={g.id} className="grant-tag">
              {g.name}
            </span>
          ))}
        </div>
      )}
      {speech && <div className="speech">„{speech}”</div>}
    </div>
  );
}

export function TrackBar({ s, sees }: { s: GameState; sees: Sees }) {
  const div = trackStrengthDiv(s);
  const markers = s.houses
    .filter((h) => !s.magnates[h]!.eliminated && sees(h))
    .map((h) => ({ h, v: Math.min(TRACK_MAX, magnateScore(s.magnates[h]!).total) }));
  return (
    <div className="track">
      <div className="track-title">
        <span>Tor absolutyzmu</span>
        <span className="track-sub">złote pola co 5: +1 nadanie · siła króla w starciu: pole ÷ {div}</span>
      </div>
      <div className="track-cells">
        {Array.from({ length: TRACK_MAX + 1 }, (_, i) => (
          <div key={i} className={`cell ${i % 5 === 0 && i > 0 ? 'gold' : ''} ${i === s.king.track ? 'here' : ''}`}>
            <span className="n">{i}</span>
            {i === s.king.track && (
              <span className="king-marker">
                <CrownIcon size={22} />
              </span>
            )}
            <span className="esteem-markers">
              {markers
                .filter((m) => m.v === i)
                .map((m) => (
                  <span key={m.h} className="esteem-dot" style={{ background: HOUSES[m.h].color }} title={`${HOUSES[m.h].name}: Estyma ${m.v}`} />
                ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PoolView({ n }: { n: number }) {
  const dots = Array.from({ length: n }, (_, i) => {
    const ring = i < 8 ? 0 : i < 22 ? 1 : 2;
    const idxInRing = ring === 0 ? i : ring === 1 ? i - 8 : i - 22;
    const count = ring === 0 ? 8 : ring === 1 ? 14 : Math.max(1, n - 22);
    const r = ring === 0 ? 12 : ring === 1 ? 26 : 39;
    const a = (idxInRing / count) * Math.PI * 2 + ring * 0.3;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  });
  return (
    <div className="pool">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#dbe8f3" stroke="#1f6aa5" strokeWidth="2" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="4.2" fill="#1f6aa5" stroke="#0f3f66" strokeWidth="0.8" />
        ))}
      </svg>
      <div className="pool-label">
        Pula szlachty <b>{n}</b> posłów
      </div>
    </div>
  );
}

export function EraBadge({ s }: { s: GameState }) {
  return (
    <div className="era">
      <div className="era-sejms">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className={`sejm-dot ${i === s.sejm ? 'now' : i < s.sejm ? 'past' : ''} ${i % 2 === 0 && i < 6 ? 'era-gap' : ''}`}>
            {i}
          </span>
        ))}
      </div>
      <div className="era-name">
        Sejm {s.sejm} · Epoka {['', 'I', 'II', 'III'][s.era]}: <i>{ERA_NAMES[s.era]}</i>
      </div>
    </div>
  );
}
