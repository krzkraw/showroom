import { expect, test } from "bun:test";
import type { Fact } from "../domain/showroom";
import { copy } from "./copy.pl";
import { distanceLimitText, factText, formattedFactText } from "./facts";

const sourceRef = "source";

function fact(status: Fact<number>["status"], value: number | null): Fact<number> {
  return { status, value, sourceRef };
}

test("keeps missing facts distinct from confirmed absence", () => {
  expect(factText(fact("unknown", null))).toBe(copy.unknownFact);
  expect(factText(fact("unverified", null))).toBe(copy.unconfirmedFact);
  expect(factText(fact("verified", null))).toBe(copy.confirmedAbsent);
});

test("renders verified null warranty distance as no mileage limit", () => {
  expect(distanceLimitText(fact("verified", null))).toBe(copy.noMileageLimit);
  expect(distanceLimitText(fact("unknown", null))).toBe(copy.unknownFact);
  expect(distanceLimitText(fact("unverified", null))).toBe(copy.unconfirmedFact);
});

test("marks an unverified value without replacing it", () => {
  expect(formattedFactText(fact("unverified", 7.79), copy.percent)).toBe(
    copy.unconfirmedValue(copy.percent(7.79)),
  );
});
