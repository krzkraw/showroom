// Every user-visible Polish string of the showroom lives in this file.
// No other file contains a Polish string literal.

const unknownFact = "Brak potwierdzonych danych";

export const copy = {
  showroomTitle: "Wirtualny salon samochodów",
  unknownFact,
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
  fuelLabels: {
    petrol: "benzyna",
    lpg: "LPG",
    hybrid: "hybryda",
    electric: "napęd elektryczny",
    unknown: unknownFact,
  },
} as const;
