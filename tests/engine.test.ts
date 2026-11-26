import { describe, expect, it } from 'vitest';
import { botDecide } from '../src/ai/bots';
import { advance, canAdvance, createGame, submit } from '../src/engine/game';
import type { GameState, Role } from '../src/engine/types';

function totalDeputies(s: GameState) {
  return s.king.deputies + s.pool + s.houses.reduce((a, h) => a + s.magnates[h]!.deputies, 0);
}

function playOut(seed: number, players: 4 | 5) {
  let s = createGame({ players, human: null, seed });
  let guard = 0;
  while (s.phase !== 'gameOver' && guard++ < 2000) {
    for (const r of s.waitingFor as Role[]) {
      if (s.pending[r]) continue;
      const d = botDecide(s, r);
      if (d) s = submit(s, r, d);
    }
    expect(canAdvance(s)).toBe(true);
    s = advance(s);
    expect(totalDeputies(s)).toBe(100);
    expect(s.king.ducats).toBeGreaterThanOrEqual(0);
    for (const h of s.houses) {
      expect(s.magnates[h]!.ducats).toBeGreaterThanOrEqual(0);
      expect(s.magnates[h]!.banners).toBeGreaterThanOrEqual(0);
    }
  }
  return s;
}

describe('engine', () => {
  it('plays many full bot games without errors and keeps 100 deputies', () => {
    const winners: Record<string, number> = {};
    const reasons: Record<string, number> = {};
    for (let seed = 1; seed <= 200; seed++) {
      const s = playOut(seed, seed % 2 ? 4 : 5);
      expect(s.phase).toBe('gameOver');
      expect(s.result).not.toBeNull();
      const w = s.result!.winner === 'king' ? 'king' : 'magnate';
      winners[w] = (winners[w] ?? 0) + 1;
      reasons[s.result!.reason] = (reasons[s.result!.reason] ?? 0) + 1;
    }
    
    console.log('winners', winners, 'reasons', reasons);
    expect(winners.king ?? 0).toBeGreaterThan(20);
    expect(reasons.rokoszWon ?? 0).toBeLessThan(50);
    expect(winners.magnate ?? 0).toBeGreaterThan(20);
  }, 120_000);
});
