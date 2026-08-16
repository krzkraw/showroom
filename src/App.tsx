import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import catalogData from "./data/showroom.json";
import { Catalog, type Fact, type FuelKind, type NumberRange } from "./domain/showroom";
import { copy } from "./ui/copy.pl";
import { factText } from "./ui/facts";
import { swipeStep, wrappedIndex } from "./ui/navigation";

// The catalog is validated once, at module load, without any fetch call.
const catalog = Catalog.fromJSON(catalogData);

function numberFactText(fact: Fact<number>, unit: string): string {
  const text = factText(fact);
  return fact.status === "unknown" || fact.value === null ? text : `${text} ${unit}`;
}

function rangeFactText(fact: Fact<NumberRange>, unit: string): string {
  if (fact.status === "unknown" || fact.value === null) return copy.unknownFact;
  const value =
    fact.value.min === fact.value.max
      ? String(fact.value.min)
      : `${fact.value.min}–${fact.value.max}`;
  return `${value} ${unit}`;
}

function dimensionsText(version: (typeof catalog.models)[number]["versions"][number]): string {
  const { length, width, height } = version.dimensionsMm;
  const values = [length, width, height];
  if (values.some((fact) => fact.status === "unknown" || fact.value === null)) {
    return copy.unknownFact;
  }
  return `${length.value} × ${width.value} × ${height.value} mm`;
}

function noiseText(version: (typeof catalog.models)[number]["versions"][number]): string {
  const noise = version.noiseMeasurementDb;
  if (noise.status === "unknown" || noise.value === null) return copy.unknownFact;
  const speed = version.noiseMeasurementSpeedKph;
  return speed.status === "unknown" || speed.value === null
    ? `${noise.value} dB`
    : `${noise.value} dB · ${speed.value} km/h`;
}

function fuelText(fuels: Fact<readonly FuelKind[]>): string | null {
  if (fuels.status === "unknown" || fuels.value === null) return null;
  return fuels.value.map((fuel) => copy.fuelLabels[fuel]).join(" + ");
}

export default function App() {
  const [modelIndex, setModelIndex] = useState(0);
  const [versionIndex, setVersionIndex] = useState(0);
  const modelSwipeStart = useRef<number | null>(null);
  const versionSwipeStart = useRef<number | null>(null);
  const suppressVersionClick = useRef(false);

  const model = catalog.models[modelIndex];
  const version = model.versions[versionIndex];
  const modelName = `${factText(model.brand)} ${factText(model.model)}`;

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
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
  }, [model.versions.length]);

  const summary = [
    version.powertrain.status === "unknown" || version.powertrain.value === null
      ? null
      : version.powertrain.value,
    fuelText(version.fuels),
    version.gearbox.name.status === "unknown" || version.gearbox.name.value === null
      ? null
      : version.gearbox.name.value,
  ].filter((item): item is string => item !== null);

  return (
    <main className="showroom-shell">
      <header className="showroom-header">
        <p className="showroom-title">{copy.showroomTitle}</p>
        <p className="model-counter">
          {copy.modelCounter(modelIndex + 1, catalog.models.length)}
        </p>
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
      </section>
    </main>
  );
}
