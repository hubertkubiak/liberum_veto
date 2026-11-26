import { useState } from 'react';
import type { GameOptions } from './engine/types';
import { GameScreen } from './ui/GameScreen';
import { StartScreen } from './ui/StartScreen';
import { TooltipLayer } from './ui/Tooltip';

export function App() {
  const [opts, setOpts] = useState<GameOptions | null>(null);
  const [gameKey, setGameKey] = useState(0);

  if (!opts) {
    // ?seed=123 makes the first game reproducible (handy for presentations)
    const seedParam = Number(new URLSearchParams(window.location.search).get('seed'));
    const seed = Number.isFinite(seedParam) && seedParam > 0 && gameKey === 0 ? seedParam : undefined;
    return (
      <>
        <StartScreen onStart={(o) => { setOpts({ ...o, seed }); setGameKey((k) => k + 1); }} />
        <TooltipLayer />
      </>
    );
  }
  return (
    <>
      <GameScreen key={gameKey} opts={opts} onExit={() => setOpts(null)} />
      <TooltipLayer />
    </>
  );
}
