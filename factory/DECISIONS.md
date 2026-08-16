# Project decisions

This file records the settled decisions for specs `auta-001` to `auta-006`. Date: 2026-08-16.

The user settled the decisions in `Confirmed by the user`. The assistant settled the decisions in `Delegated to the assistant`.

## Confirmed by the user

- The public repository name is `showroom`. The public URL is `https://krzkraw.github.io/showroom/`.
- Development uses placeholder images. A placeholder shows a gray field, the model name, and the label `Zdjęcie poglądowe`.
- The catalog keeps no image field. A UI-side map connects a model ID to a real photo when photography exists.
- Vite bundles the development server, the static build, and the Playwright preview.
- `bun test` stays the unit test runner. The verification commands in the specs stay unchanged.
- The four destinations open as a full-screen overlay. The overlay slides up on open. The overlay slides down on close.
- The showroom stays visible and static behind the overlay. The overlay applies no dim layer.
- A downward swipe closes the overlay. The visible `Wróć` button closes the overlay too.
- `prefers-reduced-motion` degrades the slide to an instant swap.
- Playwright runs the E2E tests. Playwright installs Chromium only.
- The acceptance viewports are 1280x800 landscape and 800x1280 portrait.
- The version selector shows tappable version names only. The UI adds no up or down glyphs.
- The version row renders even when the model has one version.
- One `src/ui/copy.pl.ts` dictionary holds every Polish string. The user reviews this file during `auta-003` acceptance.
- One implementer subagent and one reviewer subagent run per spec. The root dispatches both directly.
- Both subagents use the same model settings as the root agent.
- Each accepted spec produces one commit and one push.
- The repository starts private. The repository becomes public during `auta-006`.
- A reviewer checks the catalog, the parser, and personal data before `auta-001` moves to archive.
- The application uses self-hosted Inter, a light theme, and no dark mode.
- `bin/loop-factory` stages and dispatches each spec. The `review-and-archive` skill closes each spec.
- The `Więcej` destination ships with honest empty states. The catalog receives YouTube materials later.

## Delegated to the assistant

### Dependencies and versions

- Install React 19.2.8, Vite 8.2.1, Tailwind CSS 4.3.3, and TypeScript 7.0.2.
- Install `@tailwindcss/vite` 4.3.3. Do not add a PostCSS pipeline.
- WHEN TypeScript 7.0.2 breaks a build tool, THEN fall back to 6.0.3, and then to 5.9.3.
- Install `@fontsource-variable/inter` 5.3.0. This dependency removes every runtime font request.
- Install `@playwright/test` 1.62.1 and `@axe-core/playwright` 4.13.0.
- Add no swipe library. Pointer events with a 40 px threshold implement every swipe.
- Add no router, no state library, and no animation library.
- Commit `bun.lock`.

### Structure

- Keep `index.html` at the repository root. Keep the Vite root at the repository root.
- Keep the existing `src/data/` and `src/domain/` directories unchanged.
- Add `src/main.tsx`, `src/App.tsx`, `src/ui/` components, and `src/ui/copy.pl.ts`.
- Import the JSON directly into the bundle. Validate it once through `Catalog.fromJSON` at module load.
- Use no fetch call and no async data loading.
- Hold the model index, the version index, and the open destination in `useState` inside `App`.

### UI

- Take the shadcn components `sheet` and `button` only. The `sheet` component provides the bottom slide, the focus trap, and the Escape key.
- Set `<html lang="pl">`.
- Keep the catalog order. Dacia stays first. The counter shows `1 z 12`.
- Bind `ArrowLeft` and `ArrowRight` to the model. Bind `ArrowUp` and `ArrowDown` to the version.
- Set the base font size to 20 px. Set every touch target to a 48 px minimum.
- Use near-black text, gray secondary text, and the concept red as an accent only.
- Filter offers and financing by `versionId`. Show the warranty at model level.

### Verification and publication

- Add `test:e2e` as `playwright test`. Run two Playwright projects for the two acceptance viewports.
- Write the E2E interaction tests and the accessibility tests in Playwright. Add no jsdom dependency.
- Keep `test-results/` untracked. Commit the two accepted screenshots to `design/acceptance/`.
- Ignore `node_modules`, `dist`, `.DS_Store`, `playwright-report`, and `test-results`.
- Set the Vite `base` option to `/showroom/`.
- Publish through a GitHub Actions workflow during `auta-006`. The workflow uploads the `dist` output only.
- Write every commit message in Conventional Commits format. Commit to `main` without a pull request.

## Findings carried to later specs

The `auta-002` review accepted the foundation and raised these items. Each item
belongs to a later spec.

- `auta-003`: run `shadcn init` and take the `sheet` and `button` components.
- `auta-003`: install `@vitejs/plugin-react` to restore React Fast Refresh.
- `auta-003`: set the page title from `src/ui/copy.pl.ts` in `src/main.tsx`.
- `auta-004`: correct the fact renderer for a confirmed absence. `src/ui/facts.ts`
  currently returns `Brak potwierdzonych danych` for every `null` value. A fact
  with `status: "verified"` and `value: null` records a confirmed absence, not
  missing data. The Hyundai warranty `distanceLimitKm` is the live case: the
  value is `null` and `verified`, and the sibling `terms` confirms an unlimited
  mileage warranty. The warranty view SHALL NOT report that fact as missing.
- `auta-006`: the built bundle contains every financing number. Confirm the
  public scope before the repository becomes public.
