# Liberum Veto — specyfikacja aplikacji

Przeglądarkowa symulacja gry planszowej *Liberum veto* (instrukcja: `Liberum veto – instrukcja.pdf`, wersja robocza 0.4).
Cel: **pokazać grę osobie postronnej** — użytkownik wybiera rolę (król albo jeden z rodów magnackich), pozostałe
miejsca zajmują boty, a rozgrywka toczy się krok po kroku z czytelną kroniką wydarzeń i atrakcyjną oprawą.

## 1. Technologia

| Warstwa | Wybór | Dlaczego |
|---|---|---|
| Aplikacja | **React 19 + TypeScript + Vite** | Jedna osoba gra z botami — cały stan żyje w przeglądarce, backend nic nie wnosi. Statyczny build (`dist/`) można wrzucić na GitHub Pages / Netlify i wysłać link. |
| Silnik gry | czysty TypeScript (`src/engine`) | Niezależny od UI, deterministyczny (ziarno RNG), testowalny. Łatwo go później przenieść na serwer, gdyby powstał tryb wieloosobowy. |
| Testy | **Vitest** | Symulacje setek pełnych gier bot-vs-bot (brak wyjątków, zachowanie 100 posłów, rozkład zwycięzców). |
| Grafika | ręcznie rysowane **SVG** jako komponenty React | Herby rodów, emblematy na kartach (korona, buława, chorągiew, dukat, orły obcych dworów...). Skalują się, nie wymagają zewnętrznych plików. |
| Czcionki | Alegreya / Alegreya Sans (`@fontsource`) | Ten sam krój co w instrukcji, polskie znaki, działa offline. |

Brak backendu. Jeśli kiedyś potrzebny będzie tryb sieciowy — silnik da się uruchomić w Node.js (Express + WebSocket) bez zmian.

## 2. Tryby i role

- Liczba graczy: **4** (król + 3 rody, losowy ród odpada) lub **5** (król + 4 rody).
- Rola człowieka: Król, Radziwiłłowie, Potoccy, Czartoryscy, Lubomirscy — albo **Tryb pokazowy** (same boty, człowiek tylko ogląda).
- Przełącznik **„Odsłoń tajemnice”**: pokazuje ukryte informacje (ręce, oferty, dukaty, Estymę) — przydatne przy prezentacji.
- Tempo: przycisk **Dalej** po każdym kroku albo **autoodtwarzanie**.

## 3. Zasady zaimplementowane (skrót instrukcji)

- 100 posłów: król 15, magnaci 20 (4 graczy) / 15 (5 graczy), pula 25. Suma zawsze 100 (test).
- Król: 15 dukatów, 6 chorągwi, czeki 0–10 (każda wartość raz na sejm), 4 karty „brak nadania”, 4 nadania na ręce, tor 0.
- Rody: Radziwiłłowie 4 ch / 10 d (zaciąg 3 d = 2 ch), Potoccy 3 ch / 8 d (+3 głosy przy ustawach ⚔),
  Czartoryscy 1 ch / 7 d (raz na sejm podgląd cudzej oferty), Lubomirscy 2 ch / 6 d (weto 2 d taniej). Każdy 3 Estymy startowe.
- 6 sejmów w 3 epokach. Sejm = 8 kroków: dochód i poselstwo → porządek obrad (3 → 2) → draft (1. sejm epoki) →
  oferty → negocjacje → głosowanie i weto → rozliczenie → zaciąg. Od 3. sejmu: rokosz / zamach.
- Głosowanie: `ZA > PRZECIW + min(OPÓR, pula)`; remis = upada. Ani razu przeciw = przyjęcie oferty.
- Przyjęcie oferty: nadanie jawnie, dukaty z czeku, odrzucenie karty korzyści. Odrzucenie: zagranie karty korzyści.
- Weto: 5 d + 2 za każde wcześniejsze weto w epoce (Lubomirscy −2), 3 posłów do puli, obie ustawy upadają,
  król bierze 1 posła z puli za każdą zerwaną ustawę i nie dostaje pola za niezerwany sejm, +1 Estymy za weto przeciw ustawie z oporem ≥ 12.
