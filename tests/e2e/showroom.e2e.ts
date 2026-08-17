import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import catalogData from "../../src/data/showroom.json" with { type: "json" };

const expectedPrimaryPrices = [
  ["fiat-grande-panda-hybrid-la-prima", "90 212"],
  ["volkswagen-t-cross-life-plus-116-dsg", "129 290"],
  ["peugeot-2008-edition-hybrid-110", "108 400"],
  ["peugeot-208-business-hybrid-110", "87 500"],
  ["hyundai-inster-49kwh-pure", "123 300"],
  ["hyundai-bayon-modern-90-7dct", "103 600"],
  ["hyundai-i20-modern-90-7dct", "99 900"],
  ["skoda-fabia-drive-115-dsg", "91 350"],
  ["skoda-kamiq-drive-115-dsg", "108 800"],
  ["toyota-yaris-style-hybrid-116", "107 920"],
] as const;

async function openShowroom(page: Page, hash = "") {
  await page.goto(`./${hash}`);
  await expect(page.getByRole("heading", { name: "Showroom ofert" })).toBeVisible();
}

async function selectVehicle(page: Page, id: string) {
  const vehicle = catalogData.vehicles.find((item) => item.id === id);
  if (!vehicle) throw new Error(`missing vehicle fixture: ${id}`);
  await page.getByLabel("Wybierz model").selectOption(id);
  await expect(page.locator(".vehicle-intro h2")).toHaveText(vehicle.model);
}

function tab(page: Page, name: string) {
  return page.getByRole("tab", { name });
}

function panel(page: Page) {
  return page.locator("#tab-panel");
}

function factValue(page: Page, label: string) {
  return panel(page).locator(".fact-card").filter({ hasText: label }).locator("dd");
}

async function expectNoAxeViolations(page: Page, include: string | Locator = "main") {
  const builder = new AxeBuilder({ page });
  if (typeof include === "string") builder.include(include);
  else builder.include(await include.evaluate((element) => {
    if (!element.id) element.id = "axe-target";
    return `#${element.id}`;
  }));
  const result = await builder.analyze();
  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    })),
  ).toEqual([]);
}

test("loads from the Pages path and exposes grouped searchable inventory", async ({ page }) => {
  await openShowroom(page);

  expect(new URL(page.url()).pathname).toBe("/showroom/");
  expect(catalogData.vehicles).toHaveLength(14);
  expect(catalogData.vehicles.filter(({ category }) => category === "offer-2026")).toHaveLength(10);
  expect(catalogData.vehicles.flatMap(({ offer_variants }) => offer_variants)).toHaveLength(11);

  const select = page.getByLabel("Wybierz model");
  await expect(select.locator("option")).toHaveCount(14);
  expect(
    await select.locator("optgroup").evaluateAll((groups) =>
      groups.map((group) => group.getAttribute("label")),
    ),
  ).toEqual(["Aktualne oferty (10)", "Porównanie techniczne (1)", "Archiwum (3)"]);

  const search = page.getByRole("searchbox", {
    name: "Szukaj marki, modelu, wersji lub grupy",
  });
  await search.fill("archiwum");
  await expect(select.locator("option:not([disabled])")).toHaveCount(3);
  await search.fill("Fabia");
  await expect(select.getByRole("option", { name: "Škoda Fabia — Drive" })).toHaveCount(1);
  await select.selectOption("skoda-fabia-drive-115-dsg");
  await expect(page.locator(".vehicle-intro h2")).toHaveText("Fabia");
});

test("renders all exact primary prices, both Fabias, and neutral C3", async ({ page }) => {
  await openShowroom(page);

  for (const [id, price] of expectedPrimaryPrices) {
    await selectVehicle(page, id);
    await expect(page.locator(".hero-price strong")).toContainText(price);
  }

  await selectVehicle(page, "hyundai-inster-49kwh-pure");
  await expect(
    panel(page).locator(".primary-metric").filter({ hasText: "Zużycie WLTP" }).locator("dd"),
  ).toContainText("15,3 kWh/100 km");

  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await page.getByRole("button", { name: "Błękit Race metalizowany" }).click();
  await expect(page.locator(".hero-price strong")).toContainText("101 550");
  await expect(page).toHaveURL(/offer=skoda-fabia-blue/);

  await selectVehicle(page, "citroen-c3-hybrid-110");
  const intro = page.locator(".vehicle-intro");
  await expect(intro.locator(".trim")).toHaveText("Hybrid 110 e-DCS6");
  await expect(intro).toContainText("Wyłącznie porównanie techniczne");
  await expect(intro).not.toContainText(/\b(?:Collection|Plus|Max)\b/);
  await expect(page.locator(".hero-price strong")).toHaveText("brak konkretnej oferty");
  await expect(page.locator(".hero-offer-switcher")).toHaveCount(0);

  await tab(page, "Oferta").click();
  await expect(panel(page)).toContainText("Brak konkretnej oferty dealerskiej");
  await tab(page, "Finansowanie").click();
  await expect(panel(page).locator(".financing-card")).toHaveCount(0);
  await expect(panel(page)).toContainText(
    "Brak jednoznacznie przypisanej kalkulacji finansowania",
  );
});

