import { useEffect } from 'react';
import { Coat } from '../art/heraldry';
import { CrownIcon, EsteemIcon } from '../art/icons';
import { HOUSES } from '../engine/data';
import { activeHouses, magnateScore, mag, publicEsteem } from '../engine/rules';
import type { GameState, HouseId, Role } from '../engine/types';
import { KING_GUIDE, MAGNATE_GUIDE } from './guide';

type Tone = 'good' | 'warn' | 'bad';

interface Situation {
  tone: Tone;
  hint: string;
}

function sejmsLeftText(s: GameState): string {
  const left = 6 - s.sejm;
  return left === 0 ? 'to ostatni sejm' : `po tym sejmie jeszcze ${left}`;
}

/** Best public esteem among magnates other than `except`. */
function bestRival(s: GameState, except?: HouseId): { h: HouseId; v: number } | null {
  let best: { h: HouseId; v: number } | null = null;
  for (const h of activeHouses(s)) {
    if (h === except) continue;
    const v = publicEsteem(mag(s, h));
    if (!best || v > best.v) best = { h, v };
  }
  return best;
}

function magnateSituation(s: GameState, h: HouseId): Situation {
  const mine = magnateScore(mag(s, h)).total;
  const track = s.king.track;
  const rival = bestRival(s, h);
  if (track > mine) {
    return {
      tone: 'bad',
      hint: `Król prowadzi (${track} na torze, Ty ${mine} Estymy). Gdyby gra skończyła się teraz, nie wygrasz. Blokuj ustawy — głosuj PRZECIW (jeśli ustawa upadnie: +1 Estymy), w ostateczności weto.`,
    };
  }
  if (track >= mine - 2) {
    return {
      tone: 'warn',
      hint: `Król depcze Ci po piętach (${track} vs Twoje ${mine}). Każda przyjęta ustawa daje mu kilka pól — przyjmuj ofertę tylko wtedy, gdy da Ci więcej Estymy niż królowi toru.`,
    };
  }
  // Rivals' cards and ducats are hidden, so treat a lead under 3 as uncertain.
  if (rival && rival.v + 2 >= mine) {
    return {
      tone: 'warn',
      hint: `Król jest daleko, ale ${HOUSES[rival.h].name} mają jawnie ${rival.v} Estymy, a ich ukryte dukaty i karty mogą dodać kilka punktów — Twoje ${mine} to niepewna przewaga. Dobra oferta króla (nadanie z Estymą, wysoki czek) albo karta szlachecka pomogą Ci odskoczyć.`,
    };
  }
  return {
    tone: 'good',
    hint: `Prowadzisz: Twoje ${mine} Estymy jest wyraźnie wyżej niż tor króla (${track}) i jawna Estyma rywali. Zbieraj dalej i pilnuj, by król nie dogonił Cię na torze.`,
  };
}

function kingSituation(s: GameState): Situation {
  const track = s.king.track;
  const rival = bestRival(s);
  const best = rival?.v ?? 0;
  const name = rival ? HOUSES[rival.h].name : 'magnaci';
  if (track > best + 3) {
    return {
      tone: 'good',
      hint: `Prowadzisz: ${track} na torze, a ${name} mają jawnie ${best} Estymy (ukryte karty i dukaty mogą dodać kilka punktów). Nie przepłacaj — każdy dukat i nadanie dla magnatów to ich punkty.`,
    };
  }
  if (track > best) {
    return {
      tone: 'warn',
      hint: `Minimalna przewaga: ${track} na torze vs jawne ${best} Estymy (${name}). Ukryta Estyma może ją zniwelować — potrzebujesz kolejnych przyjętych ustaw.`,
    };
  }
  return {
    tone: 'bad',
    hint: `Przegrywasz: ${name} mają co najmniej ${best} Estymy, Ty ${track} na torze (remis wygrywa magnat). Przepychaj ustawy z dużym torem i kupuj głosy tam, gdzie są niezbędne${s.sejm >= 3 ? '; przy dużej przewadze siły rozważ zamach' : ''}.`,
  };
}

