import type { Phase } from '../engine/types';

/** Tooltip texts for resources and board elements (player-facing, Polish). */
export const TIP = {
  deputies:
    'Posłowie — głosy w sejmie. Wszyscy posłowie rodu głosują razem: ZA albo PRZECIW. W starciu 5 posłów = 1 siły (rokoszanie: 3 = 1).',
  banners:
    'Chorągwie jawne — wojsko. Liczą się tylko w starciu (rokosz / zamach): 1 chorągiew = 1 siły. Nie dają punktów, a na koniec epoki trzeba płacić żołd (1 d za każde 2). Odstraszają króla od zamachu.',
  hiddenBanners:
    'Chorągwie ukryte — wojsko z zagranych kart korzyści (zakryte przed innymi). Liczą się w starciu tylko wtedy, gdy zaangażujesz kartę. Zapis „3+2” oznacza 3 chorągwie zawsze i 2 tylko w obronie króla. Uwaga: zaangażowane karty przepadają po starciu razem z ich Estymą.',
  ducats:
    'Dukaty — ukryte za zasłonką. Płacisz nimi za weto, zaciąg i żołd. Niewydane na koniec gry stają się fundacjami: 4 d = 1 Estymy.',
  esteem:
    'Estyma — wynik magnata: 3 + znaczniki + Estyma z kart i nadań + fundacje (4 d = 1). Na koniec gry najwyższa Estyma musi przewyższyć pole króla na torze.',
  hand: 'Karty korzyści w ręce — gdy odrzucasz ofertę króla (choć raz PRZECIW), zagrywasz jedną z nich. Niezagrane przepadają na koniec epoki.',
  court:
    'Stronnik dworu — ma przynajmniej jedno nadanie od króla. Tylko stronnicy dworu mogą bronić króla w rokoszu.',
  grant: 'Nadanie królewskie przyjęte od króla — jego Estyma liczy się do wyniku, a buława daje siłę w starciu.',
  kingTrack:
    'Tor absolutyzmu — wynik króla. Rośnie za każdą przyjętą ustawę i +1 za każdy niezerwany sejm. Po 6. sejmie musi być WYŻSZY niż najwyższa Estyma magnata.',
  kingDeputies:
    'Stronnictwo dworskie — posłowie króla zawsze głosują ZA. Rośnie, gdy ustawy upadają, sejm zostaje zerwany albo magnat dostaje premię za blokadę. Progi 22 / 28 / 34 dają po 3 chorągwie.',
  kingBanners:
    'Chorągwie królewskie — siła w zamachu i w obronie przed rokoszem. Duże wojsko odstrasza buntowników. Żołd na koniec epoki: 1 d za każde 3.',
  kingDucats:
    'Skarb — 4 d dochodu co sejm. Wypłacasz z niego czeki magnatom, którzy poprą obie ustawy. Czek bez pokrycia = tracisz cały zysk toru z tego sejmu i jeszcze 3 pola.',
  kingGrants:
    'Nadania w ręce — urzędy i dobra do rozdania w ofertach. Co sejm dobierasz 2 + 1 za każde złote pole toru (co 5). Niewykorzystane wracają do ręki.',
  thresholds:
    'Progi stronnictwa: gdy posłowie króla osiągną 22, 28 i 34, król jednorazowo dostaje +3 chorągwie.',
  track:
    'Pozycja korony (żółta) kontra Estyma magnatów (kropki w kolorach rodów). Złote pola co 5: król dobiera +1 nadanie co sejm. W starciu tor daje królowi siłę: pole ÷ 3.',
  pool: 'Pula szlachty — posłowie niczyi. To z niej bierze się opór ustaw (ale opór nie może przekroczyć liczby posłów w puli) i stąd przychodzą nowi posłowie.',
  resistance: 'Opór — tylu posłów z puli głosuje PRZECIW tej ustawie. Ustawa przechodzi, gdy ZA > PRZECIW + OPÓR.',
  lawTrack: 'Ile pól toru absolutyzmu zyska król, jeśli ustawa przejdzie.',
  check: 'Czek — dukaty ze skarbu króla. Wypłacany tylko wtedy, gdy magnat ani razu nie zagłosuje PRZECIW.',
  publicEsteem:
    'Jawna Estyma: 3 + znaczniki + nadania. Prawdziwa jest wyższa — karty korzyści i dukaty magnata są ukryte.',
} as const;

