import { useEffect, useState } from 'react';

interface TipState {
  text: string;
  x: number;
  y: number;
  below: boolean;
}

/**
 * One fixed-position tooltip for the whole app. Any element with a `data-tip`
 * attribute shows it on hover; rendering outside panels avoids overflow clipping.
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<TipState | null>(null);

  useEffect(() => {
    const over = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('[data-tip]') as HTMLElement | null;
      const text = el?.dataset.tip;
      if (!el || !text) {
        setTip(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const below = r.top < 140;
      const x = Math.max(160, Math.min(window.innerWidth - 160, r.left + r.width / 2));
      setTip({ text, x, y: below ? r.bottom + 8 : r.top - 8, below });
    };
    const hide = () => setTip(null);
    document.addEventListener('mouseover', over);
    document.addEventListener('scroll', hide, true);
    document.addEventListener('mousedown', hide);
    return () => {
      document.removeEventListener('mouseover', over);
      document.removeEventListener('scroll', hide, true);
      document.removeEventListener('mousedown', hide);
    };
  }, []);

  if (!tip) return null;
  return (
    <div className={`tooltip ${tip.below ? 'below' : 'above'}`} style={{ left: tip.x, top: tip.y }} role="tooltip">
      {tip.text}
    </div>
  );
}
