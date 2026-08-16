// Every user-visible Polish string of the showroom lives in this file.
// No other file contains a Polish string literal.

export const copy = {
  unknownFact: "Brak potwierdzonych danych",
  modelCounter: (position: number, total: number) => `${position} z ${total}`,
  previousModel: "Poprzedni model",
  nextModel: "Następny model",
  versions: "Wersje",
  modelYear: "Rocznik",
  powertrain: "Napęd",
  powerHp: "Moc (KM)",
  gearbox: "Skrzynia biegów",
} as const;
