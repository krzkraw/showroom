---
id: auta-001-catalog-completeness-and-validation
title: Catalog completeness and data validation
status: inbox
agent: codex
verification:
  - python3 -m json.tool src/data/showroom.json >/dev/null
  - bun test
---

# Grill Gate

- Decision: The catalog includes all 12 models and all relevant versions.
- Decision: C3 Max and Collection remain distinct catalog versions; neither is grounds for excluding the model.
- Decision: Unconfirmed LPG automatic variants do not block the catalog; record each uncertainty for the user's final validation.
- Decision: The user will perform the Peugeot follow-up after 2026-08-17; this spec includes no Gmail access.
- Decision: Unsupported facts retain `unknown` status and `null` values.
- Decision: Exact anonymized financing terms may be public when they contain no personal data.
- Decision: Every future commit or push requires separate user authorization.

# Goal

Complete the catalog with every relevant version of all 12 models. Preserve the explicit provenance and uncertainty of every fact.

# Dependencies

- This spec has no dependencies.

# Scope

- The scope includes `src/data/showroom.json`.
- The scope includes `src/domain/showroom.ts`.
- The scope includes tests in `src/`.
- The scope includes `README.md` when the schema description requires an update.

# Requirements

- WHEN a reliable source confirms a fact, THEN the catalog SHALL record the source, access date, and verification status.
- WHEN no reliable source confirms a fact, THEN the catalog SHALL retain `unknown` status and a `null` value.
- The catalog SHALL contain the 12 named models and every relevant known version.
- The catalog SHALL retain C3 Max and Collection without artificially excluding either version.
- The catalog SHALL record every uncertainty about automatic LPG variants for the user's final validation.
- The catalog SHALL allow exact financing terms only after anonymization and source attribution.
- The implementation SHALL use the existing data model when it satisfies the requirements.
- The implementation SHALL not create a Gmail access task.
- Repository artifacts, specs, documentation, code, comments, and test text SHALL be written in English. Polish SHALL appear only in end-user-visible showroom copy and accepted mockup text.

# Acceptance Criteria

- The JSON file contains exactly 12 models.
- Each model contains every relevant version identified in the project's public data.
- Every unconfirmed fact remains explicit and receives no estimated value.
- The parser rejects an invalid contract and accepts the complete catalog.
- The parser test passes.
- The catalog contains no personal data.
- The user performs final catalog correctness validation before publication.

# Out of Scope

- Gmail access is out of scope.
- Guessing missing parameters is out of scope.
- UI implementation is out of scope.
- Commits, pushes, and publication are out of scope.
