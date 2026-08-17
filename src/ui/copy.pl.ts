// Every user-visible Polish string of the showroom lives in this file.
// No other file contains a Polish string literal.

const number = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });
const unknownFact = "Brak potwierdzonych danych";

export const copy = {
  showroomTitle: "Wirtualny salon samochodów",
  unknownFact,
  unconfirmedFact: "Dane niepotwierdzone",
  confirmedAbsent: "Potwierdzony brak",
  unconfirmedValue: (value: string) => `${value} · dane niepotwierdzone`,
  modelCounter: (position: number, total: number) => `${position} z ${total}`,
  previousModel: "Poprzedni model",
  nextModel: "Następny model",
  versions: "Wersje",
  selectVersion: (name: string) => `Wybierz wersję ${name}`,
  previewImage: (name: string) => `${name}. Zdjęcie poglądowe`,
  previewLabel: "Zdjęcie poglądowe",
  power: "Moc",
  consumption: "Spalanie",
  dimensions: "Wymiary",
  weight: "Masa",
  cabinNoise: "Hałas w kabinie",
  showroomSummary: "Podsumowanie oferty i ochrony",
  offer: "Oferta",
  manufacturerWarranty: "Gwarancja producenta",
  warrantyExtension: "Rozszerzenie gwarancji",
  nonStopWarranty: "Formuła Non Stop",
  offers: "Oferty",
  financing: "Finansowanie",
  warranty: "Gwarancja",
  more: "Więcej",
  back: "Wróć",
  selectedVersion: "Wybrana wersja",
  availableOffer: "Oferta dostępna",
  pendingOffer: "Oferta oczekuje na potwierdzenie",
  noOffer: "Brak oferty",
  noConfirmedPrice: "Brak potwierdzonej ceny",
  price: "Cena",
  specialPrice: "Cena specjalna",
  catalogPrice: "Cena katalogowa",
  configurationPrice: "Cena konfiguracji",
  priceBeforeDiscount: "Cena przed rabatem",
  discount: "Rabat",
  priceAfterDiscount: "Cena po rabacie",
  availableFinancing: "Finansowanie dostępne",
  pendingFinancing: "Finansowanie oczekuje na potwierdzenie",
  noFinancing: "Brak oferty finansowania",
  noFinancingTerms: "Brak potwierdzonych warunków finansowania",
  financingVariant: (position: number) => `Wariant ${position}`,
  basePrice: "Cena bazowa",
  duration: "Okres",
  initialPayment: "Wpłata początkowa",
  installment: "Rata",
  nominalInterestRate: "Oprocentowanie nominalne",
  annualPercentageRate: "RRSO",
  baseWarranty: "Gwarancja podstawowa",
  warrantyExtensions: "Rozszerzenia gwarancji",
  noBaseWarranty: "Brak potwierdzonej gwarancji podstawowej",
  noWarrantyExtensions: "Brak potwierdzonych rozszerzeń gwarancji",
  distanceLimit: "Limit przebiegu",
  warrantyTerms: "Warunki",
  noMileageLimit: "Bez limitu kilometrów",
  youtube: "YouTube",
  technicalData: "Dane techniczne",
  noYoutube: "Brak materiałów YouTube",
  noTechnicalData: "Brak materiałów technicznych",
  sourceUnavailable: "Brak potwierdzonego źródła",
  source: (label: string, accessedAt: string) =>
    `Źródło: ${label} · dostęp: ${accessedAt}`,
  pln: (value: number) => `${number.format(value)} zł`,
  percent: (value: number) => `${number.format(value)}%`,
  months: (value: number) => `${number.format(value)} mies.`,
  years: (value: number) => `${number.format(value)} lat`,
  summaryYears: (value: number) => {
    const integer = Math.abs(value);
    const lastTwoDigits = integer % 100;
    const lastDigit = integer % 10;
    const unit =
      value === 1
        ? "rok"
        : lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
          ? "lata"
          : "lat";
    return `${number.format(value)} ${unit}`;
  },
  upToEither: (duration: string, distance: string) => `do ${duration} lub ${distance}`,
  kilometers: (value: number) => `${number.format(value)} km`,
  fuelLabels: {
    petrol: "benzyna",
    lpg: "LPG",
    hybrid: "hybryda",
    electric: "napęd elektryczny",
    unknown: unknownFact,
  },
} as const;
