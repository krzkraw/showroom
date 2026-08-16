import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import catalogData from "./data/showroom.json";
import {
  Catalog,
  type Fact,
  type FuelKind,
  type MoreLink,
  type NumberRange,
  type Vehicle,
  type VehicleVersion,
  type Warranty,
} from "./domain/showroom";
import { copy } from "./ui/copy.pl";
import {
  financingForVersion,
  financingRateRows,
  isDownwardSwipe,
  offerPriceRows,
  offersForVersion,
  resolveSource,
  type Destination,
  warrantySections,
} from "./ui/destinations";
import {
  distanceLimitText,
  factText,
  formattedFactText,
  missingFactText,
} from "./ui/facts";
import { swipeStep, wrappedIndex } from "./ui/navigation";

// The catalog is validated once, at module load, without any fetch call.
const catalog = Catalog.fromJSON(catalogData);

const destinationActions = [
  ["offers", copy.offers],
  ["financing", copy.financing],
  ["warranty", copy.warranty],
  ["more", copy.more],
] as const satisfies readonly (readonly [Destination, string])[];

function numberFactText(fact: Fact<number>, unit: string): string {
  const text = factText(fact);
  return fact.value === null ? text : `${text} ${unit}`;
}

function rangeFactText(fact: Fact<NumberRange>, unit: string): string {
  if (fact.value === null) return missingFactText(fact);
  const value =
    fact.value.min === fact.value.max
      ? String(fact.value.min)
      : `${fact.value.min}–${fact.value.max}`;
  return `${value} ${unit}`;
}

function dimensionsText(version: VehicleVersion): string {
  const { length, width, height } = version.dimensionsMm;
  const values = [length, width, height];
  const missing = values.find((fact) => fact.value === null);
  if (missing !== undefined) return missingFactText(missing);
  return `${length.value} × ${width.value} × ${height.value} mm`;
}

function noiseText(version: VehicleVersion): string {
  const noise = version.noiseMeasurementDb;
  if (noise.value === null) return missingFactText(noise);
  const speed = version.noiseMeasurementSpeedKph;
  return speed.status === "unknown" || speed.value === null
    ? `${noise.value} dB`
    : `${noise.value} dB · ${speed.value} km/h`;
}

function fuelText(fuels: Fact<readonly FuelKind[]>): string | null {
  if (fuels.value === null) return missingFactText(fuels);
  return fuels.value.map((fuel) => copy.fuelLabels[fuel]).join(" + ");
}

function SourceLine({ sourceRef }: { readonly sourceRef: string }) {
  const source = resolveSource(sourceRef, catalog.sources);
  if (source === null) return <p className="source-line">{copy.sourceUnavailable}</p>;
  const text = copy.source(source.label, source.accessedAt);
  return source.href === null ? (
    <p className="source-line">{text}</p>
  ) : (
    <a className="source-line" href={source.href} target="_blank" rel="noreferrer">
      {text}
    </a>
  );
}

function SourceLines({ sourceRefs }: { readonly sourceRefs: readonly string[] }) {
  return [...new Set(sourceRefs)].map((sourceRef) => (
    <SourceLine key={sourceRef} sourceRef={sourceRef} />
  ));
}

function FactRows({ children }: { readonly children: ReactNode }) {
  return <dl className="destination-facts">{children}</dl>;
}

function FactRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function OffersView({ model, version }: { readonly model: Vehicle; readonly version: VehicleVersion }) {
  const offers = offersForVersion(model, version.id);
  if (offers.length === 0) return <p className="destination-empty">{copy.noOffer}</p>;

  return offers.map((offer) => {
    if (offer.state === "missing") {
      return (
        <article className="destination-card" key={offer.id}>
          <h3>{copy.noOffer}</h3>
          <SourceLine sourceRef={offer.sourceRef} />
        </article>
      );
    }

    const prices = offerPriceRows(offer).filter(({ fact }) => fact.value !== null);
    return (
      <article className="destination-card" key={offer.id}>
        <h3>{offer.state === "pending" ? copy.pendingOffer : copy.availableOffer}</h3>
        <p>{formattedFactText(offer.summary)}</p>
        {prices.length === 0 ? (
          <p className="destination-empty">{copy.noConfirmedPrice}</p>
        ) : (
          <FactRows>
            {prices.map(({ label, fact }) => (
              <FactRow key={label} label={label} value={formattedFactText(fact, copy.pln)} />
            ))}
          </FactRows>
        )}
        <SourceLine sourceRef={offer.sourceRef} />
      </article>
    );
  });
}

