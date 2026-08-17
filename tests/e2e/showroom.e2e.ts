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

const expectedAssignedScenarioIds = {
  "volkswagen-t-cross-life-plus-116-dsg": ["vw-6177859-36", "vw-6177859-48"],
  "skoda-fabia-drive-115-dsg": [
    "skoda-fabia-blue-6174608-36",
    "skoda-fabia-blue-6174608-48",
    "skoda-fabia-green-6174634-36",
    "skoda-fabia-green-6174634-48",
  ],
  "skoda-kamiq-drive-115-dsg": ["skoda-kamiq-6174620-36", "skoda-kamiq-6174620-48"],
  "toyota-yaris-style-hybrid-116": [
    "toyota-022777-36-50k",
    "toyota-022777-36-30k",
    "toyota-022777-48-50k",
    "toyota-022777-48-30k",
  ],
} as const;

const expectedNeutralWarrantySummaryIds = new Set([
  "volkswagen-t-cross-life-plus-116-dsg",
  "peugeot-2008-edition-hybrid-110",
  "peugeot-208-business-hybrid-110",
  "hyundai-bayon-modern-90-7dct",
  "hyundai-i20-modern-90-7dct",
  "skoda-fabia-drive-115-dsg",
  "skoda-kamiq-drive-115-dsg",
  "citroen-c3-hybrid-110",
]);

const expectedNeutralProtectionSummaryIds = new Set([
  "fiat-grande-panda-hybrid-la-prima",
  "hyundai-inster-49kwh-pure",
  "citroen-c3-hybrid-110",
]);

async function openShowroom(page: Page, hash = "") {
  await page.goto(`./${hash}`);
  await expect(page.getByText("Wirtualny salon samochodów", { exact: true })).toBeVisible();
}

async function openDirectory(page: Page) {
  await page.getByRole("button", { name: /Wybierz model, \d+ z 14/ }).click();
  const directory = page.getByRole("dialog", { name: "Wybierz model" });
  await expect(directory).toBeVisible();
  return directory;
}

async function selectVehicle(page: Page, id: string) {
  const vehicle = catalogData.vehicles.find((item) => item.id === id);
  if (!vehicle) throw new Error(`missing vehicle fixture: ${id}`);
  const directory = await openDirectory(page);
  const result = directory
    .locator(".directory-list button")
    .filter({ hasText: `${vehicle.make} ${vehicle.model}` })
    .filter({ hasText: vehicle.trim });
  await expect(result).toHaveCount(1);
  await result.click();
  await expect(page.getByRole("heading", { name: `${vehicle.make} ${vehicle.model}`, exact: true })).toBeVisible();
}

async function openDestination(page: Page, name: "Oferty" | "Finansowanie" | "Gwarancja" | "Więcej") {
  await page.getByRole("button", { name, exact: true }).click();
  const titles = {
    Oferty: "Oferty i wyposażenie",
    Finansowanie: "Finansowanie",
    Gwarancja: "Gwarancja",
    Więcej: "Więcej informacji",
  } as const;
  const dialog = page.getByRole("dialog", { name: titles[name] });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function closeDestination(dialog: Locator) {
  await dialog.getByRole("button", { name: "Wróć" }).click();
  await expect(dialog).toBeHidden();
}

async function openMoreSection(dialog: Locator, name: string) {
  const summary = dialog.locator("summary").filter({ hasText: name });
  await expect(summary).toHaveCount(1);
  const details = summary.locator("..");
  if ((await details.getAttribute("open")) === null) await summary.click();
  await expect(details).toHaveAttribute("open", "");
  return details;
}

function factValue(scope: Locator, label: string) {
  return scope.locator(".fact-card").filter({ hasText: label }).locator("dd > span").first();
}

async function expectNoAxeViolations(page: Page, include: string | Locator = "main") {
  const builder = new AxeBuilder({ page });
  if (typeof include === "string") builder.include(include);
  else {
    builder.include(await include.evaluate((element) => {
      if (!element.id) element.id = "axe-target";
      return `#${element.id}`;
    }));
  }
  const result = await builder.analyze();
  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    })),
  ).toEqual([]);
}

