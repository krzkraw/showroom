export type VerificationStatus = "verified" | "unverified" | "unknown";
export type AvailabilityState = "missing" | "pending" | "available";
export type SourceKind = "official" | "dealer-email" | "independent" | "youtube" | "input";
export type FuelKind = "petrol" | "lpg" | "hybrid" | "electric" | "unknown";
export type TimingDrive = "dryBelt" | "wetBelt" | "chain" | "none" | "unknown";
export type GearboxKind =
  | "manual"
  | "torqueConverter"
  | "dualClutch"
  | "cvt"
  | "singleSpeed"
  | "unknown";
export type ClutchType = "wet" | "dry" | "none" | "unknown";
export type WarrantyKind = "base" | "extension";

export interface Fact<T> {
  readonly value: T | null;
  readonly status: VerificationStatus;
  readonly sourceRef: string;
}

export interface Source {
  readonly kind: SourceKind;
  readonly label: string;
  readonly url: string | null;
  readonly accessedAt: string;
}

export interface NumberRange {
  readonly min: number;
  readonly max: number;
}

export interface VehicleVersion {
  readonly id: string;
  readonly name: Fact<string>;
  readonly modelYear: Fact<number>;
  readonly needsConfirmation: Fact<boolean>;
  readonly powertrain: Fact<string>;
  readonly fuels: Fact<readonly FuelKind[]>;
  readonly powerKw: Fact<number>;
  readonly powerHp: Fact<number>;
  readonly batteryKWh: Fact<number>;
  readonly electricRangeKmWltp: Fact<number>;
  readonly timingDrive: Fact<TimingDrive>;
  readonly gearbox: {
    readonly name: Fact<string>;
    readonly kind: Fact<GearboxKind>;
    readonly forwardGears: Fact<number>;
    readonly clutchType: Fact<ClutchType>;
  };
  readonly dimensionsMm: {
    readonly length: Fact<number>;
    readonly width: Fact<number>;
    readonly height: Fact<number>;
  };
  readonly curbWeightKg: Fact<NumberRange>;
  readonly grossVehicleWeightKg: Fact<number>;
  readonly consumptionLPer100KmWltp: Fact<number>;
  readonly noiseMeasurementDb: Fact<number>;
  readonly noiseMeasurementSpeedKph: Fact<number>;
}

export interface FinancingVariant {
  readonly durationMonths: Fact<number>;
  readonly initialPaymentPln: Fact<number>;
  readonly installmentPln: Fact<number>;
  readonly nominalInterestRate: Fact<number>;
  readonly annualPercentageRate: Fact<number>;
}

export interface Warranty {
  readonly id: string;
  readonly kind: Fact<WarrantyKind>;
  readonly label: Fact<string>;
  readonly durationYears: Fact<number>;
  readonly distanceLimitKm: Fact<number>;
  readonly terms: Fact<string>;
}

export interface MoreLink {
  readonly title: string;
  readonly sourceRef: string;
}

type JsonObject = Record<string, unknown>;
type Sources = ReadonlyMap<string, Source>;

const statuses = ["verified", "unverified", "unknown"] as const;
const availabilityStates = ["missing", "pending", "available"] as const;
const sourceKinds = ["official", "dealer-email", "independent", "youtube", "input"] as const;
const fuelKinds = ["petrol", "lpg", "hybrid", "electric", "unknown"] as const;
const timingDrives = ["dryBelt", "wetBelt", "chain", "none", "unknown"] as const;
const gearboxKinds = [
  "manual",
  "torqueConverter",
  "dualClutch",
  "cvt",
  "singleSpeed",
  "unknown",
] as const;
const clutchTypes = ["wet", "dry", "none", "unknown"] as const;
const warrantyKinds = ["base", "extension"] as const;

function fail(path: string, message: string): never {
  throw new TypeError(`${path}: ${message}`);
}

function object(value: unknown, path: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "expected an object");
  }
  return value as JsonObject;
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, "expected an array");
  return value;
}

function string(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) fail(path, "expected a non-empty string");
  return value;
}

function id(value: unknown, path: string): string {
  const result = string(value, path);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) fail(path, "expected a lowercase kebab-case ID");
  return result;
}

function number(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "expected a finite number");
  return value;
}

function positiveInteger(value: unknown, path: string): number {
  const result = number(value, path);
  if (!Number.isInteger(result) || result <= 0) fail(path, "expected a positive integer");
  return result;
}

function boolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") fail(path, "expected a boolean");
  return value;
}

