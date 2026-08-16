# Virtual Showroom Data

The `src/data/showroom.json` file is the only data catalog. The catalog uses schema version `1.0`.

The parser in `src/domain/showroom.ts` validates the catalog before use. The parser requires no validation library.

## Schema

The catalog contains a `sources` registry and a `models` array. Each model record has the following content:

- The record identifies the brand and model.
- The record describes versions, the powertrain, fuels, the gearbox, and technical data.
- The record contains offers and their short summaries.
- The record contains financing details and their short summaries.
- The record contains the base warranty and its extensions.
- The record links to materials shown under `Więcej`.

Each fact has `value`, `status`, and `sourceRef` fields. The source registry stores the `accessedAt` date.

## Fact statuses

- A `verified` status means that the cited source confirms the value.
- An `unverified` status means that a source provides the value, but the value requires further confirmation.
- An `unknown` status means that no value is confirmed. A fact with this status must have `value: null`.

The `unverified` status may contain a value or `null`. A `verified` value of `null` may mean a confirmed absence of a numeric limit.

## Sources and dates

`sourceRef` identifies one entry in `sources`. The parser rejects unknown references.

Supported source kinds are `official`, `dealer-email`, `independent`, `youtube`, and `input`.

Official, independent, and YouTube sources require an HTTPS address. Anonymized emails and input data have no URL.

The `accessedAt` date records the source check date in `YYYY-MM-DD` format. The current catalog reflects project decisions as of 2026-08-16.

## Privacy

The catalog contains only anonymized facts needed to compare offers. It contains no names, email addresses, or phone numbers.

The catalog contains no Gmail identifiers, private attachment names, raw PDFs, or data identifying a specific dealer.

Confirm the publication scope for exact financing terms before a public push.

## Offer states

- A `missing` state means `Brak oferty`. This state is explicit for Dacia, Renault, and Citroën.
- A `pending` state means that an announced offer has not arrived.
- An `available` state means that an offer or document has been received.

A missing price does not hide an offer. The price remains `null` when the document does not confirm an amount.

## Financing

The `nominalInterestRate` field stores the nominal interest rate. The `annualPercentageRate` field stores RRSO.

RRSO represents the annual total credit cost under statutory rules. It is not the nominal interest rate.

The Hyundai calculations record 7.79% as the nominal interest rate and 11.06% as RRSO. The calculation base price remains separate from the configuration price.

## Known gaps

- The Renault Eco-G 120 automatic gearbox remains `unknown`.
- The Citroën Plus and Max versions remain in scope. The official page does not confirm a current Max version.
- The electric range of the Hyundai Inster remains unconfirmed.
- No reliable cabin-noise measurements or measurement speeds were found.
- The timing drives and clutch types remain unconfirmed for the specified versions.
- Complete dimensions, weights, fuel-consumption figures, and ranges have not been collected.
- The exact Volkswagen warranty and the official Fiat warranty terms remain unconfirmed.
- The Toyota Yaris price and some financing terms remain unconfirmed.

## Test

Run the parser and contract tests:

```sh
bun test
```
