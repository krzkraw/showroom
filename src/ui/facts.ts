import type { Fact } from "../domain/showroom";
import { copy } from "./copy.pl";

/**
 * Renders a fact as text. An unknown status or a null value stays honest.
 * The function never substitutes a number, a dash, or an empty string.
 */
export function factText<T extends string | number>(fact: Fact<T>): string {
  if (fact.status === "unknown" || fact.value === null) return copy.unknownFact;
  return String(fact.value);
}
