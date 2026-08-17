export type SourceStatus = string;

export interface SourcedValue {
  readonly value: string | number | boolean | null;
  readonly status: SourceStatus;
  readonly source_ids?: readonly string[];
  readonly note?: string;
}

export type SourcedSection = Readonly<Record<string, SourcedValue>>;

export interface OfferPriceItem {
  readonly label: string;
  readonly price_pln: number;
}

export interface OfferVariant {
  readonly id: string;
  readonly label: string;
  readonly source_file?: string;
  readonly offer_id?: string | null;
  readonly dealer?: string | null;
  readonly price_pln?: number | null;
  readonly special_price_pln?: number | null;
  readonly catalog_price_pln?: number | null;
  readonly configuration_price_pln?: number | null;
  readonly price_before_discount_pln?: number | null;
  readonly discount_pln?: number | null;
  readonly price_after_discount_pln?: number | null;
  readonly exterior?: string | null;
  readonly interior?: string | null;
  readonly wheels?: string | null;
  readonly production_year?: number | null;
  readonly model_year?: number | null;
  readonly offer_date?: string | null;
  readonly vin?: string | null;
  readonly configuration_id?: string | null;
  readonly price_items?: readonly OfferPriceItem[];
  readonly notes?: string;
}

export interface FinancingScenario {
  readonly id: string;
  readonly vehicle_id: string | null;
  readonly association: string;
  readonly source_file?: string;
  readonly price_pln: number | null;
  readonly down_payment_pln: number | null;
  readonly term_months: number | null;
  readonly credit_amount_pln: number | null;
  readonly monthly_payment_pln: number | null;
  readonly nominal_rate_pct: number | null;
  readonly rrso_pct: number | null;
  readonly total_cash_outlay_pln: number | null;
  readonly financing_premium_vs_price_pln: number | null;
  readonly notes?: string;
  readonly documentPath?: string;
}

export interface GalleryItem {
  readonly src: string;
  readonly label: string;
  readonly kind: string;
  readonly colorMatch: string;
  readonly fallback?: string;
}

export interface DocumentLink {
  readonly title: string;
  readonly path: string;
  readonly kind: string;
}

export interface WebSource {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly publisher?: string;
  readonly scope?: string;
  readonly notes?: string;
  readonly accessed?: string;
}

export interface LocalSource {
  readonly id: string;
  readonly title: string;
  readonly path: string;
}

export interface RealWorldData {
  readonly fuelConsumption?: string;
  readonly noise?: string;
  readonly rangeSummer?: string;
  readonly rangeWinter?: string;
  readonly sources?: readonly string[];
  readonly [key: string]: string | readonly string[] | undefined;
}

export interface Vehicle {
  readonly id: string;
  readonly make: string;
  readonly model: string;
  readonly trim: string;
  readonly body_style: string;
  readonly category: string;
  readonly powertrain: SourcedSection;
  readonly performance: SourcedSection;
  readonly efficiency: SourcedSection;
  readonly dimensions: SourcedSection;
  readonly warranty: readonly string[];
  readonly equipment_highlights: readonly string[];
  readonly offer_variants: readonly OfferVariant[];
  readonly conflicts: readonly string[];
  readonly unknown_fields: readonly string[];
  readonly gallery: readonly GalleryItem[];
  readonly documents: readonly DocumentLink[];
  readonly dossierPath?: string | null;
  readonly financing_scenarios: readonly FinancingScenario[];
  readonly web_sources: readonly WebSource[];
  readonly local_sources: readonly LocalSource[];
  readonly real_world: RealWorldData;
}

export interface ResearchLink {
  readonly title: string;
  readonly path: string;
}

export interface Catalog {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly upstream: {
    readonly repository: string;
    readonly branch: string;
    readonly treeSha: string;
  };
  readonly privacy: string;
  readonly vehicles: readonly Vehicle[];
  readonly globalFinancingScenarios: readonly FinancingScenario[];
  readonly researchLinks: readonly ResearchLink[];
}