- Rozliczenie w 6 krokach (ustawy przyjęte, upadłe, premia za blokadę, oferty, niezerwany sejm, progi 22/28/34 posłów).
- Czek bez pokrycia: król oddaje skarb, brak → Estyma magnata (4 d = 1), król traci pola zdobyte w tym sejmie i jeszcze 3.
- Koniec epoki: żołd (magnat 1 d / 2 ch w górę, król 1 d / 3 ch), przepadają karty z ręki.
- Rokosz (po sejmach 3–5, raz na grę) i zamach (po sejmach 3–6): tajne zaangażowanie, siła, 1k6 vs 1k6, straty.
- Wynik: magnat = 3 + znaczniki + Estyma kart + Estyma nadań + fundacje (dukaty i rezerwy / 4); król = tor; remis → magnat.

### Uproszczenia i doprecyzowania (do przedyskutowania przy prototypie)

1. Karta korzyści do zagrania/odrzucenia wybierana jest razem z głosami (w grze fizycznej — w rozliczeniu).
2. Gdy weto zgłosi kilku magnatów, każdy płaci i oddaje posłów (koszt rośnie dla kolejnych w kolejności stołu).
3. Ukryte chorągwie „tylko w obronie” liczą się, gdy magnat broni się (zamach) lub broni króla (rokosz).
4. Negocjacje są deklaratywne: gracze wygłaszają (niewiążące) zapowiedzi wybrane z listy; boty też blefują.
5. Rokosz rozpatrywany jest przed zamachem; po rokoszu w tym samym oknie nie ma zamachu.
6. Po rokoszu remis sił rokoszan: wyżej inicjator, potem kolejność stołu.
7. Gdy sejm zostanie zerwany, magnat, który głosował „ani razu przeciw”, zagrywa wskazaną kartę (tę, którą chciał odrzucić);
   pozostali zagrywają kartę wskazaną przy głosowaniu.
8. Czek bez pokrycia: brakująca kwota zamieniana jest na Estymę z zaokrągleniem w górę.
9. Balans botów (200 symulacji): król wygrywa ok. 38% gier, rokosz pojawia się w ok. 20% gier, zamach sporadycznie.

## 4. Zawartość talii (zaprojektowana — w instrukcji brak pełnych list)

### Ustawy

| Kod | Nazwa | Znak | Opór | Tor | Od razu | Dyrektywa |
|---|---|---|---|---|---|---|
| I.1 | Elekcja vivente rege | | 18 | +4 | król +2 posłów z puli | król dobiera +1 nadanie co sejm |
| I.2 | Wojska saskie | ⚔ | 10 | +2 | król +4 chorągwie | zaciąg króla 1 d = 1 ch |
| I.3 | Stały komput | ⚔ | 6 | +1 | król +2 chorągwie | żołd króla 1 d za każde 4 ch |
| I.4 | Podatek podymny | ⛁ | 8 | +2 | król +5 dukatów | dochód króla +1 |
| I.5 | Trybunał Skarbowy | ⛁ | 12 | +2 | każdy magnat płaci 2 d do banku | weto droższe o 1 d |
| II.1 | Komisja Skarbu | ⛁ | 10 | +3 | król +6 dukatów | dochód króla +2 |
| II.2 | Komisja Wojskowa | ⚔ | 12 | +3 | król +3 chorągwie | Potoccy tracą +3 głosy |
| II.3 | Szkoła Rycerska | ⚔ | 8 | +2 | król dobiera 1 nadanie | zaciąg króla 3 d = 2 ch |
| II.4 | Prawo o miastach | | 11 | +3 | król +2 posłów z puli | upadła ustawa daje królowi 2 posłów |
| II.5 | Ograniczenie liberum veto | | 14 | +4 | — | weto droższe o 3 d |
| II.6 | Cło generalne | ⛁ | 9 | +2 | król +4 dukaty | dochód króla +1 |
| III.1 | Ustawa Rządowa | | 20 | +6 | — | weto zniesione |
| III.2 | Aukcja wojska | ⚔ | 15 | +4 | król +6 chorągwi | — |
| III.3 | Ofiara dziesiątego grosza | ⛁ | 13 | +4 | każdy magnat oddaje królowi do 3 d | — |
| III.4 | Prawo o sejmikach | | 12 | +3 | król +3 posłów z puli | opór kolejnych ustaw −2 |
| III.5 | Straż Praw | | 14 | +4 | — | król dobiera +1 nadanie co sejm |
| III.6 | Sukcesja tronu | | 18 | +5 | — | tor ÷ 2 (zamiast ÷ 3) w starciu |

