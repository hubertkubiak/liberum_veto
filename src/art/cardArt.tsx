/* Card illustrations composed from small heraldic/period primitives. viewBox 160×96. */
import { useId, type ReactNode } from 'react';

type XY = { x: number; y: number; s?: number };
const g = (x: number, y: number, s = 1, rot = 0) => `translate(${x} ${y}) rotate(${rot}) scale(${s})`;

const INK = '#2b2320';
const GOLD = '#d4a52a';
const GOLD_D = '#7a520a';
const RED = '#8b1a2b';

// ---------------------------------------------------------------- primitives

function Crown({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-14 6l-2-14 8 7 8-12 8 12 8-7-2 14z" fill={GOLD} stroke={GOLD_D} strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="-15" y="6" width="30" height="5" rx="1.5" fill={GOLD} stroke={GOLD_D} strokeWidth="1.2" />
      <circle cx="0" cy="1" r="2.2" fill={RED} />
      <circle cx="-8" cy="3" r="1.4" fill="#1f4e8c" />
      <circle cx="8" cy="3" r="1.4" fill="#1f4e8c" />
      <circle cx="0" cy="-13" r="1.6" fill={GOLD} stroke={GOLD_D} />
      <circle cx="-16" cy="-8" r="1.3" fill={GOLD} stroke={GOLD_D} />
      <circle cx="16" cy="-8" r="1.3" fill={GOLD} stroke={GOLD_D} />
    </g>
  );
}

function Coin({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <circle r="7" fill={GOLD} stroke={GOLD_D} strokeWidth="1.2" />
      <circle r="4.8" fill="none" stroke={GOLD_D} strokeWidth="0.7" strokeDasharray="1 1" />
      <path d="M-2.5 1.5l.5-3 1.2 1.2L0-2.5l.8 2.2L2-1.5l.5 3z" fill={GOLD_D} />
    </g>
  );
}

