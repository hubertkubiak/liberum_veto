import type { Phase, Role } from '../engine/types';

export const PHASE_STEP: Partial<Record<Phase, number>> = {
  income: 1,
  agenda: 2,
  draft1: 3,
  draft2: 3,
  offers: 4,
  negotiation: 5,
  voting: 6,
  reveal: 6,
  settlement: 7,
  muster: 8,
};

export const STEPS = ['Dochód i poselstwo', 'Porządek obrad', 'Draft', 'Oferty', 'Negocjacje', 'Głosowanie', 'Rozliczenie', 'Zaciąg'];

export const PHASE_TITLE: Record<Phase, string> = {
  income: 'Dochód i poselstwo',
  agenda: 'Porządek obrad',
  draft1: 'Draft kart korzyści',
  draft2: 'Draft kart korzyści',
  offers: 'Oferty króla',
  negotiation: 'Negocjacje',
  voting: 'Głosowanie i weto',
  reveal: 'Odkrycie głosów',
  settlement: 'Rozliczenie',
  muster: 'Zaciąg',
  conflictDeclare: 'Rokosz albo zamach?',
  rokoszSides: 'Rokosz: wybór stron',
  conflictCommit: 'Starcie: tajne zaangażowanie',
  conflictResult: 'Wynik starcia',
  eraEnd: 'Koniec epoki',
  gameOver: 'Koniec gry',
};

export const PHASE_HELP: Record<Phase, string> = {
  income:
    'Król bierze z banku 4 dukaty (plus dyrektywy). Odkrywa się poselstwo — wizyta obcego dworu albo wydarzenie, które zmienia jedną zasadę tylko w tym sejmie.',
  agenda:
    'Król ogląda 3 wierzchnie ustawy bieżącej epoki, 2 wykłada na obrady, trzecią odkłada pod stos. Każda ustawa ma opór (posłowie z puli przeciw), punkty toru, skutek natychmiastowy i trwałą dyrektywę.',
  draft1:
    'Każdy magnat w tajemnicy dobiera 3 karty korzyści, zatrzymuje 1, a 2 podaje sąsiadowi z lewej. Obcy dwór: dużo wojska, Estyma w dół. Szlachta: mniej wojska, Estyma w górę. Mieszane: wojsko i dukaty.',
  draft2: 'Z 2 kart otrzymanych od sąsiada zatrzymujesz 1, drugą odrzucasz zakrytą. Masz teraz 2 karty na 2 sejmy tej epoki.',
  offers:
    'Król kładzie przed każdym magnatem zakryty stosik: nadanie (albo „brak nadania”) i czek 0–10 dukatów — każda wartość czeku tylko raz. Magnat może zajrzeć do swojego stosiku.',
  negotiation:
    'Wszyscy mówią na głos przy całym stole. Można obiecywać, kłamać i blefować — obietnice nie wiążą. Nie wolno przekazywać sobie zasobów.',
  voting:
    'Magnaci jednocześnie głosują ZA albo PRZECIW każdej ustawie wszystkimi posłami, król zawsze ZA. Ani razu przeciw = przyjmujesz ofertę (i odrzucasz kartę korzyści). Choć raz przeciw = oddajesz ofertę i zagrywasz kartę. Karta weta zrywa cały sejm.',
  reveal: 'ZA > PRZECIW + OPÓR → ustawa przechodzi. Remis: upada. Opór nie może być większy niż liczba posłów w puli.',
  settlement:
    'Przyjęte ustawy: skutek, dyrektywa, tor. Upadłe: król +1 poseł z puli. Premia za blokadę: +1 Estymy i 1 poseł dla króla. Oferty: nadania i czeki. Niezerwany sejm: król +1. Progi 22/28/34 posłów: +3 chorągwie.',
  muster:
    'Każdy może kupić jawne chorągwie: 2 dukaty = 1 chorągiew (Radziwiłłowie 3 = 2). Wszyscy widzą, kto się zbroi.',
  conflictDeclare:
    'Od 3. sejmu: magnat może ogłosić rokosz (po sejmach 3–5, raz na grę), król — zamach (po każdym sejmie od 3.). Rozstrzyga siła i kości.',
  rokoszSides: 'Pozostali magnaci wybierają: przyłączam się, bronię króla (tylko stronnicy dworu, −1 Estymy) albo neutralność.',
  conflictCommit:
    'W zaciśniętej dłoni: ile chorągwi jawnych, które zagrane karty korzyści i ile dukatów (3 = 1 siły) angażujesz. Posłowie liczą się automatycznie (5 = 1, rokoszanie 3 = 1), król dodaje tor ÷ 3.',
  conflictResult:
    'Różnica sił + k6 atakującego − k6 obrońcy > 0 → wygrywa atakujący. Obie strony tracą połowę zaangażowanych chorągwi, wydane dukaty i zaangażowane karty.',
  eraEnd: 'Żołd: magnat 1 dukat za każde 2 chorągwie, król 1 za każde 3. Kogo nie stać — rozpuszcza wojsko. Niezagrane karty korzyści przepadają.',
  gameOver: 'Magnat: 3 + znaczniki + Estyma z kart i nadań + fundacje (4 d = 1). Król: pole toru. Remis wygrywa magnat.',
};

export const SPEECHES: Record<'king' | 'magnate', string[]> = {
  king: [
    'Ustawy te wzmocnią Rzeczpospolitą. Lojalni nie pożałują.',
    'Kto poprze tron, nie wyjdzie z pustymi rękami.',
    'Buława czeka na godnego. Wiecie, o kim mówię.',
    'Każdy, kto zerwie ten sejm, będzie miał we mnie wroga.',
  ],
  magnate: [
    'Złota wolność ponad wszystko — przeciw obu ustawom!',
    'Ustawy rozsądne. Poprzemy Jego Królewską Mość.',
    'Jeśli trzeba, zerwiemy ten sejm!',
    'Wstrzymujemy się od deklaracji.',
  ],
};

export const RESULT_REASON: Record<string, string> = {
  freedom: 'Złota wolność — liczenie wyników po 6. sejmie',
  zamachWon: 'Udany zamach — absolutum dominium',
  zamachLost: 'Przegrany zamach — król na ostatnim miejscu',
  rokoszWon: 'Udany rokosz — król obalony',
};

export function roleKind(r: Role): 'king' | 'magnate' {
  return r === 'king' ? 'king' : 'magnate';
}