function enumeration<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  path: string,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value as T[number])) {
    fail(path, `expected one of: ${allowed.join(", ")}`);
  }
  return value as T[number];
}

function sourceRef(value: unknown, sources: Sources, path: string): string {
  const result = string(value, path);
  if (!sources.has(result)) fail(path, `unknown sourceRef ${JSON.stringify(result)}`);
  return result;
}

function fact<T>(
  value: unknown,
  sources: Sources,
  path: string,
  parseValue: (value: unknown, path: string) => T,
): Fact<T> {
  const record = object(value, path);
  const status = enumeration(record.status, statuses, `${path}.status`);
  const rawValue = record.value;
  if (status === "unknown" && rawValue !== null) fail(`${path}.value`, "must be null when status is unknown");
  return {
    value: rawValue === null ? null : parseValue(rawValue, `${path}.value`),
    status,
    sourceRef: sourceRef(record.sourceRef, sources, `${path}.sourceRef`),
  };
}

function range(value: unknown, path: string): NumberRange {
  const record = object(value, path);
  const min = number(record.min, `${path}.min`);
  const max = number(record.max, `${path}.max`);
  if (min > max) fail(path, "min must not exceed max");
  return { min, max };
}

function uniqueIds<T extends { readonly id: string }>(values: readonly T[], path: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) fail(path, `duplicate ID ${JSON.stringify(value.id)}`);
    seen.add(value.id);
  }
}

function parseSource(value: unknown, path: string): Source {
  const record = object(value, path);
  const kind = enumeration(record.kind, sourceKinds, `${path}.kind`);
  const rawUrl = record.url;
  if (rawUrl !== null && (typeof rawUrl !== "string" || !rawUrl.startsWith("https://"))) {
    fail(`${path}.url`, "expected null or an HTTPS URL");
  }
  if (["official", "independent", "youtube"].includes(kind) && rawUrl === null) {
    fail(`${path}.url`, `${kind} sources require a URL`);
  }
  if (["dealer-email", "input"].includes(kind) && rawUrl !== null) {
    fail(`${path}.url`, `${kind} sources must not expose a URL`);
  }
  const accessedAt = string(record.accessedAt, `${path}.accessedAt`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(accessedAt)) fail(`${path}.accessedAt`, "expected YYYY-MM-DD");
  return { kind, label: string(record.label, `${path}.label`), url: rawUrl, accessedAt };
}

function parseVersion(value: unknown, sources: Sources, path: string): VehicleVersion {
  const record = object(value, path);
  const gearbox = object(record.gearbox, `${path}.gearbox`);
  const dimensions = object(record.dimensionsMm, `${path}.dimensionsMm`);
  return {
    id: id(record.id, `${path}.id`),
    name: fact(record.name, sources, `${path}.name`, string),
    modelYear: fact(record.modelYear, sources, `${path}.modelYear`, positiveInteger),
    needsConfirmation: fact(record.needsConfirmation, sources, `${path}.needsConfirmation`, boolean),
    powertrain: fact(record.powertrain, sources, `${path}.powertrain`, string),
    fuels: fact(record.fuels, sources, `${path}.fuels`, (item, itemPath) => {
      const values = array(item, itemPath).map((fuel, index) =>
        enumeration(fuel, fuelKinds, `${itemPath}[${index}]`),
      );
      if (values.length === 0) fail(itemPath, "expected at least one fuel");
      return values;
    }),
    powerKw: fact(record.powerKw, sources, `${path}.powerKw`, number),
    powerHp: fact(record.powerHp, sources, `${path}.powerHp`, number),
    batteryKWh: fact(record.batteryKWh, sources, `${path}.batteryKWh`, number),
    electricRangeKmWltp: fact(
      record.electricRangeKmWltp,
      sources,
      `${path}.electricRangeKmWltp`,
      number,
    ),
    timingDrive: fact(record.timingDrive, sources, `${path}.timingDrive`, (item, itemPath) =>
      enumeration(item, timingDrives, itemPath),
    ),
    gearbox: {
      name: fact(gearbox.name, sources, `${path}.gearbox.name`, string),
      kind: fact(gearbox.kind, sources, `${path}.gearbox.kind`, (item, itemPath) =>
        enumeration(item, gearboxKinds, itemPath),
      ),
      forwardGears: fact(gearbox.forwardGears, sources, `${path}.gearbox.forwardGears`, positiveInteger),
      clutchType: fact(gearbox.clutchType, sources, `${path}.gearbox.clutchType`, (item, itemPath) =>
        enumeration(item, clutchTypes, itemPath),
      ),
    },
    dimensionsMm: {
      length: fact(dimensions.length, sources, `${path}.dimensionsMm.length`, number),
      width: fact(dimensions.width, sources, `${path}.dimensionsMm.width`, number),
      height: fact(dimensions.height, sources, `${path}.dimensionsMm.height`, number),
    },
    curbWeightKg: fact(record.curbWeightKg, sources, `${path}.curbWeightKg`, range),
    grossVehicleWeightKg: fact(
      record.grossVehicleWeightKg,
      sources,
      `${path}.grossVehicleWeightKg`,
      number,
    ),
    consumptionLPer100KmWltp: fact(
      record.consumptionLPer100KmWltp,
      sources,
      `${path}.consumptionLPer100KmWltp`,
      number,
    ),
    noiseMeasurementDb: fact(record.noiseMeasurementDb, sources, `${path}.noiseMeasurementDb`, number),
    noiseMeasurementSpeedKph: fact(
      record.noiseMeasurementSpeedKph,
      sources,
      `${path}.noiseMeasurementSpeedKph`,
      number,
    ),
  };
}

