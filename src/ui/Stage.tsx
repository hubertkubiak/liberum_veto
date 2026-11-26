import { useEffect, useState } from 'react';
import { Coat } from '../art/heraldry';
import { DieFace, VetoIcon } from '../art/icons';
import { roleName } from '../engine/game';
import { activeHouses, effectiveResistance, magnateScore } from '../engine/rules';
import type { GameState, HouseId, Role } from '../engine/types';
import { CardBack, CheckView, EnvoyCardView, GrantCardView, LawCardView } from './Cards';
import { PoolView, type Sees } from './Table';
import { RESULT_REASON } from './text';

export function Stage({ s, sees, onNewGame, onExit }: { s: GameState; sees: Sees; onNewGame: () => void; onExit: () => void }) {
  switch (s.phase) {
    case 'reveal':
      return <VoteReveal s={s} />;
    case 'settlement':
      return <OffersReveal s={s} sees={sees} />;
    case 'rokoszSides':
    case 'conflictCommit':
    case 'conflictResult':
      return <ConflictStage s={s} />;
    case 'gameOver':
      return <GameOver s={s} onNewGame={onNewGame} onExit={onExit} />;
    default:
      return <Board s={s} sees={sees} />;
  }
}

function Board({ s, sees }: { s: GameState; sees: Sees }) {
  const choosing = s.phase === 'agenda';
  return (
    <div className="board">
      <div className="board-title">Plansza sejmu</div>
      <div className="board-row">
        <div className="board-slot">
          {s.envoy ? <EnvoyCardView envoy={s.envoy} size="md" /> : <CardBack kind="law" size="md" />}
        </div>
        <div className="board-agenda">
          <div className="slot-label">2 ustawy na obradach</div>
          <div className="agenda-cards">
            {choosing && !sees('king') && (
              <>
                <CardBack kind="law" size="md" label="król wybiera…" />
                <CardBack kind="law" size="md" label="król wybiera…" />
              </>
            )}
            {choosing && sees('king') && s.human !== 'king' &&
              s.agendaOptions.map((l) => <LawCardView key={l.id} law={l} size="md" resistance={effectiveResistance(s, l)} />)}
            {choosing && s.human === 'king' && <div className="agenda-placeholder">Wybierz ustawy w panelu poniżej</div>}
            {!choosing &&
              s.agenda.map((l) => <LawCardView key={l.id} law={l} size="md" resistance={effectiveResistance(s, l)} />)}
            {!choosing && s.agenda.length === 0 && (
              <>
                <div className="law-slot" />
                <div className="law-slot" />
              </>
            )}
          </div>
        </div>
        <PoolView n={s.pool} />
      </div>
      {s.directives.length > 0 && (
        <div className="directives">
          <span className="slot-label">Dyrektywy w mocy</span>
          {s.directives.map((l) => (
            <span key={l.id} className="directive" title={l.directiveText}>
              <b>{l.code}</b> {l.name}
              {l.directiveText !== '—' && <i> — {l.directiveText}</i>}
            </span>
          ))}
        </div>
      )}
      {s.phase === 'eraEnd' && (
        <div className="era-end-banner">
          Koniec epoki {['', 'I', 'II', 'III'][s.era]} — żołd wypłacony, niezagrane karty korzyści przepadają.
        </div>
      )}
    </div>
  );
}

