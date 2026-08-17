# Raport aktualizacji showroomu — 2026-08-17

## Podstawa

- Repozytorium: `krzkraw/showroom`.
- Bazowy commit: `0cf8be623ad411d50ab10d1e7f8d0ea62d9850ac`.
- Bazowe drzewo: `1e23fb4a2f5fb51c61b78c881f615e7538d63fee`.
- Katalog danych: schemat `2.0`.
- Ścieżka GitHub Pages: `/showroom/`.

## Zainstalowane dane

Katalog zawiera 14 pojazdów, 11 ofert i 18 scenariuszy finansowania.

Dziesięć modeli ma aktualne oferty. Citroën C3 pozostaje porównaniem bez oferty. Trzy modele mają status archiwalny.

Dwanaście scenariuszy finansowania przypisano do pojazdów. Sześć scenariuszy VeloBank pozostaje bez przypisania.

Model danych przechowuje ceny, rabaty, elementy ceny, wyposażenie, osiągi, efektywność, wymiary, gwarancje i konflikty.

## Zainstalowane źródła

- 18 pełnych dokumentów Markdown w `public/documents/offers/`.
- 98 obrazów stron w `public/documents/offers/assets/`.
- 10 pełnych dossier w `public/documents/dossiers/`.
- Pełne dane i notatki w `public/research/`.
- 25 lokalnych obrazów i fallbacków w `public/cars/`.
- 16 zdalnych adresów galerii zachowanych jako metadane.

Dokumenty źródłowe nie są anonimizowane. Zachowują dostarczone dane osób, dealerów, ofert, konfiguracji i pojazdów.

Surowych PDF-ów nie opublikowano. W materiale wejściowym brakował PDF dla `02-gov-26-286981.md`.

Pełny Markdown i obrazy 12 stron dokumentu Volkswagena zachowano.

## Mapowanie źródeł

- `oferty_markdown_komplet/[0-9][0-9]-*.md` → `public/documents/offers/`.
- `oferty_markdown_komplet/assets/` → `public/documents/offers/assets/`.
- `oferty_markdown_komplet/research/vehicles/` → `public/documents/dossiers/`.
- Pozostały katalog `research/` → `public/research/`.
- Kanoniczne obrazy aplikacji → `public/cars/`.

W dossier zmieniono tylko względne ścieżki do dokumentów, podglądów i skrótów URL.

## Zachowane konflikty

- Finansowanie T-Crossa dotyczy innej wersji i ceny niż główna oferta.
- Finansowanie niebieskiej Fabii używa ceny `92 700 PLN`, a konfiguracja pokazuje `101 550 PLN`.
- Źródła Toyoty podają bagażnik `286 l` albo `296 l`.
- Dane bagażnika Instera zależą od pozycji siedzeń i metodologii.
- Źródła Bayona podają różne wartości prześwitu.
- Pomiary hałasu zachowują status proxy, gdy nie dotyczą dokładnej wersji.

## Weryfikacja

Sprawdzenia obejmują liczności, ścieżki katalogu, lokalne linki Markdown, rozmiary i sumy SHA-256.

Uruchomiono także `node scripts/validate-data.mjs`.

Nie uruchamiano szerokiej bramki akceptacyjnej, publikacji, commita ani wdrożenia.
