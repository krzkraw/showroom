import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import catalogData from "../../src/data/showroom.json" with { type: "json" };
import { copy } from "../../src/ui/copy.pl";

async function expectTargetsMeetMinimum(root: Locator) {
  const undersized = await root.locator("button:visible, a[href]:visible").evaluateAll((targets) =>
    targets.flatMap((target) => {
      const { width, height } = target.getBoundingClientRect();
      if (width >= 44 && height >= 44) return [];
      const name = target.getAttribute("aria-label") ?? target.textContent?.trim();
      return [`${name}: ${Math.round(width)}x${Math.round(height)}`];
    }),
  );
  expect(undersized).toEqual([]);
}

async function expectKeyboardFocusCycle(page: Page, root: Locator, startsFocused = false) {
  const targetCount = await root.locator("button:visible, a[href]:visible").count();
  const focused = new Set<string>();

  for (let index = 0; index < targetCount; index += 1) {
    if (!startsFocused || index > 0) await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeInViewport();
    const state = await page.evaluate(() => {
      const target = document.activeElement;
      if (!(target instanceof HTMLElement)) return null;
      const box = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      const top = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      return {
        key: target.getAttribute("aria-label") ?? target.textContent?.trim() ?? "",
        box: { top: box.top, left: box.left, bottom: box.bottom, right: box.right },
        target: target.matches("button, a[href]"),
        inViewport:
          box.top >= 0 &&
          box.left >= 0 &&
          box.bottom <= innerHeight &&
          box.right <= innerWidth,
        unobscured: top === target || target.contains(top),
        indicator:
          (style.outlineStyle !== "none" && style.outlineWidth !== "0px") ||
          style.boxShadow !== "none",
      };
    });

    expect(state?.target, `non-interactive focus for ${state?.key}`).toBe(true);
    expect(state?.inViewport, `offscreen focus: ${JSON.stringify(state)}`).toBe(true);
    expect(state?.unobscured, `obscured focus for ${state?.key}`).toBe(true);
    expect(state?.indicator, `missing focus indicator for ${state?.key}`).toBe(true);
    focused.add(state?.key ?? "");
  }

  expect(focused.size).toBe(targetCount);
}

