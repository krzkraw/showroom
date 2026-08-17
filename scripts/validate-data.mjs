import { existsSync, readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

const catalog = JSON.parse(readFileSync(new URL("../src/data/showroom.json", import.meta.url), "utf8"));
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const same = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected);

const expectedVehicleIds = [
  "fiat-grande-panda-hybrid-la-prima",
  "volkswagen-t-cross-life-plus-116-dsg",
  "peugeot-2008-edition-hybrid-110",
  "peugeot-208-business-hybrid-110",
  "hyundai-inster-49kwh-pure",
  "hyundai-bayon-modern-90-7dct",
  "hyundai-i20-modern-90-7dct",
  "skoda-fabia-drive-115-dsg",
  "skoda-kamiq-drive-115-dsg",
  "toyota-yaris-style-hybrid-116",
  "citroen-c3-hybrid-110",
  "dacia-sandero-stepway",
  "renault-clio",
  "toyota-aygo-x",
];

const expectedOffers = new Map([
  ["fiat-152036209", ["fiat-grande-panda-hybrid-la-prima", 90212, 100800, 100800, 11088, 89712, "01-grande-panda-hybrid-la-prima.md", "152036209", "MARIMEX sp. z o.o. sp. k.", null, null, [100800, -11088, 500]]],
  ["vw-gov-26-286981", ["volkswagen-t-cross-life-plus-116-dsg", 129290, 120690, 129290, null, null, "02-gov-26-286981.md", "GOV-26-286981", null, "WVGZZZC19VY023240", "GOV-26-286981", [120690, 8600, 0]]],
  ["peugeot-189220", ["peugeot-2008-edition-hybrid-110", 108400, 102900, 108400, null, null, "04-oferta-2008-pan-krzysztof-krawczynski.md", "189220", "Auto Centrum GOLEMO", "VR3USHPX6TJ753669", "1PP1SYHJGWC05YH2", [102900, 5500]]],
  ["peugeot-189219", ["peugeot-208-business-hybrid-110", 87500, 97100, 97100, 9600, 87500, "05-oferta-208-pan-krzysztof-krawczynski.md", "189219", "Auto Centrum GOLEMO", null, "1PP2A5HJGWC0BUH2", [97100, 0, -9600]]],
  ["hyundai-26095544", ["hyundai-inster-49kwh-pure", 123300, 116900, 123300, null, null, "09-ha0520260814121921-00000026095544-1.md", null, "KOREA MOTORS KRAKÓW", null, "26095544", [116900, 2400, 4000]]],
  ["hyundai-26095581", ["hyundai-bayon-modern-90-7dct", 103600, 102200, 103600, null, null, "10-ha0520260814124843-00000026095581.md", null, "KOREA MOTORS KRAKÓW", null, "26095581", [102200, 1400]]],
  ["hyundai-26095574", ["hyundai-i20-modern-90-7dct", 99900, 97100, 99900, null, null, "11-ha0520260814124132-00000026095574.md", null, "KOREA MOTORS KRAKÓW", null, "26095574", [97100, 2800]]],
  ["skoda-fabia-green", ["skoda-fabia-drive-115-dsg", 91350, 93850, 100150, 8800, 91350, "12-skoda-fabia-poz-3.md", "GOC-26-376490", "InterAuto Kraków", "TMBER6PJ5T4088196", null, [93850, 3900, 2400, -8800]]],
  ["skoda-fabia-blue", ["skoda-fabia-drive-115-dsg", 101550, 93850, 101550, null, null, "14-skoda-fabia-92-700-poz-2.md", null, null, null, "CKL9JCZW", [93850, 2400, 3400, 1900]]],
  ["skoda-kamiq-silver", ["skoda-kamiq-drive-115-dsg", 108800, 118250, 121150, 12350, 108800, "13-skoda-kamiq-poz-3.md", "GOC-26-376491", "InterAuto Kraków", "TMBGR6NW7V3052025", null, [118250, 0, 2900, -12350]]],
  ["toyota-022777", ["toyota-yaris-style-hybrid-116", 107920, 112900, null, null, null, "18-toyota-yaris-forest-green-wersja-style.md", "KS/076/2026/8/K1NKS/022777", "ANWA sp. z o.o.", null, null, [107920]]],
]);

