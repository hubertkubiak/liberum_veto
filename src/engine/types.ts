export type HouseId = 'radziwill' | 'potocki' | 'czartoryski' | 'lubomirski';
export type Role = 'king' | HouseId;
export type Era = 1 | 2 | 3;
export type LawTag = 'military' | 'tax';

export interface LawImmediate {
  kingBanners?: number;
  kingDucats?: number;
  kingDeputies?: number;
  kingDrawGrants?: number;
  magnatesPayBank?: number;
  magnatesPayKing?: number;
}

export interface LawDirective {
  kingMusterRate?: [ducats: number, banners: number];
  kingIncome?: number;
  kingUpkeepPer?: number;
  vetoCost?: number;
  vetoBanned?: boolean;
  potockiBonusOff?: boolean;
  failedLawDeputies?: number;
  resistanceMod?: number;
  extraGrants?: number;
  trackStrengthDiv?: number;
}

export interface LawCard {
  id: string;
  code: string;
  era: Era;
  year: number;
  name: string;
  tag?: LawTag;
  resistance: number;
  track: number;
  immediateText: string;
  directiveText: string;
  immediate: LawImmediate;
  directive: LawDirective;
  art: string;
}

export interface EnvoyCard {
  id: string;
  name: string;
  text: string;
  art: string;
  resistance?: number;
  militaryResistance?: number;
  taxResistance?: number;
  noMuster?: boolean;
  magnatesDucats?: number;
  vetoCostMod?: number;
  noKingIncome?: boolean;
  kingExtraGrants?: number;
  everyoneBanner?: number;
}

export interface GrantCard {
  id: string;
  name: string;
  deputies: number;
  banners: number;
  esteem: number;
  ducats: number;
  strength: number;
  art: string;
}

export type Faction = 'foreign' | 'nobility' | 'mixed';

export interface BenefitCard {
  id: string;
  name: string;
  faction: Faction;
  court?: string;
  banners: number;
  defenseOnly?: boolean;
  esteem: number;
  reserve: number;
  art: string;
}

export interface MagnateState {
  id: HouseId;
  deputies: number;
  ducats: number;
  banners: number;
  /** Esteem tokens earned during the game (the base 3 is added at scoring). */
  esteemTokens: number;
  hand: BenefitCard[];
  played: BenefitCard[];
  grants: GrantCard[];
  eliminated: boolean;
}

export interface KingState {
  deputies: number;
  ducats: number;
  banners: number;
  track: number;
  grantHand: GrantCard[];
  thresholdsReached: number[];
}

export interface Offer {
  grant: GrantCard | null;
  check: number;
}

export interface VoteDecision {
  votes: [boolean, boolean];
  veto: boolean;
  /** Card discarded (offer accepted) or played (offer rejected). */
  cardId: string | null;
}

export interface Commitment {
  banners: number;
  cardIds: string[];
  ducats: number;
}

export type RokoszSide = 'join' | 'defend' | 'neutral';

export type Decision =
  | { kind: 'agenda'; keep: [number, number] }
  | { kind: 'draft'; keepId: string }
  | { kind: 'offers'; offers: Partial<Record<HouseId, { grantId: string | null; check: number }>> }
  | { kind: 'negotiation'; speech: string; peek?: HouseId }
  | { kind: 'vote'; vote: VoteDecision }
  | { kind: 'muster'; buy: number }
  | { kind: 'declare'; declare: boolean }
  | { kind: 'side'; side: RokoszSide }
  | { kind: 'commit'; commit: Commitment };

export type Phase =
  | 'income'
  | 'agenda'
  | 'draft1'
  | 'draft2'
  | 'offers'
  | 'negotiation'
  | 'voting'
  | 'reveal'
  | 'settlement'
  | 'muster'
  | 'conflictDeclare'
  | 'rokoszSides'
  | 'conflictCommit'
  | 'conflictResult'
  | 'eraEnd'
  | 'gameOver';

export interface LawTally {
  za: number;
  przeciw: number;
  resistance: number;
  passed: boolean;
}

export interface RevealInfo {
  tallies: LawTally[];
  votes: Partial<Record<HouseId, VoteDecision>>;
  vetoers: HouseId[];
  broken: boolean;
  accepted: HouseId[];
}

export interface ConflictInfo {
  type: 'rokosz' | 'zamach';
  initiator: Role;
  sides: Partial<Record<HouseId, RokoszSide>>;
  attackers: Role[];
  defenders: Role[];
  commits: Partial<Record<Role, Commitment>>;
  strengths?: Partial<Record<Role, number>>;
  attackPower?: number;
  defensePower?: number;
  diceAttack?: number;
  diceDefense?: number;
  attackerWon?: boolean;
}

export interface LogEntry {
  sejm: number;
  role?: Role;
  kind: 'info' | 'drama' | 'speech' | 'phase';
  text: string;
}

export interface Speech {
  role: Role;
  text: string;
}

export interface BotTraits {
  greed: number;
  boldness: number;
  honesty: number;
}

export interface Standing {
  role: Role;
  score: number;
  eliminated: boolean;
  place: number;
}

export interface GameResult {
  winner: Role;
  reason: 'freedom' | 'zamachWon' | 'zamachLost' | 'rokoszWon';
  standings: Standing[];
}

export interface GameOptions {
  players: 4 | 5;
  human: Role | null;
  seed?: number;
}

export interface GameState {
  seed: number;
  rngState: number;
  human: Role | null;
  houses: HouseId[];
  king: KingState;
  magnates: Partial<Record<HouseId, MagnateState>>;
  pool: number;
  sejm: number;
  era: Era;
  phase: Phase;
  waitingFor: Role[];
  pending: Partial<Record<Role, Decision>>;
  lawDecks: Record<Era, LawCard[]>;
  grantDeck: GrantCard[];
  benefitDeck: BenefitCard[];
  envoyDeck: EnvoyCard[];
  envoy: EnvoyCard | null;
  agendaOptions: LawCard[];
  agenda: LawCard[];
  directives: LawCard[];
  draftDraw: Partial<Record<HouseId, BenefitCard[]>>;
  draftReceived: Partial<Record<HouseId, BenefitCard[]>>;
  offers: Partial<Record<HouseId, Offer>>;
  peeks: Partial<Record<HouseId, HouseId>>;
  speeches: Speech[];
  reveal: RevealInfo | null;
  vetoesThisEra: number;
  trackAtSejmStart: number;
  rokoszUsed: boolean;
  conflict: ConflictInfo | null;
  traits: Partial<Record<Role, BotTraits>>;
  log: LogEntry[];
  result: GameResult | null;
}
