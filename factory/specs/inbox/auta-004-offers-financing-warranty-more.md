---
id: auta-004-offers-financing-warranty-more
title: Offers, financing, warranty, and more
status: inbox
agent: codex
verification:
  - bun test
  - bun run build
---

# Grill Gate

- Decision: Exact anonymized financing terms and numbers may be public when they contain no personal data.
- Decision: The user will perform the Peugeot follow-up after 2026-08-17. This spec includes no Gmail access.
- Decision: Unconfirmed facts retain `unknown` status, `null` values, or a clear empty state.
- Decision: Unconfirmed LPG automatic variants do not block offer presentation.
- Decision: Every future commit or push requires separate user authorization.

# Goal

Implement four large destinations that provide honest, sourced information for the selected model and version.

# Dependencies

- This spec depends first on `auta-001-catalog-completeness-and-validation`.
- This spec then depends on `auta-002-react-showroom-foundation`.
- This spec finally depends on `auta-003-responsive-showroom-experience`.

# Scope

- The implementation scope includes `src/`.
- The scope uses the public data description in `README.md`.

# Requirements

- The UI SHALL provide the large actions `Oferty`, `Finansowanie`, `Gwarancja`, and `Więcej`.
- Each action SHALL open a simple one-page view for the selected model and version.
- WHEN an offer exists, THEN the one-page view SHALL show only sourced, anonymized facts.
- WHEN no offer exists, THEN the one-page view SHALL show `Brak oferty`.
- Financing SHALL distinguish confirmed numbers from gaps and doubts.
- The warranty view SHALL show the base period and confirmed extension programs.
- The `Więcej` view SHALL provide places for YouTube materials and technical data.
- WHEN material does not exist, THEN the UI SHALL show an honest empty state.
- The implementation SHALL fetch no Gmail messages or attachments.
- Repository artifacts, specs, documentation, code, comments, and test text SHALL be written in English. Polish SHALL appear only in end-user-visible showroom copy and accepted mockup text.

# Acceptance Criteria

- The four actions are visible, large, and keyboard- and touch-accessible.
- Each one-page view preserves the context of the selected model and version.
- Exact financing data is anonymized and sourced.
- Warranty terms distinguish base protection from extensions.
- Data gaps are explicit and do not block navigation.
- YouTube and technical materials have clear empty states.
- Tests and the static build pass.

# Out of Scope

- Gmail access is out of scope.
- Publishing personal or dealer data is out of scope.
- Guessing installments, prices, or terms is out of scope.
- Commits, pushes, and publication are out of scope.
