# Design QA

## Sources and capture state

- Landscape reference: `design/concept-landscape.png`, 1280 × 800.
- Landscape acceptance: `design/acceptance/landscape.png`, 1280 × 800.
- Portrait reference: `design/concept-portrait.png`, 800 × 1280.
- Portrait acceptance: `design/acceptance/portrait.png`, 800 × 1280.
- State: initial Dacia Sandero Stepway model with Extreme Eco-G 120 selected.
- Capture method: the existing Playwright screenshot test at each reference viewport.
- Capture controls: loaded local fonts, disabled animations, and hidden the caret.

The repository user-context preflight returned no stored visual context. The two concept images remained the only visual source.

## Comparison and iterations

1. The initial comparison found three P1 differences.
   The page omitted the four-row summary.
   The destination actions used gray text tiles without icons.
   The portrait fact rows had excess vertical spacing.
2. The first implementation added data-derived summary rows and four Lucide icons.
   It also added responsive summary and action grid areas.
   The first captures exposed P2 differences in summary order, fact cadence, action placement, and portrait insets.
3. The second implementation matched the concept order and vertical rhythm.
   It placed landscape actions at the viewport bottom with separators.
   It placed portrait icons above labels across the full viewport width.
   The resulting captures have no remaining P0, P1, or P2 findings.

## Final comparison

The landscape capture matches the reference hierarchy and major geometry.
The identity and facts occupy the left column.
The vehicle stage and selected version occupy the right column.
The summary follows the facts.
The four actions span the lower viewport with vertical separators.

The portrait capture matches the reference sequence and spacing.
The vehicle stage follows the identity.
The version selector follows the stage.
The five separated facts precede the four-row summary.
The four icon actions remain visible in one row near the viewport bottom.

All action targets retain keyboard focus indicators and minimum target sizes.
All icons are decorative and hidden from the accessibility tree.
The visible button labels remain their accessible names.

## Intentional deviation and remaining P3 items

- The acceptance captures retain the deliberate gray vehicle placeholder.
  The concepts show a vehicle photograph, but no approved raster vehicle asset exists.
  No image was generated or inferred for this placeholder.
- The Lucide icon outlines differ slightly from the concept artwork.
  Their roles, scale, red outline treatment, and responsive arrangement match the concepts.

final result: passed
