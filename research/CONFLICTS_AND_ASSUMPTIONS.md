# Konflikty, założenia i zasady scalania

## Zasada nadrzędna

1. **Konkretna oferta / VIN / ID konfiguracji** ma pierwszeństwo dla ceny, wyposażenia, koloru i danych homologacyjnych podanych w tym dokumencie.
2. Dane producenta z internetu uzupełniają tylko pola brakujące. Muszą zachować `status`, rynek i datę dostępu.
3. Dane z innego rynku lub porównywalnego egzemplarza nie mogą zostać bez ostrzeżenia zapisane jako właściwość konkretnego VIN.
4. Sprzeczne oficjalne wartości pozostają w danych jako konflikt; nie są arbitralnie „naprawiane”.

## Wykryte konflikty

### Volkswagen T-Cross

- Symulacja 6177859 dotyczy T-Cross Life za 106 000 zł, a nie dokładnie Life Plus z informacji handlowej za 129 290 zł. Nie wolno automatycznie łączyć tych dokumentów jako jednej konfiguracji.

### Peugeot 2008

- W tabeli technicznej oferty pole „Emisja CO₂” zawiera 4,9 — to wartość zużycia paliwa, nie g/km. Za właściwą wartość exact przyjęto 111 g/km z nagłówka.
- Aktualna strona modelu podaje około 4304 × 1815 × 1523/1550 mm, podczas gdy konkretna oferta podaje 4300 × 1770 × 1550 mm. W kodzie należy zachować obie wartości z zakresem pochodzenia, nie nadpisywać danych konfiguracji wartością ogólnomodelową.

### Peugeot 208

- W tabeli technicznej oferty fazy WLTP mają wartości 0, a pole „Emisja CO₂” ma 4,5. Za exact przyjęto 4,5 l/100 km i 102 g/km z nagłówka, a błędne pola zachowano jako konflikt.
- Parametry masy, prędkości i uciągu pochodzą z porównywalnego egzemplarza w oficjalnym sklepie Peugeot, nie z VIN oferty. Muszą pozostać oznaczone jako comparable-stock.

### Hyundai Inster

- Oficjalne materiały podają różne minimalne pojemności bagażnika (238 l lub 280 l), ponieważ zależy ona od metodologii i położenia przesuwanych siedzeń. Wartość 351 l jest podawana przy maksymalnym przesunięciu siedzeń.

### Hyundai Bayon

- Oferta polska nie podaje osiągów ani WLTP. Uzupełnienia techniczne 90 PS 7DCT pochodzą z bieżącej oficjalnej specyfikacji rynku UK i mogą różnić się homologacją, oponami lub wyposażeniem od auta w Polsce.

### Hyundai i20

- Niektóre ogólne podstrony Hyundai nadal zawierają wcześniejsze informacje o mocy 100 KM; dla oferty MY/PY2026 przyjęto tabelę 90 KM 7DCT z aktualnej podstrony wyposażenia oraz exact nazwę z PDF.

### Škoda Fabia

- Symulacja 6174608 używa ceny 92 700 zł, podczas gdy konfiguracja CKL9JCZW pokazuje 101 550 zł. To może być cena po rabacie, ale dokumenty nie zawierają jednoznacznego identyfikatora łączącego kalkulację z niebieską konfiguracją; relacja ma status likely, nie exact.

### Toyota Yaris

- Dealerowa cena 107 920 zł jest niższa od komunikowanej ceny katalogowej Style od 112 900 zł dla MY2026; exact cena z dokumentu ma pierwszeństwo w analizie konkretnej oferty.
- Dwie oficjalne publikacje Toyota podają bagażnik 286 l i 296 l. Bez świadectwa homologacji konkretnego VIN nie należy arbitralnie usuwać jednej wartości.
- Forest Green wynika z nazwy załączonego pliku, nie z tekstu samej kalkulacji; kolor jest jednak dostępny w aktualnym konfiguratorze.

## Relacje dokumentów finansowych

- `exact`: ten sam pojazd/identyfikator lub jednoznaczne dopasowanie.
- `exact-by-model-and-price`: ten sam model i cena, lecz bez wspólnego unikalnego ID.
- `likely`: prawdopodobna relacja, ale istnieje rozbieżność ceny lub brak identyfikatora.
- `not-exact`: kalkulacja dotyczy innej wersji/konfiguracji.
- `unknown-vehicle`: kalkulacja nie wskazuje modelu pojazdu.
