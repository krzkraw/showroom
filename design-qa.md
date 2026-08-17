# Design QA

## Source visual truth

- `design/concept-landscape.png`
- `design/concept-portrait.png`

The current schema and vehicle assets intentionally replace the mockups' sample data.

## Implementation evidence

- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-landscape.png`
- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-portrait.png`
- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-peugeot-portrait.png`
- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-landscape-comparison.png`
- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-portrait-comparison.png`

## Normalization

- Landscape source pixels: 1280 x 800.
- Landscape implementation pixels: 1280 x 800.
- Landscape CSS viewport: 1280 x 800.
- Portrait source pixels: 800 x 1280.
- Portrait implementation pixels: 800 x 1280.
- Portrait CSS viewport: 800 x 1280.
- Device scale factor: 1.
- Density normalization: none required.
- Intermediate implementation viewport: 912 x 1100.
- State: Fiat Grande Panda, first offer, first gallery image, closed destination sheet.

## Full-view comparison

The final implementation preserves the reference composition at both primary viewports.

- The page uses a flat white canvas.
- The header retains the title and compact model counter.
- The landscape view uses the original identity, facts, summary, vehicle, and action regions.
- The portrait view keeps the original vertical order and bottom action row.
- The vehicle remains the dominant visual element within the supplied image constraints.
- Bare model arrows flank the vehicle.
- The selected configuration uses black text and a red underline.
- The four red-icon actions remain fully visible at both reference viewports.
- The current factual content remains distinct from the mockup's sample Dacia content.

## Focused-region comparison

Focused checks covered the header, vehicle stage, fact rows, commercial summary, and action row.

- Header spacing and type hierarchy match the reference closely.
- Missing facts use `Brak potwierdzonych danych`.
- Incomplete dimensions use one honest missing-state phrase.
- Commercial summaries remain concise enough for the reference viewport.
- The action icons, dividers, labels, and alignment follow the original design.
- The Fiat source image has lower resolution and more embedded whitespace than the reference image.
- No image cropping, fabrication, or replacement was used.

## Interaction and browser evidence

- The model directory opened and filtered to Fabia.
- The offer sheet opened and exposed its document action.
- The gallery sheet opened and exposed both images.
- The More sheet opened and exposed technical sections.
- Sheet focus restoration worked.
- The final clean browser session reported no JavaScript errors.
- The final console contained only Vite and React development messages.
- The 912-pixel view had no horizontal clipping.
- The responsive regression covered all 14 vehicles at both reference viewports.
- All 28 vehicle and viewport combinations kept the complete action row visible.

## Comparison history

### Iteration 1

Findings:

- P1: Long warranty text pushed the action row below both reference viewports.
- P1: Missing primary facts used `brak danych` instead of the required phrase.
- P2: Incomplete dimensions mixed confirmed values with missing fragments.
- P2: The subtitle included missing-data fragments.
- P2: The visible counter included the extra word `Model`.
- P2: The layout overflowed between 901 and 1099 pixels.
- P2: The full-canvas live region exposed modal background controls.

Repairs:

- Main warranty summaries now use concise confirmed clauses.
- Full warranty text remains in the Warranty sheet.
- Main missing facts use the required phrase.
- Incomplete dimensions collapse to one missing state.
- The subtitle omits absent facts.
- The counter now uses `X z 14` with an explicit accessible name.
- The single-column breakpoint now covers intermediate widths.
- The full-canvas live region was removed.

### Iteration 2

Post-fix evidence:

- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-landscape-comparison.png`
- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-portrait-comparison.png`

The second comparison exposed longer summaries on several non-default vehicles.

### Iteration 3

Repairs:

- Unsafe or oversized warranty summaries now use a neutral details pointer.
- Complete source qualifications remain available in the Warranty sheet.
- The portrait image ratio supplies headroom for long confirmed facts.
- An all-vehicle test covers 28 vehicle and viewport combinations.

Post-fix evidence:

- `/Users/krz/.codex/visualizations/2026/08/17/01a010ab-690e-7870-afb6-cc4e5e77168c/showroom-final-peugeot-portrait.png`

No actionable P0, P1, or P2 visual findings remain.

## Remaining P3 limitations

- The supplied Fiat image is visibly lower-resolution than the original Dacia concept image.
- The supplied Fiat image contains embedded whitespace and `Zdjęcie przykładowe` text.
- Expanded commercial content creates small spacing differences from the static concept.

These limitations do not change the restored hierarchy or navigation model.

final result: passed