export class Offer {
  private constructor(
    readonly id: string,
    readonly versionId: string,
    readonly state: AvailabilityState,
    readonly sourceRef: string,
    readonly pricePln: Fact<number>,
    readonly specialPricePln: Fact<number>,
    readonly catalogPricePln: Fact<number>,
    readonly configurationPricePln: Fact<number>,
    readonly priceBeforeDiscountPln: Fact<number>,
    readonly discountPln: Fact<number>,
    readonly priceAfterDiscountPln: Fact<number>,
    readonly summary: Fact<string>,
  ) {}

  static fromJSON(value: unknown, sources: Sources, path = "offer"): Offer {
    const record = object(value, path);
    return new Offer(
      id(record.id, `${path}.id`),
      id(record.versionId, `${path}.versionId`),
      enumeration(record.state, availabilityStates, `${path}.state`),
      sourceRef(record.sourceRef, sources, `${path}.sourceRef`),
      fact(record.pricePln, sources, `${path}.pricePln`, number),
      fact(record.specialPricePln, sources, `${path}.specialPricePln`, number),
      fact(record.catalogPricePln, sources, `${path}.catalogPricePln`, number),
      fact(record.configurationPricePln, sources, `${path}.configurationPricePln`, number),
      fact(record.priceBeforeDiscountPln, sources, `${path}.priceBeforeDiscountPln`, number),
      fact(record.discountPln, sources, `${path}.discountPln`, number),
      fact(record.priceAfterDiscountPln, sources, `${path}.priceAfterDiscountPln`, number),
      fact(record.summary, sources, `${path}.summary`, string),
    );
  }
}

export class Financing {
  private constructor(
    readonly id: string,
    readonly versionId: string | null,
    readonly state: AvailabilityState,
    readonly sourceRef: string,
    readonly basePricePln: Fact<number>,
    readonly variants: readonly FinancingVariant[],
    readonly summary: Fact<string>,
  ) {}

  static fromJSON(value: unknown, sources: Sources, path = "financing"): Financing {
    const record = object(value, path);
    const rawVersionId = record.versionId;
    return new Financing(
      id(record.id, `${path}.id`),
      rawVersionId === null ? null : id(rawVersionId, `${path}.versionId`),
      enumeration(record.state, availabilityStates, `${path}.state`),
      sourceRef(record.sourceRef, sources, `${path}.sourceRef`),
      fact(record.basePricePln, sources, `${path}.basePricePln`, number),
      array(record.variants, `${path}.variants`).map((item, index) => {
        const variantPath = `${path}.variants[${index}]`;
        const variant = object(item, variantPath);
        return {
          durationMonths: fact(variant.durationMonths, sources, `${variantPath}.durationMonths`, positiveInteger),
          initialPaymentPln: fact(variant.initialPaymentPln, sources, `${variantPath}.initialPaymentPln`, number),
          installmentPln: fact(variant.installmentPln, sources, `${variantPath}.installmentPln`, number),
          nominalInterestRate: fact(
            variant.nominalInterestRate,
            sources,
            `${variantPath}.nominalInterestRate`,
            number,
          ),
          annualPercentageRate: fact(
            variant.annualPercentageRate,
            sources,
            `${variantPath}.annualPercentageRate`,
            number,
          ),
        };
      }),
      fact(record.summary, sources, `${path}.summary`, string),
    );
  }
}

