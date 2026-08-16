---
id: auta-003-responsive-showroom-experience
title: Responsive showroom experience
status: inbox
agent: codex
verification:
  - bun test
  - bun run build
---

# Grill Gate

- Decision: The implementation follows `design/concept-landscape.png` and `design/concept-portrait.png`.
- Decision: The UI shows every version. C3 Max and Collection do not exclude each other.
- Decision: Unconfirmed LPG variants remain available, with each uncertainty recorded for the user's final validation.
- Decision: Facts with `unknown` status and `null` values receive no substitute numbers.
- Decision: This spec includes no Gmail access.
- Decision: Every future commit or push requires separate user authorization.

# Goal

Implement the accepted landscape and portrait tablet views with clear interaction patterns for older users.

# Dependencies

- This spec depends first on `auta-001-catalog-completeness-and-validation`.
- This spec then depends on `auta-002-react-showroom-foundation`.

# Scope

- The implementation scope includes `src/`.
- The landscape reference is `design/concept-landscape.png`.
- The portrait reference is `design/concept-portrait.png`.

# Requirements

- The UI SHALL show all 12 models.
- The UI SHALL place bare `<` and `>` glyphs beside the car without visible backgrounds.
- The UI SHALL place version-name selectors directly below the car.
- The selected version SHALL be black, bold, and indicated without color alone.
- Unselected versions SHALL be gray, readable, and accessible by touch.
- WHEN a user taps a version name, THEN the app SHALL select that version.
- WHEN a user swipes the version row or car area, THEN the app SHALL change the relevant item.
- The UI SHALL provide a visible touch alternative for every gesture.
- The UI SHALL show power, fuel consumption or range, dimensions, weight, and cabin noise.
- WHEN a fact is unknown, THEN the UI SHALL show `Brak potwierdzonych danych`.
- The UI SHALL preserve the flat, borderless layout and readability for older users.
- Repository artifacts, specs, documentation, code, comments, and test text SHALL be written in English. Polish SHALL appear only in end-user-visible showroom copy and accepted mockup text.

# Acceptance Criteria

- The views match both accepted `design/` files.
- Navigation covers all 12 models without omission.
- Tap and swipe interactions work for both models and versions as designed.
- Controls do not rely on gesture or color alone.
- Every fact preserves its source state without an added value.
- The layout works without horizontal scrolling in both tablet orientations.
- Tests and the static build pass.

# Out of Scope

- Fetching new data is out of scope.
- Gmail access is out of scope.
- Publication is out of scope.
- Commits and pushes are out of scope.