/** Always-visible bar: the human's goal, current standing and what it implies. */
export function GoalBar({ s }: { s: GameState }) {
  const h = s.human;
  if (!h || s.phase === 'gameOver') return null;
  if (h !== 'king' && mag(s, h).eliminated) {
    return <div className="goal goal-bad">Twój ród odpadł z gry po przegranym rokoszu. Możesz obserwować dalszy przebieg.</div>;
  }
  const sit = h === 'king' ? kingSituation(s) : magnateSituation(s, h);
  const mine = h === 'king' ? s.king.track : magnateScore(mag(s, h)).total;
  return (
    <div className={`goal goal-${sit.tone}`}>
      <div className="goal-row">
        <span className="goal-label">🎯 Cel</span>
        <span className="goal-text">
          {h === 'king'
            ? 'Po 6. sejmie mieć na torze więcej niż najlepszy magnat Estymy (albo wygrać zamach).'
            : 'Po 6. sejmie mieć najwyższą Estymę — wyższą niż tor króla i niż każdy inny magnat (albo wygrać rokosz).'}
        </span>
        <span className="goal-sejms">Sejm {s.sejm}/6 · {sejmsLeftText(s)}</span>
      </div>
      <div className="goal-row goal-scores">
        <span className="goal-score is-you" data-tip={h === 'king' ? 'Twój wynik: pole na torze absolutyzmu.' : 'Twoja Estyma (pełna, łącznie z ukrytymi kartami i dukatami).'}>
          <Coat role={h} size={18} /> Ty: <b>{mine}</b>
        </span>
        {h !== 'king' && (
          <span className="goal-score" data-tip="Wynik króla: pole na torze absolutyzmu.">
            <CrownIcon size={16} /> Król: <b>{s.king.track}</b>
          </span>
        )}
        {activeHouses(s)
          .filter((x) => x !== h)
          .map((x) => (
            <span key={x} className="goal-score" data-tip="Jawna Estyma: 3 + znaczniki + nadania. Prawdziwa może być wyższa (ukryte karty i dukaty).">
              <Coat role={x} size={16} /> <b>≥{publicEsteem(mag(s, x))}</b>
            </span>
          ))}
        <span className="goal-hint">{sit.hint}</span>
      </div>
    </div>
  );
}

/** One-time briefing shown when a human game starts. */
export function Briefing({ role, onClose, onRules }: { role: Role; onClose: () => void; onRules: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const isKing = role === 'king';
  const g = isKing ? KING_GUIDE : MAGNATE_GUIDE;
  const name = isKing ? 'Król' : HOUSES[role].name;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal briefing" onClick={(e) => e.stopPropagation()}>
        <div className="briefing-head">
          <Coat role={role} size={64} />
          <div>
            <div className="briefing-sub">Grasz jako</div>
            <h2>{name}</h2>
            {!isKing && (
              <div className="briefing-ability">
                <b>{HOUSES[role].ability}:</b> {HOUSES[role].abilityText}
              </div>
            )}
          </div>
        </div>
        <h3>
          <EsteemIcon size={18} /> Twój cel
        </h3>
        <p className="guide-goal">{g.goal}</p>
        <h3>Co robisz w każdym sejmie</h3>
        <ul>
          {g.how.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h3>Główny dylemat</h3>
        <p className="guide-dilemma">{g.dilemma}</p>
        <p className="briefing-foot">
          Nad panelem decyzji zawsze widzisz pasek <b>🎯 Cel</b> z aktualnym wynikiem i podpowiedzią, a przy każdej decyzji — ramkę <b>💡 Rada</b>.
          Najedź myszką na dowolną liczbę, by zobaczyć, co oznacza.
        </p>
        <div className="row-buttons">
          <button className="btn btn-primary" onClick={onClose}>
            Do sejmu!
          </button>
          <button className="btn btn-ghost" onClick={onRules}>
            Pełne zasady i porady
          </button>
        </div>
      </div>
    </div>
  );
}
