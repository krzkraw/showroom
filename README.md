# Dane wirtualnego salonu

Plik `src/data/showroom.json` jest jedynym katalogiem danych. Katalog używa wersji schematu `1.0`.

Parser `src/domain/showroom.ts` sprawdza katalog przed użyciem. Nie wymaga biblioteki walidacyjnej.

## Schemat

Katalog zawiera rejestr `sources` oraz tablicę `models`. Każdy model zawiera:

- markę i nazwę modelu;
- wersje, napęd, paliwa, skrzynię biegów i dane techniczne;
- oferty i ich krótkie podsumowania;
- finansowanie i jego krótkie podsumowania;
- gwarancję podstawową oraz przedłużenia;
- odsyłacze do materiałów „Więcej”.

Każdy fakt ma pola `value`, `status` i `sourceRef`. Rejestr źródeł przechowuje datę `accessedAt`.

## Statusy faktów

- `verified` oznacza potwierdzenie w podanym źródle.
- `unverified` oznacza wartość pochodzącą ze źródła, która wymaga dalszego potwierdzenia.
- `unknown` oznacza brak potwierdzonej wartości. Taki fakt musi mieć `value: null`.

Status `unverified` może zawierać wartość lub `null`. `null` przy statusie `verified` może oznaczać potwierdzony brak limitu liczbowego.

## Źródła i daty

`sourceRef` wskazuje jeden wpis w `sources`. Parser odrzuca nieznane referencje.

Obsługiwane rodzaje źródeł to `official`, `dealer-email`, `independent`, `youtube` i `input`.

Źródła oficjalne, niezależne i YouTube wymagają adresu HTTPS. Zanonimizowane emaile oraz dane wejściowe nie mają adresu URL.

Data `accessedAt` opisuje dzień sprawdzenia źródła w formacie `YYYY-MM-DD`. Obecny katalog odzwierciedla stan ustaleń projektu z 2026-08-16.

## Prywatność

Katalog zawiera wyłącznie zanonimizowane fakty potrzebne do porównania ofert. Nie zawiera nazwisk, adresów email ani numerów telefonów.

Katalog nie zawiera identyfikatorów Gmail, nazw prywatnych załączników, surowych PDF-ów ani danych konkretnego sprzedawcy.

Przed publicznym push trzeba potwierdzić zakres publikacji dokładnych warunków finansowania.

## Stany ofert

- `missing` oznacza „Brak oferty”. Ten stan jest jawny dla Dacia, Renault i Citroën.
- `pending` oznacza zapowiedzianą ofertę, której jeszcze nie otrzymano.
- `available` oznacza otrzymaną ofertę lub dokument.

Brak ceny nie ukrywa oferty. Cena pozostaje `null`, jeśli dokument nie potwierdza kwoty.

## Finansowanie

`nominalInterestRate` przechowuje oprocentowanie nominalne. `annualPercentageRate` przechowuje RRSO.

RRSO obejmuje roczny całkowity koszt kredytu według zasad ustawowych. Nie jest tym samym co oprocentowanie nominalne.

W kalkulacjach Hyundai zapisano 7,79% jako oprocentowanie nominalne i 11,06% jako RRSO. Cena bazowa kalkulacji pozostaje oddzielna od ceny konfiguracji.

## Znane braki

- Automat Renault Eco-G 120 pozostaje `unknown`.
- Citroën Plus i Max pozostają w wymaganym zakresie. Oficjalna strona nie potwierdza obecnej wersji Max.
- Nie potwierdzono zasięgu elektrycznego Hyundai Inster.
- Nie znaleziono wiarygodnych pomiarów hałasu kabiny ani prędkości pomiaru.
- Nie potwierdzono rozrządów ani typów sprzęgieł wskazanych wersji.
- Nie zebrano pełnych wymiarów, mas, spalań i zasięgów.
- Nie potwierdzono dokładnej gwarancji Volkswagen ani oficjalnych warunków gwarancji Fiat.
- Cena Toyota Yaris oraz część warunków finansowania pozostają niepotwierdzone.

## Test

Uruchom parser i testy kontraktu:

```sh
bun test
```