function CoinStack({ x, y, n = 4, s = 1 }: XY & { n?: number }) {
  return (
    <g transform={g(x, y, s)}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(0 ${-i * 3.2})`}>
          <ellipse rx="10" ry="3.6" fill={i % 2 ? '#e9c35a' : GOLD} stroke={GOLD_D} strokeWidth="0.9" />
        </g>
      ))}
    </g>
  );
}

function Banner({ x, y, s = 1, color = RED, accent = '#f4ecdc', flip = false }: XY & { color?: string; accent?: string; flip?: boolean }) {
  return (
    <g transform={`${g(x, y, s)} ${flip ? 'scale(-1 1)' : ''}`}>
      <rect x="-1.2" y="-34" width="2.4" height="40" rx="1" fill="#5a3b1e" />
      <path d="M0 -38l2.5 4h-5z" fill={GOLD} />
      <path d="M1 -32c8 -2 16 2 26 0l-6 8 6 8c-10 2 -18 -2 -26 0z" fill={color} stroke="#2a0a10" strokeWidth="0.8" />
      <path d="M5 -24c5 -1 9 1 13 0" stroke={accent} strokeWidth="1.6" fill="none" />
    </g>
  );
}

function Sabre({ x, y, s = 1, rot = 0 }: XY & { rot?: number }) {
  return (
    <g transform={g(x, y, s, rot)}>
      <path d="M0 0c6 -10 10 -24 9 -38c3 12 0 26 -6 38z" fill="#d8dee4" stroke="#6b7680" strokeWidth="0.8" />
      <rect x="-5" y="-1" width="11" height="2.6" rx="1.2" fill={GOLD} stroke={GOLD_D} strokeWidth="0.6" />
      <path d="M-1 1.5c-1 4 -1 8 1 11h2.5c-1 -3 -1 -7 0 -11z" fill="#5a2a14" />
      <circle cx="0.8" cy="13" r="1.8" fill={GOLD} />
    </g>
  );
}

function Scroll({ x, y, s = 1, lines = 4 }: XY & { lines?: number }) {
  return (
    <g transform={g(x, y, s)}>
      <rect x="-16" y="-20" width="32" height="40" fill="#f4ecdc" stroke="#7a5a3a" strokeWidth="1.2" />
      <rect x="-19" y="-24" width="38" height="6" rx="3" fill="#e6d6b4" stroke="#7a5a3a" strokeWidth="1.2" />
      <rect x="-19" y="18" width="38" height="6" rx="3" fill="#e6d6b4" stroke="#7a5a3a" strokeWidth="1.2" />
      {Array.from({ length: lines }, (_, i) => (
        <path key={i} d={`M-11 ${-12 + i * 7}h${i === lines - 1 ? 14 : 22}`} stroke="#7a5a3a" strokeWidth="1.3" />
      ))}
    </g>
  );
}

function Seal({ x, y, s = 1, color = RED }: XY & { color?: string }) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-3 6l-4 12 4 -3 2 4 1 -13zM3 6l4 12 -4 -3 -2 4 -1 -13z" fill="#c8a24a" />
      <circle r="9" fill={color} stroke="#3a0a12" strokeWidth="1" />
      <circle r="6" fill="none" stroke="#e8b3b9" strokeWidth="0.8" />
      <path d="M-3 1l1-4 2 2 2-2 1 4z" fill="#e8b3b9" />
    </g>
  );
}

function Quill({ x, y, s = 1, rot = 0 }: XY & { rot?: number }) {
  return (
    <g transform={g(x, y, s, rot)}>
      <path d="M0 0c4 -14 12 -26 22 -32c-4 10 -10 22 -20 32z" fill="#f7f4ec" stroke="#9a8f7a" strokeWidth="0.8" />
      <path d="M0 0l12 -18" stroke="#9a8f7a" strokeWidth="0.7" />
      <path d="M0 0l-2 4" stroke={INK} strokeWidth="1.4" />
    </g>
  );
}

function Tower({ x, y, s = 1, color = '#b9a58a' }: XY & { color?: string }) {
  return (
    <g transform={g(x, y, s)}>
      <rect x="-8" y="-30" width="16" height="30" fill={color} stroke="#5a4a36" strokeWidth="1" />
      <path d="M-10 -30h20v-5h-3v3h-4v-3h-6v3h-4v-3h-3z" fill={color} stroke="#5a4a36" strokeWidth="1" />
      <path d="M-3 0v-8a3 3 0 0 1 6 0v8z" fill="#3a2a1c" />
      <rect x="-2" y="-22" width="4" height="6" rx="2" fill="#3a2a1c" />
    </g>
  );
}

function Castle({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <rect x="-22" y="-18" width="44" height="18" fill="#c9b796" stroke="#5a4a36" strokeWidth="1" />
      <Tower x={-24} y={0} s={1} />
      <Tower x={24} y={0} s={1} />
      <Tower x={0} y={-6} s={0.8} color="#d2c09e" />
      <path d="M-5 0v-9a5 5 0 0 1 10 0v9z" fill="#3a2a1c" />
    </g>
  );
}

function Columns({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-30 -30l30 -14 30 14z" fill="#e6dcc6" stroke="#6b5a44" strokeWidth="1" />
      <rect x="-31" y="-31" width="62" height="4" fill="#d8ccb2" stroke="#6b5a44" strokeWidth="1" />
      {[-24, -12, 0, 12, 24].map((cx) => (
        <rect key={cx} x={cx - 2.5} y="-27" width="5" height="25" fill="#efe6d2" stroke="#6b5a44" strokeWidth="0.8" />
      ))}
      <rect x="-33" y="-2" width="66" height="4" fill="#d8ccb2" stroke="#6b5a44" strokeWidth="1" />
    </g>
  );
}

const EAGLE_BODY =
  'M0 -6c-4 -3 -10 -8 -20 -8c3 3 4 5 3 8c-3 0 -6 1 -8 4c4 0 6 2 7 4c-3 1 -4 3 -4 5c6 -1 11 1 15 5l-3 10c-2 0 -4 1 -5 3h6l3 -3 2 4 2 -4 3 3h6c-1 -2 -3 -3 -5 -3l-3 -10c4 -4 9 -6 15 -5c0 -2 -1 -4 -4 -5c1 -2 3 -4 7 -4c-2 -3 -5 -4 -8 -4c-1 -3 0 -5 3 -8c-10 0 -16 5 -20 8z';

function Eagle({ x, y, s = 1, color = '#f7f4ec', double = false, crown = true, beak = GOLD }: XY & { color?: string; double?: boolean; crown?: boolean; beak?: string }) {
  const stroke = color === '#f7f4ec' ? '#b5ab98' : '#000';
  const head = (dx: number, flip: number) => (
    <g transform={`translate(${dx} 0) scale(${flip} 1)`}>
      <path d="M-1 -5c0 -5 2 -8 5 -8s4 2 4 4l3 1.5 -3 1c0 2 -2 3 -4 3z" fill={color} stroke={stroke} strokeWidth="0.6" />
      <path d="M8 -7.5l3 1.5 -3 1z" fill={beak} />
      {crown && <path d="M1.5 -12.5l.8 -3 1.5 1.5 1 -2.5 1 2.5 1.5 -1.5 .5 3z" fill={GOLD} stroke={GOLD_D} strokeWidth="0.4" />}
    </g>
  );
  return (
    <g transform={g(x, y, s)}>
      <path d={EAGLE_BODY} fill={color} stroke={stroke} strokeWidth="0.7" />
      {double ? (
        <>
          {head(1, 1)}
          {head(-1, -1)}
        </>
      ) : (
        head(-2, 1)
      )}
      {double && crown && <path d="M-5 -19l1 -4 2 2 2 -3 2 3 2 -2 1 4z" fill={GOLD} stroke={GOLD_D} strokeWidth="0.5" />}
    </g>
  );
}

function Lily({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)} fill={GOLD} stroke={GOLD_D} strokeWidth="0.6">
      <path d="M0 -12c3 4 3 9 0 13c-3 -4 -3 -9 0 -13z" />
      <path d="M-1 0c-3 -6 -8 -7 -10 -4c3 0 5 2 6 6z" />
      <path d="M1 0c3 -6 8 -7 10 -4c-3 0 -5 2 -6 6z" />
      <rect x="-6" y="1" width="12" height="2.5" rx="1" />
      <path d="M-2 3.5l2 6 2 -6z" />
    </g>
  );
}

function Crescent({ x, y, s = 1, color = '#f7f4ec' }: XY & { color?: string }) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M5 -13.1A14 14 0 1 0 5 13.1A14 14 0 0 1 5 -13.1z" fill={color} />
      <path d="M12 -3l1.4 3 3.2 .3 -2.4 2 .8 3.2 -3 -1.8 -3 1.8 .8 -3.2 -2.4 -2 3.2 -.3z" fill={color} />
    </g>
  );
}

function Keys({ x, y, s = 1 }: XY) {
  const key = (rot: number, c: string) => (
    <g transform={`rotate(${rot})`}>
      <rect x="-1.5" y="-20" width="3" height="30" fill={c} stroke={GOLD_D} strokeWidth="0.5" />
      <circle cy="14" r="5" fill="none" stroke={c} strokeWidth="3" />
      <path d="M1.5 -20h6v4h-3v3h3v4h-6z" fill={c} />
    </g>
  );
  return (
    <g transform={g(x, y, s)}>
      {key(-30, GOLD)}
      {key(30, '#d8dee4')}
    </g>
  );
}

function Wheat({ x, y, s = 1, color = '#d9b44a', wilted = false }: XY & { color?: string; wilted?: boolean }) {
  return (
    <g transform={g(x, y, s)}>
      <path d={wilted ? 'M0 0c0 -14 4 -24 12 -28' : 'M0 0v-34'} stroke="#8a6a2a" strokeWidth="1.4" fill="none" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} transform={wilted ? `translate(${3 + i * 2.2} ${-12 - i * 3.6}) rotate(${40 + i * 6})` : `translate(0 ${-14 - i * 4.5})`}>
          <ellipse cx="-3" cy="0" rx="3.2" ry="1.6" transform="rotate(-35)" fill={color} />
          <ellipse cx="3" cy="0" rx="3.2" ry="1.6" transform="rotate(35)" fill={color} />
        </g>
      ))}
    </g>
  );
}

function Barrel({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-10 -14c-3 9 -3 19 0 28h20c3 -9 3 -19 0 -28z" fill="#a0672e" stroke="#4a2c10" strokeWidth="1" />
      <path d="M-11.5 -7h23M-11.5 7h23" stroke="#3a3a3a" strokeWidth="2" />
      <path d="M-4 -14c-1 9 -1 19 0 28M4 -14c1 9 1 19 0 28" stroke="#7a4a1e" strokeWidth="0.8" />
    </g>
  );
}

function Mace({ x, y, s = 1, rot = -30 }: XY & { rot?: number }) {
  return (
    <g transform={g(x, y, s, rot)}>
      <rect x="-2" y="0" width="4" height="40" rx="2" fill="#6b4708" />
      <rect x="-3" y="34" width="6" height="7" rx="2" fill={GOLD} stroke={GOLD_D} />
      <ellipse cx="0" cy="-6" rx="9" ry="10" fill={GOLD} stroke={GOLD_D} strokeWidth="1.2" />
      {[-6, -2, 2, 6].map((cx) => (
        <path key={cx} d={`M${cx} -15c${cx / 3} 4 ${cx / 3} 14 0 18`} stroke={GOLD_D} strokeWidth="0.8" fill="none" />
      ))}
      <circle cx="0" cy="-6" r="2" fill={RED} />
      <circle cx="0" cy="-17" r="2" fill={GOLD} stroke={GOLD_D} />
    </g>
  );
}

function OrderStar({ x, y, s = 1 }: XY) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 7 : 18;
    const a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  return (
    <g transform={g(x, y, s)}>
      <polygon points={pts} fill="#e8e2d0" stroke="#8a8270" strokeWidth="0.8" />
      <path d="M0 -11l3 8h8l-6 5 2 8 -7 -5 -7 5 2 -8 -6 -5h8z" fill="#b3192e" stroke={GOLD} strokeWidth="1" />
      <circle r="3.5" fill="#f7f4ec" stroke={GOLD} />
    </g>
  );
}

function Book({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M0 -10c-6 -4 -14 -4 -20 -2v22c6 -2 14 -2 20 2z" fill="#f4ecdc" stroke="#6b4a2a" strokeWidth="1" />
      <path d="M0 -10c6 -4 14 -4 20 -2v22c-6 -2 -14 -2 -20 2z" fill="#efe4cc" stroke="#6b4a2a" strokeWidth="1" />
      {[-5, -1, 3].map((yy) => (
        <path key={yy} d={`M-16 ${yy}c4 -1 8 -1 12 0M4 ${yy}c4 -1 8 -1 12 0`} stroke="#9a7a5a" strokeWidth="0.8" fill="none" />
      ))}
    </g>
  );
}

function House({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <rect x="-16" y="-14" width="32" height="14" fill="#d9c7a3" stroke="#5a4a36" />
      <path d="M-20 -14l20 -14 20 14z" fill="#8a5a3a" stroke="#4a2c10" />
      <rect x="8" y="-30" width="5" height="10" fill="#7a6a5a" stroke="#3a2a1c" />
      <path d="M10 -32c-4 -4 2 -6 -2 -10c-3 -3 2 -5 0 -8" stroke="#9a948a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <rect x="-5" y="-9" width="6" height="9" fill="#4a2c10" />
      <rect x="-13" y="-10" width="5" height="4" fill="#f0c860" />
    </g>
  );
}

function Scales({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)} stroke={GOLD_D} strokeWidth="1.2" fill="none">
      <path d="M0 -26v34M-10 8h20" strokeWidth="2.2" stroke="#6b4708" />
      <path d="M-22 -20h44" strokeWidth="2" stroke="#6b4708" />
      <path d="M-22 -20l-7 14h14zM22 -20l-7 14h14z" />
      <path d="M-30 -6a8 3 0 0 0 16 0zM14 -6a8 3 0 0 0 16 0z" fill={GOLD} />
      <circle cy="-27" r="2.4" fill={GOLD} />
    </g>
  );
}

function Chest({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <rect x="-18" y="-12" width="36" height="20" rx="2" fill="#7a4a1e" stroke="#3a200a" />
      <path d="M-18 -12c0 -10 36 -10 36 0" fill="#8a5a2a" stroke="#3a200a" />
      <path d="M-18 -4h36M-10 -19v27M10 -19v27" stroke={GOLD} strokeWidth="2" />
      <rect x="-3" y="-7" width="6" height="7" rx="1" fill={GOLD} stroke={GOLD_D} />
      <Coin x={-8} y={-18} s={0.7} />
      <Coin x={2} y={-20} s={0.7} />
      <Coin x={10} y={-17} s={0.7} />
    </g>
  );
}

function Ship({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-26 0h52l-8 10h-36z" fill="#6b4a2a" stroke="#3a200a" />
      <rect x="-1" y="-34" width="2" height="34" fill="#4a2c10" />
      <path d="M2 -32c12 4 14 18 0 26z" fill="#f4ecdc" stroke="#9a8f7a" />
      <path d="M-2 -28c-10 4 -12 14 0 20z" fill="#efe4cc" stroke="#9a8f7a" />
      <path d="M1 -36l8 2 -8 2z" fill={RED} />
    </g>
  );
}

function Figure({ x, y, s = 1, color = RED, arm = false }: XY & { color?: string; arm?: boolean }) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-8 0c0 -12 2 -20 8 -20s8 8 8 20z" fill={color} stroke="#2a0a10" strokeWidth="0.8" />
      <path d="M-2 -20h4l-1 18h-2z" fill={GOLD} opacity="0.85" />
      <circle cy="-24" r="4.2" fill="#e8c9a8" stroke="#8a6a4a" strokeWidth="0.5" />
      <path d="M-4.8 -26c0 -5 9.6 -5 9.6 0z" fill="#3a2a1c" />
      <path d="M3 -29l3 -4" stroke="#f4ecdc" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M-2 -22.5c1 1 3 1 4 0" stroke="#5a3a1c" strokeWidth="0.8" fill="none" />
      {arm && <path d="M6 -16l7 -12" stroke={color} strokeWidth="3.5" strokeLinecap="round" />}
    </g>
  );
}

function Lances({ x, y, s = 1, n = 6, color = RED }: XY & { n?: number; color?: string }) {
  return (
    <g transform={g(x, y, s)}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${i * 9 - (n - 1) * 4.5} ${(i % 2) * 4})`}>
          <rect x="-0.8" y="-40" width="1.6" height="42" fill="#6b4a2a" />
          <path d="M0 -46l2 6h-4z" fill="#cfd6dc" />
          <path d="M0.8 -38l9 2 -9 3z" fill={i % 2 ? '#f4ecdc' : color} />
        </g>
      ))}
    </g>
  );
}

