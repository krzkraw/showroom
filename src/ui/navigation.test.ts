import { expect, test } from "bun:test";
import { swipeStep, wrappedIndex } from "./navigation";

test("wraps navigation and ignores short swipes", () => {
  expect(wrappedIndex(-1, 12)).toBe(11);
  expect(wrappedIndex(12, 12)).toBe(0);
  expect(swipeStep(100, 61)).toBe(0);
  expect(swipeStep(100, 60)).toBe(1);
  expect(swipeStep(100, 140)).toBe(-1);
});
