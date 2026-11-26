import { useState } from 'react';
import { HeroArt } from '../art/cardArt';
import { Coat } from '../art/heraldry';
import { BannerIcon, DeputyIcon, DucatIcon, EsteemIcon } from '../art/icons';
import { HOUSE_ORDER, HOUSES } from '../engine/data';
import type { GameOptions, Role } from '../engine/types';

export function StartScreen({ onStart }: { onStart: (o: GameOptions) => void }) {
  const [players, setPlayers] = useState<4 | 5>(4);
  const [role, setRole] = useState<Role | null>('king');

  return (
    <div className="start">
      <div className="start-hero">
        <HeroArt className="start-hero-art" />
        <div className="start-hero-text">
          <h1>Liberum veto</h1>
          <p className="start-tagline">
            Jeden gracz jest królem i chce wzmocnić władzę. Pozostali to magnaci: razem bronią złotej wolności, ale każdy gra o
            własne zwycięstwo.
          </p>
          <p className="start-meta">4–5 graczy · 6 sejmów w 3 epokach · wersja robocza 0.4</p>
        </div>
      </div>

      <section className="start-section">
        <h2>Wybierz rolę</h2>
        <div className="role-grid">
          <button className={`role-card role-king ${role === 'king' ? 'is-selected' : ''}`} onClick={() => setRole('king')}>
            <Coat role="king" size={64} />
            <div className="role-name">Król</div>
            <div className="role-ability">Tor absolutyzmu</div>
            <p>Przekupuj magnatów nadaniami i czekami, przepychaj ustawy, a gdy będziesz dość silny — sięgnij po zamach.</p>
            <div className="role-stats">
              <span><DeputyIcon size={16} /> 15</span>
              <span><DucatIcon size={16} /> 15</span>
              <span><BannerIcon size={16} /> 6</span>
            </div>
          </button>
          {HOUSE_ORDER.map((h) => {
            const info = HOUSES[h];
            return (
              <button
                key={h}
                className={`role-card ${role === h ? 'is-selected' : ''}`}
                style={{ ['--house' as string]: info.color }}
                onClick={() => setRole(h)}
              >
                <Coat role={h} size={64} />
                <div className="role-name">{info.name}</div>
                <div className="role-ability">{info.ability}</div>
                <p>{info.abilityText}</p>
                <div className="role-stats">
                  <span><DeputyIcon size={16} /> {players === 4 ? 20 : 15}</span>
                  <span><DucatIcon size={16} /> {info.ducats}</span>
                  <span><BannerIcon size={16} /> {info.banners}</span>
                  <span><EsteemIcon size={16} /> 3</span>
                </div>
                <div className="role-coat-name">herb {info.coat}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="start-section start-controls">
        <div className="seg">
          <span className="seg-label">Liczba graczy</span>
          <button className={players === 4 ? 'is-on' : ''} onClick={() => setPlayers(4)}>
            4 (król + 3 rody)
          </button>
          <button className={players === 5 ? 'is-on' : ''} onClick={() => setPlayers(5)}>
            5 (król + 4 rody)
          </button>
        </div>
        <div className="start-buttons">
          <button className="btn btn-primary btn-big" onClick={() => onStart({ players, human: role })}>
            Zasiądź do sejmu
          </button>
          <button className="btn btn-ghost" onClick={() => onStart({ players, human: null })}>
            Tryb pokazowy — same boty
          </button>
        </div>
        {players === 4 && role !== 'king' && (
          <p className="hint">Przy 4 graczach jeden ród (losowy, inny niż Twój) nie bierze udziału.</p>
        )}
        {players === 4 && role === 'king' && <p className="hint">Przy 4 graczach jeden losowy ród nie bierze udziału.</p>}
      </section>

      <section className="start-section start-how">
        <h2>Jak to działa</h2>
        <div className="how-grid">
          <div>
            <DeputyIcon size={34} />
            <h3>100 posłów</h3>
            <p>Głosy w sejmie. Nikt ich nie produkuje — przechodzą między królem, magnatami i pulą szlachty.</p>
          </div>
          <div>
            <EsteemIcon size={34} />
            <h3>Estyma</h3>
            <p>Punkty magnatów. Rośnie za blokowanie króla i za karty szlacheckie, spada za karty obcych dworów.</p>
          </div>
          <div>
            <DucatIcon size={34} />
            <h3>Oferty i czeki</h3>
            <p>Król płaci za głos, a nie za wynik. Kto choć raz zagłosuje przeciw, odrzuca ofertę.</p>
          </div>
          <div>
            <BannerIcon size={34} />
            <h3>Rokosz i zamach</h3>
            <p>Od 3. sejmu spór może rozstrzygnąć siła: chorągwie, posłowie, dukaty i rzut kośćmi.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
