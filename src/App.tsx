import { useState } from 'react';
import type { GameOptions } from './engine/types';
import { GameScreen } from './ui/GameScreen';
import { StartScreen } from './ui/StartScreen';

export function App() {
  const [opts, setOpts] = useState<GameOptions | null>(null);
  const [gameKey, setGameKey] = useState(0);

  if (!opts) return <StartScreen onStart={(o) => { setOpts(o); setGameKey((k) => k + 1); }} />;
  return <GameScreen key={gameKey} opts={opts} onExit={() => setOpts(null)} />;
}
