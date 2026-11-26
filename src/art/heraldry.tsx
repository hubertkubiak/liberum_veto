import { useId } from 'react';
import type { Role } from '../engine/types';

const SHIELD = 'M6 5h52v30c0 19-26 32-26 32S6 54 6 35z';

interface Props {
  role: Role;
  size?: number;
  className?: string;
}

/** Heraldic shields: Orzeł Biały (king), Trąby, Pilawa, Pogoń, Szreniawa. */
export function Coat({ role, size = 48, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const field: Record<Role, string> = {
    king: '#b3192e',
    radziwill: '#d9a426',
    potocki: '#1f4e8c',
    czartoryski: '#b3192e',
    lubomirski: '#b3192e',
  };
  return (
    <svg className={className} width={size} height={size * 1.08} viewBox="0 0 64 70" aria-label={role}>
      <defs>
        <clipPath id={`clip${uid}`}>
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id={`shine${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <path d={SHIELD} fill={field[role]} />
      <g clipPath={`url(#clip${uid})`}>{CHARGES[role]}</g>
      <path d={SHIELD} fill={`url(#shine${uid})`} />
      <path d={SHIELD} fill="none" stroke="#5c430f" strokeWidth="3" />
      <path d={SHIELD} fill="none" stroke="#e6c35c" strokeWidth="1.2" />
    </svg>
  );
}

const horn = (
  <g>
    <path d="M33 31c6-1 10-5 11-12l6 1c-1 10-8 15-16 15z" fill="#1b1b1b" />
    <path d="M43.5 19.5l7 1" stroke="#1b1b1b" strokeWidth="2.6" strokeLinecap="round" />
  </g>
);

const CHARGES: Record<Role, React.ReactNode> = {
  // Orzeł Biały: crowned white eagle
  king: (
    <g>
      <path d="M32 14c-3 0-5 2-5 5 0 2 1 3 2 4l-3 1c-4-5-10-8-17-7 2 2 3 3 3 5-2 0-4 1-5 2 3 1 4 2 5 4-2 0-3 1-4 2 4 1 7 3 9 6 2 2 5 3 8 3l-3 6c-2 0-4 1-5 3 2 0 3 0 4 1l-2 3h4l2-3 2 4 2-4 2 3h4l-2-3c1-1 2-1 4-1-1-2-3-3-5-3l-3-6c3 0 6-1 8-3 2-3 5-5 9-6-1-1-2-2-4-2 1-2 2-3 5-4-1-1-3-2-5-2 0-2 1-3 3-5-7-1-13 2-17 7l-3-1c1-1 2-2 2-4 0-3-2-5-5-5z" fill="#f7f4ec" stroke="#c9c2b2" strokeWidth="0.6" />
      <path d="M27.5 13.5l1-4 2 2 1.5-3 1.5 3 2-2 1 4z" fill="#e6c35c" stroke="#8a5f0c" strokeWidth="0.6" />
      <path d="M33.5 18.5l3 1-3 .8z" fill="#e6c35c" />
      <circle cx="31" cy="18" r="0.9" fill="#1b1b1b" />
    </g>
  ),
  // Trąby: three black hunting horns
  radziwill: (
    <g>
      {horn}
      <g transform="rotate(120 32 34)">{horn}</g>
      <g transform="rotate(240 32 34)">{horn}</g>
      <circle cx="32" cy="34" r="2.4" fill="#1b1b1b" />
    </g>
  ),
  // Pilawa: silver cross with one and a half crossbars
  potocki: (
    <g fill="#eef1f4" stroke="#b9c2cc" strokeWidth="0.6">
      <rect x="29.5" y="10" width="5" height="44" />
      <rect x="18" y="18" width="28" height="5" />
      <rect x="18" y="30" width="28" height="5" />
      <rect x="18" y="42" width="14" height="5" />
    </g>
  ),
  // Pogoń: knight on a white horse with raised sword
  czartoryski: (
    <g>
      <path
        d="M14 40c2-6 8-8 15-8h9c3-4 6-7 10-8l2-3 1 4c2 1 3 3 3 5l-3 1c-1-1-3-1-4 0l-4 7c1 2 1 4 0 6l5 8-3 1-6-7-2 1-1 9h-3l-1-9c-5 1-9 0-12-2l-5 7-3-1 4-8c-2-1-3-2-3-3l-3 6-3-1z"
        fill="#f7f4ec"
        stroke="#c9c2b2"
        strokeWidth="0.6"
      />
      <path d="M28 33c-1-5 0-9 4-11l3 1c1 3 0 7-2 10z" fill="#f7f4ec" stroke="#c9c2b2" strokeWidth="0.6" />
      <circle cx="32.5" cy="19" r="2.6" fill="#f7f4ec" stroke="#c9c2b2" strokeWidth="0.6" />
      <path d="M34 22l8-12" stroke="#f7f4ec" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 13l3 2" stroke="#e6c35c" strokeWidth="1.6" />
      <path d="M26 30h-4c-2 0-3 2-3 4s2 4 4 4h2z" fill="#1f4e8c" stroke="#e6c35c" strokeWidth="0.8" />
      <path d="M22.5 32.5v3.5M21 34h3" stroke="#e6c35c" strokeWidth="0.7" />
    </g>
  ),
  // Szreniawa: silver river bent like a crook, topped with a cross
  lubomirski: (
    <g fill="none" stroke="#eef1f4" strokeLinecap="round">
      <path d="M22 56V34c0-9 5-14 10-14s10 5 10 14v6" strokeWidth="6" />
      <path d="M22 56V34c0-9 5-14 10-14s10 5 10 14v6" strokeWidth="1" stroke="#9fb3c4" strokeDasharray="3 3" />
      <path d="M32 20V8M27 12.5h10" strokeWidth="3.4" />
    </g>
  ),
};
