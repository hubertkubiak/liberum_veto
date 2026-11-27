import { useEffect, useRef, useState } from 'react';
import { Coat } from '../art/heraldry';
import { HOUSES } from '../engine/data';
import type { GameOptions, GameState, Role } from '../engine/types';
import { ActionPanel } from './ActionPanel';
import { Stage } from './Stage';
import { EraBadge, KingPanel, MagnatePanel, TrackBar } from './Table';
import { BannerIcon, CrownIcon, DeputyIcon, DucatIcon, EsteemIcon, HandIcon, VetoIcon } from '../art/icons';
import { KING_GUIDE, MAGNATE_GUIDE, TIP, TIPS } from './guide';
import { PHASE_HELP, PHASE_STEP, PHASE_TITLE, STEPS, roleKind } from './text';
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
          <button className="btn btn-small btn-rules" onClick={() => setRules(true)} data-tip="Cel gry, zasoby, przebieg sejmu i porady dla Twojej roli">
            Zasady i porady
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

type RulesTab = 'king' | 'magnate' | 'resources' | 'sejm' | 'win' | 'end';

const RULE_TABS: { id: RulesTab; label: string }[] = [
  { id: 'king', label: 'Gra królem' },
  { id: 'magnate', label: 'Gra magnatem' },
  { id: 'resources', label: 'Zasoby' },
  { id: 'sejm', label: 'Przebieg sejmu' },
  { id: 'win', label: 'Głosowanie' },
  { id: 'end', label: 'Koniec gry' },
];