function VoteReveal({ s }: { s: GameState }) {
  const rv = s.reveal!;
  return (
    <div className="board reveal">
      <div className="board-title">Odkrycie głosów</div>
      {rv.broken && (
        <div className="veto-banner">
          <VetoIcon size={40} />
          <div>
            <div className="veto-title">Nie pozwalam!</div>
            <div>
              {rv.vetoers.map((h) => roleName(h)).join(', ')} zrywają sejm. Obie ustawy upadają.
            </div>
          </div>
        </div>
      )}
      <div className="reveal-laws">
        {s.agenda.map((l, i) => {
          const t = rv.tallies[i];
          const total = Math.max(100, t.za, t.przeciw + t.resistance);
          const verdict = rv.broken ? 'zerwana' : t.passed ? 'przyjęta' : 'upada';
          return (
            <div key={l.id} className="reveal-law">
              <LawCardView law={l} size="sm" />
              <div className="tally">
                <div className="tally-row">
                  <span className="tally-label za">ZA</span>
                  <div className="bar">
                    <div className="bar-fill za" style={{ width: `${(t.za / total) * 100}%` }} />
                  </div>
                  <b>{t.za}</b>
                </div>
                <div className="tally-row">
                  <span className="tally-label przeciw">PRZECIW + OPÓR</span>
                  <div className="bar">
                    <div className="bar-fill przeciw" style={{ width: `${(t.przeciw / total) * 100}%` }} />
                    <div className="bar-fill opor" style={{ width: `${(t.resistance / total) * 100}%` }} />
                  </div>
                  <b>
                    {t.przeciw} + {t.resistance}
                  </b>
                </div>
                <div className="voters">
                  <span className="voter za" title="Król zawsze głosuje za">
                    <Coat role="king" size={22} />
                  </span>
                  {activeHouses(s).map((h) => (
                    <span key={h} className={`voter ${rv.votes[h]?.votes[i] ? 'za' : 'przeciw'}`} title={roleName(h)}>
                      <Coat role={h} size={22} />
                    </span>
                  ))}
                </div>
                <div className={`stamp stamp-${verdict}`}>{verdict}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OffersReveal({ s, sees }: { s: GameState; sees: Sees }) {
  const rv = s.reveal!;
  return (
    <div className="board">
      <div className="board-title">Rozliczenie ofert</div>
      <div className="offers-reveal">
        {activeHouses(s).map((h) => {
          const o = s.offers[h];
          const accepted = rv.accepted.includes(h);
          const show = accepted || sees(h) || sees('king');
          return (
            <div key={h} className={`offer-result ${accepted ? 'accepted' : 'rejected'}`}>
              <div className="offer-result-head">
                <Coat role={h} size={28} /> {roleName(h)}
              </div>
              <div className="offer-result-cards">
                {o && show ? (
                  <>
                    <GrantCardView grant={o.grant} size="sm" dim={!accepted} />
                    <CheckView value={o.check} size="sm" />
                  </>
                ) : (
                  <>
                    <CardBack kind="grant" size="sm" />
                    <CardBack kind="offer" size="sm" />
                  </>
                )}
              </div>
              <div className="offer-result-note">
                {rv.broken ? 'sejm zerwany — oferta wraca do króla' : accepted ? 'przyjmuje ofertę' : 'odrzuca — oferta wraca zakryta'}
              </div>
            </div>
          );
        })}
      </div>
      <PoolView n={s.pool} />
    </div>
  );
}

function ConflictStage({ s }: { s: GameState }) {
  const c = s.conflict!;
  const [rolled, setRolled] = useState(false);
  const [face, setFace] = useState([1, 1]);
  useEffect(() => {
    if (s.phase !== 'conflictResult') return;
    setRolled(false);
    let n = 0;
    const iv = setInterval(() => {
      setFace([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
      if (++n > 12) {
        clearInterval(iv);
        setRolled(true);
      }
    }, 90);
    return () => clearInterval(iv);
  }, [s.phase]);

  const side = (roles: Role[], label: string, cls: string) => (
    <div className={`conflict-side ${cls}`}>
      <div className="side-label">{label}</div>
      {roles.map((r) => (
        <div key={r} className="side-member">
          <Coat role={r} size={34} />
          <span>{roleName(r)}</span>
          {c.strengths && <b className="side-str">{c.strengths[r]}</b>}
        </div>
      ))}
      {c.attackPower !== undefined && (
        <div className="side-total">
          siła: <b>{cls === 'attack' ? c.attackPower : c.defensePower}</b>
        </div>
      )}
    </div>
  );
  const title = c.type === 'rokosz' ? `Rokosz · ${roleName(c.initiator)} przeciw królowi` : 'Zamach · król przeciw wszystkim';
  const neutrals = c.type === 'rokosz' ? (Object.entries(c.sides).filter(([, v]) => v === 'neutral').map(([k]) => k) as HouseId[]) : [];
  return (
    <div className={`board conflict conflict-${c.type}`}>
      <div className="board-title">{title}</div>
      <div className="conflict-arena">
        {side(c.attackers, 'Atakujący', 'attack')}
        <div className="conflict-mid">
          {s.phase === 'conflictResult' ? (
            <>
              <div className="dice">
                <div className="die-wrap">
                  <DieFace value={rolled ? c.diceAttack! : face[0]} size={64} />
                  <span>atak</span>
                </div>
                <div className="die-wrap">
                  <DieFace value={rolled ? c.diceDefense! : face[1]} size={64} />
                  <span>obrona</span>
                </div>
              </div>
              {rolled && (
                <div className={`conflict-verdict ${c.attackerWon ? 'win' : 'lose'}`}>
                  {c.attackPower} + {c.diceAttack} {c.attackerWon ? '>' : '≤'} {c.defensePower} + {c.diceDefense}
                  <div>{c.attackerWon ? 'Zwycięża atakujący!' : 'Obrona się utrzymuje!'}</div>
                </div>
              )}
            </>
          ) : (
            <div className="vs">⚔</div>
          )}
        </div>
        {side(c.defenders, 'Obrońcy', 'defend')}
      </div>
      {neutrals.length > 0 && <div className="neutrals">Neutralni: {neutrals.map((h) => roleName(h)).join(', ')}</div>}
    </div>
  );
}

function GameOver({ s, onNewGame, onExit }: { s: GameState; onNewGame: () => void; onExit: () => void }) {
  const r = s.result!;
  return (
    <div className="board gameover">
      <div className="board-title">{RESULT_REASON[r.reason]}</div>
      <div className="winner">
        <Coat role={r.winner} size={110} />
        <div>
          <div className="winner-label">Zwycięzca</div>
          <div className="winner-name">{roleName(r.winner)}</div>
          {s.human && <div className="winner-you">{r.winner === s.human ? 'Wygrałeś!' : `Twoje miejsce: ${r.standings.find((x) => x.role === s.human)?.place}.`}</div>}
        </div>
      </div>
      <table className="standings">
        <thead>
          <tr>
            <th>#</th>
            <th>Gracz</th>
            <th>Wynik</th>
            <th>Skład</th>
          </tr>
        </thead>
        <tbody>
          {r.standings.map((st) => {
            const sc = st.role === 'king' ? null : magnateScore(s.magnates[st.role]!);
            return (
              <tr key={st.role} className={st.eliminated ? 'out' : ''}>
                <td>{st.place}</td>
                <td>
                  <Coat role={st.role} size={22} /> {roleName(st.role)}
                </td>
                <td>
                  <b>{st.score}</b>
                </td>
                <td className="breakdown">
                  {st.role === 'king'
                    ? 'pole toru absolutyzmu'
                    : st.eliminated
                      ? 'odpadł po rokoszu'
                      : `3 + znaczniki ${sc!.tokens} + karty ${sc!.cards} + nadania ${sc!.grants} + fundacje ${sc!.foundations}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="gameover-buttons">
        <button className="btn btn-primary" onClick={onNewGame}>
          Zagraj jeszcze raz
        </button>
        <button className="btn btn-ghost" onClick={onExit}>
          Zmień rolę
        </button>
      </div>
    </div>
  );
}