const expectedFinancing = new Map([
  ["vw-6177859-36", ["volkswagen-t-cross-life-plus-116-dsg", "not-exact", 106000, 42400, 36, 66691, 1953.89, 3.49, 3.55, 112740.04, 6740.04, "03-simulation-6177859.md"]],
  ["vw-6177859-48", ["volkswagen-t-cross-life-plus-116-dsg", "not-exact", 106000, 42400, 48, 67721, 1513.67, 3.49, 3.55, 115056.16, 9056.16, "03-simulation-6177859.md"]],
  ["skoda-fabia-blue-6174608-36", ["skoda-fabia-drive-115-dsg", "likely", 92700, 27810, 36, 68044, 1904.42, 0.49, 3.5, 96369.12, 3669.12, "15-simulation-6174608.md"]],
  ["skoda-fabia-blue-6174608-48", ["skoda-fabia-drive-115-dsg", "likely", 92700, 27810, 48, 69095, 1453.93, 0.49, 2.72, 97598.64, 4898.64, "15-simulation-6174608.md"]],
  ["skoda-fabia-green-6174634-36", ["skoda-fabia-drive-115-dsg", "exact-by-model-and-price", 91350, 27405, 36, 67053, 1862.58, 0, 3.03, 94457.88, 3107.88, "17-simulation-6174634.md"]],
  ["skoda-fabia-green-6174634-48", ["skoda-fabia-drive-115-dsg", "exact-by-model-and-price", 91350, 27405, 48, 68089, 1418.52, 0, 2.25, 95493.96, 4143.96, "17-simulation-6174634.md"]],
  ["skoda-kamiq-6174620-36", ["skoda-kamiq-drive-115-dsg", "exact-by-model-and-price", 108800, 32640, 36, 79861, 2218.36, 0, 2.53, 112500.96, 3700.96, "16-simulation-6174620.md"]],
  ["skoda-kamiq-6174620-48", ["skoda-kamiq-drive-115-dsg", "exact-by-model-and-price", 108800, 32640, 48, 81095, 1689.48, 0, 1.87, 113735.04, 4935.04, "16-simulation-6174620.md"]],
  ["toyota-022777-36-50k", ["toyota-yaris-style-hybrid-116", "exact", 107920, 50000, 36, 60526.4, 1938.8, 9.49, 13.2694, 119796.64, 11876.64, "18-toyota-yaris-forest-green-wersja-style.md"]],
  ["toyota-022777-36-30k", ["toyota-yaris-style-hybrid-116", "exact", 107920, 30000, 36, 81426.4, 2608.27, 9.49, 13.2694, 123897.73, 15977.73, "18-toyota-yaris-forest-green-wersja-style.md"]],
  ["toyota-022777-48-50k", ["toyota-yaris-style-hybrid-116", "exact", 107920, 50000, 48, 60526.4, 1534.99, 9.99, 13.0538, 123679.67, 15759.67, "18-toyota-yaris-forest-green-wersja-style.md"]],
  ["toyota-022777-48-30k", ["toyota-yaris-style-hybrid-116", "exact", 107920, 30000, 48, 81426.4, 2065.03, 9.99, 13.0535, 129121.66, 21201.66, "18-toyota-yaris-forest-green-wersja-style.md"]],
  ["velo-90000-promo", [null, "unknown-vehicle", 90000, 40000, 48, 50000, 1293.85, 7.79, 11.06, 102104.8, 12104.8, "08-kalkulacja48318-pdf-1opcja.md"]],
  ["velo-90000-nonpromo", [null, "unknown-vehicle", 90000, 40000, 48, 50000, 1341.22, 9.79, 13.8, 104378.56, 14378.56, "08-kalkulacja48318-pdf-1opcja.md"]],
  ["velo-82000-promo", [null, "unknown-vehicle", 82000, 40000, 48, 42000, 1086.83, 7.79, 11.06, 92167.84, 10167.84, "07-kalkulacja48318-1-pdf-2opcja.md"]],
  ["velo-82000-nonpromo", [null, "unknown-vehicle", 82000, 40000, 48, 42000, 1126.62, 9.79, 13.8, 94077.76, 12077.76, "07-kalkulacja48318-1-pdf-2opcja.md"]],
  ["velo-89900-promo", [null, "unknown-vehicle", 89900, 40000, 48, 49900, 1291.26, 7.79, 11.06, 101980.48, 12080.48, "06-kalkulacja48318-2-pdf-3opcja.md"]],
  ["velo-89900-nonpromo", [null, "unknown-vehicle", 89900, 40000, 48, 49900, 1338.54, 9.79, 13.8, 104249.92, 14349.92, "06-kalkulacja48318-2-pdf-3opcja.md"]],
]);

