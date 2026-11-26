import { useCallback, useEffect, useState } from 'react';
import { botDecide } from '../ai/bots';
import { advance, canAdvance, createGame, submit } from '../engine/game';
import type { Decision, GameOptions, GameState, Phase, Role } from '../engine/types';

/** Let every bot that still owes a decision make it. */
function runBots(s: GameState): GameState {
  let n = s;
  for (const r of n.waitingFor) {
    if (r === n.human || n.pending[r]) continue;
    const d = botDecide(n, r);
    if (d) n = submit(n, r, d);
  }
  return n;
}

const AUTO_DELAY: Partial<Record<Phase, number>> = {
  income: 2200,
  reveal: 3800,
  settlement: 3200,
  conflictResult: 4200,
  eraEnd: 2600,
};

export function useGame(opts: GameOptions) {
  const [state, setState] = useState<GameState>(() => runBots(createGame(opts)));
  const [auto, setAuto] = useState(opts.human === null);
  const [speed, setSpeed] = useState(1);

  const human = state.human;
  const humanTurn = human !== null && state.waitingFor.includes(human) && !state.pending[human];

  const act = useCallback(
    (d: Decision) => {
      setState((s) => {
        if (!s.human) return s;
        let n = runBots(submit(s, s.human as Role, d));
        if (canAdvance(n)) n = runBots(advance(n));
        return n;
      });
    },
    [],
  );

  const next = useCallback(() => setState((s) => (canAdvance(s) ? runBots(advance(s)) : s)), []);

  useEffect(() => {
    if (!auto || humanTurn || !canAdvance(state)) return;
    const delay = (AUTO_DELAY[state.phase] ?? 1400) / speed;
    const t = setTimeout(next, delay);
    return () => clearTimeout(t);
  }, [auto, humanTurn, state, next, speed]);

  return { state, act, next, humanTurn, auto, setAuto, speed, setSpeed, canNext: canAdvance(state) && !humanTurn };
}