export type RoleKind = 'king' | 'magnate';

/** Strategic advice per phase for the human's role. */
export const TIPS: Record<RoleKind, Partial<Record<Phase, string>>> = {
  king: {
    agenda:
      'Ustawy z wysokim torem dają dużo punktów, ale z wysokim oporem trudno je przegłosować. Pod każdą kartą widzisz, ilu posłów magnatów musisz przekupić. Uwaga: zerwanie sejmu przy ustawie z oporem ≥ 12 daje zrywaczowi +1 Estymy.',
    offers:
      'Kupujesz głosy. Nie musisz przekupić wszystkich — wystarczy tylu magnatów, by ich posłowie przeważyli („Rachunek głosów” poniżej). Duży czek daj rodowi z wieloma posłami. Liderowi Estymy dawaj mało — każdy dukat (4 d = 1) i każde nadanie z Estymą podnosi jego wynik, z którym na końcu się mierzysz. Nadania z buławą wzmacniają magnata w starciu — ostrożnie.',
    negotiation:
      'Obietnice nie wiążą. Możesz grozić tym, którzy planują weto, albo sugerować hojność, by skłonić niezdecydowanych do głosowania ZA.',
    muster:
      'Chorągwie nie dają punktów, ale chronią przed rokoszem (od 3. sejmu) i są potrzebne do zamachu. Zostaw w skarbie dość dukatów na czeki w kolejnym sejmie i na żołd (1 d za 3 chorągwie) na koniec epoki.',
    conflictDeclare:
      'Zamach to rzut na wszystko: wygrana kończy grę Twoim zwycięstwem, przegrana — ostatnim miejscem. Ryzykuj, gdy masz wyraźną przewagę siły albo gdy na torze przegrywasz i nie masz już czasu.',
    conflictCommit:
      'Zaangażuj tyle, ile trzeba, by wygrać — połowę zaangażowanych chorągwi i tak stracisz. Tor daje Ci siłę automatycznie.',
  },
  magnate: {
    draft1:
      'Szlachta podnosi Estymę (punkty). Obcy dwór daje dużo wojska kosztem Estymy — przydaje się do rokoszu. Karty z rezerwą dają dukaty, które na koniec zamienią się w fundacje.',
    draft2: 'Po tym wyborze będziesz mieć 2 karty na 2 sejmy tej epoki. Kartę zagrywasz tylko wtedy, gdy odrzucisz ofertę króla — inaczej ją odrzucasz. Niezagrane przepadają na koniec epoki.',
    negotiation:
      'Zobacz swoją zakrytą ofertę. Duży czek albo nadanie z Estymą bywa warte więcej niż karta korzyści. Pamiętaj jednak, że przyjęcie oznacza ZA dla obu ustaw — przesuwasz króla na torze.',
    voting:
      'Kluczowe pytanie: kto jest Twoim głównym rywalem? Jeśli król zbliża się na torze do Twojej Estymy — blokuj (głos PRZECIW, a jeśli ustawa upadnie: +1 Estymy). Jeśli wyprzedzają Cię inni magnaci — oferta króla może Cię wynieść nad nich. Weto zrywa cały sejm: król nie dostaje toru, ale kosztuje Cię dukaty i 3 posłów.',
    muster:
      'Zbrojenie ma sens, jeśli planujesz rokosz albo boisz się zamachu króla. Inaczej dukaty lepiej zachować — na koniec dają fundacje (4 d = 1 Estymy), a wojsko zjada żołd.',
    conflictDeclare:
      'Rokosz (raz na grę): wygrana = wygrywasz grę, jeśli masz największą siłę wśród rokoszan; przegrana = odpadasz. Twoi posłowie liczą się mocniej (3 = 1). Pozostali magnaci mogą się przyłączyć — albo bronić króla.',
    rokoszSides:
      'Przyłączenie się może dać Ci zwycięstwo, ale tylko jeśli będziesz najsilniejszy wśród rokoszan. Neutralność jest bezpieczna. Obrona króla kosztuje 1 Estymę, ale osłabia rywala.',
    conflictCommit:
      'Zaangażuj tyle, ile trzeba — połowę zaangażowanych chorągwi, dukaty i karty (razem z ich Estymą) stracisz niezależnie od wyniku.',
  },
};

