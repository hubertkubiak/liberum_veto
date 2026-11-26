# Liberum veto — symulacja w przeglądarce

Prezentacyjna wersja gry planszowej *Liberum veto* (instrukcja v0.4): wybierasz rolę — króla albo jeden z rodów
magnackich — a pozostałe miejsca przy stole zajmują boty. Szczegóły projektu: [SPEC.md](SPEC.md).

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # symulacje 200 pełnych gier botów
npm run build      # statyczny build w dist/ (do wrzucenia np. na GitHub Pages)
```

> Windows: uruchamiaj `npm test` z PowerShella w ścieżce zaczynającej się od wielkiego `C:\` —
> Vitest gubi się, gdy katalog roboczy ma małą literę dysku (`c:\`).

## Wskazówki do prezentacji

- **Tryb pokazowy** (same boty) + **Auto** — gra toczy się sama; „Odsłoń tajemnice” pokazuje ręce, oferty i Estymę.
- `?seed=2` w adresie daje powtarzalną partię (np. `?seed=2` przy 5 graczach kończy się rokoszem po 3. sejmie).
- **Zasady** w górnym pasku — streszczenie reguł i opis bieżącego kroku.

## Struktura

- `src/engine` — silnik gry (czysty TypeScript, deterministyczny RNG)
- `src/ai` — boty króla i magnatów
- `src/art` — ilustracje SVG (herby, karty, ikony)
- `src/ui` — komponenty React
