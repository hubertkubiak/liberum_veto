import type { BenefitCard, EnvoyCard, GrantCard, HouseId, LawCard } from './types';

export interface HouseInfo {
  id: HouseId;
  name: string;
  short: string;
  banners: number;
  ducats: number;
  ability: string;
  abilityText: string;
  color: string;
  coat: string;
}

export const HOUSES: Record<HouseId, HouseInfo> = {
  radziwill: {
    id: 'radziwill',
    name: 'Radziwiłłowie',
    short: 'R',
    banners: 4,
    ducats: 10,
    ability: 'Prywatna armia',
    abilityText: 'Zaciąg: 3 dukaty = 2 chorągwie.',
    color: '#8b1a2b',
    coat: 'Trąby',
  },
  potocki: {
    id: 'potocki',
    name: 'Potoccy',
    short: 'P',
    banners: 3,
    ducats: 8,
    ability: 'Hetmani',
    abilityText: '+3 głosy przy ustawach wojskowych ⚔.',
    color: '#1f4e8c',
    coat: 'Pilawa',
  },
  czartoryski: {
    id: 'czartoryski',
    name: 'Czartoryscy',
    short: 'C',
    banners: 1,
    ducats: 7,
    ability: 'Familia, dostęp do dworu',
    abilityText: 'Raz na sejm podgląda jedną cudzą ofertę króla.',
    color: '#2e6b3f',
    coat: 'Pogoń Litewska',
  },
  lubomirski: {
    id: 'lubomirski',
    name: 'Lubomirscy',
    short: 'L',
    banners: 2,
    ducats: 6,
    ability: 'Tradycja rokoszu',
    abilityText: 'Weto kosztuje ich 2 dukaty mniej.',
    color: '#b5651d',
    coat: 'Szreniawa',
  },
};

export const HOUSE_ORDER: HouseId[] = ['radziwill', 'potocki', 'czartoryski', 'lubomirski'];

export const KING_INFO = {
  name: 'Król',
  color: '#b07d12',
  coat: 'Orzeł Biały',
};

export const ERA_NAMES: Record<number, string> = {
  1: 'Wiek wet',
  2: 'Reformy Familii',
  3: 'Sejm Wielki',
};

