# Showroom ofert nowych aut

Statyczna aplikacja React i Vite porównuje konkretne oferty dealerskie oraz dane modeli z roczników 2025+.

Aktualizacja z 17 sierpnia 2026 r. instaluje katalog w schemacie `2.0` i pełny pakiet źródeł.

## Zakres katalogu

- 14 rekordów pojazdów.
- 10 modeli z aktualnymi ofertami.
- 11 konkretnych konfiguracji handlowych.
- 1 porównawczy Citroën C3 bez oferty dealerskiej.
- 3 rekordy archiwalne.
- 18 scenariuszy finansowania.
- 10 dossier technicznych.

Katalog rozdziela dane konkretnej oferty, dane modelowe, wartości wyliczone, proxy, konflikty i braki.

Finansowanie Volkswagena dotyczy innej wersji T-Crossa niż główna oferta.

Sześć kalkulacji VeloBank nie wskazuje pojazdu i pozostaje nieprzypisanych.

## Materiały źródłowe

`public/documents/offers/` zawiera 18 pełnych konwersji Markdown i obrazy wszystkich 98 stron.

Dokumenty nie są anonimizowane. Zachowują dostarczone nazwy, kontakty, identyfikatory ofert, konfiguracji, VIN-y i dane dealerów.

`public/research/` zawiera pełne dane, notatki, konflikty, źródła i lokalne podglądy researchu.

Wersje `*_redacted.*` pozostają jedynie dodatkowymi wariantami historycznymi. Aplikacja korzysta z pełnych źródeł.

Surowe pliki PDF nie są publikowane. Pakiet wejściowy zawierał 17 z 18 PDF-ów.

Brakującym plikiem jest PDF źródłowy dokumentu `02-gov-26-286981.md`. Pełny Markdown i obrazy 12 stron są dostępne.

## Galerie

`public/cars/` zawiera 25 lokalnych zdjęć i fallbacków wskazanych przez katalog.

Katalog przechowuje 16 zdalnych źródeł galerii wyłącznie jako metadane. Każde ma lokalny fallback.

## Uruchomienie i sprawdzenie

Zainstaluj zależności:

```sh
bun install
```

Uruchom sprawdzenia:

```sh
node scripts/validate-data.mjs
bun test
bun run typecheck
bun run build
bun run test:e2e
```

Uruchom serwer deweloperski:

```sh
bun run dev
```

Vite używa ścieżki bazowej `/showroom/` dla GitHub Pages.

## Ścieżki wykonawcze

- `src/main.tsx` uruchamia aplikację.
- `src/App.tsx` zawiera główny interfejs.
- `src/data/showroom.json` zawiera katalog w schemacie `2.0`.
- `src/types.ts` opisuje katalog.
- `scripts/validate-data.mjs` sprawdza dane, ścieżki i liczności.
- `public/cars/` zawiera lokalne obrazy galerii.
- `public/documents/offers/` zawiera pełne dokumenty i obrazy stron.
- `public/documents/dossiers/` zawiera dossier pojazdów.
- `public/research/` zawiera pełny pakiet researchu.
- `tests/e2e/showroom.e2e.ts` zawiera testy przeglądarkowe.

Szczegóły zmiany opisuje [`UPDATE_REPORT.md`](UPDATE_REPORT.md).