test("shows corrected CO2 values and financing association warnings", async ({ page }) => {
  await openShowroom(page);

  await selectVehicle(page, "peugeot-208-business-hybrid-110");
  await tab(page, "Specyfikacja").click();
  await expect(factValue(page, "Emisja CO₂ WLTP")).toHaveText("102 g/km");

  await selectVehicle(page, "peugeot-2008-edition-hybrid-110");
  await tab(page, "Specyfikacja").click();
  await expect(factValue(page, "Emisja CO₂ WLTP")).toHaveText("111 g/km");

  await selectVehicle(page, "volkswagen-t-cross-life-plus-116-dsg");
  await tab(page, "Finansowanie").click();
  await expect(panel(page).locator(".financing-card")).toHaveCount(2);
  await expect(panel(page).locator(".financing-card .status")).toHaveText([
    "not exact",
    "not exact",
  ]);
  await expect(panel(page)).toContainText("106 000");
  await expect(panel(page)).toContainText("129 290");

  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await tab(page, "Finansowanie").click();
  await expect(panel(page).locator(".financing-card")).toHaveCount(4);
  await expect(panel(page).locator(".status-caution")).toHaveCount(2);
  await expect(panel(page).locator(".status-caution")).toHaveText(["likely", "likely"]);
  await expect(panel(page)).toContainText("92 700");
  await expect(panel(page)).toContainText("91 350");

  await selectVehicle(page, "toyota-yaris-style-hybrid-116");
  await tab(page, "Finansowanie").click();
  await expect(panel(page).locator(".financing-card")).toHaveCount(4);
});

test("keeps 18 financing scenarios and 18 source documents with six Velo scenarios global", async ({
  page,
}) => {
  const assigned = catalogData.vehicles.flatMap(({ financing_scenarios }) => financing_scenarios);
  expect(assigned).toHaveLength(12);
  expect(catalogData.globalFinancingScenarios).toHaveLength(6);
  expect([...assigned, ...catalogData.globalFinancingScenarios]).toHaveLength(18);

  const sourceDocuments = new Set<string>();
  for (const vehicle of catalogData.vehicles) {
    for (const document of vehicle.documents) sourceDocuments.add(document.path);
  }
  for (const scenario of catalogData.globalFinancingScenarios) {
    if (scenario.documentPath) sourceDocuments.add(scenario.documentPath);
  }
  expect(sourceDocuments.size).toBe(18);

  await openShowroom(page);
  const globalFinance = page.locator(".unassigned-financing");
  await globalFinance.locator("summary").click();
  await expect(globalFinance.locator(".financing-card")).toHaveCount(6);
  await expect(globalFinance.locator(".financing-card").first()).toBeVisible();
  await expect(globalFinance).toContainText(
    "Kalkulacje pozostają globalne i nie są przypisane do marki ani modelu",
  );
  await expect(globalFinance).not.toContainText("Hyundai");
});

