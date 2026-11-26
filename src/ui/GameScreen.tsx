import { useEffect, useRef, useState } from 'react';
import { Coat } from '../art/heraldry';
import { HOUSES } from '../engine/data';
import type { GameOptions, GameState, Role } from '../engine/types';
import { ActionPanel } from './ActionPanel';
import { Stage } from './Stage';
import { EraBadge, KingPanel, MagnatePanel, TrackBar } from './Table';
import { PHASE_HELP, PHASE_STEP, PHASE_TITLE, STEPS } from './text';
import { useGame } from './useGame';

export function GameScreen({ opts, onExit }: { opts: GameOptions; onExit: () => void }) {
  const [round, setRound] = useState(0);
  return <Game key={round} opts={opts} onExit={onExit} onNewGame={() => setRound((r) => r + 1)} />;
}

function Game({ opts, onExit, onNewGame }: { opts: GameOptions; onExit: () => void; onNewGame: () => void }) {
  const g = useGame(opts);
  const s = g.state;
  const [god, setGod] = useState(opts.human === null);
  const [rules, setRules] = useState(false);
  const sees = (r: Role) => god || s.human === r;
  const step = PHASE_STEP[s.phase];

  return (
    <div className="game">
      <header className="topbar">
        <div className="brand" onClick={onExit} title="Wróć do wyboru roli">
          Liberum veto
        </div>
        <EraBadge s={s} />
        <div className="steps">
          {STEPS.map((name, i) => (
            <span key={name} className={`step ${step === i + 1 ? 'now' : step && i + 1 < step ? 'past' : ''} ${i === 2 && s.sejm % 2 === 0 ? 'skip' : ''}`}>
              <i>{i + 1}</i> {name}
            </span>
          ))}
          {!step && <span className="step now special">{PHASE_TITLE[s.phase]}</span>}
        </div>
        <div className="toggles">
          <label className="toggle" title="Pokaż ukryte informacje wszystkich graczy">
            <input type="checkbox" checked={god} onChange={(e) => setGod(e.target.checked)} /> Odsłoń tajemnice
          </label>
          <label className="toggle" title="Automatycznie przechodź do kolejnych kroków">
            <input type="checkbox" checked={g.auto} onChange={(e) => g.setAuto(e.target.checked)} /> Auto
          </label>
          {g.auto && (
            <select value={g.speed} onChange={(e) => g.setSpeed(+e.target.value)} className="speed">
              <option value={0.5}>wolno</option>
              <option value={1}>normalnie</option>
              <option value={2}>szybko</option>
              <option value={4}>bardzo szybko</option>
            </select>
          )}
          <button className="btn btn-small" onClick={() => setRules(true)}>
            Zasady
          </button>
          <button className="btn btn-small btn-ghost" onClick={onExit}>
            Nowa gra
          </button>
        </div>
      </header>

      <main className="table">
        <TrackBar s={s} sees={sees} />
        <div className="magnates">
          {s.houses.map((h) => (
            <MagnatePanel key={h} s={s} h={h} sees={sees} />
          ))}
        </div>
        <Stage s={s} sees={sees} onNewGame={onNewGame} onExit={onExit} />
        <div className="bottom">
          <KingPanel s={s} sees={sees} />
          <ActionPanel s={s} humanTurn={g.humanTurn} act={g.act} next={g.next} canNext={g.canNext} auto={g.auto} />
        </div>
      </main>

      <Chronicle s={s} />
      {rules && <RulesModal s={s} onClose={() => setRules(false)} />}
    </div>
  );
}

function Chronicle({ s }: { s: GameState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [s.log.length]);
  return (
    <aside className="chronicle">
      <div className="chronicle-title">Kronika sejmowa</div>
      <div className="chronicle-body" ref={ref}>
        {s.log.map((e, i) => (
          <div key={i} className={`log log-${e.kind}`} style={e.role && e.role !== 'king' ? { ['--house' as string]: HOUSES[e.role].color } : undefined}>
            {e.role && e.kind !== 'phase' && <Coat role={e.role} size={16} className="log-coat" />}
            <span>{e.text}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function RulesModal({ s, onClose }: { s: GameState; onClose: () => void }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Zasady w pigułce</h2>
        <div className="rules-now">
          <b>Teraz: {PHASE_TITLE[s.phase]}.</b> {PHASE_HELP[s.phase]}
        </div>
        <h3>Jak się wygrywa</h3>
        <ul>
          <li>
            <b>Złota wolność</b> (po 6. sejmie): pole króla na torze kontra najwyższa Estyma magnata. Remis wygrywa magnat.
          </li>
          <li>
            <b>Udany zamach</b> — wygrywa król. <b>Przegrany zamach</b> — gra kończy się od razu, król ostatni.
          </li>
          <li>
            <b>Udany rokosz</b> — magnat obala króla i wygrywa. Przegrani rokoszanie odpadają.
          </li>
        </ul>
        <h3>Sejm krok po kroku</h3>
        <ol>
          {STEPS.map((st, i) => (
            <li key={st}>
              <b>{st}.</b>{' '}
              {PHASE_HELP[(['income', 'agenda', 'draft1', 'offers', 'negotiation', 'voting', 'settlement', 'muster'] as const)[i]]}
            </li>
          ))}
        </ol>
        <h3>Głosowanie</h3>
        <p>
          <span className="za-t">ZA</span> &gt; <span className="przeciw-t">PRZECIW</span> + <span className="opor-t">OPÓR</span> → ustawa
          przechodzi. Weto kosztuje 5 d (+2 za każde wcześniejsze w epoce), zrywacz oddaje 3 posłów do puli, a król bierze posła za każdą zerwaną
          ustawę.
        </p>
        <h3>Wynik magnata</h3>
        <p>3 + znaczniki Estymy + Estyma z kart + Estyma z nadań + fundacje (niewydane dukaty i rezerwy, 4 d = 1).</p>
      </div>
    </div>
  );
}