function FinancingView({
  model,
  version,
}: {
  readonly model: Vehicle;
  readonly version: VehicleVersion;
}) {
  const financing = financingForVersion(model, version.id);
  if (financing.length === 0) return <p className="destination-empty">{copy.noFinancing}</p>;

  return financing.map((item) => (
    <article className="destination-card" key={item.id}>
      <h3>
        {item.state === "missing"
          ? copy.noFinancing
          : item.state === "pending"
            ? copy.pendingFinancing
            : copy.availableFinancing}
      </h3>
      <p>{formattedFactText(item.summary)}</p>
      {item.state === "available" && (
        <FactRows>
          <FactRow label={copy.basePrice} value={formattedFactText(item.basePricePln, copy.pln)} />
        </FactRows>
      )}
      {item.variants.length === 0 ? (
        <p className="destination-empty">{copy.noFinancingTerms}</p>
      ) : (
        item.variants.map((variant, index) => (
          <section className="financing-variant" key={index}>
            <h4>{copy.financingVariant(index + 1)}</h4>
            <FactRows>
              <FactRow
                label={copy.duration}
                value={formattedFactText(variant.durationMonths, copy.months)}
              />
              <FactRow
                label={copy.initialPayment}
                value={formattedFactText(variant.initialPaymentPln, copy.pln)}
              />
              <FactRow
                label={copy.installment}
                value={formattedFactText(variant.installmentPln, copy.pln)}
              />
              {financingRateRows(variant).map(({ label, fact }) => (
                <FactRow
                  key={label}
                  label={label}
                  value={formattedFactText(fact, copy.percent)}
                />
              ))}
            </FactRows>
          </section>
        ))
      )}
      <SourceLine sourceRef={item.sourceRef} />
    </article>
  ));
}

function WarrantyCard({ warranty }: { readonly warranty: Warranty }) {
  return (
    <article className="destination-card">
      <h4>{formattedFactText(warranty.label)}</h4>
      <FactRows>
        <FactRow
          label={copy.duration}
          value={formattedFactText(warranty.durationYears, copy.years)}
        />
        <FactRow label={copy.distanceLimit} value={distanceLimitText(warranty.distanceLimitKm)} />
        <FactRow label={copy.warrantyTerms} value={formattedFactText(warranty.terms)} />
      </FactRows>
      <SourceLines
        sourceRefs={[
          warranty.kind.sourceRef,
          warranty.label.sourceRef,
          warranty.durationYears.sourceRef,
          warranty.distanceLimitKm.sourceRef,
          warranty.terms.sourceRef,
        ]}
      />
    </article>
  );
}

function WarrantyView({ model }: { readonly model: Vehicle }) {
  const sections = warrantySections(model.warranty);
  return (
    <>
      <section className="destination-section">
        <h3>{copy.baseWarranty}</h3>
        {sections.base.length === 0 ? (
          <p className="destination-empty">{copy.noBaseWarranty}</p>
        ) : (
          sections.base.map((warranty) => <WarrantyCard key={warranty.id} warranty={warranty} />)
        )}
      </section>
      <section className="destination-section">
        <h3>{copy.warrantyExtensions}</h3>
        {sections.extensions.length === 0 ? (
          <p className="destination-empty">{copy.noWarrantyExtensions}</p>
        ) : (
          sections.extensions.map((warranty) => (
            <WarrantyCard key={warranty.id} warranty={warranty} />
          ))
        )}
      </section>
    </>
  );
}

function MaterialList({ links, empty }: { readonly links: readonly MoreLink[]; readonly empty: string }) {
  if (links.length === 0) return <p className="destination-empty">{empty}</p>;
  return (
    <ul className="material-list">
      {links.map((link) => {
        const source = resolveSource(link.sourceRef, catalog.sources);
        return (
          <li key={`${link.sourceRef}-${link.title}`}>
            {source?.href === null || source === null ? (
              <strong>{link.title}</strong>
            ) : (
              <a href={source.href} target="_blank" rel="noreferrer">
                {link.title}
              </a>
            )}
            <SourceLine sourceRef={link.sourceRef} />
          </li>
        );
      })}
    </ul>
  );
}

