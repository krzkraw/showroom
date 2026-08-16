import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import App, { DestinationView } from "../App";
import catalogData from "../data/showroom.json";
import { Catalog, type Source, type Vehicle } from "../domain/showroom";
import { copy } from "./copy.pl";
import {
  financingForVersion,
  financingRateRows,
  isDownwardSwipe,
  offerPriceRows,
  offersForVersion,
  resolveSource,
  warrantySections,
} from "./destinations";

const catalog = Catalog.fromJSON(catalogData);

function model(id: string): Vehicle {
  const result = catalog.models.find((item) => item.id === id);
  if (result === undefined) throw new Error(`missing test model ${id}`);
  return result;
}

test("filters offers and keeps availability independent from price", () => {
  const dacia = model("dacia-sandero-stepway");
  expect(offersForVersion(dacia, "extreme-eco-g-120")[0].state).toBe("missing");

  const citroen = model("citroen-c3");
  expect(offersForVersion(citroen, "max")).toEqual([]);

  const yarisOffer = offersForVersion(model("toyota-yaris"), "style")[0];
  expect(yarisOffer.state).toBe("available");
  expect(offerPriceRows(yarisOffer).every(({ fact }) => fact.value === null)).toBeTrue();
});

test("distinguishes absent, pending, and available financing", () => {
  expect(financingForVersion(model("dacia-sandero-stepway"), "extreme-eco-g-120")).toEqual(
    [],
  );
  expect(financingForVersion(model("peugeot-2008"), "hybrid-110-e-dcs6")[0].state).toBe(
    "pending",
  );
  expect(financingForVersion(model("hyundai-i20"), "modern")[0].state).toBe("available");
});

test("keeps nominal interest separate from RRSO", () => {
  const variant = financingForVersion(model("hyundai-i20"), "modern")[0].variants[0];
  const rows = financingRateRows(variant);
  expect(rows.map(({ label }) => label)).toEqual([
    copy.nominalInterestRate,
    copy.annualPercentageRate,
  ]);
  expect(rows.map(({ fact }) => fact.value)).toEqual([7.79, 11.06]);
});

test("separates base warranty from extensions without changing terms", () => {
  const sections = warrantySections(model("dacia-sandero-stepway").warranty);
  expect(sections.base.map((warranty) => warranty.id)).toEqual(["base"]);
  expect(sections.extensions.map((warranty) => warranty.id)).toEqual(["non-stop"]);
  expect(sections.base[0].durationYears.value).toBe(3);
  expect(sections.extensions[0].durationYears.value).toBe(5);
  expect(sections.extensions[0].terms.value).toBeString();
});

test("resolves HTTPS material sources and preserves honest empty sections", () => {
  const yaris = model("toyota-yaris");
  expect(yaris.more.youtubeReviews).toEqual([]);
  expect(yaris.more.technicalData).toEqual([]);

  const dacia = model("dacia-sandero-stepway");
  expect(dacia.more.youtubeReviews).toEqual([]);
  const source = resolveSource(dacia.more.technicalData[0].sourceRef, catalog.sources);
  expect(source?.href?.startsWith("https://")).toBeTrue();
  expect(source?.label).toBeString();
  expect(source?.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  const unsafe: Source = {
    kind: "official",
    label: "Unsafe source",
    url: "http://example.com",
    accessedAt: "2026-08-16",
  };
  expect(resolveSource("unsafe", { unsafe })?.href).toBeNull();
});

test("closes only after a downward swipe reaches the threshold", () => {
  expect(isDownwardSwipe(100, 139)).toBeFalse();
  expect(isDownwardSwipe(100, 140)).toBeTrue();
  expect(isDownwardSwipe(140, 100)).toBeFalse();
});

test("renders required destination acceptance states", () => {
  const dacia = model("dacia-sandero-stepway");
  const yaris = model("toyota-yaris");
  const hyundai = model("hyundai-i20");
  const markup = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(DestinationView, {
        destination: "offers",
        model: dacia,
        version: dacia.versions[0],
      }),
      createElement(DestinationView, {
        destination: "more",
        model: yaris,
        version: yaris.versions[0],
      }),
      createElement(DestinationView, {
        destination: "warranty",
        model: dacia,
        version: dacia.versions[0],
      }),
      createElement(DestinationView, {
        destination: "warranty",
        model: hyundai,
        version: hyundai.versions[0],
      }),
    ),
  );

  expect(markup).toContain(copy.noOffer);
  expect(markup).toContain(copy.noYoutube);
  expect(markup).toContain(copy.noTechnicalData);
  expect(markup).toContain(copy.baseWarranty);
  expect(markup).toContain(copy.warrantyExtensions);
  expect(markup).toContain(copy.noMileageLimit);
});

test("renders dialog semantics on every destination action", () => {
  const markup = renderToStaticMarkup(createElement(App));
  expect(markup.match(/aria-haspopup="dialog"/g)).toHaveLength(4);
  expect(markup.match(/aria-expanded="false"/g)).toHaveLength(4);
  expect(markup).not.toContain('aria-controls="destination-sheet"');
});