function RulesModal({ s, onClose }: { s: GameState; onClose: () => void }) {
  const [tab, setTab] = useState<RulesTab>(s.human && s.human !== 'king' ? 'magnate' : 'king');
  const tip = s.human ? TIPS[roleKind(s.human)][s.phase] : undefined;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const isYou = (id: RulesTab) => (id === 'king' && s.human === 'king') || (id === 'magnate' && !!s.human && s.human !== 'king');

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Zasady i porady</h2>
        <div className="rules-now">
          <b>Teraz: {PHASE_TITLE[s.phase]}.</b> {PHASE_HELP[s.phase]}
          {tip && (
            <p className="rules-tip">
              <b>💡 Rada:</b> {tip}
            </p>
          )}
        </div>
        <div className="rules-tabs">
          {RULE_TABS.map((t) => (
            <button key={t.id} className={`rules-tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {isYou(t.id) && <span className="you">Ty</span>}
            </button>
          ))}
        </div>
        <div className="rules-body">
          {tab === 'king' && <RoleGuide g={KING_GUIDE} />}
          {tab === 'magnate' && (
            <>
              <RoleGuide g={MAGNATE_GUIDE} />
              <h3>Zdolności rodów</h3>
              <ul className="houses-list">
                {s.houses.map((h) => (
                  <li key={h} className={s.human === h ? 'is-you' : ''}>
                    <Coat role={h} size={20} /> <b>{HOUSES[h].name}</b> — {HOUSES[h].ability}: {HOUSES[h].abilityText}
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab === 'resources' && <Resources />}
          {tab === 'sejm' && (
            <>
              <p>Gra trwa 6 sejmów w 3 epokach (po 2 sejmy). Każdy sejm to 8 kroków:</p>
              <ol>
                {STEPS.map((st, i) => (
                  <li key={st}>
                    <b>{st}.</b>{' '}
                    {PHASE_HELP[(['income', 'agenda', 'draft1', 'offers', 'negotiation', 'voting', 'settlement', 'muster'] as const)[i]]}
                  </li>
                ))}
              </ol>
              <p>
                <b>Draft</b> odbywa się tylko w pierwszym sejmie epoki. <b>Od 3. sejmu</b> po zaciągu może wybuchnąć rokosz albo zamach. Po
                sejmach 2 i 4 — <b>koniec epoki</b>: żołd za wojsko i przepadają niezagrane karty.
              </p>
              <h3>Starcie (rokosz / zamach)</h3>
              <p>{PHASE_HELP.conflictCommit}</p>
              <p>{PHASE_HELP.conflictResult}</p>
            </>
          )}
          {tab === 'end' && <EndConditions s={s} />}
          {tab === 'win' && (
            <>
              <h3>Głosowanie</h3>
              <p>
                <span className="za-t">ZA</span> &gt; <span className="przeciw-t">PRZECIW</span> + <span className="opor-t">OPÓR</span> → ustawa
                przechodzi. Remis — upada. Posłowie króla zawsze głosują ZA; każdy ród głosuje wszystkimi posłami naraz.
              </p>
              <p>
                <b>Oferta</b> działa jak umowa: magnat, który ani razu nie zagłosuje przeciw, bierze nadanie i czek (i odrzuca kartę korzyści). Kto
                choć raz zagłosuje przeciw, oddaje ofertę i zagrywa kartę korzyści.
              </p>
              <p>
                <b>Weto</b> zrywa cały sejm. Kosztuje 5 d (+2 za każde wcześniejsze w epoce), zrywacz oddaje 3 posłów do puli, a król bierze posła
                za każdą zerwaną ustawę. Ustawy z oporem ≥ 12 dają zrywaczowi +1 Estymy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EndConditions({ s }: { s: GameState }) {
  const sejmsLeft = Math.max(0, 6 - s.sejm);
  return (
    <>
      <p className="guide-goal">
        Gra kończy się na jeden z trzech sposobów: <b>po 6. sejmie</b> (złota wolność), <b>zamachem króla</b> albo <b>zwycięskim rokoszem</b>.
        Teraz trwa sejm {s.sejm} z 6{sejmsLeft > 0 ? ` — zostało jeszcze ${sejmsLeft}` : ' — to ostatni sejm'}.
        {s.rokoszUsed ? ' Rokosz został już wykorzystany w tej grze.' : ''}
      </p>

      <div className="end-cards">
        <div className="end-card">
          <div className="end-head">
            <EsteemIcon size={24} /> 1. Złota wolność — koniec po 6. sejmie
          </div>
          <p>
            <b>Kiedy:</b> po zakończeniu 6. sejmu — o ile król nie ogłosi wcześniej zamachu (może to zrobić jeszcze po zaciągu w 6. sejmie).
          </p>
          <p>
            <b>Kto wygrywa:</b> porównuje się <b>pole króla na torze absolutyzmu</b> z <b>Estymą każdego magnata</b>. Wygrywa najwyższy wynik.
          </p>
          <ul>
            <li>Estyma magnata = 3 + znaczniki Estymy + Estyma z zagranych kart + Estyma z nadań + fundacje (niewydane dukaty i rezerwy z kart, 4 d = 1).</li>
            <li>
              <b>Remis króla z magnatem wygrywa magnat.</b> Król musi mieć wynik <i>wyższy</i> od najlepszego magnata.
            </li>
            <li>Remis między magnatami: wyżej ten, kto ma mniej nadań od króla (mniej „sprzedał się” dworowi).</li>
          </ul>
        </div>

        <div className="end-card">
          <div className="end-head">
            <CrownIcon size={24} /> 2. Zamach stanu (król)
          </div>
          <p>
            <b>Kiedy:</b> po zaciągu w każdym sejmie od <b>3. do 6.</b> Tylko jeśli w tym samym sejmie żaden magnat nie ogłosił rokoszu (rokosz ma
            pierwszeństwo).
          </p>
          <p>
            <b>Jak:</b> król atakuje wszystkich magnatów naraz. Siła króla + k6 kontra łączna siła magnatów + k6.
          </p>
          <ul>
            <li>
              <b>Zamach udany</b> → gra kończy się natychmiast, <b>wygrywa król</b> (absolutum dominium). Magnaci są uszeregowani według Estymy.
            </li>
            <li>
              <b>Zamach nieudany</b> → gra kończy się natychmiast, <b>król zajmuje ostatnie miejsce</b>, wygrywa magnat z najwyższą Estymą.
            </li>
          </ul>
        </div>

        <div className="end-card">
          <div className="end-head">
            <BannerIcon size={24} /> 3. Rokosz (magnat)
          </div>
          <p>
            <b>Kiedy:</b> po zaciągu w sejmach <b>3.–5.</b>, <b>tylko raz na całą grę</b> (dla wszystkich magnatów łącznie). Gdy kilku chce naraz —
            losuje się inicjatora.
          </p>
          <p>
            <b>Jak:</b> pozostali magnaci wybierają: przyłączają się, bronią króla (tylko stronnicy dworu, −1 Estymy) albo zachowują neutralność.
            Siła rokoszan (inicjator +3, posłowie 3 = 1) + k6 kontra siła króla i obrońców + k6.
          </p>
          <ul>
            <li>
              <b>Rokosz udany</b> → gra kończy się natychmiast, <b>wygrywa rokoszanin z największą siłą</b> w starciu (przy remisie inicjator). Król
              ostatni.
            </li>
            <li>
              <b>Rokosz nieudany</b> → gra <b>toczy się dalej</b>, ale wszyscy rokoszanie <b>odpadają</b>: tracą wszystko, ich posłowie wracają do
              puli, a w końcowej klasyfikacji są na samym dole. Jeśli odpadną wszyscy magnaci — wygrywa król.
            </li>
          </ul>
        </div>
      </div>

      <h3>Oś czasu</h3>
      <table className="end-timeline">
        <thead>
          <tr>
            <th>Sejm</th>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <th key={i} className={i === s.sejm ? 'now' : ''}>
                {i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rokosz</td>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <td key={i} className={i >= 3 && i <= 5 ? (s.rokoszUsed ? 'used' : 'yes') : ''}>
                {i >= 3 && i <= 5 ? (s.rokoszUsed ? '✗' : '✓') : '—'}
              </td>
            ))}
          </tr>
          <tr>
            <td>Zamach</td>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <td key={i} className={i >= 3 ? 'yes' : ''}>
                {i >= 3 ? '✓' : '—'}
              </td>
            ))}
          </tr>
          <tr>
            <td>Liczenie punktów</td>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <td key={i} className={i === 6 ? 'yes' : ''}>
                {i === 6 ? '★' : ''}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}

function RoleGuide({ g }: { g: typeof KING_GUIDE }) {
  return (
    <>
      <h3>Twój cel</h3>
      <p className="guide-goal">{g.goal}</p>
      <h3>Jak to działa</h3>
      <ul>
        {g.how.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>Główny dylemat</h3>
      <p className="guide-dilemma">{g.dilemma}</p>
      <h3>Wskazówki</h3>
      <ul>
        {g.tips.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </>
  );
}

function Resources() {
  const rows: { icon: React.ReactNode; name: string; text: string }[] = [
    { icon: <DeputyIcon size={22} />, name: 'Posłowie magnata', text: TIP.deputies },
    { icon: <DeputyIcon size={22} />, name: 'Posłowie króla', text: TIP.kingDeputies },
    { icon: <BannerIcon size={22} />, name: 'Chorągwie', text: `${TIP.banners} Król: ${TIP.kingBanners}` },
    { icon: <BannerIcon size={22} color="#4b3a8c" />, name: 'Chorągwie ukryte', text: TIP.hiddenBanners },
    { icon: <DucatIcon size={22} />, name: 'Dukaty', text: `${TIP.ducats} Król: ${TIP.kingDucats}` },
    { icon: <EsteemIcon size={22} />, name: 'Estyma', text: TIP.esteem },
    { icon: <CrownIcon size={22} />, name: 'Tor absolutyzmu', text: `${TIP.kingTrack} ${TIP.track}` },
    { icon: <HandIcon size={22} />, name: 'Nadania', text: `${TIP.kingGrants} ${TIP.court}` },
    { icon: <DucatIcon size={22} />, name: 'Czeki', text: `${TIP.check} Wartości 0–10, każda tylko raz na sejm.` },
    { icon: <HandIcon size={22} />, name: 'Karty korzyści', text: TIP.hand },
    {
      icon: <VetoIcon size={22} />,
      name: 'Weto',
      text: 'Karta weta zrywa cały sejm: ustawy przepadają, oferty wracają do króla, a każdy magnat zagrywa kartę korzyści.',
    },
  ];
  return (
    <dl className="resources">
      {rows.map((r) => (
        <div key={r.name} className="res-row">
          <dt>
            {r.icon} {r.name}
          </dt>
          <dd>{r.text}</dd>
        </div>
      ))}
    </dl>
  );
}
