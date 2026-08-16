---
id: auta-002-react-showroom-foundation
title: React showroom foundation
status: inbox
agent: codex
verification:
  - bun test
  - bun run build
---

# Grill Gate

- Decision: The application uses the complete catalog after `auta-001-catalog-completeness-and-validation` is accepted.
- Decision: Values with `unknown` status and `null` values remain honest UI states.
- Decision: Unconfirmed LPG variants do not block application initialization.
- Decision: This spec includes no Gmail access.
- Decision: Every future commit or push requires separate user authorization.

# Goal

Create the simplest static foundation for a one-page showroom by using Bun, React, TypeScript, and shadcn/ui.

# Dependencies

- This spec depends on `auta-001-catalog-completeness-and-validation`.

# Scope

- The scope includes the public requirements in `README.md`.
- The scope includes the data and code in `src/`.
- The scope includes the minimum configuration required for tests and a static build.

# Requirements

- BEFORE installing dependencies, the implementer SHALL check current stable versions in official registries.
- The app SHALL use Bun, React, TypeScript, and shadcn/ui.
- The app SHALL build one static page without a router.
- The app SHALL load the existing JSON through the validated model in `src/`.
- The app SHALL not add a state library.
- The app SHALL not add a dependency without a current need.
- The app SHALL not add speculative factories, layers, or abstractions.
- WHEN the catalog contains `unknown` or `null`, THEN the app SHALL preserve that state without estimation.
- Repository artifacts, specs, documentation, code, comments, and test text SHALL be written in English. Polish SHALL appear only in end-user-visible showroom copy and accepted mockup text.

# Acceptance Criteria

- Installation uses verified stable versions.
- The one-page application starts through Bun and loads the catalog.
- The static build succeeds.
- Catalog tests continue to pass.
- The project contains no router or state library.
- shadcn/ui is used only where it simplifies the required UI.

# Out of Scope

- The final responsive layout is out of scope.
- Complete offer and financing screens are out of scope.
- GitHub Pages publication is out of scope.
- Commits and pushes are out of scope.
