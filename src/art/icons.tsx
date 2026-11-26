import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, viewBox = '0 0 24 24', ...rest }: P & { viewBox?: string }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

/** Poseł — a nobleman in a fur kołpak on a blue token. */
export function DeputyIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="11" fill="#1f6aa5" stroke="#0f3f66" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="#9cc4e6" strokeWidth="0.7" />
      <path d="M6.5 19.5c.6-3.2 2.8-4.8 5.5-4.8s4.9 1.6 5.5 4.8" fill="#f4ecdc" />
      <circle cx="12" cy="11" r="2.8" fill="#f4ecdc" />
      <path d="M8.6 9.3c.4-2.6 6.4-2.6 6.8 0z" fill="#3a2a1c" />
      <path d="M14.6 7.8l2.2-3" stroke="#f4ecdc" strokeWidth="0.9" strokeLinecap="round" />
    </Svg>
  );
}

/** Dukat — gold coin with a crown. */
export function DucatIcon(p: P) {
  return (
    <Svg {...p}>
      <defs>
        <radialGradient id="coinG" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ffe28a" />
          <stop offset="0.6" stopColor="#d4a52a" />
          <stop offset="1" stopColor="#8a5f0c" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#coinG)" stroke="#7a520a" strokeWidth="1" />
      <circle cx="12" cy="12" r="8" fill="none" stroke="#8a5f0c" strokeWidth="0.8" strokeDasharray="1.2 1.1" />
      <path d="M7.5 14.5l.8-5 2.2 2.3L12 8l1.5 3.8 2.2-2.3.8 5z" fill="#8a5f0c" />
      <rect x="7.5" y="15" width="9" height="1.4" rx="0.5" fill="#8a5f0c" />
    </Svg>
  );
}

/** Chorągiew — a swallow-tailed banner on a pole. */
export function BannerIcon({ color = '#8b1a2b', ...p }: P & { color?: string }) {
  return (
    <Svg {...p}>
      <rect x="4" y="2" width="1.8" height="21" rx="0.8" fill="#5a3b1e" />
      <circle cx="4.9" cy="2.2" r="1.5" fill="#d4a52a" />
      <path d="M5.8 4h14l-3.5 4.5 3.5 4.5h-14z" fill={color} stroke="#3a0d14" strokeWidth="0.6" />
      <path d="M9 6.5l1.2 2 1.2-2 1.2 2 1.2-2" fill="none" stroke="#f4ecdc" strokeWidth="0.8" />
    </Svg>
  );
}

/** Estyma — a golden star. */
export function EsteemIcon(p: P) {
  return (
    <Svg {...p}>
      <path
        d="M12 1.8l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17l-6.2 3.5 1.6-6.9L2.1 8.9l7-.7z"
        fill="#d4a52a"
        stroke="#7a520a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M12 5.5l1.6 3.6 3.6.4" fill="none" stroke="#fff3c4" strokeWidth="0.8" />
    </Svg>
  );
}

export function CrownIcon({ color = '#d4a52a', ...p }: P & { color?: string }) {
  return (
    <Svg {...p}>
      <path d="M3 18L2 7l5.2 4.5L12 4l4.8 7.5L22 7l-1 11z" fill={color} stroke="#6b4708" strokeWidth="1" strokeLinejoin="round" />
      <rect x="3" y="18" width="18" height="3" rx="1" fill={color} stroke="#6b4708" strokeWidth="1" />
      <circle cx="12" cy="14" r="1.6" fill="#8b1a2b" />
      <circle cx="7" cy="15" r="1.1" fill="#1f4e8c" />
      <circle cx="17" cy="15" r="1.1" fill="#1f4e8c" />
    </Svg>
  );
}

export function MaceIcon(p: P) {
  return (
    <Svg {...p}>
      <rect x="11" y="9" width="2.2" height="13" rx="1" fill="#6b4708" transform="rotate(-30 12 15)" />
      <g transform="rotate(-30 12 15)">
        <ellipse cx="12.1" cy="6.5" rx="4" ry="4.3" fill="#d4a52a" stroke="#6b4708" strokeWidth="0.9" />
        <path d="M8.3 6.5h7.6M12.1 2.3v8.4" stroke="#6b4708" strokeWidth="0.7" />
        <circle cx="12.1" cy="6.5" r="1" fill="#8b1a2b" />
      </g>
    </Svg>
  );
}

export function ScrollIcon(p: P) {
  return (
    <Svg {...p}>
      <rect x="5" y="4" width="14" height="16" rx="1.5" fill="#f4ecdc" stroke="#7a5a3a" strokeWidth="1" />
      <path d="M8 8h8M8 11h8M8 14h5" stroke="#7a5a3a" strokeWidth="1" />
      <circle cx="16" cy="17" r="2.4" fill="#8b1a2b" />
    </Svg>
  );
}

export function SwordsIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 3l11 13M20 3L9 16" stroke="#cfd6dc" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 15.5l4 -1M11.5 15.5l-4-1" stroke="#6b4708" strokeWidth="2" strokeLinecap="round" />
      <path d="M15.5 17.5l3 3.5M8.5 17.5l-3 3.5" stroke="#5a3b1e" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

export function TaxIcon(p: P) {
  return (
    <Svg {...p}>
      <ellipse cx="12" cy="18" rx="7" ry="2.4" fill="#b07d12" stroke="#6b4708" />
      <ellipse cx="12" cy="14.5" rx="7" ry="2.4" fill="#d4a52a" stroke="#6b4708" />
      <ellipse cx="12" cy="11" rx="7" ry="2.4" fill="#e9c35a" stroke="#6b4708" />
      <path d="M12 3v5M9.5 5.5h5" stroke="#6b4708" strokeWidth="1.2" />
    </Svg>
  );
}

export function VetoIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" fill="#8b1a2b" stroke="#4a0c16" strokeWidth="1.2" />
      <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" stroke="#f4ecdc" strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  );
}

export function DieFace({ value, size = 48 }: { value: number; size?: number }) {
  const pips: Record<number, [number, number][]> = {
    1: [[12, 12]],
    2: [[7, 7], [17, 17]],
    3: [[7, 7], [12, 12], [17, 17]],
    4: [[7, 7], [17, 7], [7, 17], [17, 17]],
    5: [[7, 7], [17, 7], [12, 12], [7, 17], [17, 17]],
    6: [[7, 6.5], [17, 6.5], [7, 12], [17, 12], [7, 17.5], [17, 17.5]],
  };
  return (
    <Svg size={size}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="#f4ecdc" stroke="#2b2320" strokeWidth="1.3" />
      {(pips[value] ?? []).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={value === 1 ? '#8b1a2b' : '#2b2320'} />
      ))}
    </Svg>
  );
}

export function HandIcon(p: P) {
  return (
    <Svg {...p}>
      <rect x="4" y="5" width="9" height="13" rx="1.5" fill="#4b3a8c" stroke="#241a4d" transform="rotate(-12 8 12)" />
      <rect x="10" y="5" width="9" height="13" rx="1.5" fill="#1f6aa5" stroke="#0f3f66" transform="rotate(10 15 12)" />
    </Svg>
  );
}