const expectedDocumentPaths = [
  "documents/offers/01-grande-panda-hybrid-la-prima.md",
  "documents/offers/02-gov-26-286981.md",
  "documents/offers/03-simulation-6177859.md",
  "documents/offers/04-oferta-2008-pan-krzysztof-krawczynski.md",
  "documents/offers/05-oferta-208-pan-krzysztof-krawczynski.md",
  "documents/offers/06-kalkulacja48318-2-pdf-3opcja.md",
  "documents/offers/07-kalkulacja48318-1-pdf-2opcja.md",
  "documents/offers/08-kalkulacja48318-pdf-1opcja.md",
  "documents/offers/09-ha0520260814121921-00000026095544-1.md",
  "documents/offers/10-ha0520260814124843-00000026095581.md",
  "documents/offers/11-ha0520260814124132-00000026095574.md",
  "documents/offers/12-skoda-fabia-poz-3.md",
  "documents/offers/13-skoda-kamiq-poz-3.md",
  "documents/offers/14-skoda-fabia-92-700-poz-2.md",
  "documents/offers/15-simulation-6174608.md",
  "documents/offers/16-simulation-6174620.md",
  "documents/offers/17-simulation-6174634.md",
  "documents/offers/18-toyota-yaris-forest-green-wersja-style.md",
].sort();

const expectedResearchPaths = [
  "research/INDEX.md",
  "research/GAP_MATRIX.md",
  "research/CONFLICTS_AND_ASSUMPTIONS.md",
  "research/FINANCING_OVERVIEW.md",
  "research/data/vehicles.json",
  "research/data/finance_scenarios.json",
].sort();

assert(catalog.schemaVersion === "2.0", "schemaVersion must be 2.0");
assert(Array.isArray(catalog.vehicles), "vehicles must be an array");
assert(Array.isArray(catalog.globalFinancingScenarios), "globalFinancingScenarios must be an array");
assert(Array.isArray(catalog.researchLinks), "researchLinks must be an array");

const vehicles = catalog.vehicles ?? [];
const vehicleIds = vehicles.map((vehicle) => vehicle.id);
assert(same(vehicleIds, expectedVehicleIds), "vehicle IDs or ordering differ from the canonical 14-vehicle catalog");
assert(new Set(vehicleIds).size === vehicleIds.length, "vehicle IDs must be unique");
assert(vehicles.filter((vehicle) => vehicle.category === "offer-2026").length === 10, "expected 10 offer-backed models");
assert(vehicles.filter((vehicle) => vehicle.category === "comparison-no-offer").length === 1, "expected one comparison-only model");
assert(vehicles.filter((vehicle) => vehicle.category === "archive-needs-research").length === 3, "expected three archive models");

const offers = [];
const financing = [];
const documentPaths = new Set();
const referencedPaths = new Set();

