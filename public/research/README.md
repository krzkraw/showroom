# Uzupełnienia internetowe do ofert samochodowych

Ta warstwa została dodana **2026-08-17**. Oryginalne pliki Markdown i obrazy 98 stron PDF pozostają bez zmian.

## Co dodano

- 10 dossier modelowych obejmujących 11 konfiguracji handlowych;
- brakujące dane techniczne z oficjalnych stron producentów;
- jawne oznaczenie zakresu pochodzenia każdego pola (`exact`, `model-level`, `other-market`, `comparable-stock`, `derived`);
- listy wyposażenia, gwarancji, nadal brakujących pól oraz konfliktów;
- ujednolicone scenariusze finansowania w Markdown, CSV i JSON;
- macierz porównawcza konfiguracji do wykorzystania przed zmianami w kodzie;
- pełne pliki `vehicles.json` i `comparison_matrix.csv` używane przez aktualizację showroomu;
- historyczne warianty `vehicles_redacted.json` i `comparison_matrix_redacted.csv`;
- lokalne podglądy ofert oraz oficjalne linki do galerii i obrazów;
- skróty `.url`, dzięki którym strony źródłowe można otworzyć bez kopiowania adresów.

## Zdjęcia

W paczce są **offline** rendery pochodzące z dostarczonych ofert. Oficjalnych plików fotograficznych z internetu nie redystrybuowano: mogą podlegać licencjom producentów, a ponadto są zwykle poglądowe. Zamiast tego zachowano bezpośrednie oficjalne URL-e, stronę `galleries/index.html` oraz skróty `.url`. HTML wyświetli zdjęcia po uzyskaniu dostępu do internetu.

## Zacznij tutaj

1. [Indeks uzupełnień](INDEX.md)
2. [Konflikty i założenia](CONFLICTS_AND_ASSUMPTIONS.md)
3. [Macierz kompletności](GAP_MATRIX.md)
4. [Słownik danych](DATA_DICTIONARY.md)
5. [Zakres danych źródłowych](PRIVACY_AND_REPOSITORY_USE.md)
6. `data/comparison_matrix.csv` oraz `data/vehicles.json`
7. Warianty historyczne: `data/comparison_matrix_redacted.csv` oraz `data/vehicles_redacted.json`

## Ograniczenia

- Strony producentów mogą zmienić treść po dacie badania.
- Zdjęcia internetowe nie gwarantują zgodności koloru, felg, tapicerki i wyposażenia.
- Nie wszystkie brakujące pola udało się znaleźć w źródłach oficjalnych; pozostają jawnie oznaczone jako `not-found`.
- Pełne, wiążące dane konkretnego auta wynikają z umowy sprzedaży, VIN i świadectwa homologacji.