function Church({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <rect x="-16" y="-18" width="32" height="18" fill="#efe6d2" stroke="#6b5a44" />
      <path d="M-19 -18l19 -12 19 12z" fill="#9a5a3a" stroke="#4a2c10" />
      <rect x="-6" y="-46" width="12" height="20" fill="#efe6d2" stroke="#6b5a44" />
      <path d="M-8 -46l8 -10 8 10z" fill="#9a5a3a" stroke="#4a2c10" />
      <path d="M0 -56v-8M-3 -61h6" stroke={GOLD} strokeWidth="1.6" />
      <path d="M-4 0v-9a4 4 0 0 1 8 0v9z" fill="#4a2c10" />
    </g>
  );
}

function Sun({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d="M0 -14l2 -10h-4z" fill="#f0c860" opacity="0.8" transform={`rotate(${i * 22.5})`} />
      ))}
      <circle r="12" fill="#f6d77a" stroke="#d4a52a" />
    </g>
  );
}

function Chain({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)} fill="none" stroke="#9aa3ab" strokeWidth="2.2">
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} cx={i * 9 - 22} cy="0" rx="5.5" ry={i % 2 ? 2 : 3.5} />
      ))}
    </g>
  );
}

function Shield({ x, y, s = 1, fill = '#b3192e', children }: XY & { fill?: string; children?: ReactNode }) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-14 -16h28v14c0 10 -14 16 -14 16s-14 -6 -14 -16z" fill={fill} stroke={GOLD_D} strokeWidth="1.5" />
      {children}
    </g>
  );
}