function parseWarranty(value: unknown, sources: Sources, path: string): Warranty {
  const record = object(value, path);
  return {
    id: id(record.id, `${path}.id`),
    kind: fact(record.kind, sources, `${path}.kind`, (item, itemPath) =>
      enumeration(item, warrantyKinds, itemPath),
    ),
    label: fact(record.label, sources, `${path}.label`, string),
    durationYears: fact(record.durationYears, sources, `${path}.durationYears`, number),
    distanceLimitKm: fact(record.distanceLimitKm, sources, `${path}.distanceLimitKm`, number),
    terms: fact(record.terms, sources, `${path}.terms`, string),
  };
}

function parseMoreLinks(value: unknown, sources: Sources, path: string): MoreLink[] {
  return array(value, path).map((item, index) => {
    const itemPath = `${path}[${index}]`;
    const record = object(item, itemPath);
    return {
      title: string(record.title, `${itemPath}.title`),
      sourceRef: sourceRef(record.sourceRef, sources, `${itemPath}.sourceRef`),
    };
  });
}

export class Vehicle {
  private constructor(
    readonly id: string,
    readonly brand: Fact<string>,
    readonly model: Fact<string>,
    readonly versions: readonly VehicleVersion[],
    readonly offers: readonly Offer[],
    readonly financing: readonly Financing[],
    readonly warranty: readonly Warranty[],
    readonly more: {
      readonly youtubeReviews: readonly MoreLink[];
      readonly technicalData: readonly MoreLink[];
    },
  ) {}

  static fromJSON(value: unknown, sources: Sources, path = "vehicle"): Vehicle {
    const record = object(value, path);
    const versions = array(record.versions, `${path}.versions`).map((item, index) =>
      parseVersion(item, sources, `${path}.versions[${index}]`),
    );
    if (versions.length === 0) fail(`${path}.versions`, "expected at least one version");
    uniqueIds(versions, `${path}.versions`);
    const versionIds = new Set(versions.map((version) => version.id));
    const offers = array(record.offers, `${path}.offers`).map((item, index) =>
      Offer.fromJSON(item, sources, `${path}.offers[${index}]`),
    );
    const financing = array(record.financing, `${path}.financing`).map((item, index) =>
      Financing.fromJSON(item, sources, `${path}.financing[${index}]`),
    );
    uniqueIds(offers, `${path}.offers`);
    uniqueIds(financing, `${path}.financing`);
    for (const offer of offers) {
      if (!versionIds.has(offer.versionId)) fail(`${path}.offers`, `unknown versionId ${JSON.stringify(offer.versionId)}`);
    }
    for (const item of financing) {
      if (item.versionId !== null && !versionIds.has(item.versionId)) {
        fail(`${path}.financing`, `unknown versionId ${JSON.stringify(item.versionId)}`);
      }
    }
    const warranty = array(record.warranty, `${path}.warranty`).map((item, index) =>
      parseWarranty(item, sources, `${path}.warranty[${index}]`),
    );
    uniqueIds(warranty, `${path}.warranty`);
    const more = object(record.more, `${path}.more`);
    return new Vehicle(
      id(record.id, `${path}.id`),
      fact(record.brand, sources, `${path}.brand`, string),
      fact(record.model, sources, `${path}.model`, string),
      versions,
      offers,
      financing,
      warranty,
      {
        youtubeReviews: parseMoreLinks(more.youtubeReviews, sources, `${path}.more.youtubeReviews`),
        technicalData: parseMoreLinks(more.technicalData, sources, `${path}.more.technicalData`),
      },
    );
  }
}

export class Catalog {
  private constructor(
    readonly schemaVersion: string,
    readonly sources: Readonly<Record<string, Source>>,
    readonly models: readonly Vehicle[],
  ) {}

  static fromJSON(value: unknown): Catalog {
    const record = object(value, "catalog");
    const schemaVersion = string(record.schemaVersion, "catalog.schemaVersion");
    if (schemaVersion !== "1.0") fail("catalog.schemaVersion", 'expected "1.0"');
    const sourceRecords = object(record.sources, "catalog.sources");
    const sourceEntries = Object.entries(sourceRecords).map(([sourceId, source]) => {
      id(sourceId, `catalog.sources.${sourceId}`);
      return [sourceId, parseSource(source, `catalog.sources.${sourceId}`)] as const;
    });
    const sources = new Map(sourceEntries);
    const models = array(record.models, "catalog.models").map((model, index) =>
      Vehicle.fromJSON(model, sources, `catalog.models[${index}]`),
    );
    uniqueIds(models, "catalog.models");
    return new Catalog(schemaVersion, Object.fromEntries(sourceEntries), models);
  }
}
