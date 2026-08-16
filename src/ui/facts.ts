import type { Fact } from "../domain/showroom";
import { copy } from "./copy.pl";

export function missingFactText(fact: Fact<unknown>): string {
  if (fact.status === "verified") return copy.confirmedAbsent;
  if (fact.status === "unverified") return copy.unconfirmedFact;
  return copy.unknownFact;
}

/**
 * Renders a fact as text. An unknown status or a null value stays honest.
 * The function never substitutes a number, a dash, or an empty string.
 */
export function factText<T extends string | number>(fact: Fact<T>): string {
  if (fact.value === null) return missingFactText(fact);
  return String(fact.value);
}

export function formattedFactText<T extends string | number>(
  fact: Fact<T>,
  format: (value: T) => string = (value) => String(value),
): string {
  if (fact.value === null) return factText(fact);
  const value = format(fact.value);
  return fact.status === "unverified" ? copy.unconfirmedValue(value) : value;
}

export function distanceLimitText(fact: Fact<number>): string {
  if (fact.value !== null) return formattedFactText(fact, copy.kilometers);
  return fact.status === "verified" ? copy.noMileageLimit : missingFactText(fact);
}
