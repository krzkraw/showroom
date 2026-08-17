# Słownik danych

## Status pól

| Status | Znaczenie |
|---|---|
| `exact-offer` | wartość z dokumentu konkretnej oferty/konfiguracji |
| `exact-offer-cover` | wartość z nagłówka oferty; niższa tabela zawiera konflikt/błąd |
| `official-current-model` | bieżąca oficjalna wartość producenta dla modelu, bez gwarancji zgodności z VIN |
| `official-current-model-pl` | bieżąca oficjalna wartość dla rynku polskiego |
| `official-current-uk-variant` | bieżący wariant techniczny rynku UK; tylko uzupełnienie model-level |
| `official-comparable-stock` | porównywalny egzemplarz w oficjalnym sklepie producenta, nie ten sam VIN |
| `official-conflict` | oficjalne źródła są sprzeczne; pole przechowuje obie wartości |
| `derived-*` | wartość obliczona lub przeliczona; opis w `note` |
| `not-found` | brak wiarygodnej wartości w przeszukanych materiałach |
| `not-applicable` | pole nie dotyczy pojazdu |

## Najważniejsze pliki maszynowe

- `vehicles.json` — pełna struktura wraz z pochodzeniem każdego pola.
- `vehicles.csv` — jeden wiersz na model, uproszczone wartości do analizy.
- `comparison_matrix.csv` — jeden wiersz na konfigurację handlową; Fabia ma dwa wiersze.
- `vehicles_redacted.json` i `comparison_matrix_redacted.csv` — dodatkowe warianty historyczne bez VIN i identyfikatorów.
- `finance_scenarios.json/csv` — finansowanie niezależne od specyfikacji pojazdów.
- `sources.json/csv` — rejestr źródeł internetowych i lokalnych.
- `image_sources.json/csv` — oficjalne linki do obrazów i lokalne podglądy.

## Zasady dla zmian w kodzie

- Nie zamieniaj zakresów tekstowych (`"5.3–5.8"`) na pojedynczą liczbę bez jawnej reguły.
- Nie usuwaj `status`, `source_ids`, `note`, `conflicts` ani `unknown_fields`.
- Nie przypisuj kalkulacji finansowej do pojazdu, gdy `association` nie jest `exact` lub `exact-by-model-and-price`.
- Dla porównań cen używaj `offer_variants[].price_pln`, a nie aktualnej ceny internetowej modelu.
- Aktualny showroom używa pełnych źródeł. Pliki `*_redacted.*` nie opisują publikowanego zakresu.