test("loads from the Pages path and exposes a grouped searchable directory", async ({ page }) => {
  await openShowroom(page);

  expect(new URL(page.url()).pathname).toBe("/showroom/");
  expect(catalogData.vehicles).toHaveLength(14);
  expect(catalogData.vehicles.filter(({ category }) => category === "offer-2026")).toHaveLength(10);
  expect(catalogData.vehicles.flatMap(({ offer_variants }) => offer_variants)).toHaveLength(11);
  await expect(page.locator(".model-counter")).toHaveText("1 z 14");
  await expect(page.locator(".model-counter")).toHaveAttribute("aria-label", "Wybierz model, 1 z 14");

  const directory = await openDirectory(page);
  await expect(page.locator(".showroom-shell").locator("..")).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("button", { name: "Następny model" })).toHaveCount(0);
  await expect(directory.getByRole("button", { name: "Wróć" })).toBeVisible();
  await expect(directory.getByRole("heading", { name: "Aktualne oferty" })).toBeVisible();
  await expect(directory.getByRole("heading", { name: "Porównanie techniczne" })).toBeVisible();
  await expect(directory.getByRole("heading", { name: "Archiwum" })).toBeVisible();
  await expect(directory.locator(".directory-list button")).toHaveCount(14);

  const search = directory.getByRole("searchbox", { name: "Szukaj marki, modelu, wersji lub grupy" });
  await search.fill("archiwum");
  await expect(directory.locator(".directory-list button")).toHaveCount(3);
  await expect(directory.locator(".directory-group header span")).toHaveText("3");
  await search.fill("Fabia");
  await expect(directory.locator(".directory-list button")).toHaveCount(1);
  await expect(directory.locator(".directory-group header span")).toHaveText("1");
  await expect(directory.locator(".directory-list button")).toContainText("Škoda Fabia");
});