test("model and version controls wrap across keyboard, buttons, and pointer input", async ({ page }) => {
  await page.goto("./");
  const total = catalogData.models.length;
  const counter = page.getByText(copy.modelCounter(1, total), { exact: true });
  const previous = page.getByRole("button", { name: copy.previousModel });
  const next = page.getByRole("button", { name: copy.nextModel });

  await next.click();
  await expect(page.getByText(copy.modelCounter(2, total), { exact: true })).toBeVisible();
  await previous.click();
  await expect(counter).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText(copy.modelCounter(total, total), { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(counter).toBeVisible();

  await next.click();
  await next.click();
  const versionNames = catalogData.models[2].versions.map((version) => version.name.value);
  const versionButtons = versionNames.map((name) =>
    page.getByRole("button", { name: copy.selectVersion(name) }),
  );

  await page.keyboard.press("ArrowUp");
  await expect(versionButtons[2]).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowDown");
  await expect(versionButtons[0]).toHaveAttribute("aria-pressed", "true");
  await versionButtons[1].click();
  await expect(versionButtons[1]).toHaveAttribute("aria-pressed", "true");

  const selector = page.getByRole("list", { name: copy.versions });
  const box = await selector.boundingBox();
  expect(box).not.toBeNull();
  if (box === null) return;
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect(versionButtons[2]).toHaveAttribute("aria-pressed", "true");
});

test("warranty summary preserves a known duration when mileage is unknown", async ({ page }) => {
  await page.goto("./");
  const next = page.getByRole("button", { name: copy.nextModel });
  await next.click();
  await next.click();
  await next.click();

  const aygo = catalogData.models.find((model) => model.id === "toyota-aygo-x");
  const relax = aygo?.warranty.find((warranty) => warranty.id === "relax");
  if (relax?.label.value === null || relax?.label.value === undefined) {
    throw new Error("Toyota Relax fixture label is missing");
  }

  const summary = page.getByLabel(copy.showroomSummary);
  await expect(
    summary.getByText(relax.label.value, { exact: true }).locator("..").locator("dd"),
  ).toHaveText(copy.upToEither(copy.summaryYears(10), copy.unknownFact));
});

test("destinations support keyboard activation, all close paths, and honest missing facts", async ({
  page,
}) => {
  await page.goto("./");
  const destinations = [copy.offers, copy.financing, copy.warranty, copy.more];

  const summary = page.getByLabel(copy.showroomSummary);
  for (const [label, value] of [
    [copy.offer, copy.noOffer],
    [copy.manufacturerWarranty, copy.summaryYears(3)],
    [copy.nonStopWarranty, copy.upToEither(copy.summaryYears(5), copy.kilometers(200_000))],
    [copy.financing, copy.unknownFact],
  ]) {
    await expect(summary.getByText(label, { exact: true }).locator("..").locator("dd")).toHaveText(
      value,
    );
  }

  for (const name of destinations) {
    const trigger = page.getByRole("button", { name });
    await expect(trigger.locator("svg[aria-hidden='true']")).toHaveCount(1);
    await trigger.press("Enter");
    await expect(page.getByRole("dialog", { name })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }

  const offers = page.getByRole("button", { name: copy.offers });
  await offers.press("Enter");
  await page.getByRole("dialog", { name: copy.offers }).getByRole("button", { name: copy.back }).press("Enter");
  await expect(offers).toBeFocused();

  await offers.press("Enter");
  const dialog = page.getByRole("dialog", { name: copy.offers });
  const heading = dialog.getByRole("heading", { name: copy.offers, exact: true }).locator("..");
  await heading.hover();
  const box = await heading.boundingBox();
  expect(box).not.toBeNull();
  if (box === null) return;
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, { steps: 3 });
  await page.mouse.up();
  await expect(dialog).toBeHidden();
  await expect(offers).toBeFocused();

  await page.keyboard.press("ArrowLeft");
  for (const label of [copy.power, copy.consumption, copy.dimensions, copy.weight, copy.cabinNoise]) {
    await expect(page.getByText(label, { exact: true }).locator("..").locator("dd")).toHaveText(
      copy.unknownFact,
    );
  }

  const warranty = page.getByRole("button", { name: copy.warranty });
  await warranty.press("Enter");
  const warrantyDialog = page.getByRole("dialog", { name: copy.warranty });
  const baseWarranty = warrantyDialog
    .getByRole("heading", { name: copy.baseWarranty, level: 3, exact: true })
    .locator("..");
  await expect(
    baseWarranty.getByText(copy.distanceLimit, { exact: true }).locator("..").locator("dd"),
  ).toHaveText(copy.noMileageLimit);
});

test("visible controls meet touch, focus, axe, and reduced-motion requirements", async ({ page }) => {
  await page.goto("./");
  const main = page.locator("main");
  await expectTargetsMeetMinimum(main);
  await expectKeyboardFocusCycle(page, main);

  const pageAxe = await new AxeBuilder({ page }).analyze();
  expect(pageAxe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual(
    [],
  );

  for (const name of [copy.offers, copy.financing, copy.warranty, copy.more]) {
    const trigger = page.getByRole("button", { name });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name });
    await expect(dialog).toBeVisible();
    await expectTargetsMeetMinimum(dialog);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }

  const more = page.getByRole("button", { name: copy.more });
  await more.click();
  const dialog = page.getByRole("dialog", { name: copy.more });
  await expect(dialog).toBeVisible();
  await dialog.evaluate(async (target) => {
    await Promise.all(target.getAnimations().map((animation) => animation.finished));
  });
  await expectKeyboardFocusCycle(page, dialog, true);
  const dialogAxe = await new AxeBuilder({ page }).include("#destination-sheet").analyze();
  expect(
    dialogAxe.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })),
  ).toEqual([]);
  await page.keyboard.press("Escape");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await more.click();
  await expect(page.getByRole("dialog", { name: copy.more })).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const durationMs = await page.getByRole("dialog", { name: copy.more }).evaluate((target) => {
    const duration = getComputedStyle(target).animationDuration;
    return duration.endsWith("ms") ? Number.parseFloat(duration) : Number.parseFloat(duration) * 1000;
  });
  expect(durationMs).toBeLessThanOrEqual(0.01);
});

test("source and material links keep 48px targets at narrow width", async ({ page }) => {
  await page.setViewportSize({ width: 520, height: 900 });
  await page.goto("./");

  for (const [destination, selector] of [
    [copy.warranty, "a.source-line"],
    [copy.more, ".material-list a"],
  ] as const) {
    await page.getByRole("button", { name: destination }).click();
    const dialog = page.getByRole("dialog", { name: destination });
    const link = dialog.locator(selector).first();
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(48);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("initial tablet view matches the accepted baseline", async ({ page }) => {
  await page.goto("./");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page).toHaveScreenshot({ animations: "disabled", caret: "hide" });
});
