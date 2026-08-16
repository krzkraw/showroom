import type {
  Financing,
  FinancingVariant,
  Offer,
  Source,
  Vehicle,
  Warranty,
} from "../domain/showroom";
import { copy } from "./copy.pl";

export type Destination = "offers" | "financing" | "warranty" | "more";

export function offersForVersion(model: Vehicle, versionId: string): readonly Offer[] {
  return model.offers.filter((offer) => offer.versionId === versionId);
}

export function financingForVersion(
  model: Vehicle,
  versionId: string,
): readonly Financing[] {
  return model.financing.filter((financing) => financing.versionId === versionId);
}

export function offerPriceRows(offer: Offer) {
  return [
    { label: copy.price, fact: offer.pricePln },
    { label: copy.specialPrice, fact: offer.specialPricePln },
    { label: copy.catalogPrice, fact: offer.catalogPricePln },
    { label: copy.configurationPrice, fact: offer.configurationPricePln },
    { label: copy.priceBeforeDiscount, fact: offer.priceBeforeDiscountPln },
    { label: copy.discount, fact: offer.discountPln },
    { label: copy.priceAfterDiscount, fact: offer.priceAfterDiscountPln },
  ] as const;
}

export function financingRateRows(variant: FinancingVariant) {
  return [
    { label: copy.nominalInterestRate, fact: variant.nominalInterestRate },
    { label: copy.annualPercentageRate, fact: variant.annualPercentageRate },
  ] as const;
}

export function warrantySections(warranties: readonly Warranty[]) {
  return {
    base: warranties.filter((warranty) => warranty.kind.value === "base"),
    extensions: warranties.filter((warranty) => warranty.kind.value === "extension"),
  };
}

export interface ResolvedSource {
  readonly label: string;
  readonly accessedAt: string;
  readonly href: string | null;
}

export function resolveSource(
  sourceRef: string,
  sources: Readonly<Record<string, Source>>,
): ResolvedSource | null {
  const source = sources[sourceRef];
  if (source === undefined) return null;
  return {
    label: source.label,
    accessedAt: source.accessedAt,
    href: source.url?.startsWith("https://") ? source.url : null,
  };
}

export function isDownwardSwipe(startY: number, endY: number): boolean {
  return endY - startY >= 40;
}