function Salt({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-14 0l6 -16 6 16zM-4 0l8 -22 8 22zM8 0l5 -12 5 12z" fill="#e8eef2" stroke="#8a9aa8" />
      <path d="M-8 -16v16M4 -22v22M13 -12v12" stroke="#c9d4dc" />
    </g>
  );
}

function Bow({ x, y, s = 1 }: XY) {
  return (
    <g transform={g(x, y, s)}>
      <path d="M-4 -24c14 8 14 40 0 48" stroke="#6b4a2a" strokeWidth="2.4" fill="none" />
      <path d="M-4 -24c4 16 4 32 0 48" stroke="#d8d0c0" strokeWidth="0.8" fill="none" />
      <path d="M-14 0h26" stroke="#5a3b1e" strokeWidth="1.4" />
      <path d="M12 0l-4 -2.5v5z" fill="#9aa3ab" />
    </g>
  );
}

// ---------------------------------------------------------------- scenes

type Scene = { sky: [string, string]; ground?: string; draw: ReactNode };

const field = (c1: string, c2: string, ground?: string): Pick<Scene, 'sky' | 'ground'> => ({ sky: [c1, c2], ground });

const PARCH: [string, string] = ['#f6eedb', '#e4d2ad'];
const DUSK: [string, string] = ['#f3d9a4', '#c88f5a'];
const NIGHT: [string, string] = ['#3a3f6b', '#1d2140'];

