---
id: auta-005-accessibility-tests-and-visual-acceptance
title: Accessibility tests and visual acceptance
status: accepted
agent: codex
verification:
  - bun test
  - bun run test:e2e
  - bun run build
---

# Grill Gate

- Decision: The files `design/concept-landscape.png` and `design/concept-portrait.png` are the visual acceptance references.
- Decision: The tests cover honest `unknown`, `null`, and `Brak potwierdzonych danych` states.
- Decision: Unconfirmed LPG variants do not block tests. Each uncertainty remains for the user's final validation.
- Decision: This spec includes no Gmail access.
- Decision: Every future commit or push requires separate user authorization.

# Goal

Add runnable interaction and accessibility tests, and then verify both accepted tablet layouts.

# Dependencies

- This spec depends first on `auta-002-react-showroom-foundation`.
- This spec then depends on `auta-003-responsive-showroom-experience`.
- This spec finally depends on `auta-004-offers-financing-warranty-more`.

# Scope

- The implementation scope includes `src/`.
- The scope includes interaction and accessibility tests.
- The landscape acceptance reference is `design/concept-landscape.png`.
- The portrait acceptance reference is `design/concept-portrait.png`.

# Requirements

- Tests SHALL cover model changes through `<` and `>`.
- Tests SHALL cover both tapping and swiping the version selector.
- Every touch target SHALL have a 44 px minimum and a 48 px design target.
- Every interactive element SHALL work with a keyboard.
- Focus SHALL be visible and unobscured.
- Text SHALL have at least 4.5:1 contrast.
- Animations SHALL respect `prefers-reduced-motion`.
- Verification SHALL capture real tablet screenshots in landscape and portrait orientations.
- Screenshots SHALL be compared with both accepted `design/` files.
- Tests SHALL verify that missing data creates no number, speed, or estimate.
- Repository artifacts, specs, documentation, code, comments, and test text SHALL be written in English. Polish SHALL appear only in end-user-visible showroom copy and accepted mockup text.

# Acceptance Criteria

- Runnable interaction tests pass.
- Runnable accessibility tests pass.
- Keyboard input operates every action and selector.
- Every touch target meets the 44 px minimum and aims for 48 px.
- Both real screenshots preserve the hierarchy of the accepted designs.
- Contrast, focus, and reduced motion are confirmed.
- Tests and the static build pass.

# Out of Scope

- Changing the accepted visual direction is out of scope.
- Gmail access is out of scope.
- Publication is out of scope.
- Commits and pushes are out of scope.
