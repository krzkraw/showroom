import { expect, test } from "bun:test";
import { Catalog } from "./showroom";

const raw = await Bun.file(new URL("../data/showroom.json", import.meta.url)).json();

function changed(change: (catalog: any) => void): unknown {
  const catalog = structuredClone(raw);
  change(catalog);
  return catalog;
}

test("parses the showroom catalog", () => {
  const catalog = Catalog.fromJSON(raw);
  expect(catalog.models.map((model) => model.id)).toEqual([
    "dacia-sandero-stepway",
    "renault-clio",
    "citroen-c3",
    "toyota-aygo-x",
    "toyota-yaris",
    "volkswagen-t-cross",
    "fiat-grande-panda",
    "hyundai-i20",
    "hyundai-bayon",
    "hyundai-inster",
    "peugeot-208",
    "peugeot-2008",
  ]);
  expect(catalog.models[0].versions[0].fuels.value).toEqual(["petrol", "lpg"]);
  expect(catalog.models[1].versions[0].gearbox.kind).toMatchObject({ value: null, status: "unknown" });
  expect(catalog.models[2].versions).toHaveLength(2);
  expect(catalog.models.slice(0, 3).map((model) => model.offers[0].state)).toEqual([
    "missing",
    "missing",
    "missing",
  ]);
  expect(catalog.models[9].versions[0]).toMatchObject({
    electricRangeKmWltp: { value: null },
    noiseMeasurementSpeedKph: { value: null },
  });
  expect(catalog.models[7].financing[0].variants[0]).toMatchObject({
    nominalInterestRate: { value: 7.79 },
    annualPercentageRate: { value: 11.06 },
  });
  expect(catalog.models[3].offers[0].summary.value).toBeString();
  expect(catalog.models[7].financing[0].summary.value).toBeString();
  expect(catalog.models[0].warranty.map((item) => item.kind.value)).toEqual(["base", "extension"]);
});

test("rejects broken catalog contracts", () => {
  expect(() =>
    Catalog.fromJSON(changed((catalog) => (catalog.models[0].brand.sourceRef = "missing"))),
  ).toThrow("unknown sourceRef");
  expect(() =>
    Catalog.fromJSON(changed((catalog) => (catalog.models[3].versions[0].fuels.value[0] = "steam"))),
  ).toThrow("expected one of");
  expect(() => Catalog.fromJSON(changed((catalog) => (catalog.schemaVersion = "2.0")))).toThrow(
    'expected "1.0"',
  );
  expect(() =>
    Catalog.fromJSON(changed((catalog) => (catalog.models[0].versions[0].timingDrive.value = "chain"))),
  ).toThrow("must be null when status is unknown");
});