export const LAWS: LawCard[] = [
  {
    id: 'I1', code: 'I.1', era: 1, year: 1697, name: 'Elekcja vivente rege', resistance: 18, track: 4,
    immediateText: 'Król bierze 2 posłów z puli', directiveText: 'Król dobiera +1 nadanie co sejm',
    immediate: { kingDeputies: 2 }, directive: { extraGrants: 1 }, art: 'election',
  },
  {
    id: 'I2', code: 'I.2', era: 1, year: 1697, name: 'Wojska saskie', tag: 'military', resistance: 10, track: 2,
    immediateText: 'Król bierze 4 chorągwie z banku', directiveText: 'Zaciąg króla: 1 dukat = 1 chorągiew',
    immediate: { kingBanners: 4 }, directive: { kingMusterRate: [1, 1] }, art: 'saxon',
  },
  {
    id: 'I3', code: 'I.3', era: 1, year: 1717, name: 'Stały komput', tag: 'military', resistance: 6, track: 1,
    immediateText: 'Król bierze 2 chorągwie z banku', directiveText: 'Żołd króla: 1 dukat za każde 4 chorągwie',
    immediate: { kingBanners: 2 }, directive: { kingUpkeepPer: 4 }, art: 'komput',
  },
  {
    id: 'I4', code: 'I.4', era: 1, year: 1717, name: 'Podatek podymny', tag: 'tax', resistance: 8, track: 2,
    immediateText: 'Król bierze 5 dukatów', directiveText: 'Dochód króla +1 dukat',
    immediate: { kingDucats: 5 }, directive: { kingIncome: 1 }, art: 'hearth',
  },
  {
    id: 'I5', code: 'I.5', era: 1, year: 1726, name: 'Trybunał Skarbowy', tag: 'tax', resistance: 12, track: 2,
    immediateText: 'Każdy magnat płaci 2 dukaty do banku', directiveText: 'Weto droższe o 1 dukat',
    immediate: { magnatesPayBank: 2 }, directive: { vetoCost: 1 }, art: 'tribunal',
  },
  {
    id: 'II1', code: 'II.1', era: 2, year: 1764, name: 'Komisja Skarbu', tag: 'tax', resistance: 10, track: 3,
    immediateText: 'Król bierze 6 dukatów', directiveText: 'Dochód króla +2 dukaty',
    immediate: { kingDucats: 6 }, directive: { kingIncome: 2 }, art: 'treasury',
  },
  {
    id: 'II2', code: 'II.2', era: 2, year: 1764, name: 'Komisja Wojskowa', tag: 'military', resistance: 12, track: 3,
    immediateText: 'Król bierze 3 chorągwie z banku', directiveText: 'Potoccy tracą +3 głosy hetmańskie',
    immediate: { kingBanners: 3 }, directive: { potockiBonusOff: true }, art: 'commission',
  },
  {
    id: 'II3', code: 'II.3', era: 2, year: 1765, name: 'Szkoła Rycerska', tag: 'military', resistance: 8, track: 2,
    immediateText: 'Król dobiera 1 nadanie', directiveText: 'Zaciąg króla: 3 dukaty = 2 chorągwie',
    immediate: { kingDrawGrants: 1 }, directive: { kingMusterRate: [3, 2] }, art: 'school',
  },
  {
    id: 'II4', code: 'II.4', era: 2, year: 1768, name: 'Prawo o miastach', resistance: 11, track: 3,
    immediateText: 'Król bierze 2 posłów z puli', directiveText: 'Upadła ustawa daje królowi 2 posłów',
    immediate: { kingDeputies: 2 }, directive: { failedLawDeputies: 2 }, art: 'cities',
  },
  {
    id: 'II5', code: 'II.5', era: 2, year: 1768, name: 'Ograniczenie liberum veto', resistance: 14, track: 4,
    immediateText: '—', directiveText: 'Weto droższe o 3 dukaty',
    immediate: {}, directive: { vetoCost: 3 }, art: 'vetoLimit',
  },
  {
    id: 'II6', code: 'II.6', era: 2, year: 1764, name: 'Cło generalne', tag: 'tax', resistance: 9, track: 2,
    immediateText: 'Król bierze 4 dukaty', directiveText: 'Dochód króla +1 dukat',
    immediate: { kingDucats: 4 }, directive: { kingIncome: 1 }, art: 'customs',
  },
  {
    id: 'III1', code: 'III.1', era: 3, year: 1791, name: 'Ustawa Rządowa', resistance: 20, track: 6,
    immediateText: '—', directiveText: 'Liberum veto zniesione',
    immediate: {}, directive: { vetoBanned: true }, art: 'constitution',
  },
  {
    id: 'III2', code: 'III.2', era: 3, year: 1788, name: 'Aukcja wojska', tag: 'military', resistance: 15, track: 4,
    immediateText: 'Król bierze 6 chorągwi z banku', directiveText: '—',
    immediate: { kingBanners: 6 }, directive: {}, art: 'army',
  },
  {
    id: 'III3', code: 'III.3', era: 3, year: 1789, name: 'Ofiara dziesiątego grosza', tag: 'tax', resistance: 13, track: 4,
    immediateText: 'Każdy magnat oddaje królowi do 3 dukatów', directiveText: '—',
    immediate: { magnatesPayKing: 3 }, directive: {}, art: 'tithe',
  },
  {
    id: 'III4', code: 'III.4', era: 3, year: 1791, name: 'Prawo o sejmikach', resistance: 12, track: 3,
    immediateText: 'Król bierze 3 posłów z puli', directiveText: 'Opór kolejnych ustaw −2',
    immediate: { kingDeputies: 3 }, directive: { resistanceMod: -2 }, art: 'sejmiki',
  },
  {
    id: 'III5', code: 'III.5', era: 3, year: 1791, name: 'Straż Praw', resistance: 14, track: 4,
    immediateText: '—', directiveText: 'Król dobiera +1 nadanie co sejm',
    immediate: {}, directive: { extraGrants: 1 }, art: 'guard',
  },
  {
    id: 'III6', code: 'III.6', era: 3, year: 1791, name: 'Sukcesja tronu', resistance: 18, track: 5,
    immediateText: '—', directiveText: 'W starciu tor ÷ 2 zamiast ÷ 3',
    immediate: {}, directive: { trackStrengthDiv: 2 }, art: 'succession',
  },
];

