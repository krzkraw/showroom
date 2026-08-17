# Nałożenie pełnego pakietu na istniejący klon

Nie rozpakowuj całego checkpointu nad repozytorium.

Skopiuj tylko uzgodnione ścieżki kodu, danych i treści.

## Mapowanie treści

Skopiuj 25 obrazów z kanonicznego `public/cars/` do `public/cars/`.

Skopiuj 18 plików `oferty_markdown_komplet/[0-9][0-9]-*.md` do `public/documents/offers/`.

Skopiuj `oferty_markdown_komplet/assets/` do `public/documents/offers/assets/`.

Nie używaj zanonimizowanych dokumentów z kandydata publicznego.

Skopiuj 10 plików `research/vehicles/*.md` do `public/documents/dossiers/`.

Zmień ich odnośniki `../../NN-*.md` na `../offers/NN-*.md`.

Zmień odnośniki do podglądów na `../../research/images/`.

Zmień odnośniki do skrótów na `../../research/url_shortcuts/`.

Skopiuj pozostałe pełne dane i notatki `research/` do `public/research/`.

Nie kopiuj surowych PDF-ów. Jeden z 18 PDF-ów nie występuje w materiale wejściowym.

## Sprawdzenie

Uruchom:

```sh
node scripts/validate-data.mjs
bun test
bun run typecheck
bun run build
bun run test:e2e
```

Sprawdź, czy `vite.config.ts` nadal ustawia `base: "/showroom/"`.

Sprawdź manifesty:

```sh
shasum -a 256 -c SHA256SUMS.txt
```

`FILE_MANIFEST.csv` i `SHA256SUMS.txt` opisują zainstalowany pakiet treści.