### Poselstwa (10, jedno na sejm)
Poselstwo rosyjskie (opór +3) · Traktat pokojowy (zakaz zaciągu) · Poselstwo francuskie (każdy magnat +2 d) ·
Poselstwo pruskie (weto tańsze o 2 d) · Nuncjusz papieski (weto droższe o 2 d) · Najazd tatarski (ustawy ⚔ opór −4) ·
Nieurodzaj (król bez dochodu) · Poselstwo austriackie (król +1 nadanie) · Sejmiki gardłują (ustawy ⛁ opór +4) ·
Poselstwo tureckie (każdy +1 chorągiew za darmo).

### Nadania (30)
Buława wielka ×2 (+2 posłów, +2 ch, +1 E, +2 siły w starciu) · Buława polna ×3 (+2 posłów, +2 ch) ·
Pieczęć kanclerska ×2 (+3 posłów, +1 E) · Podskarbiostwo ×2 (+2 posłów, +3 d) · Województwo ×5 (+2 posłów, +1 E) ·
Kasztelania ×5 (+1 poseł, +1 E) · Starostwo ×7 (+2 posłów, +1 ch) · Order Orła Białego ×4 (+2 E).

### Karty korzyści (36)
- **Obcy dwór** ×12 (Rosja, Prusy, Austria, Francja, Saksonia, Porta): +3…+5 ukrytych chorągwi, −1…−2 Estymy, czasem rezerwa dukatów.
- **Szlachta** ×12: +1…+2 Estymy, 0…+1 chorągwi lub +3 chorągwie tylko w obronie.
- **Mieszana** ×12: +1…+3 chorągwie i rezerwa 2…5 dukatów (do fundacji i szybkiego zaciągu).

## 5. Boty

Heurystyki z elementem losowości („charakter” bota: chciwość, odwaga):
- **Król**: wybiera ustawy wg `tor − szansa porażki`, rozdziela nadania i czeki tak, by kupić „języczek u wagi”, nigdy nie
  wystawia czeków bez pokrycia, zbroi się przed zamachem, ogłasza zamach przy dużej przewadze.
- **Magnat**: porównuje wartość oferty (czek, nadanie, pozbycie się słabej karty) z wartością blokady (premia, hamowanie
  toru króla względem własnej Estymy); liczy, że inni zablokują (gapowicz); czasem wetuje; rzadko ogłasza rokosz.
- Negocjacje: boty wygłaszają zapowiedzi, które z pewnym prawdopodobieństwem są blefem.

## 6. Interfejs

- **Ekran startowy**: tytuł z ilustracją, wybór liczby graczy, karty ról z herbami i opisem zdolności, tryb pokazowy.
- **Stół**: tor absolutyzmu (złote pola co 5), plansza sejmu (2 ustawy, poselstwo, pula posłów, dyrektywy),
  panele graczy (herb, posłowie, chorągwie, nadania jawnie, zagrane karty zakryte, ukryte zasoby za „zasłonką”),
  panel decyzji (kontekstowy dla bieżącego kroku), kronika po prawej, pasek 8 kroków sejmu.
- **Momenty dramatyczne**: odkrycie głosów (słupki ZA vs PRZECIW + OPÓR), odkrycie ofert (odwracanie kart), weto,
  rzut kośćmi w starciu, ekran końcowy z rankingiem.
- **Pomoc**: przycisk „Zasady” z krótkim streszczeniem i opisem bieżącego kroku.

## 7. Struktura kodu

```
src/
  engine/   types.ts, data.ts (talie), rng.ts, setup.ts, game.ts (maszyna stanów), rules.ts (głosowanie, siła, wynik)
  ai/       bots.ts
  art/      icons.tsx, heraldry.tsx, cardArt.tsx
  ui/       komponenty ekranów i paneli
  App.tsx, main.tsx, styles.css
tests/      engine.test.ts (symulacje)
```

## 8. Uruchomienie

```
npm install
npm run dev      # http://localhost:5173
npm test         # symulacje silnika
npm run build    # statyczny build w dist/
```