export const ENVOYS: EnvoyCard[] = [
  { id: 'e-ru', name: 'Poselstwo rosyjskie', text: 'Opór wszystkich ustaw +3', art: 'russia', resistance: 3 },
  { id: 'e-peace', name: 'Traktat pokojowy', text: 'Zaciąg w tym sejmie niedozwolony', art: 'peace', noMuster: true },
  { id: 'e-fr', name: 'Poselstwo francuskie', text: 'Każdy magnat dostaje 2 dukaty', art: 'france', magnatesDucats: 2 },
  { id: 'e-pr', name: 'Poselstwo pruskie', text: 'Weto tańsze o 2 dukaty', art: 'prussia', vetoCostMod: -2 },
  { id: 'e-pope', name: 'Nuncjusz papieski', text: 'Weto droższe o 2 dukaty', art: 'papal', vetoCostMod: 2 },
  { id: 'e-tatar', name: 'Najazd tatarski', text: 'Ustawy wojskowe ⚔: opór −4', art: 'tatar', militaryResistance: -4 },
  { id: 'e-famine', name: 'Nieurodzaj', text: 'Król nie dostaje dochodu', art: 'famine', noKingIncome: true },
  { id: 'e-at', name: 'Poselstwo austriackie', text: 'Król dobiera +1 nadanie', art: 'austria', kingExtraGrants: 1 },
  { id: 'e-sejmiki', name: 'Sejmiki gardłują', text: 'Ustawy podatkowe ⛁: opór +4', art: 'sejmikiAngry', taxResistance: 4 },
  { id: 'e-tr', name: 'Poselstwo tureckie', text: 'Każdy gracz bierze 1 chorągiew', art: 'porte', everyoneBanner: 1 },
];

function grants(name: string, n: number, g: Omit<GrantCard, 'id' | 'name'>, key: string): GrantCard[] {
  return Array.from({ length: n }, (_, i) => ({ id: `g-${key}-${i}`, name, ...g }));
}

export const GRANTS: GrantCard[] = [
  ...grants('Buława wielka', 2, { deputies: 2, banners: 2, esteem: 1, ducats: 0, strength: 2, art: 'maceGreat' }, 'bw'),
  ...grants('Buława polna', 3, { deputies: 2, banners: 2, esteem: 0, ducats: 0, strength: 0, art: 'maceField' }, 'bp'),
  ...grants('Pieczęć kanclerska', 2, { deputies: 3, banners: 0, esteem: 1, ducats: 0, strength: 0, art: 'seal' }, 'kan'),
  ...grants('Podskarbiostwo', 2, { deputies: 2, banners: 0, esteem: 0, ducats: 3, strength: 0, art: 'coffer' }, 'pod'),
  ...grants('Województwo', 5, { deputies: 2, banners: 0, esteem: 1, ducats: 0, strength: 0, art: 'voivode' }, 'woj'),
  ...grants('Kasztelania', 5, { deputies: 1, banners: 0, esteem: 1, ducats: 0, strength: 0, art: 'castellan' }, 'kas'),
  ...grants('Starostwo', 7, { deputies: 2, banners: 1, esteem: 0, ducats: 0, strength: 0, art: 'starost' }, 'sta'),
  ...grants('Order Orła Białego', 4, { deputies: 0, banners: 0, esteem: 2, ducats: 0, strength: 0, art: 'order' }, 'ord'),
];