test("selects gallery images, preserves the rail layout, hash, and viewport width", async ({
  page,
}) => {
  await openShowroom(page);
  await selectVehicle(page, "skoda-fabia-drive-115-dsg");

  const thumbnails = page.locator(".thumbnail-rail");
  const buttons = thumbnails.getByRole("button");
  await expect(buttons).toHaveCount(5);
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".main-image-frame img")).toHaveAttribute("alt", /Błękit Race/);
  await expect(page).toHaveURL(/image=1/);

  const layout = await page.evaluate(() => {
    const main = document.querySelector(".main-image-frame")?.getBoundingClientRect();
    const rail = document.querySelector(".thumbnail-rail")?.getBoundingClientRect();
    const direction = document.querySelector(".thumbnail-rail")
      ? getComputedStyle(document.querySelector(".thumbnail-rail")!).flexDirection
      : "";
    return {
      direction,
      mainRight: main?.right ?? 0,
      mainBottom: main?.bottom ?? 0,
      railLeft: rail?.left ?? 0,
      railTop: rail?.top ?? 0,
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport);
  if ((page.viewportSize()?.width ?? 0) > 820) {
    expect(layout.direction).toBe("column");
    expect(layout.railLeft).toBeGreaterThanOrEqual(layout.mainRight);
  } else {
    expect(layout.direction).toBe("row");
    expect(layout.railTop).toBeGreaterThanOrEqual(layout.mainBottom);
  }
});

test("uses a neutral state after the local gallery fallback also fails", async ({ page }) => {
  await page.route("**/cars/skoda-fabia-timiano-front.jpg", (route) => route.abort());
  await openShowroom(
    page,
    "#vehicle=skoda-fabia-drive-115-dsg&tab=overview&offer=skoda-fabia-green&image=0",
  );
  await expect(page.locator(".main-image-frame .image-failure")).toHaveText(
    "Obraz niedostępny",
  );
});

test("compares three vehicles with explicit unknowns and restores focus", async ({ page }) => {
  await openShowroom(page);

  await page.getByRole("checkbox", { name: /Dodaj ten model do porównania/ }).check();
  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await page.getByRole("checkbox", { name: /Dodaj ten model do porównania/ }).check();
  await selectVehicle(page, "citroen-c3-hybrid-110");
  await page.getByRole("checkbox", { name: /Dodaj ten model do porównania/ }).check();

  const trigger = page.getByRole("button", { name: "Porównaj (3/3)" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Porównanie samochodów" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("columnheader")).toHaveCount(4);
  await expect(dialog.getByRole("row", { name: /Cena oferty/ })).toContainText(
    "brak oferty",
  );
  await expect(
    dialog.getByRole("row", { name: /Długość × szerokość × wysokość/ }),
  ).toContainText("brak danych");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("restores vehicle, offer, image, and keyboard-selected tab from the hash", async ({
  page,
}) => {
  await openShowroom(
    page,
    "#vehicle=citroen-c3-hybrid-110&tab=financing&image=0",
  );
  await expect(page.locator(".vehicle-intro h2")).toHaveText("C3");
  await expect(tab(page, "Finansowanie")).toHaveAttribute("aria-selected", "true");

  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await page.getByRole("button", { name: "Błękit Race metalizowany" }).click();
  await page.locator(".thumbnail").nth(1).click();
  const overview = tab(page, "Przegląd");
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(tab(page, "Specyfikacja")).toBeFocused();
  await expect(tab(page, "Specyfikacja")).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(
    /vehicle=skoda-fabia-drive-115-dsg&tab=specification&offer=skoda-fabia-blue&image=1/,
  );

  await page.reload();
  await expect(page.locator(".vehicle-intro h2")).toHaveText("Fabia");
  await expect(page.locator(".hero-price strong")).toContainText("101 550");
  await expect(tab(page, "Specyfikacja")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".thumbnail").nth(1)).toHaveAttribute("aria-pressed", "true");
});

test("loads full local documents and restores invoking focus on Escape", async ({ page }) => {
  await openShowroom(page);
  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await tab(page, "Oferta").click();

  const trigger = panel(page).locator(".document-button").nth(1);
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Škoda Fabia Drive 115 DSG — konfiguracja Błękit Race",
  });
  await expect(dialog).toBeVisible();
  const text = dialog.locator("pre");
  await expect(text).toBeVisible();
  expect((await text.textContent())?.length ?? 0).toBeGreaterThan(10_000);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("has no serious accessibility violations or page-level horizontal overflow", async ({
  page,
}) => {
  await openShowroom(page);
  await expectNoAxeViolations(page);

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport);

  await page.getByRole("checkbox", { name: /Dodaj ten model do porównania/ }).check();
  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await page.getByRole("checkbox", { name: /Dodaj ten model do porównania/ }).check();
  await page.getByRole("button", { name: "Porównaj (2/3)" }).click();
  const dialog = page.getByRole("dialog", { name: "Porównanie samochodów" });
  await expect(dialog).toBeVisible();
  await expectNoAxeViolations(page, dialog);
});