for (const vehicle of vehicles) {
  assert(typeof vehicle.id === "string" && vehicle.id.length > 0, "vehicle id missing");
  assert(Boolean(vehicle.make && vehicle.model && vehicle.trim), `${vehicle.id}: identity incomplete`);
  for (const key of ["offer_variants", "documents", "financing_scenarios", "conflicts", "unknown_fields", "gallery", "web_sources", "local_sources"]) {
    assert(Array.isArray(vehicle[key]), `${vehicle.id}: ${key} must be an array`);
  }
  validateVehicleSourceIds(vehicle);

  const localDocumentPaths = new Set();
  for (const document of vehicle.documents ?? []) {
    assert(typeof document.title === "string" && document.title.length > 0, `${vehicle.id}: document title missing`);
    assert(typeof document.path === "string" && document.path.length > 0, `${vehicle.id}: document path missing`);
    assert(!localDocumentPaths.has(document.path), `${vehicle.id}: duplicate document path ${document.path}`);
    localDocumentPaths.add(document.path);
    documentPaths.add(document.path);
    referencedPaths.add(document.path);
  }

  for (const offer of vehicle.offer_variants ?? []) {
    offers.push([vehicle.id, offer]);
    assert(localDocumentPaths.has(`documents/offers/${offer.source_file}`), `${offer.id}: source_file lacks matching document link`);
    const componentTotal = (offer.price_items ?? []).reduce((sum, item) => sum + item.price_pln, 0);
    assert(componentTotal === offer.price_pln, `${offer.id}: price components do not total price_pln`);
    if (offer.discount_pln != null) {
      assert(offer.price_items.some((item) => item.price_pln === -offer.discount_pln), `${offer.id}: discount lacks matching price item`);
    }
    if (offer.price_before_discount_pln != null && offer.price_after_discount_pln != null && offer.discount_pln != null) {
      assert(offer.price_before_discount_pln - offer.discount_pln === offer.price_after_discount_pln, `${offer.id}: discount arithmetic does not tie`);
    }
  }

  for (const scenario of vehicle.financing_scenarios ?? []) {
    assert(scenario.vehicle_id === vehicle.id, `${scenario.id}: assigned vehicle_id differs from owner`);
    financing.push(scenario);
  }

  for (const item of vehicle.gallery ?? []) {
    if (item.src && !/^https?:\/\//.test(item.src)) referencedPaths.add(item.src);
    if (item.fallback && !/^https?:\/\//.test(item.fallback)) referencedPaths.add(item.fallback);
  }
  if (vehicle.dossierPath) referencedPaths.add(vehicle.dossierPath);
  for (const source of vehicle.local_sources ?? []) referencedPaths.add(source.path);
}

assert(offers.length === 11, `expected 11 concrete offers, got ${offers.length}`);
assert(new Set(offers.map(([, offer]) => offer.id)).size === offers.length, "offer IDs must be unique");
for (const [vehicleId, offer] of offers) {
  const expected = expectedOffers.get(offer.id);
  assert(Boolean(expected), `unexpected offer ID: ${offer.id}`);
  const actual = [
    vehicleId,
    offer.price_pln ?? null,
    offer.catalog_price_pln ?? null,
    offer.configuration_price_pln ?? null,
    offer.discount_pln ?? null,
    offer.price_after_discount_pln ?? null,
    offer.source_file ?? null,
    offer.offer_id ?? null,
    offer.dealer ?? null,
    offer.vin ?? null,
    offer.configuration_id ?? null,
    (offer.price_items ?? []).map((item) => item.price_pln),
  ];
  assert(same(actual, expected), `${offer.id}: exact offer values differ`);
}

const c3 = vehicles.find((vehicle) => vehicle.id === "citroen-c3-hybrid-110");
assert(Boolean(c3), "Citroën C3 comparison record missing");
assert(c3?.model === "C3" && c3?.trim === "Hybrid 110 e-DCS6", "Citroën C3 must use neutral Hybrid 110 e-DCS6 identity");
assert(c3?.category === "comparison-no-offer", "Citroën C3 must remain comparison-only");
assert(c3?.offer_variants.length === 0 && c3?.documents.length === 0 && c3?.financing_scenarios.length === 0, "Citroën C3 must not have an offer, price document, or financing");
assert(!/\b(?:Plus|Max|Collection)\b/i.test(`${c3?.model} ${c3?.trim}`), "Citroën C3 identity contains a prohibited trim label");

assert(financing.length === 12, `expected 12 assigned financing scenarios, got ${financing.length}`);
assert(catalog.globalFinancingScenarios.length === 6, `expected 6 global VeloBank scenarios, got ${catalog.globalFinancingScenarios.length}`);
for (const scenario of catalog.globalFinancingScenarios) {
  assert(scenario.vehicle_id === null, `${scenario.id}: global financing must remain unassigned`);
  financing.push(scenario);
}
assert(financing.length === 18, `expected 18 total financing scenarios, got ${financing.length}`);
assert(new Set(financing.map((scenario) => scenario.id)).size === financing.length, "financing IDs must be unique");

for (const scenario of financing) {
  const expected = expectedFinancing.get(scenario.id);
  assert(Boolean(expected), `unexpected financing ID: ${scenario.id}`);
  const actual = [
    scenario.vehicle_id,
    scenario.association,
    scenario.price_pln,
    scenario.down_payment_pln,
    scenario.term_months,
    scenario.credit_amount_pln,
    scenario.monthly_payment_pln,
    scenario.nominal_rate_pct,
    scenario.rrso_pct,
    scenario.total_cash_outlay_pln,
    scenario.financing_premium_vs_price_pln,
    scenario.source_file,
  ];
  assert(same(actual, expected), `${scenario.id}: exact financing values or association differ`);
  assert(basename(scenario.documentPath ?? "") === scenario.source_file, `${scenario.id}: source_file and documentPath differ`);
  documentPaths.add(scenario.documentPath);
  referencedPaths.add(scenario.documentPath);
  const premium = Math.round((scenario.total_cash_outlay_pln - scenario.price_pln) * 100) / 100;
  assert(Math.abs(premium - scenario.financing_premium_vs_price_pln) < 0.02, `${scenario.id}: financing premium does not tie`);
}

assert(same([...documentPaths].sort(), expectedDocumentPaths), "source document paths differ from the canonical 18-file inventory");
const researchPaths = catalog.researchLinks.map((link) => link.path).sort();
assert(same(researchPaths, expectedResearchPaths), "researchLinks differ from the canonical full-data paths");
for (const link of catalog.researchLinks) {
  assert(typeof link.title === "string" && link.title.length > 0, `research link title missing for ${link.path}`);
  referencedPaths.add(link.path);
}

visitNumbers(catalog);

const missingPaths = [...referencedPaths]
  .filter((path) => typeof path !== "string" || !pathExists(path))
  .sort();
assert(missingPaths.length === 0, `missing referenced public paths:\n  - ${missingPaths.join("\n  - ")}`);

if (errors.length > 0) {
  console.error(`Data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${vehicles.length} vehicles, ${offers.length} offers, ${financing.length} financing scenarios, and ${documentPaths.size} source documents.`);

function visitNumbers(value, path = "catalog") {
  if (typeof value === "number") {
    assert(Number.isFinite(value), `${path}: number must be finite`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visitNumbers(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) visitNumbers(item, `${path}.${key}`);
  }
}

function pathExists(path) {
  try {
    const url = new URL(`../public/${path}`, import.meta.url);
    return existsSync(url) && statSync(url).isFile();
  } catch {
    return false;
  }
}

export function validateVehicleSourceIds(vehicle, report = assert) {
  const registeredIds = new Set([
    ...(vehicle.local_sources ?? []).map((source) => source.id),
    ...(vehicle.web_sources ?? []).map((source) => source.id),
  ]);

  function visit(value, path) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;

    if (Object.hasOwn(value, "source_ids")) {
      report(Array.isArray(value.source_ids), `${path}.source_ids must be an array`);
      for (const sourceId of Array.isArray(value.source_ids) ? value.source_ids : []) {
        report(registeredIds.has(sourceId), `${path}.source_ids references unknown source ID ${sourceId}`);
      }
    }

    for (const [key, item] of Object.entries(value)) {
      if (key !== "source_ids") visit(item, `${path}.${key}`);
    }
  }

  visit(vehicle, vehicle.id);
}