const SCENES: Record<string, Scene> = {
  // laws
  election: { ...field(...DUSK, '#7a5a3a'), draw: <><Columns x={80} y={86} s={1.2} /><Crown x={80} y={30} s={1.3} /></> },
  saxon: { ...field('#dfe8d2', '#a9bf8e', '#6b7a4a'), draw: <><Banner x={52} y={84} color="#2e6b3f" accent="#f4ecdc" /><Banner x={108} y={84} color="#f4ecdc" accent="#2e6b3f" flip /><Sabre x={70} y={80} rot={-25} /><Sabre x={90} y={80} rot={25} /></> },
  komput: { ...field('#e8dcc4', '#bba27a', '#6b5a3a'), draw: <><Lances x={80} y={90} n={9} /><Banner x={30} y={88} s={0.9} /></> },
  hearth: { ...field('#f0e2c2', '#c9a77a', '#7a6a4a'), draw: <><House x={62} y={84} s={1.3} /><CoinStack x={118} y={84} n={5} /></> },
  tribunal: { ...field(...PARCH, '#9a8a6a'), draw: <><Columns x={80} y={88} s={1.1} /><Scales x={80} y={52} s={0.9} /></> },
  treasury: { ...field(...PARCH, '#8a6a4a'), draw: <><Chest x={80} y={74} s={1.3} /><CoinStack x={34} y={84} n={4} /><CoinStack x={128} y={84} n={6} /></> },
  commission: { ...field('#dfe3e8', '#a7b0bd', '#5a6472'), draw: <><Scroll x={80} y={50} s={0.9} /><Sabre x={46} y={84} rot={-15} /><Sabre x={114} y={84} rot={15} /><Seal x={94} y={64} s={0.8} /></> },
  school: { ...field('#e6e9ef', '#b6bfcf', '#6a7282'), draw: <><Columns x={80} y={88} s={1} /><Book x={80} y={50} s={1} /><Sabre x={118} y={86} rot={20} s={0.9} /></> },
  cities: { ...field('#e8eef4', '#b9c6d3', '#7a8a6a'), draw: <><Castle x={80} y={86} s={1.3} /><Banner x={140} y={70} s={0.6} color="#1f4e8c" /></> },
  vetoLimit: { ...field(...PARCH, '#8a6a4a'), draw: <><Scroll x={70} y={50} s={0.9} /><Seal x={98} y={66} s={1.1} /><path d="M40 86l80 -70" stroke={RED} strokeWidth="4" strokeLinecap="round" opacity="0.75" /></> },
  customs: { ...field('#dce9f2', '#9fbfd6', '#3a6a8a'), draw: <><Ship x={66} y={74} s={1.1} /><Barrel x={124} y={76} s={0.9} /><Barrel x={140} y={80} s={0.7} /></> },
  constitution: { ...field('#fbefd0', '#f0c878', '#9a7a4a'), draw: <><Sun x={80} y={40} s={1.6} /><Scroll x={80} y={58} s={0.9} /><Quill x={102} y={78} rot={10} /></> },
  army: { ...field('#e8dcc4', '#b79a6a', '#5a4a2a'), draw: <><Lances x={80} y={92} n={12} s={0.95} /><Banner x={24} y={88} /><Banner x={136} y={88} flip color="#f4ecdc" accent={RED} /></> },
  tithe: { ...field(...PARCH, '#8a6a4a'), draw: <><CoinStack x={48} y={84} n={7} /><CoinStack x={80} y={84} n={9} /><CoinStack x={112} y={84} n={5} /><Coin x={130} y={40} /></> },
  sejmiki: { ...field('#efe0c0', '#cfae7a', '#7a5a3a'), draw: <><Columns x={80} y={70} s={0.9} /><Figure x={46} y={92} color="#1f4e8c" arm /><Figure x={80} y={94} /><Figure x={114} y={92} color="#2e6b3f" arm /></> },
  guard: { ...field('#f3e6c6', '#d2b27a', '#7a5a3a'), draw: <><Shield x={80} y={52} s={1.6}><Eagle x={0} y={0} s={0.42} /></Shield><Crown x={80} y={18} s={0.7} /></> },
  succession: { ...field(...DUSK, '#6b4a2a'), draw: <><Chain x={80} y={74} s={1.2} /><Crown x={80} y={46} s={1.6} /></> },
  // envoys & foreign courts
  russia: { ...field('#f3d77a', '#c99a2a', '#8a6a1a'), draw: <><Eagle x={80} y={52} s={1.7} color="#1b1b1b" double beak="#d4a52a" /></> },
  prussia: { ...field('#f4f4f4', '#cfd3d8', '#8a8f96'), draw: <><Eagle x={80} y={52} s={1.7} color="#1b1b1b" beak="#d4a52a" /></> },
  austria: { ...field('#f3d77a', '#c99a2a', '#8a6a1a'), draw: <><Eagle x={80} y={50} s={1.7} color="#1b1b1b" double beak="#d4a52a" /><Shield x={80} y={58} s={0.5} fill="#c8102e"><rect x="-14" y="-6" width="28" height="5" fill="#fff" /></Shield></> },
  france: { ...field('#2f4f9a', '#1b2f66', '#162650'), draw: <><Lily x={56} y={36} s={1.2} /><Lily x={104} y={36} s={1.2} /><Lily x={80} y={70} s={1.4} /></> },
  saxonyCourt: { ...field('#f3d77a', '#1b1b1b'), draw: <><Shield x={80} y={50} s={2} fill="#f3d77a"><path d="M-14 -10h28M-14 -4h28M-14 2h28" stroke="#1b1b1b" strokeWidth="3" /><path d="M-9 -14l18 20M9 -14l-18 20" stroke="#1f6aa5" strokeWidth="2.6" /></Shield></> },
  porte: { ...field('#c8102e', '#7a0a1a', '#5a0814'), draw: <><Crescent x={74} y={50} s={1.5} /></> },
  peace: { ...field('#eef3e4', '#c4d4a8', '#7a8a5a'), draw: <><Scroll x={80} y={50} s={0.9} /><Seal x={60} y={70} s={0.8} /><Seal x={100} y={70} s={0.8} color="#1f4e8c" /><Wheat x={30} y={88} color="#8ab05a" /><Wheat x={130} y={88} color="#8ab05a" /></> },
  papal: { ...field('#f6efd8', '#e0c88a', '#9a7a4a'), draw: <><Keys x={80} y={50} s={1.3} /></> },
  tatar: { ...field('#f0d0a0', '#b8743a', '#7a4a1a'), draw: <><Crescent x={110} y={36} s={0.8} color="#fff3d0" /><Bow x={62} y={54} s={1.3} /><Lances x={120} y={92} n={4} s={0.7} color="#3a3a3a" /></> },
  famine: { ...field('#c9c4b4', '#8a8474', '#5a5040'), draw: <><Wheat x={50} y={90} wilted color="#a08a5a" /><Wheat x={80} y={90} wilted color="#a08a5a" /><Wheat x={110} y={90} wilted color="#a08a5a" /></> },
  sejmikiAngry: { ...field('#f0d2b4', '#c88a5a', '#7a4a2a'), draw: <><Figure x={50} y={92} arm color="#8b1a2b" /><Figure x={80} y={94} arm color="#1f4e8c" /><Figure x={110} y={92} arm color="#2e6b3f" /><Sabre x={64} y={50} rot={-30} s={0.7} /><Sabre x={96} y={50} rot={30} s={0.7} /></> },
  // grants
  maceGreat: { ...field(...DUSK, '#6b4a2a'), draw: <><Sun x={80} y={48} s={1.5} /><Mace x={80} y={48} s={1.2} /></> },
  maceField: { ...field('#e8dcc4', '#bba27a', '#6b5a3a'), draw: <><Banner x={120} y={88} s={0.9} /><Mace x={70} y={44} s={1.1} /></> },
  seal: { ...field(...PARCH, '#8a6a4a'), draw: <><Scroll x={70} y={50} s={0.9} /><Seal x={104} y={62} s={1.5} /></> },
  coffer: { ...field(...PARCH, '#8a6a4a'), draw: <><Chest x={80} y={74} s={1.4} /></> },
  voivode: { ...field('#e8eef4', '#b9c6d3', '#7a8a6a'), draw: <><Castle x={70} y={86} s={1.1} /><Banner x={126} y={86} s={1.1} /></> },
  castellan: { ...field('#ece4d4', '#c0ae8a', '#7a6a4a'), draw: <><Tower x={80} y={90} s={1.8} /></> },
  starost: { ...field('#e6ecd8', '#b4c49a', '#6a7a4a'), draw: <><Castle x={70} y={88} s={1} /><Keys x={128} y={50} s={0.8} /></> },
  order: { ...field('#dde6f4', '#8ea8d4', '#3a5a9a'), draw: <><path d="M40 0l40 40 40 -40" stroke="#1f4e8c" strokeWidth="10" fill="none" /><OrderStar x={80} y={54} s={1.5} /></> },
  // nobility
  sejmik: { ...field('#efe0c0', '#cfae7a', '#7a5a3a'), draw: <><Church x={124} y={88} s={0.8} /><Figure x={50} y={92} arm /><Figure x={76} y={94} color="#1f4e8c" /></> },
  confederation: { ...field('#f0dcc4', '#c49a6a', '#6a4a2a'), draw: <><Banner x={80} y={86} s={1.2} /><Sabre x={50} y={88} rot={-30} /><Sabre x={112} y={88} rot={30} /></> },
  levy: { ...field('#e6dcc0', '#b8a070', '#6a5a3a'), draw: <><Lances x={80} y={92} n={7} color="#1f6aa5" /><Figure x={36} y={94} color="#1f6aa5" /></> },
  clients: { ...field('#f0e4cc', '#c8aa7a', '#7a5a3a'), draw: <><Figure x={50} y={92} color="#1f4e8c" /><Figure x={80} y={94} color="#8b1a2b" /><Figure x={110} y={92} color="#2e6b3f" /></> },
  speech: { ...field('#f3e6c6', '#d2b27a', '#7a5a3a'), draw: <><Columns x={110} y={80} s={0.7} /><Figure x={56} y={92} arm s={1.3} color="#1f6aa5" /></> },
  church: { ...field('#e8eef4', '#b9c6d3', '#7a8a6a'), draw: <><Church x={80} y={90} s={1.3} /></> },
  tribunalCrown: { ...field(...PARCH, '#8a6a4a'), draw: <><Scales x={80} y={60} s={1.2} /></> },
  memoir: { ...field(...PARCH, '#8a6a4a'), draw: <><Book x={74} y={60} s={1.4} /><Quill x={112} y={70} rot={10} /></> },
  // mixed
  barrels: { ...field('#efe0c0', '#c49a6a', '#6a4a2a'), draw: <><Barrel x={56} y={74} /><Barrel x={80} y={74} /><Barrel x={68} y={50} s={0.9} /><CoinStack x={120} y={84} n={5} /></> },
  grain: { ...field('#dce9f2', '#9fbfd6', '#3a6a8a'), draw: <><Ship x={96} y={74} /><Wheat x={30} y={92} /><Wheat x={42} y={92} /></> },
  salt: { ...field('#e4e8ec', '#a8b4c0', '#5a6a7a'), draw: <><Salt x={70} y={86} s={1.6} /><Coin x={124} y={50} /></> },
  retinue: { ...field('#e6dcc0', '#b8a070', '#6a5a3a'), draw: <><Lances x={96} y={92} n={5} color="#5a2a14" /><Figure x={46} y={94} color="#5a2a14" arm /></> },
  fortress: { ...field('#dfe3e8', '#a7b0bd', '#5a6472'), draw: <><Castle x={80} y={88} s={1.4} /></> },
  // night sky backup
  default: { ...field(...NIGHT), draw: <Crown x={80} y={48} s={1.5} /> },
};

