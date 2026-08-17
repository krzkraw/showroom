---
id: auta-006-github-pages-publication
title: GitHub Pages publication
status: active
agent: codex
verification:
  - bun test
  - bun run test:e2e
  - bun run build
---

# Grill Gate

- Decision: Before publication, the user performs final validation of catalog correctness and LPG uncertainties.
- Decision: Exact financing terms may be public only after anonymization and a personal-data check.
- Decision: The user will perform the Peugeot follow-up after 2026-08-17. This spec includes no Gmail access.
- Decision: Unsupported facts retain `unknown` status and `null` values.
- Decision: Every future commit, push, or GitHub state mutation requires separate explicit user authorization.
- Decision: The current `inbox` status authorizes no implementation or publication.

# Goal

Prepare and publish the static application through GitHub Pages after all checks pass and separate authorization is granted.

# Dependencies

- This spec depends first on `auta-001-catalog-completeness-and-validation`.
- This spec then depends on `auta-002-react-showroom-foundation`.
- This spec then depends on `auta-003-responsive-showroom-experience`.
- This spec then depends on `auta-004-offers-financing-warranty-more`.
- This spec finally depends on `auta-005-accessibility-tests-and-visual-acceptance`.

# Scope

- The scope includes the public application in `src/`.
- The scope includes the public documentation in `README.md`.
- The scope includes the static build and GitHub Pages configuration.
- The scope includes verification of the public URL.

# Requirements

- BEFORE any Git or GitHub mutation, the implementer SHALL obtain separate user authorization for the required commit and push.
- BEFORE publication, the implementer SHALL confirm the user's final catalog validation.
- BEFORE publication, the implementer SHALL check the complete public scope for personal data.
- The check SHALL allow exact financing data only after complete anonymization.
- The implementer SHALL run all tests and the static build.
- GitHub Pages configuration SHALL publish only the static build output.
- WHEN publication completes, THEN the implementer SHALL verify the public URL.
- WHEN the public URL works, THEN the implementer SHALL verify landscape and portrait tablet layouts.
- Publication SHALL require no Gmail access.
- Repository artifacts, specs, documentation, code, comments, and test text SHALL be written in English. Polish SHALL appear only in end-user-visible showroom copy and accepted mockup text.

# Acceptance Criteria

- The user has confirmed catalog correctness.
- The personal-data check finds no private data within the public scope.
- Tests, E2E tests, and the build pass.
- Separate authorization for the required Git and GitHub mutations was recorded before any action.
- GitHub Pages provides a working public URL.
- The public page works in both tablet orientations.
- The public build contains only approved artifacts.

# Out of Scope

- Implementing this spec while creating it is out of scope.
- Gmail access is out of scope.
- Publishing personal data is out of scope.
- Any Git or GitHub mutation without separate authorization is out of scope.