test("renders every exact primary price, both Fabia offers, and neutral missing states", async ({ page }) => {
  await openShowroom(page);

  for (const [id, price] of expectedPrimaryPrices) {
    await selectVehicle(page, id);
    await expect(page.locator(".showroom-summary")).toContainText(price);
  }

  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await page.getByRole("button", { name: "Błękit Race metalizowany" }).click();
  await expect(page.getByRole("button", { name: "Błękit Race metalizowany" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".showroom-summary")).toContainText("101 550");
  await expect(page).toHaveURL(/offer=skoda-fabia-blue/);

  await selectVehicle(page, "citroen-c3-hybrid-110");
  await expect(page.locator(".showroom-summary")).toContainText("brak konkretnej oferty");
  await expect(page.locator(".version-button.is-static")).toHaveText("Hybrid 110 e-DCS6");
  const offers = await openDestination(page, "Oferty");
  await expect(offers.getByRole("heading", { name: "Brak konkretnej oferty dealerskiej" })).toBeVisible();
});

test("uses concise confirmed summaries and exact primary missing states", async ({ page }) => {
  await openShowroom(page);

  await expect(page.locator(".model-identity p")).not.toContainText("brak danych");
  await expect(page.locator(".fact-list dd").nth(2)).toHaveText("Brak potwierdzonych danych");
  await expect(page.locator(".showroom-summary dd").nth(1)).toHaveText(
    "Gwarancja ogólna: 24 miesiące bez limitu kilometrów",
  );
  await expect(page.locator(".showroom-summary dd").nth(2)).toHaveText(
    "szczegóły w sekcji Gwarancja",
  );

  const warranty = await openDestination(page, "Gwarancja");
  await expect(warranty).toContainText(
    "Gwarancja ogólna: 24 miesiące bez limitu kilometrów — warunki ogólne Fiat.",
  );
  await expect(warranty).toContainText(
    "Lakier: 24 miesiące; perforacja nadwozia: 8 lat — zweryfikować książkę gwarancyjną konkretnego auta.",
  );
  await closeDestination(warranty);

  await selectVehicle(page, "dacia-sandero-stepway");
  await expect(page.locator(".model-identity p")).toHaveText("Extreme Eco-G 120");
  await expect(page.locator(".fact-list dd")).toHaveText([
    "Brak potwierdzonych danych",
    "Brak potwierdzonych danych",
    "Brak potwierdzonych danych",
    "Brak potwierdzonych danych",
    "Brak potwierdzonych danych",
  ]);
});

test("keeps sourced efficiency, emissions, and financing associations", async ({ page }) => {
  await openShowroom(page);

  await selectVehicle(page, "hyundai-inster-49kwh-pure");
  await expect(page.locator(".fact-list").filter({ hasText: "Spalanie / zużycie" })).toContainText("15,3 kWh/100 km");

  await selectVehicle(page, "peugeot-208-business-hybrid-110");
  let more = await openDestination(page, "Więcej");
  let specification = await openMoreSection(more, "Specyfikacja");
  await expect(factValue(specification, "Emisja CO₂ WLTP")).toHaveText("102 g/km");
  await closeDestination(more);

  await selectVehicle(page, "peugeot-2008-edition-hybrid-110");
  more = await openDestination(page, "Więcej");
  specification = await openMoreSection(more, "Specyfikacja");
  await expect(factValue(specification, "Emisja CO₂ WLTP")).toHaveText("111 g/km");
  await closeDestination(more);

  await selectVehicle(page, "volkswagen-t-cross-life-plus-116-dsg");
  let financing = await openDestination(page, "Finansowanie");
  let assignedFinancing = financing.locator(".financing-list").first();
  await expect(assignedFinancing.locator(".financing-card")).toHaveCount(2);
  await expect(assignedFinancing.locator(".financing-card .status")).toHaveText(["not exact", "not exact"]);
  await expect(financing).toContainText("106 000");
  await expect(financing).toContainText("129 290");
  await closeDestination(financing);

  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  financing = await openDestination(page, "Finansowanie");
  assignedFinancing = financing.locator(".financing-list").first();
  await expect(assignedFinancing.locator(".financing-card")).toHaveCount(4);
  await expect(assignedFinancing.locator(".status-caution")).toHaveText(["likely", "likely"]);
  await expect(financing).toContainText("92 700");
  await expect(financing).toContainText("91 350");
});

test("keeps all 18 financing scenarios reachable", async ({ page }) => {
  const assigned = catalogData.vehicles.flatMap(({ financing_scenarios }) => financing_scenarios);
  expect(assigned).toHaveLength(12);
  expect(catalogData.globalFinancingScenarios).toHaveLength(6);
  expect([...assigned, ...catalogData.globalFinancingScenarios]).toHaveLength(18);

  await openShowroom(page);
  for (const [vehicleId, scenarioIds] of Object.entries(expectedAssignedScenarioIds)) {
    await selectVehicle(page, vehicleId);
    const financing = await openDestination(page, "Finansowanie");
    const assignedFinancing = financing.locator(".financing-list").first();
    await expect(assignedFinancing.locator(".financing-card")).toHaveCount(scenarioIds.length);
    for (const scenarioId of scenarioIds) {
      await expect(assignedFinancing.locator(`[data-scenario-id="${scenarioId}"]`)).toBeVisible();
    }
    await closeDestination(financing);
  }

  const financing = await openDestination(page, "Finansowanie");
  const globalFinance = financing.locator(".unassigned-financing");
  await globalFinance.locator("summary").click();
  await expect(globalFinance.locator(".financing-card")).toHaveCount(6);
  for (const scenario of catalogData.globalFinancingScenarios) {
    await expect(globalFinance.locator(`[data-scenario-id="${scenario.id}"]`)).toBeVisible();
  }
  await expect(globalFinance).not.toContainText("Hyundai");
});

test("exposes every one of the 18 source document paths through the UI", async ({ page }) => {
  const sourceDocuments = new Set<string>();
  for (const vehicle of catalogData.vehicles) {
    for (const document of vehicle.documents) sourceDocuments.add(document.path);
  }
  for (const scenario of catalogData.globalFinancingScenarios) {
    if (scenario.documentPath) sourceDocuments.add(scenario.documentPath);
  }
  expect(sourceDocuments.size).toBe(18);

  await openShowroom(page);
  const reachedDocuments = new Set<string>();
  for (const vehicle of catalogData.vehicles.filter(({ documents }) => documents.length > 0)) {
    await selectVehicle(page, vehicle.id);
    const more = await openDestination(page, "Więcej");
    const documents = await openMoreSection(more, "Dokumenty");
    const paths = await documents.locator(".document-button[data-document-path]").evaluateAll((buttons) =>
      buttons.map((button) => (button as HTMLElement).dataset.documentPath ?? ""),
    );
    expect(paths).not.toContain("");
    paths.forEach((path) => reachedDocuments.add(path));
    await closeDestination(more);
  }

  const financing = await openDestination(page, "Finansowanie");
  const globalFinance = financing.locator(".unassigned-financing");
  await globalFinance.locator("summary").click();
  const globalPaths = await globalFinance.locator(".document-button[data-document-path]").evaluateAll((buttons) =>
    buttons.map((button) => (button as HTMLElement).dataset.documentPath ?? ""),
  );
  expect(globalPaths).not.toContain("");
  globalPaths.forEach((path) => reachedDocuments.add(path));

  expect([...reachedDocuments].sort()).toEqual([...sourceDocuments].sort());
});

test("opens the full gallery, keeps image hash state, and renders fallback failure", async ({ page }) => {
  await page.route("**/cars/skoda-fabia-timiano-front.jpg", (route) => route.abort());
  await openShowroom(page, "#vehicle=skoda-fabia-drive-115-dsg&tab=overview&offer=skoda-fabia-green&image=0");
  await expect(page.locator(".vehicle-image-button .image-failure")).toHaveText("Obraz niedostępny");
  await page.unroute("**/cars/skoda-fabia-timiano-front.jpg");
  await page.reload();
  await expect(page.locator(".vehicle-image-button img")).toBeVisible();

  const galleryTrigger = page.locator(".gallery-count");
  await galleryTrigger.click();
  const gallery = page.getByRole("dialog", { name: "Galeria" });
  await expect(gallery).toBeVisible();
  const thumbnails = gallery.locator(".gallery-thumbnail");
  await expect(thumbnails).toHaveCount(5);
  await thumbnails.nth(1).click();
  await expect(thumbnails.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/image=1/);
  await page.keyboard.press("Escape");
  await expect(galleryTrigger).toBeFocused();

  const currentModel = page.locator(".model-identity h1");
  await expect(currentModel).toHaveText("Škoda Fabia");
  await page.getByRole("button", { name: "Następny model" }).click();
  await expect(currentModel).not.toHaveText("Škoda Fabia");
  await expect(page).toHaveURL(/image=0/);

});

test("compares up to three vehicles and restores comparison focus", async ({ page }) => {
  await openShowroom(page);
  const more = await openDestination(page, "Więcej");
  const comparison = await openMoreSection(more, "Porównanie");

  await comparison.getByRole("checkbox", { name: "skoda-fabia-drive-115-dsg" }).check();
  await comparison.getByRole("checkbox", { name: "citroen-c3-hybrid-110" }).check();
  await comparison.getByRole("checkbox", { name: "dacia-sandero-stepway" }).check();
  await expect(comparison.getByRole("checkbox", { name: "renault-clio" })).toBeDisabled();

  const trigger = comparison.getByRole("button", { name: "Porównaj (3/3)" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Porównanie samochodów" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("columnheader")).toHaveCount(4);
  await expect(dialog.getByRole("row", { name: /Cena oferty/ })).toContainText("brak oferty");
  await expect(dialog.getByRole("row", { name: /Długość × szerokość × wysokość/ })).toContainText("brak danych");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("restores hash routes, configuration, image, keyboard model navigation, and invoking focus", async ({ page }) => {
  await openShowroom(page, "#vehicle=citroen-c3-hybrid-110&tab=financing&image=0");
  const financing = page.getByRole("dialog", { name: "Finansowanie" });
  await expect(financing).toBeVisible();
  await expect(page.locator(".model-identity h1")).toHaveText("Citroën C3");
  await page.keyboard.press("Escape");

  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  await page.getByRole("button", { name: "Błękit Race metalizowany" }).click();
  await page.getByRole("button", { name: "Zdjęcia 1 z 5" }).click();
  const gallery = page.getByRole("dialog", { name: "Galeria" });
  await gallery.locator(".gallery-thumbnail").nth(1).click();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/vehicle=skoda-fabia-drive-115-dsg&tab=overview&offer=skoda-fabia-blue&image=1/);
  await page.reload();
  await expect(page.locator(".model-identity h1")).toHaveText("Škoda Fabia");
  await expect(page.getByRole("button", { name: "Błękit Race metalizowany" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Zdjęcia 2 z 5" })).toBeVisible();

  const counter = page.getByRole("button", { name: /Wybierz model, \d+ z 14/ });
  await counter.click();
  await page.keyboard.press("Escape");
  await expect(counter).toBeFocused();

  const warrantyTrigger = page.getByRole("button", { name: "Gwarancja", exact: true });
  await warrantyTrigger.click();
  await page.keyboard.press("Escape");
  await expect(warrantyTrigger).toBeFocused();

  await page.locator(".showroom-header").click({ position: { x: 2, y: 2 } });
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".model-identity h1")).not.toHaveText("Škoda Fabia");
});

test("opens full source documents and restores document focus", async ({ page }) => {
  await openShowroom(page);
  await selectVehicle(page, "skoda-fabia-drive-115-dsg");
  const more = await openDestination(page, "Więcej");
  const documents = await openMoreSection(more, "Dokumenty");
  const trigger = documents.locator(".document-button").first();
  await trigger.click();
  const dialog = page.locator("dialog.document-modal");
  await expect(dialog).toBeVisible();
  const text = dialog.locator("pre");
  await expect(text).toBeVisible();
  expect((await text.textContent())?.length ?? 0).toBeGreaterThan(10_000);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("keeps intermediate widths in a single column without horizontal clipping", async ({ page }) => {
  for (const viewport of [
    { width: 912, height: 1100 },
    { width: 1024, height: 1100 },
  ]) {
    await page.setViewportSize(viewport);
    await openShowroom(page);

    const layout = await page.evaluate(() => {
      const identity = document.querySelector(".model-identity")?.getBoundingClientRect();
      const stage = document.querySelector(".vehicle-stage")?.getBoundingClientRect();
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(".model-counter, .model-arrow, .destination-action"),
        (control) => {
          const rect = control.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        },
      );
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        identityBottom: identity?.bottom ?? null,
        stageTop: stage?.top ?? null,
        controls,
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.identityBottom).not.toBeNull();
    expect(layout.stageTop).not.toBeNull();
    expect(layout.stageTop!).toBeGreaterThanOrEqual(layout.identityBottom!);
    expect(layout.controls.length).toBeGreaterThan(0);
    for (const control of layout.controls) {
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(layout.clientWidth);
    }
  }
});

test("keeps all vehicle action rows inside both reference viewports", async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 800, height: 1280 },
  ]) {
    await page.setViewportSize(viewport);
    await openShowroom(page);

    for (const [index, vehicle] of catalogData.vehicles.entries()) {
      await expect(page.locator(".model-identity h1")).toHaveText(`${vehicle.make} ${vehicle.model}`);
      if (expectedNeutralWarrantySummaryIds.has(vehicle.id)) {
        await expect(page.locator(".showroom-summary dd").nth(1)).toHaveText("szczegóły w sekcji Gwarancja");
      }
      if (expectedNeutralProtectionSummaryIds.has(vehicle.id)) {
        await expect(page.locator(".showroom-summary dd").nth(2)).toHaveText("szczegóły w sekcji Gwarancja");
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const layout = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        viewportHeight: window.innerHeight,
        actions: Array.from(document.querySelectorAll<HTMLElement>(".destination-action"), (action) => {
          const rect = action.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        }),
      }));
      const context = `${vehicle.id} at ${viewport.width}x${viewport.height}`;

      expect(layout.scrollWidth, context).toBeLessThanOrEqual(layout.clientWidth);
      expect(layout.actions, context).toHaveLength(4);
      for (const action of layout.actions) {
        expect(action.left, context).toBeGreaterThanOrEqual(0);
        expect(action.right, context).toBeLessThanOrEqual(layout.clientWidth);
        expect(action.top, context).toBeGreaterThanOrEqual(0);
        expect(action.bottom, context).toBeLessThanOrEqual(layout.viewportHeight);
      }

      if (index < catalogData.vehicles.length - 1) {
        await page.getByRole("button", { name: "Następny model" }).click();
      }
    }
  }
});

test("keeps the borderless responsive shell accessible and free of horizontal overflow", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await openShowroom(page);

  await expectNoAxeViolations(page, ".showroom-shell");
  const layout = await page.evaluate(() => {
    const identity = document.querySelector(".model-identity")?.getBoundingClientRect();
    const stage = document.querySelector(".vehicle-stage")?.getBoundingClientRect();
    const facts = document.querySelector(".fact-list")?.getBoundingClientRect();
    const actions = document.querySelector(".destination-actions")?.getBoundingClientRect();
    return {
      width: window.innerWidth,
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      identity: identity ? { left: identity.left, top: identity.top, bottom: identity.bottom } : null,
      stage: stage ? { left: stage.left, top: stage.top, bottom: stage.bottom } : null,
      facts: facts ? { top: facts.top } : null,
      actions: actions ? { top: actions.top } : null,
      actionsBottom: actions?.bottom ?? null,
      viewportHeight: window.innerHeight,
      bodyBackground: getComputedStyle(document.body).backgroundImage,
    };
  });
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.bodyBackground).toBe("none");
  expect(layout.identity).not.toBeNull();
  expect(layout.stage).not.toBeNull();
  expect(layout.facts).not.toBeNull();
  expect(layout.actions).not.toBeNull();
  if (layout.width >= 800) {
    expect(layout.actionsBottom).not.toBeNull();
    expect(layout.actionsBottom!).toBeLessThanOrEqual(layout.viewportHeight);
  }
  if (layout.width > 900) {
    expect(layout.stage!.left).toBeGreaterThan(layout.identity!.left);
  } else {
    expect(layout.stage!.top).toBeGreaterThanOrEqual(layout.identity!.bottom);
    expect(layout.facts!.top).toBeGreaterThanOrEqual(layout.stage!.bottom - 1);
  }

  const more = await openDestination(page, "Więcej");
  await expectNoAxeViolations(page, more);
  expect(consoleErrors).toEqual([]);
});
