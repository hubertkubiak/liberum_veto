import type { ReactNode } from 'react';
import { CardArt } from '../art/cardArt';
import { BannerIcon, DeputyIcon, DucatIcon, EsteemIcon, SwordsIcon, TaxIcon } from '../art/icons';
import { FACTION_NAMES } from '../engine/data';
import type { BenefitCard, EnvoyCard, GrantCard, LawCard } from '../engine/types';

interface Common {
  selected?: boolean;
  dim?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
}

function Frame({
  kind,
  selected,
  dim,
  onClick,
  size = 'md',
  children,
  footer,
}: Common & { kind: string; children: ReactNode }) {
  return (
    <div
      className={`card card-${kind} card-${size} ${selected ? 'is-selected' : ''} ${dim ? 'is-dim' : ''} ${onClick ? 'is-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      <div className="card-inner">{children}</div>
      {footer}
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`chip ${tone ? `chip-${tone}` : ''}`}>{children}</span>;
}

export function LawCardView({ law, resistance, ...c }: Common & { law: LawCard; resistance?: number }) {
  return (
    <Frame kind="law" {...c}>
      <div className="card-head">
        <span className="card-code">
          {law.code} · {law.year}
        </span>
        {law.tag === 'military' && <SwordsIcon size={16} />}
        {law.tag === 'tax' && <TaxIcon size={16} />}
      </div>
      <div className="card-title">{law.name}</div>
      <CardArt art={law.art} className="card-art" />
      <div className="card-chips">
        <Chip tone="blue">
          opór {law.resistance}
          {resistance !== undefined && resistance !== law.resistance ? ` → ${resistance}` : ''}
        </Chip>
        <Chip tone="red">tor +{law.track}</Chip>
      </div>
      <div className="card-text">
        {law.immediateText !== '—' && (
          <p>
            <b>Od razu:</b> {law.immediateText}
          </p>
        )}
        {law.directiveText !== '—' && (
          <p>
            <b>Dyrektywa:</b> {law.directiveText}
          </p>
        )}
      </div>
    </Frame>
  );
}

export function EnvoyCardView({ envoy, ...c }: Common & { envoy: EnvoyCard }) {
  return (
    <Frame kind="envoy" {...c}>
      <div className="card-head">
        <span className="card-code">Poselstwo · ten sejm</span>
      </div>
      <div className="card-title">{envoy.name}</div>
      <CardArt art={envoy.art} className="card-art" />
      <div className="card-text">
        <p>{envoy.text}</p>
      </div>
    </Frame>
  );
}

export function GrantCardView({ grant, ...c }: Common & { grant: GrantCard | null }) {
  if (!grant) {
    return (
      <Frame kind="nogrant" {...c}>
        <div className="card-head">
          <span className="card-code">Nadanie</span>
        </div>
        <div className="card-title">Brak nadania</div>
        <div className="card-art card-art-empty">
          <span>pusta zasłona</span>
        </div>
      </Frame>
    );
  }
  return (
    <Frame kind="grant" {...c}>
      <div className="card-head">
        <span className="card-code">Nadanie królewskie</span>
      </div>
      <div className="card-title">{grant.name}</div>
      <CardArt art={grant.art} className="card-art" />
      <div className="card-chips">
        {grant.deputies > 0 && (
          <Chip>
            <DeputyIcon size={13} /> +{grant.deputies}
          </Chip>
        )}
        {grant.banners > 0 && (
          <Chip>
            <BannerIcon size={13} /> +{grant.banners}
          </Chip>
        )}
        {grant.ducats > 0 && (
          <Chip>
            <DucatIcon size={13} /> +{grant.ducats}
          </Chip>
        )}
        {grant.esteem > 0 && (
          <Chip>
            <EsteemIcon size={13} /> +{grant.esteem}
          </Chip>
        )}
        {grant.strength > 0 && <Chip tone="red">+{grant.strength} siły</Chip>}
      </div>
    </Frame>
  );
}

export function BenefitCardView({ card, ...c }: Common & { card: BenefitCard }) {
  return (
    <Frame kind={`benefit benefit-${card.faction}`} {...c}>
      <div className="card-head">
        <span className="card-code">
          {FACTION_NAMES[card.faction]}
          {card.court ? ` · ${card.court}` : ''}
        </span>
      </div>
      <div className="card-title">{card.name}</div>
      <CardArt art={card.art} className="card-art" />
      <div className="card-chips">
        {card.banners > 0 && (
          <Chip>
            <BannerIcon size={13} color="#4b3a8c" /> {card.banners}
            {card.defenseOnly ? ' w obronie' : ''}
          </Chip>
        )}
        {card.esteem !== 0 && (
          <Chip tone={card.esteem > 0 ? 'green' : 'red'}>
            <EsteemIcon size={13} /> {card.esteem > 0 ? '+' : ''}
            {card.esteem}
          </Chip>
        )}
        {card.reserve > 0 && (
          <Chip>
            <DucatIcon size={13} /> rezerwa {card.reserve}
          </Chip>
        )}
      </div>
    </Frame>
  );
}

export function CardBack({ kind = 'benefit', label, size = 'sm' }: { kind?: 'benefit' | 'offer' | 'law' | 'grant'; label?: string; size?: 'xs' | 'sm' | 'md' }) {
  return (
    <div className={`card-back card-back-${kind} card-${size}`}>
      <div className="card-back-ornament">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 4l4 10 10 0-8 7 3 11-9-6-9 6 3-11-8-7h10z" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>
      {label && <div className="card-back-label">{label}</div>}
    </div>
  );
}

export function CheckView({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  return (
    <div className={`check check-${size}`}>
      <div className="check-head">Czek królewski</div>
      <div className="check-value">
        <DucatIcon size={size === 'sm' ? 16 : 22} /> {value}
      </div>
      <div className="check-foot">dukatów ze skarbu</div>
    </div>
  );
}

/** Compact benefit card for player panels. */
export function BenefitMini({ card }: { card: BenefitCard }) {
  return (
    <div className={`mini mini-${card.faction}`} title={`${FACTION_NAMES[card.faction]}${card.court ? ' · ' + card.court : ''}`}>
      <CardArt art={card.art} className="mini-art" />
      <div className="mini-body">
        <div className="mini-name">{card.name}</div>
        <div className="mini-stats">
          {card.banners > 0 && (
            <span>
              <BannerIcon size={11} color="#4b3a8c" />
              {card.banners}
              {card.defenseOnly ? '*' : ''}
            </span>
          )}
          {card.esteem !== 0 && (
            <span className={card.esteem > 0 ? 'pos' : 'neg'}>
              <EsteemIcon size={11} />
              {card.esteem > 0 ? '+' : ''}
              {card.esteem}
            </span>
          )}
          {card.reserve > 0 && (
            <span>
              <DucatIcon size={11} />
              {card.reserve}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