export function CardArt({ art, className }: { art: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const sc = SCENES[art] ?? SCENES.default;
  return (
    <svg className={className} viewBox="0 0 160 96" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sc.sky[0]} />
          <stop offset="1" stopColor={sc.sky[1]} />
        </linearGradient>
        <radialGradient id={`vig${uid}`} cx="50%" cy="45%" r="75%">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <rect width="160" height="96" fill={`url(#sky${uid})`} />
      {sc.ground && <path d="M0 84c40 -6 80 -6 160 -2v14H0z" fill={sc.ground} opacity="0.55" />}
      {sc.draw}
      <rect width="160" height="96" fill={`url(#vig${uid})`} />
    </svg>
  );
}

/** Decorative hero illustration for the start screen. */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 160" aria-hidden="true">
      <defs>
        <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b1018" />
          <stop offset="1" stopColor="#7a1a2b" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#heroSky)" />
      <g opacity="0.35">
        <Columns x={250} y={150} s={2.2} />
      </g>
      <Banner x={200} y={150} s={1.5} />
      <Banner x={300} y={150} s={1.5} flip color="#f4ecdc" accent="#8b1a2b" />
      <Sabre x={225} y={140} rot={-35} s={1.2} />
      <Sabre x={275} y={140} rot={35} s={1.2} />
      <Eagle x={250} y={78} s={2.2} />
      <Crown x={250} y={30} s={1.1} />
    </svg>
  );
}