function MoreView({ model }: { readonly model: Vehicle }) {
  return (
    <>
      <section className="destination-section">
        <h3>{copy.youtube}</h3>
        <MaterialList links={model.more.youtubeReviews} empty={copy.noYoutube} />
      </section>
      <section className="destination-section">
        <h3>{copy.technicalData}</h3>
        <MaterialList links={model.more.technicalData} empty={copy.noTechnicalData} />
      </section>
    </>
  );
}

export function DestinationView({
  destination,
  model,
  version,
}: {
  readonly destination: Destination;
  readonly model: Vehicle;
  readonly version: VehicleVersion;
}) {
  if (destination === "offers") return <OffersView model={model} version={version} />;
  if (destination === "financing") return <FinancingView model={model} version={version} />;
  if (destination === "warranty") return <WarrantyView model={model} />;
  return <MoreView model={model} />;
}

export default function App() {
  const [modelIndex, setModelIndex] = useState(0);
  const [versionIndex, setVersionIndex] = useState(0);
  const [sheet, setSheet] = useState<{ readonly open: boolean; readonly destination: Destination }>({
    open: false,
    destination: "offers",
  });
  const modelSwipeStart = useRef<number | null>(null);
  const versionSwipeStart = useRef<number | null>(null);
  const sheetSwipeStart = useRef<number | null>(null);
  const sheetTrigger = useRef<HTMLButtonElement | null>(null);
  const suppressVersionClick = useRef(false);

  const model = catalog.models[modelIndex];
  const version = model.versions[versionIndex];
  const modelName = `${factText(model.brand)} ${factText(model.model)}`;
  const versionName = factText(version.name);

  function showModel(index: number) {
    setModelIndex(wrappedIndex(index, catalog.models.length));
    setVersionIndex(0);
  }

  function showVersion(index: number) {
    setVersionIndex(wrappedIndex(index, model.versions.length));
  }

  function startSwipe(
    reference: { current: number | null },
    event: ReactPointerEvent<HTMLElement>,
  ) {
    if (!event.isPrimary) return;
    reference.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function finishModelSwipe(event: ReactPointerEvent<HTMLElement>) {
    const start = modelSwipeStart.current;
    modelSwipeStart.current = null;
    if (start === null) return;
    const step = swipeStep(start, event.clientX);
    if (step !== 0) showModel(modelIndex + step);
  }

  function finishVersionSwipe(event: ReactPointerEvent<HTMLElement>) {
    const start = versionSwipeStart.current;
    versionSwipeStart.current = null;
    if (start === null) return;
    const step = swipeStep(start, event.clientX);
    if (step !== 0) {
      suppressVersionClick.current = true;
      showVersion(versionIndex + step);
      requestAnimationFrame(() => (suppressVersionClick.current = false));
    }
  }

  function startSheetSwipe(event: ReactPointerEvent<HTMLElement>) {
    if (!event.isPrimary) return;
    sheetSwipeStart.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function finishSheetSwipe(event: ReactPointerEvent<HTMLElement>) {
    const start = sheetSwipeStart.current;
    sheetSwipeStart.current = null;
    if (start !== null && isDownwardSwipe(start, event.clientY)) {
      setSheet((current) => ({ ...current, open: false }));
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (sheet.open || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const step = event.key === "ArrowLeft" ? -1 : 1;
        setModelIndex((current) => wrappedIndex(current + step, catalog.models.length));
        setVersionIndex(0);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const step = event.key === "ArrowUp" ? -1 : 1;
        setVersionIndex((current) => wrappedIndex(current + step, model.versions.length));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sheet.open, model.versions.length]);

  const summary = [
    factText(version.powertrain),
    fuelText(version.fuels),
    factText(version.gearbox.name),
  ].filter((item): item is string => item !== null);

  return (
    <>
      <main className="showroom-shell">
        <header className="showroom-header">
          <p className="showroom-title">{copy.showroomTitle}</p>
          <p className="model-counter">{copy.modelCounter(modelIndex + 1, catalog.models.length)}</p>
        </header>

        <section className="showroom-content" aria-live="polite">
          <div className="model-identity">
            <h1>{modelName}</h1>
            <p>{summary.length > 0 ? summary.join(" · ") : copy.unknownFact}</p>
          </div>

          <div className="vehicle-stage">
            <div className="vehicle-row">
              <Button
                type="button"
                size="icon"
                className="model-arrow"
                aria-label={copy.previousModel}
                onClick={() => showModel(modelIndex - 1)}
              >
                {"<"}
              </Button>

              <div
                className="vehicle-placeholder"
                role="img"
                aria-label={copy.previewImage(modelName)}
                onPointerDown={(event) => startSwipe(modelSwipeStart, event)}
                onPointerUp={finishModelSwipe}
                onPointerCancel={() => (modelSwipeStart.current = null)}
              >
                <strong>{modelName}</strong>
                <span>{copy.previewLabel}</span>
              </div>

              <Button
                type="button"
                size="icon"
                className="model-arrow"
                aria-label={copy.nextModel}
                onClick={() => showModel(modelIndex + 1)}
              >
                {">"}
              </Button>
            </div>

            <ul
              className="version-selector"
              aria-label={copy.versions}
              onPointerDown={(event) => {
                if (event.isPrimary) versionSwipeStart.current = event.clientX;
              }}
              onPointerUp={finishVersionSwipe}
              onPointerCancel={() => (versionSwipeStart.current = null)}
              onClickCapture={(event) => {
                if (!suppressVersionClick.current) return;
                event.preventDefault();
                event.stopPropagation();
                suppressVersionClick.current = false;
              }}
            >
              {model.versions.map((item, index) => {
                const name = factText(item.name);
                return (
                  <li key={item.id}>
                    <Button
                      type="button"
                      className="version-button"
                      aria-label={copy.selectVersion(name)}
                      aria-pressed={index === versionIndex}
                      onClick={() => setVersionIndex(index)}
                    >
                      {name}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>

          <dl className="fact-list">
            <div>
              <dt>{copy.power}</dt>
              <dd>{numberFactText(version.powerHp, "KM")}</dd>
            </div>
            <div>
              <dt>{copy.consumption}</dt>
              <dd>{numberFactText(version.consumptionLPer100KmWltp, "l/100 km")}</dd>
            </div>
            <div>
              <dt>{copy.dimensions}</dt>
              <dd>{dimensionsText(version)}</dd>
            </div>
            <div>
              <dt>{copy.weight}</dt>
              <dd>{rangeFactText(version.curbWeightKg, "kg")}</dd>
            </div>
            <div>
              <dt>{copy.cabinNoise}</dt>
              <dd>{noiseText(version)}</dd>
            </div>
          </dl>

          <nav className="destination-actions">
            {destinationActions.map(([value, label]) => (
              <Button
                type="button"
                className="destination-action"
                key={value}
                aria-haspopup="dialog"
                aria-expanded={sheet.open && sheet.destination === value}
                aria-controls={
                  sheet.open && sheet.destination === value ? "destination-sheet" : undefined
                }
                onClick={(event) => {
                  sheetTrigger.current = event.currentTarget;
                  setSheet({ open: true, destination: value });
                }}
              >
                {label}
              </Button>
            ))}
          </nav>
        </section>
      </main>

      <Sheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((current) => ({ ...current, open }))}
      >
        <SheetContent
          id="destination-sheet"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            sheetTrigger.current?.focus();
          }}
        >
          <div className="destination-page">
            <header className="destination-header">
              <SheetClose asChild>
                <Button type="button" className="sheet-back">
                  {copy.back}
                </Button>
              </SheetClose>
              <div
                className="destination-heading"
                onPointerDown={startSheetSwipe}
                onPointerUp={finishSheetSwipe}
                onPointerCancel={() => (sheetSwipeStart.current = null)}
              >
                <span className="sheet-handle" aria-hidden="true" />
                <SheetTitle>{copy[sheet.destination]}</SheetTitle>
                <SheetDescription>
                  {modelName} · {copy.selectedVersion}: {versionName}
                </SheetDescription>
              </div>
            </header>
            <div className="destination-body">
              <DestinationView destination={sheet.destination} model={model} version={version} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