type B = Omit<BenefitCard, 'id' | 'faction'>;
const foreign: B[] = [
  { name: 'Gwarancja carowej', court: 'Rosja', banners: 5, esteem: -2, reserve: 0, art: 'russia' },
  { name: 'Ruble ambasadora', court: 'Rosja', banners: 3, esteem: -2, reserve: 4, art: 'russia' },
  { name: 'Korpus posiłkowy', court: 'Rosja', banners: 4, esteem: -1, reserve: 0, art: 'russia' },
  { name: 'Pruskie talary', court: 'Prusy', banners: 3, esteem: -1, reserve: 3, art: 'prussia' },
  { name: 'Huzarzy pruscy', court: 'Prusy', banners: 4, esteem: -2, reserve: 0, art: 'prussia' },
  { name: 'Łaska cesarska', court: 'Austria', banners: 3, esteem: -1, reserve: 2, art: 'austria' },
  { name: 'Kirasjerzy cesarscy', court: 'Austria', banners: 4, esteem: -1, reserve: 0, art: 'austria' },
  { name: 'Złoto Wersalu', court: 'Francja', banners: 3, esteem: -1, reserve: 4, art: 'france' },
  { name: 'Partia francuska', court: 'Francja', banners: 4, esteem: -2, reserve: 2, art: 'france' },
  { name: 'Regimenty saskie', court: 'Saksonia', banners: 4, esteem: -1, reserve: 0, art: 'saxonyCourt' },
  { name: 'Dwór drezdeński', court: 'Saksonia', banners: 3, esteem: -1, reserve: 3, art: 'saxonyCourt' },
  { name: 'Ordy chańskie', court: 'Porta', banners: 5, esteem: -2, reserve: 0, art: 'porte' },
];
const nobility: B[] = [
  { name: 'Sejmik ziemski', banners: 0, esteem: 2, reserve: 0, art: 'sejmik' },
  { name: 'Konfederacja szlachecka', banners: 1, esteem: 1, reserve: 0, art: 'confederation' },
  { name: 'Pospolite ruszenie', banners: 3, defenseOnly: true, esteem: 1, reserve: 0, art: 'levy' },
  { name: 'Herbowi klienci', banners: 1, esteem: 1, reserve: 0, art: 'clients' },
  { name: 'Mowa w obronie wolności', banners: 0, esteem: 2, reserve: 0, art: 'speech' },
  { name: 'Fundacja kościoła', banners: 0, esteem: 2, reserve: 0, art: 'church' },
  { name: 'Chorągiew powiatowa', banners: 3, defenseOnly: true, esteem: 1, reserve: 0, art: 'levy' },
  { name: 'Przyjaźń braci szlachty', banners: 1, esteem: 1, reserve: 0, art: 'clients' },
  { name: 'Trybunał Koronny', banners: 0, esteem: 2, reserve: 0, art: 'tribunalCrown' },
  { name: 'Szlachta zagrodowa', banners: 3, defenseOnly: true, esteem: 1, reserve: 0, art: 'levy' },
  { name: 'Uniwersał do województw', banners: 1, esteem: 1, reserve: 0, art: 'speech' },
  { name: 'Pamiętnik patrioty', banners: 0, esteem: 2, reserve: 0, art: 'memoir' },
];
const mixed: B[] = [
  { name: 'Dzierżawa ceł', banners: 1, esteem: 0, reserve: 5, art: 'barrels' },
  { name: 'Spław zboża do Gdańska', banners: 1, esteem: 0, reserve: 4, art: 'grain' },
  { name: 'Żupy solne', banners: 1, esteem: 0, reserve: 4, art: 'salt' },
  { name: 'Hajducy nadworni', banners: 3, esteem: 0, reserve: 2, art: 'retinue' },
  { name: 'Kozacy nadworni', banners: 3, esteem: 0, reserve: 2, art: 'retinue' },
  { name: 'Kredyt bankierów gdańskich', banners: 2, esteem: 0, reserve: 3, art: 'grain' },
  { name: 'Milicja dworska', banners: 2, esteem: 0, reserve: 3, art: 'retinue' },
  { name: 'Folwarki', banners: 1, esteem: 0, reserve: 5, art: 'grain' },
  { name: 'Dragonia prywatna', banners: 3, esteem: 0, reserve: 2, art: 'retinue' },
  { name: 'Skarbiec rodowy', banners: 1, esteem: 0, reserve: 5, art: 'barrels' },
  { name: 'Twierdza rodowa', banners: 2, esteem: 0, reserve: 3, art: 'fortress' },
  { name: 'Kontrakty lwowskie', banners: 2, esteem: 0, reserve: 4, art: 'barrels' },
];

export const BENEFITS: BenefitCard[] = [
  ...foreign.map((b, i) => ({ ...b, id: `b-f${i}`, faction: 'foreign' as const })),
  ...nobility.map((b, i) => ({ ...b, id: `b-n${i}`, faction: 'nobility' as const })),
  ...mixed.map((b, i) => ({ ...b, id: `b-m${i}`, faction: 'mixed' as const })),
];

export const FACTION_NAMES = {
  foreign: 'Obcy dwór',
  nobility: 'Szlachta',
  mixed: 'Mieszana',
} as const;

export const CHECK_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const COURT_THRESHOLDS = [22, 28, 34];
export const TRACK_MAX = 40;