export const KING_GUIDE = {
  goal: 'Po 6. sejmie Twoje pole na torze absolutyzmu musi być wyższe niż najwyższa Estyma któregokolwiek magnata (remis wygrywa magnat). Albo — od 3. sejmu — wygrany zamach.',
  how: [
    'Tor rośnie za przyjęte ustawy (liczba na karcie) i +1 za każdy niezerwany sejm.',
    'Sam ustaw nie przegłosujesz — Twoi posłowie zawsze głosują ZA, ale magnaci mają ich więcej. Ustawa przechodzi, gdy ZA > PRZECIW + OPÓR.',
    'Głosy kupujesz ofertami: przed każdym magnatem kładziesz nadanie i czek. Magnat dostaje je tylko, jeśli zagłosuje ZA dla obu ustaw.',
  ],
  dilemma:
    'Wszystko, co dajesz magnatom, podnosi ich Estymę: nadania wprost, dukaty przez fundacje (4 d = 1). Płacisz punktami przeciwników za swoje punkty. Dlatego płać tym, których głosy są niezbędne i którzy są w tyle — a liderowi Estymy dawaj mało, nawet jeśli wtedy zagłosuje przeciw.',
  tips: [
    'Policz posłów — w ofertach widzisz, ile głosów magnatów potrzebujesz. Przekup tylu, ilu trzeba, nie wszystkich.',
    'Duże czeki dla rodów z wieloma posłami, zero dla tych, których głos niczego nie zmieni.',
    'Nie wystawiaj czeków ponad skarb — czek bez pokrycia kosztuje cały zysk toru z sejmu i 3 pola.',
    'Porażka też coś daje: za każdą upadłą ustawę bierzesz posła z puli. Twoje stronnictwo rośnie, a progi 22 / 28 / 34 dają chorągwie.',
    'Weto magnata zrywa sejm: ustawy przepadają, nie dostajesz +1 za sejm. Bogaci magnaci są groźniejsi — weto kosztuje 5 d i drożeje z każdym kolejnym w epoce.',
    'Chorągwie trzymaj w takiej liczbie, by rokosz był dla magnatów zbyt ryzykowny. Złote pola toru (co 5) dają dodatkowe nadania.',
  ],
};

export const MAGNATE_GUIDE = {
  goal: 'Na koniec gry mieć najwyższą Estymę spośród magnatów i wyższą niż pole króla na torze (remis wygrywa magnat). Albo — od 3. sejmu — wygrany rokosz.',
  how: [
    'Co sejm wybierasz: PRZYJĄĆ ofertę króla (ZA dla obu ustaw) albo ją ODRZUCIĆ (choć raz PRZECIW).',
    'Przyjęcie: dostajesz nadanie i czek, odrzucasz kartę korzyści — ale pomagasz królowi na torze.',
    'Odrzucenie: zagrywasz kartę korzyści; jeśli ustawa, przeciw której głosowałeś, upadnie — premia za blokadę: +1 Estymy (oddajesz 1 posła królowi).',
  ],
  dilemma:
    'Masz dwóch rywali naraz: króla i pozostałych magnatów. Blokowanie króla pomaga wszystkim magnatom, a przyjęcie oferty pomaga tylko Tobie. Obserwuj tor: dopóki król jest daleko za liderem Estymy, opłaca się brać oferty; gdy się zbliża — czas blokować.',
  tips: [
    'Estyma to punkty: znaczniki, karty, nadania i fundacje (niewydane dukaty, 4 d = 1).',
    'Chorągwie nie dają punktów — zbrój się, jeśli planujesz rokosz albo boisz się zamachu.',
    'Weto zrywa cały sejm (5 d, +2 za każde wcześniejsze w epoce, oddajesz 3 posłów). Używaj, gdy ustawy dałyby królowi dużo toru.',
    'Karty szlachty podnoszą Estymę, obcego dworu dają wojsko kosztem Estymy, mieszane — wojsko i dukaty.',
    'W rokoszu Twoi posłowie liczą się mocniej (3 = 1 zamiast 5 = 1).',
  ],
};
