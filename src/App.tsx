import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import catalogJson from "./data/showroom.json";
import type {
  Catalog,
  DocumentLink,
  FinancingScenario,
  GalleryItem,
  OfferVariant,
  SourcedSection,
  SourcedValue,
  Vehicle,
} from "./types";

const catalog = catalogJson as unknown as Catalog;

type TabId =
  | "overview"
  | "specification"
  | "offer"
  | "equipment"
  | "financing"
  | "warranty"
  | "issues"
  | "sources";

const tabs: readonly { id: TabId; label: string }[] = [
  { id: "overview", label: "Przegląd" },
  { id: "specification", label: "Specyfikacja" },
  { id: "offer", label: "Oferta" },
  { id: "equipment", label: "Wyposażenie" },
  { id: "financing", label: "Finansowanie" },
  { id: "warranty", label: "Gwarancja" },
  { id: "issues", label: "Konflikty i braki" },
  { id: "sources", label: "Źródła" },
];

const vehicleGroups = [
  { id: "offer-2026", label: "Aktualne oferty" },
  { id: "comparison-no-offer", label: "Porównanie techniczne" },
  { id: "archive-needs-research", label: "Archiwum" },
] as const;

const sectionLabels: Readonly<Record<string, string>> = {
  powertrain: "Napęd",
  performance: "Osiągi",
  efficiency: "Zużycie i emisje",
  dimensions: "Wymiary i praktyczność",
};

const fieldLabels: Readonly<Record<string, string>> = {
  fuel: "Paliwo",
  type: "Typ napędu",
  displacement_cc: "Pojemność silnika",
  power_hp: "Moc",
  power_kw: "Moc",
  torque_nm: "Moment obrotowy",
  gearbox: "Skrzynia biegów",
  drive: "Napęd osi",
  battery_kwh: "Akumulator",
  onboard_charger_kw: "Ładowarka pokładowa AC",
  zero_to_100_s: "0–100 km/h",
  max_speed_kmh: "Prędkość maksymalna",
  consumption_wltp_l_100km: "Spalanie WLTP",
  consumption_wltp_kwh_100km: "Zużycie energii WLTP",
  electric_consumption_wltp_kwh_100km: "Zużycie energii WLTP",
  co2_wltp_g_km: "Emisja CO₂ WLTP",
  range_wltp_km: "Zasięg WLTP",
  dc_10_80_minutes: "Ładowanie DC 10–80%",
  ac_11kw_charge_time: "Ładowanie AC 11 kW",
  length_mm: "Długość",
  width_mm: "Szerokość",
  width_with_mirrors_mm: "Szerokość z lusterkami",
  height_mm: "Wysokość",
  wheelbase_mm: "Rozstaw osi",
  ground_clearance_mm: "Prześwit",
  turning_circle_m: "Średnica zawracania",
  boot_l: "Bagażnik",
  boot_max_l: "Bagażnik po złożeniu",
  tank_l: "Zbiornik paliwa",
  towing_braked_kg: "Przyczepa z hamulcem",
  towing_unbraked_kg: "Przyczepa bez hamulca",
  curb_mass_kg: "Masa własna",
  gross_mass_kg: "DMC",
  seats: "Liczba miejsc",
};

const unitByField: Readonly<Record<string, string>> = {
  displacement_cc: "cm³",
  power_hp: "KM",
  power_kw: "kW",
  torque_nm: "Nm",
  battery_kwh: "kWh",
  onboard_charger_kw: "kW",
  zero_to_100_s: "s",
  max_speed_kmh: "km/h",
  consumption_wltp_l_100km: "l/100 km",
  consumption_wltp_kwh_100km: "kWh/100 km",
  electric_consumption_wltp_kwh_100km: "kWh/100 km",
  co2_wltp_g_km: "g/km",
  range_wltp_km: "km",
  dc_10_80_minutes: "min",
  length_mm: "mm",
  width_mm: "mm",
  width_with_mirrors_mm: "mm",
  height_mm: "mm",
  wheelbase_mm: "mm",
  ground_clearance_mm: "mm",
  turning_circle_m: "m",
  boot_l: "l",
  boot_max_l: "l",
  tank_l: "l",
  towing_braked_kg: "kg",
  towing_unbraked_kg: "kg",
  curb_mass_kg: "kg",
  gross_mass_kg: "kg",
};

function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function offerPrice(offer: OfferVariant | undefined): number | null | undefined {
  return offer?.price_pln ?? offer?.price_after_discount_pln ?? offer?.special_price_pln;
}

function readHashState(): {
  readonly vehicleIndex: number;
  readonly offerIndex: number;
  readonly imageIndex: number;
  readonly tab: TabId;
} {
  const params = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.hash.slice(1),
  );
  const requestedVehicle = params.get("vehicle");
  const vehicleIndex = Math.max(
    0,
    catalog.vehicles.findIndex((vehicle) => vehicle.id === requestedVehicle),
  );
  const vehicle = catalog.vehicles[vehicleIndex];
  const requestedOffer = params.get("offer");
  const offerIndex = Math.max(
    0,
    vehicle.offer_variants.findIndex((offer) => offer.id === requestedOffer),
  );
  const requestedImage = Number.parseInt(params.get("image") ?? "0", 10);
  const requestedTab = params.get("tab");
  return {
    vehicleIndex,
    offerIndex,
    imageIndex:
      Number.isInteger(requestedImage) &&
      requestedImage >= 0 &&
      requestedImage < vehicle.gallery.length
        ? requestedImage
        : 0,
    tab: tabs.some(({ id }) => id === requestedTab) ? (requestedTab as TabId) : "overview",
  };
}

function searchableVehicleText(vehicle: Vehicle): string {
  return `${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.category} ${categoryLabel(vehicle.category)}`
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pl-PL");
}

function pln(value: number | null | undefined): string {
  if (value === null || value === undefined) return "brak danych";
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(value);
}

function number(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "brak danych";
  return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(value)}${suffix ? ` ${suffix}` : ""}`;
}

function statusClass(status: string): string {
  if (/not-found|unknown|missing/i.test(status)) return "status status-missing";
  if (/conflict|proxy|illustrative|comparable|unconfirmed|likely/i.test(status)) return "status status-caution";
  if (/exact-offer|exact-by/i.test(status)) return "status status-exact";
  if (/official|verified/i.test(status)) return "status status-official";
  if (/derived/i.test(status)) return "status status-derived";
  return "status status-neutral";
}

function statusLabel(status: string): string {
  const exact: Readonly<Record<string, string>> = {
    "exact-offer": "dokładna oferta",
    "exact-by-model-and-price": "dokładne dopasowanie",
    "official-current-model-pl": "oficjalne PL",
    "official-current-model": "oficjalne",
    "official-current-model-pl-range": "oficjalny zakres PL",
    "official-model": "dane modelu",
    "official-model-level": "dane modelu",
    "model-level": "dane modelu",
    "derived/official-model": "wyliczone + oficjalne",
    "not-found": "brak danych",
    "not-found-exact": "brak dla konfiguracji",
    "not-found-in-collected-sources": "brak w źródłach",
    "comparison-no-offer": "bez oferty",
  };
  return exact[status] ?? status.replaceAll("-", " ");
}

function valueText(field: string, fact: SourcedValue | undefined): string {
  if (!fact || fact.value === null) return "brak danych";
  if (typeof fact.value === "boolean") return fact.value ? "tak" : "nie";
  const unit = unitByField[field];
  if (typeof fact.value === "number") return number(fact.value, unit);
  const text = String(fact.value);
  if (!unit || text.toLowerCase().includes(unit.toLowerCase())) return text;
  return `${text} ${unit}`;
}

function humanize(value: string): string {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function categoryLabel(category: string): string {
  if (category === "offer-2026") return "konkretna oferta 2026";
  if (category === "comparison-no-offer") return "porównanie bez oferty";
  if (category === "archive-needs-research") return "archiwum · wymaga aktualizacji";
  return humanize(category);
}

function colorMatchLabel(value: string): string {
  if (value === "exact-offer") return "kolor z oferty";
  if (value === "illustrative-unconfirmed") return "zdjęcie poglądowe";
  if (value === "none") return "brak zdjęcia egzemplarza";
  return humanize(value);
}

function ImageWithFallback({ item, className }: { readonly item: GalleryItem; readonly className?: string }) {
  const [src, setSrc] = useState(assetUrl(item.src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(assetUrl(item.src));
    setFailed(false);
  }, [item.src]);

  if (failed) {
    return (
      <span
        className={`${className ?? ""} image-failure`}
        role="img"
        aria-label={`${item.label} — obraz niedostępny`}
      >
        Obraz niedostępny
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={item.label}
      loading="eager"
      onError={() => {
        const fallback = item.fallback ? assetUrl(item.fallback) : null;
        if (fallback && fallback !== src) setSrc(fallback);
        else setFailed(true);
      }}
    />
  );
}

function StatusBadge({ status }: { readonly status: string }) {
  return <span className={statusClass(status)}>{statusLabel(status)}</span>;
}

function FactCell({ field, fact }: { readonly field: string; readonly fact: SourcedValue }) {
  return (
    <div className="fact-card">
      <div className="fact-card-heading">
        <dt>{fieldLabels[field] ?? humanize(field)}</dt>
        <StatusBadge status={fact.status} />
      </div>
      <dd>{valueText(field, fact)}</dd>
      {fact.note ? <p>{fact.note}</p> : null}
      {fact.source_ids && fact.source_ids.length > 0 ? (
        <small>Źródła: {fact.source_ids.join(", ")}</small>
      ) : null}
    </div>
  );
}

function PrimaryMetric({ label, value, note }: { readonly label: string; readonly value: string; readonly note?: string }) {
  return (
    <div className="primary-metric">
      <dt>{label}</dt>
      <dd>
        {value}
        {note ? <small>{note}</small> : null}
      </dd>
    </div>
  );
}

function SectionTitle({ eyebrow, children }: { readonly eyebrow?: string; readonly children: ReactNode }) {
  return (
    <header className="section-title">
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2>{children}</h2>
    </header>
  );
}

function EmptyState({ children }: { readonly children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function DocumentButton({ document, onOpen }: { readonly document: DocumentLink; readonly onOpen: (document: DocumentLink) => void }) {
  return (
    <button className="document-button" type="button" onClick={() => onOpen(document)}>
      <span aria-hidden="true">↗</span>
      <span>
        <strong>{document.title}</strong>
        <small>{humanize(document.kind)}</small>
      </span>
    </button>
  );
}

function DocumentViewer({
  document,
  dialogRef,
  onClose,
}: {
  readonly document: DocumentLink | null;
  readonly dialogRef: RefObject<HTMLDialogElement | null>;
  readonly onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!document) return;
    const controller = new AbortController();
    setState("loading");
    setText("");
    fetch(assetUrl(document.path), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((content) => {
        setText(content);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });
    return () => controller.abort();
  }, [document]);

  useEffect(() => {
    if (document && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [dialogRef, document]);

  if (!document) return null;

  return (
    <dialog
      ref={dialogRef}
      className="document-modal"
      aria-labelledby="document-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <header>
        <div>
          <p>Pełny udostępniony dokument źródłowy</p>
          <h2 id="document-title">{document.title}</h2>
        </div>
        <button
          type="button"
          className="close-button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Zamknij dokument"
        >
          ×
        </button>
      </header>
      <div className="document-content">
        {state === "loading" ? <p>Ładowanie dokumentu…</p> : null}
        {state === "error" ? <p>Nie udało się wczytać dokumentu.</p> : null}
        {state === "ready" ? <pre>{text}</pre> : null}
      </div>
    </dialog>
  );
}

function comparisonPrice(vehicle: Vehicle): string {
  const prices = [
    ...new Set(
      vehicle.offer_variants
        .map((offer) => offerPrice(offer))
        .filter((price): price is number => price !== null && price !== undefined),
    ),
  ];
  return prices.length > 0 ? prices.map(pln).join(" / ") : "brak oferty";
}

function comparisonEfficiency(vehicle: Vehicle): string {
  const range = vehicle.efficiency.range_wltp_km;
  if (range?.value !== null && range?.value !== undefined) {
    return `Zasięg: ${valueText("range_wltp_km", range)}`;
  }
  const consumption =
    vehicle.efficiency.electric_consumption_wltp_kwh_100km ??
    vehicle.efficiency.consumption_wltp_kwh_100km ??
    vehicle.efficiency.consumption_wltp_l_100km;
  const field = vehicle.efficiency.electric_consumption_wltp_kwh_100km
    ? "electric_consumption_wltp_kwh_100km"
    : vehicle.efficiency.consumption_wltp_kwh_100km
      ? "consumption_wltp_kwh_100km"
      : "consumption_wltp_l_100km";
  return consumption ? `Zużycie: ${valueText(field, consumption)}` : "brak danych";
}

function comparisonDimensions(vehicle: Vehicle): string {
  return ["length_mm", "width_mm", "height_mm"]
    .map((field) => valueText(field, vehicle.dimensions[field]))
    .join(" × ");
}

function ComparisonDialog({
  vehicles,
  dialogRef,
  onClose,
}: {
  readonly vehicles: readonly Vehicle[];
  readonly dialogRef: RefObject<HTMLDialogElement | null>;
  readonly onClose: () => void;
}) {
  const rows = [
    ["Cena oferty", comparisonPrice],
    ["Moc", (vehicle: Vehicle) => valueText("power_hp", vehicle.powertrain.power_hp)],
    ["Zużycie lub zasięg", comparisonEfficiency],
    ["Skrzynia biegów", (vehicle: Vehicle) => valueText("gearbox", vehicle.powertrain.gearbox)],
    ["Długość × szerokość × wysokość", comparisonDimensions],
  ] as const;

  return (
    <dialog
      ref={dialogRef}
      className="comparison-modal"
      aria-labelledby="comparison-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <header>
        <div>
          <p>2–3 wybrane modele</p>
          <h2 id="comparison-title">Porównanie samochodów</h2>
        </div>
        <button
          type="button"
          className="close-button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Zamknij porównanie"
        >
          ×
        </button>
      </header>
      <section
        className="comparison-table-wrap"
        aria-label="Tabela porównania samochodów"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">Parametr</th>
              {vehicles.map((vehicle) => (
                <th scope="col" key={vehicle.id}>
                  {vehicle.make} {vehicle.model}
                  <small>{vehicle.trim}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {vehicles.map((vehicle) => (
                  <td key={vehicle.id}>{render(vehicle)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </dialog>
  );
}

function Overview({ vehicle, selectedOffer }: { readonly vehicle: Vehicle; readonly selectedOffer: OfferVariant | undefined }) {
  const power = vehicle.powertrain.power_hp;
  const gearbox = vehicle.powertrain.gearbox;
  const consumption =
    vehicle.efficiency.electric_consumption_wltp_kwh_100km ??
    vehicle.efficiency.consumption_wltp_l_100km ??
    vehicle.efficiency.consumption_wltp_kwh_100km;
  const consumptionField = vehicle.efficiency.electric_consumption_wltp_kwh_100km
    ? "electric_consumption_wltp_kwh_100km"
    : vehicle.efficiency.consumption_wltp_l_100km
      ? "consumption_wltp_l_100km"
      : "consumption_wltp_kwh_100km";
  const price = offerPrice(selectedOffer);

  return (
    <div className="tab-stack">
      <section>
        <SectionTitle eyebrow="Najważniejsze liczby">Szybki obraz konfiguracji</SectionTitle>
        <dl className="primary-grid">
          <PrimaryMetric label="Cena z oferty" value={pln(price)} note={selectedOffer?.label} />
          <PrimaryMetric label="Moc" value={valueText("power_hp", power)} note={power ? statusLabel(power.status) : undefined} />
          <PrimaryMetric label="Skrzynia" value={valueText("gearbox", gearbox)} note={gearbox ? statusLabel(gearbox.status) : undefined} />
          <PrimaryMetric label="Zużycie WLTP" value={valueText(consumptionField, consumption)} note={consumption ? statusLabel(consumption.status) : undefined} />
          <PrimaryMetric label="0–100 km/h" value={valueText("zero_to_100_s", vehicle.performance.zero_to_100_s)} />
          <PrimaryMetric label="Prześwit" value={valueText("ground_clearance_mm", vehicle.dimensions.ground_clearance_mm)} />
          <PrimaryMetric label="Bagażnik" value={valueText("boot_l", vehicle.dimensions.boot_l)} />
          <PrimaryMetric
            label="Wymiary D × S × W"
            value={["length_mm", "width_mm", "height_mm"]
              .map((field) => valueText(field, vehicle.dimensions[field]))
              .join(" × ")}
          />
        </dl>
      </section>

      <section className="two-column-cards">
        <article className="content-card real-world-card">
          <h3>Rzeczywiste pomiary i rozsądne założenia</h3>
          {Object.entries(vehicle.real_world).filter(([key]) => key !== "sources").length === 0 ? (
            <p>Nie znaleziono porównywalnych pomiarów rzeczywistych dla tej dokładnej wersji.</p>
          ) : (
            <dl className="plain-list">
              {Object.entries(vehicle.real_world)
                .filter(([key, value]) => key !== "sources" && typeof value === "string")
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{humanize(key)}</dt>
                    <dd>{value as string}</dd>
                  </div>
                ))}
            </dl>
          )}
          {vehicle.real_world.sources && vehicle.real_world.sources.length > 0 ? (
            <div className="source-chip-row">
              {vehicle.real_world.sources.map((source) => (
                <a key={source} href={source} target="_blank" rel="noreferrer">
                  źródło pomiaru
                </a>
              ))}
            </div>
          ) : null}
        </article>

        <article className="content-card">
          <h3>Status danych</h3>
          <p>
            Dane konkretnego egzemplarza są oddzielone od danych modelowych, pomiarów niezależnych i wartości wyliczonych.
            Braki i konflikty nie są automatycznie uzupełniane przypuszczeniami.
          </p>
          <div className="legend">
            <StatusBadge status="exact-offer" />
            <StatusBadge status="official-current-model-pl" />
            <StatusBadge status="derived" />
            <StatusBadge status="not-found" />
          </div>
        </article>
      </section>
    </div>
  );
}

function Specification({ vehicle }: { readonly vehicle: Vehicle }) {
  const sections: readonly [string, SourcedSection][] = [
    ["powertrain", vehicle.powertrain],
    ["performance", vehicle.performance],
    ["efficiency", vehicle.efficiency],
    ["dimensions", vehicle.dimensions],
  ];

  return (
    <div className="specification-sections">
      {sections.map(([sectionId, section]) => (
        <section key={sectionId}>
          <SectionTitle>{sectionLabels[sectionId]}</SectionTitle>
          <dl className="fact-grid">
            {Object.entries(section).map(([field, fact]) => (
              <FactCell key={field} field={field} fact={fact} />
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function OfferView({
  vehicle,
  selectedOfferIndex,
  onSelectOffer,
  onOpenDocument,
}: {
  readonly vehicle: Vehicle;
  readonly selectedOfferIndex: number;
  readonly onSelectOffer: (index: number) => void;
  readonly onOpenDocument: (document: DocumentLink) => void;
}) {
  if (vehicle.offer_variants.length === 0) {
    return (
      <EmptyState>
        <h2>Brak konkretnej oferty dealerskiej</h2>
        <p>Model pozostaje w porównaniu technicznym, ale nie ma ceny, koloru ani wyposażenia przypisanego do egzemplarza.</p>
      </EmptyState>
    );
  }

  return (
    <div className="tab-stack">
      <section>
        <SectionTitle eyebrow={`${vehicle.offer_variants.length} konfiguracje / warianty`}>Dane z dokumentów dealerskich</SectionTitle>
        <div className="offer-picker" role="group" aria-label="Warianty oferty">
          {vehicle.offer_variants.map((offer, index) => (
            <button
              key={offer.id}
              type="button"
              aria-pressed={selectedOfferIndex === index}
              className={selectedOfferIndex === index ? "offer-pill is-active" : "offer-pill"}
              onClick={() => onSelectOffer(index)}
            >
              {offer.label}
            </button>
          ))}
        </div>
      </section>

      {vehicle.offer_variants.map((offer, index) => (
        <article key={offer.id} className={selectedOfferIndex === index ? "offer-detail is-selected" : "offer-detail"}>
          <header>
            <div>
              <p>{offer.offer_date ? `Oferta z ${offer.offer_date}` : "Data oferty nieznana"}</p>
              <h3>{offer.label}</h3>
            </div>
            <strong>{pln(offer.price_pln ?? offer.price_after_discount_pln ?? offer.special_price_pln)}</strong>
          </header>
          <dl className="offer-grid">
            <PrimaryMetric label="Cena katalogowa" value={pln(offer.catalog_price_pln)} />
            <PrimaryMetric label="Cena konfiguracji" value={pln(offer.configuration_price_pln)} />
            <PrimaryMetric label="Cena przed rabatem" value={pln(offer.price_before_discount_pln)} />
            <PrimaryMetric label="Rabat" value={pln(offer.discount_pln)} />
            <PrimaryMetric label="Cena po rabacie" value={pln(offer.price_after_discount_pln)} />
            <PrimaryMetric label="Cena specjalna" value={pln(offer.special_price_pln)} />
            <PrimaryMetric label="Lakier" value={offer.exterior ?? "brak danych"} />
            <PrimaryMetric label="Wnętrze" value={offer.interior ?? "brak danych"} />
            <PrimaryMetric label="Koła" value={offer.wheels ?? "brak danych"} />
            <PrimaryMetric label="Rok produkcji" value={offer.production_year?.toString() ?? "brak danych"} />
            <PrimaryMetric label="Rok modelowy" value={offer.model_year?.toString() ?? "brak danych"} />
            <PrimaryMetric label="Dealer" value={offer.dealer ?? "brak danych"} />
            <PrimaryMetric label="Identyfikator oferty" value={offer.offer_id ?? "brak danych"} />
            <PrimaryMetric label="Identyfikator konfiguracji" value={offer.configuration_id ?? "brak danych"} />
            <PrimaryMetric label="VIN" value={offer.vin ?? "brak danych"} />
          </dl>
          {offer.price_items && offer.price_items.length > 0 ? (
            <dl className="plain-list offer-price-items">
              {offer.price_items.map((item) => (
                <div key={`${item.label}-${item.price_pln}`}>
                  <dt>{item.label}</dt>
                  <dd>{pln(item.price_pln)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {offer.notes ? <p className="callout">{offer.notes}</p> : null}
        </article>
      ))}

      <section>
        <SectionTitle>Pełne dokumenty źródłowe</SectionTitle>
        <p className="section-intro">
          Dokumenty zachowują udostępnioną treść ofert, harmonogramy, wyposażenie, zastrzeżenia i warunki.
        </p>
        <div className="document-list">
          {vehicle.documents.map((document) => (
            <DocumentButton key={document.path} document={document} onOpen={onOpenDocument} />
          ))}
        </div>
      </section>
    </div>
  );
}

function EquipmentView({ vehicle, onOpenDocument }: { readonly vehicle: Vehicle; readonly onOpenDocument: (document: DocumentLink) => void }) {
  return (
    <div className="tab-stack">
      <section>
        <SectionTitle>Najważniejsze wyposażenie konkretnej konfiguracji</SectionTitle>
        {vehicle.equipment_highlights.length === 0 ? (
          <EmptyState>Nie zebrano listy wyposażenia dla tej wersji.</EmptyState>
        ) : (
          <ul className="equipment-grid">
            {vehicle.equipment_highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="content-card">
        <h3>Kompletna lista</h3>
        <p>
          Pełne listy wyposażenia standardowego, opcjonalnego oraz pakietów pozostają w dokumentach źródłowych, aby nie utracić kodów opcji ani zastrzeżeń producenta.
        </p>
        <div className="document-list compact">
          {vehicle.documents.map((document) => (
            <DocumentButton key={document.path} document={document} onOpen={onOpenDocument} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FinancingCard({ scenario, onOpenDocument }: { readonly scenario: FinancingScenario; readonly onOpenDocument: (document: DocumentLink) => void }) {
  const document = scenario.documentPath
    ? { title: "Pełny dokument finansowania", path: scenario.documentPath, kind: "financing-document" }
    : null;
  return (
    <article className="financing-card">
      <header>
        <div>
          <StatusBadge status={scenario.association} />
          <h3>{scenario.term_months !== null ? `${scenario.term_months} miesięcy` : "Okres nieznany"}</h3>
        </div>
        <strong>{pln(scenario.monthly_payment_pln)} / mies.</strong>
      </header>
      <dl className="financing-grid">
        <PrimaryMetric label="Cena pojazdu w kalkulacji" value={pln(scenario.price_pln)} />
        <PrimaryMetric label="Wpłata własna" value={pln(scenario.down_payment_pln)} />
        <PrimaryMetric label="Kwota kredytu" value={pln(scenario.credit_amount_pln)} />
        <PrimaryMetric label="Oprocentowanie nominalne" value={number(scenario.nominal_rate_pct, "%")} />
        <PrimaryMetric label="RRSO" value={number(scenario.rrso_pct, "%")} />
        <PrimaryMetric label="Łączny wydatek" value={pln(scenario.total_cash_outlay_pln)} />
        <PrimaryMetric label="Nadwyżka ponad cenę auta" value={pln(scenario.financing_premium_vs_price_pln)} />
      </dl>
      {scenario.notes ? <p className="callout">{scenario.notes}</p> : null}
      {document ? <DocumentButton document={document} onOpen={onOpenDocument} /> : null}
    </article>
  );
}

function FinancingView({
  vehicle,
  selectedOffer,
  onOpenDocument,
}: {
  readonly vehicle: Vehicle;
  readonly selectedOffer: OfferVariant | undefined;
  readonly onOpenDocument: (document: DocumentLink) => void;
}) {
  return (
    <div className="tab-stack">
      <section>
        <SectionTitle eyebrow={`${vehicle.financing_scenarios.length} przypisanych scenariuszy`}>Finansowanie dopasowane do modelu</SectionTitle>
        <p className="section-intro">
          Wybrana cena oferty: <strong>{pln(offerPrice(selectedOffer))}</strong>. Każda kalkulacja poniżej pokazuje własną cenę pojazdu i status dopasowania.
        </p>
        {vehicle.financing_scenarios.length === 0 ? (
          <EmptyState>Brak jednoznacznie przypisanej kalkulacji finansowania dla tej konfiguracji.</EmptyState>
        ) : (
          <div className="financing-list">
            {vehicle.financing_scenarios.map((scenario) => (
              <FinancingCard key={scenario.id} scenario={scenario} onOpenDocument={onOpenDocument} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GlobalFinancingSection({
  onOpenDocument,
}: {
  readonly onOpenDocument: (document: DocumentLink) => void;
}) {
  return (
    <details className="unassigned-financing">
      <summary>
        Ogólne kalkulacje VeloBank — {catalog.globalFinancingScenarios.length} nieprzypisanych scenariuszy
      </summary>
      <div className="unassigned-financing-body">
        <p className="section-intro">
          Dokumenty nie wskazują pojazdu. Kalkulacje pozostają globalne i nie są przypisane do marki ani modelu.
        </p>
        <div className="financing-list">
          {catalog.globalFinancingScenarios.map((scenario) => (
            <FinancingCard key={scenario.id} scenario={scenario} onOpenDocument={onOpenDocument} />
          ))}
        </div>
      </div>
    </details>
  );
}

function WarrantyView({ vehicle }: { readonly vehicle: Vehicle }) {
  return (
    <div className="tab-stack">
      <section>
        <SectionTitle>Warunki gwarancji i programów ochronnych</SectionTitle>
        {vehicle.warranty.length === 0 ? (
          <EmptyState>Brak potwierdzonych warunków gwarancji w przygotowanym zestawie.</EmptyState>
        ) : (
          <ol className="warranty-list">
            {vehicle.warranty.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ol>
        )}
      </section>
      <article className="content-card caution-card">
        <h3>Jak czytać tę sekcję</h3>
        <p>
          Gwarancja podstawowa, assistance, ochrona baterii i programy odnawialne są osobnymi produktami. Limity, wymagany serwis i wyłączenia należy sprawdzić w aktualnych warunkach programu przed zakupem.
        </p>
      </article>
    </div>
  );
}

function IssuesView({ vehicle }: { readonly vehicle: Vehicle }) {
  return (
    <div className="two-column-cards issues-layout">
      <section className="content-card caution-card">
        <h2>Konflikty i niejednoznaczności</h2>
        {vehicle.conflicts.length === 0 ? (
          <p>Nie zapisano konfliktów źródeł.</p>
        ) : (
          <ul className="issue-list">
            {vehicle.conflicts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="content-card missing-card">
        <h2>Informacje nadal brakujące</h2>
        {vehicle.unknown_fields.length === 0 ? (
          <p>Brak jawnie zapisanych luk.</p>
        ) : (
          <ul className="issue-list">
            {vehicle.unknown_fields.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SourcesView({ vehicle, onOpenDocument }: { readonly vehicle: Vehicle; readonly onOpenDocument: (document: DocumentLink) => void }) {
  const dossier = vehicle.dossierPath
    ? { title: "Dossier researchu modelu", path: vehicle.dossierPath, kind: "research-dossier" }
    : null;
  return (
    <div className="tab-stack">
      <section>
        <SectionTitle>Dokumenty lokalne</SectionTitle>
        {vehicle.documents.length === 0 && !dossier ? (
          <EmptyState>Brak dokumentów lokalnych.</EmptyState>
        ) : (
          <div className="document-list">
            {vehicle.documents.map((document) => (
              <DocumentButton key={document.path} document={document} onOpen={onOpenDocument} />
            ))}
            {dossier ? <DocumentButton document={dossier} onOpen={onOpenDocument} /> : null}
          </div>
        )}
      </section>
      <section>
        <SectionTitle>Źródła internetowe</SectionTitle>
        {vehicle.web_sources.length === 0 ? (
          <EmptyState>Brak zapisanych źródeł internetowych.</EmptyState>
        ) : (
          <ul className="web-source-list">
            {vehicle.web_sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  <strong>{source.title}</strong>
                </a>
                <p>{source.notes}</p>
                <small>
                  {source.id} · {source.scope ?? "zakres nieopisany"} · dostęp {source.accessed ?? "—"}
                </small>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="content-card">
        <h3>Materiały przekrojowe</h3>
        <div className="document-list compact">
          {catalog.researchLinks.map((link) => (
            <DocumentButton
              key={link.path}
              document={{ title: link.title, path: link.path, kind: "research-index" }}
              onOpen={onOpenDocument}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TabContent({
  tab,
  vehicle,
  selectedOfferIndex,
  onSelectOffer,
  onOpenDocument,
}: {
  readonly tab: TabId;
  readonly vehicle: Vehicle;
  readonly selectedOfferIndex: number;
  readonly onSelectOffer: (index: number) => void;
  readonly onOpenDocument: (document: DocumentLink) => void;
}) {
  const selectedOffer = vehicle.offer_variants[selectedOfferIndex];
  if (tab === "overview") return <Overview vehicle={vehicle} selectedOffer={selectedOffer} />;
  if (tab === "specification") return <Specification vehicle={vehicle} />;
  if (tab === "offer") {
    return (
      <OfferView
        vehicle={vehicle}
        selectedOfferIndex={selectedOfferIndex}
        onSelectOffer={onSelectOffer}
        onOpenDocument={onOpenDocument}
      />
    );
  }
  if (tab === "equipment") return <EquipmentView vehicle={vehicle} onOpenDocument={onOpenDocument} />;
  if (tab === "financing") {
    return (
      <FinancingView
        vehicle={vehicle}
        selectedOffer={selectedOffer}
        onOpenDocument={onOpenDocument}
      />
    );
  }
  if (tab === "warranty") return <WarrantyView vehicle={vehicle} />;
  if (tab === "issues") return <IssuesView vehicle={vehicle} />;
  return <SourcesView vehicle={vehicle} onOpenDocument={onOpenDocument} />;
}

// Keep the schema-1 composition import type-correct until the old modules leave the build.
export function DestinationView(_props: {
  readonly destination: string;
  readonly model: unknown;
  readonly version: unknown;
}): null {
  return null;
}

export default function App() {
  const [initialRoute] = useState(readHashState);
  const [vehicleIndex, setVehicleIndex] = useState(initialRoute.vehicleIndex);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(initialRoute.offerIndex);
  const [imageIndex, setImageIndex] = useState(initialRoute.imageIndex);
  const [activeTab, setActiveTab] = useState<TabId>(initialRoute.tab);
  const [query, setQuery] = useState("");
  const [comparisonIds, setComparisonIds] = useState<readonly string[]>([]);
  const [openDocumentLink, setOpenDocumentLink] = useState<DocumentLink | null>(null);
  const documentDialog = useRef<HTMLDialogElement>(null);
  const documentTrigger = useRef<HTMLElement | null>(null);
  const comparisonDialog = useRef<HTMLDialogElement>(null);
  const comparisonTrigger = useRef<HTMLButtonElement | null>(null);

  const vehicle = catalog.vehicles[vehicleIndex];
  const gallery = vehicle.gallery;
  const selectedImage = gallery[imageIndex] ?? gallery[0];
  const currentOffer = vehicle.offer_variants[selectedOfferIndex];
  const activePrice = offerPrice(currentOffer);
  const hasActivePrice = activePrice !== null && activePrice !== undefined;
  const comparisonVehicles = comparisonIds
    .map((id) => catalog.vehicles.find((item) => item.id === id))
    .filter((item): item is Vehicle => item !== undefined);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of catalog.vehicles) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return counts;
  }, []);

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLocaleLowerCase("pl-PL")
      .trim();
    return vehicleGroups
      .map((group) => ({
        ...group,
        vehicles: catalog.vehicles.filter(
          (item) =>
            item.category === group.id &&
            (normalizedQuery === "" || searchableVehicleText(item).includes(normalizedQuery)),
        ),
      }))
      .filter((group) => group.vehicles.length > 0);
  }, [query]);

  const selectHasCurrent = visibleGroups.some((group) =>
    group.vehicles.some((item) => item.id === vehicle.id),
  );

  useEffect(() => {
    if (imageIndex >= gallery.length) setImageIndex(0);
  }, [gallery.length, imageIndex]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("vehicle", vehicle.id);
    params.set("tab", activeTab);
    if (currentOffer) params.set("offer", currentOffer.id);
    params.set("image", String(imageIndex));
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${params.toString()}`,
    );
  }, [activeTab, currentOffer, imageIndex, vehicle.id]);

  const closeDocument = useCallback(() => {
    setOpenDocumentLink(null);
    requestAnimationFrame(() => documentTrigger.current?.focus());
  }, []);

  function openDocument(nextDocument: DocumentLink) {
    documentTrigger.current =
      window.document.activeElement instanceof HTMLElement
        ? window.document.activeElement
        : null;
    setOpenDocumentLink(nextDocument);
  }

  function selectVehicle(index: number) {
    if (index < 0 || index >= catalog.vehicles.length) return;
    setVehicleIndex(index);
    setSelectedOfferIndex(0);
    setImageIndex(0);
    setActiveTab("overview");
  }

  function selectOffer(index: number) {
    setSelectedOfferIndex(index);
    setImageIndex(0);
  }

  function moveVehicle(step: number) {
    selectVehicle((vehicleIndex + step + catalog.vehicles.length) % catalog.vehicles.length);
  }

  function toggleComparison(id: string) {
    setComparisonIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
  }

  function openComparison(event: React.MouseEvent<HTMLButtonElement>) {
    comparisonTrigger.current = event.currentTarget;
    comparisonDialog.current?.showModal();
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    window.document.getElementById(`tab-${tabs[nextIndex].id}`)?.focus();
  }

  return (
    <>
      <main className="app-shell">
        <header className="topbar">
          <div>
            <p className="kicker">Nowe auta · roczniki 2025+</p>
            <h1>Showroom ofert</h1>
          </div>
          <div className="topbar-controls">
            <label className="search-control">
              <span>Szukaj marki, modelu, wersji lub grupy</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="np. Fabia, hybryda, archiwum"
              />
            </label>
            <label>
              <span>Wybierz model</span>
              <select
                value={selectHasCurrent ? vehicle.id : ""}
                onChange={(event) =>
                  selectVehicle(
                    catalog.vehicles.findIndex((item) => item.id === event.target.value),
                  )
                }
              >
                {!selectHasCurrent ? (
                  <option value="" disabled>
                    {visibleGroups.length === 0 ? "Brak wyników" : "Wybierz z wyników"}
                  </option>
                ) : null}
                {visibleGroups.map((group) => (
                  <optgroup
                    key={group.id}
                    label={`${group.label} (${group.vehicles.length})`}
                  >
                    {group.vehicles.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.make} {item.model} — {item.trim}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <button
              ref={comparisonTrigger}
              type="button"
              className="comparison-button"
              disabled={comparisonIds.length < 2}
              onClick={openComparison}
            >
              Porównaj ({comparisonIds.length}/3)
            </button>
            <p className="counter">{vehicleIndex + 1} / {catalog.vehicles.length}</p>
          </div>
        </header>

        <section className="vehicle-hero" aria-live="polite">
          <div className="vehicle-intro">
            <div className="badge-row">
              <span className="category-badge">{categoryLabel(vehicle.category)}</span>
              <span className="count-badge">{categoryCounts.get(vehicle.category)} w tej grupie</span>
            </div>
            <p className="make">{vehicle.make}</p>
            <h2>{vehicle.model}</h2>
            <p className="trim">{vehicle.trim}</p>
            <p className="powertrain-line">
              {[vehicle.powertrain.type, vehicle.powertrain.power_hp, vehicle.powertrain.gearbox]
                .filter(Boolean)
                .map((fact, index) =>
                  valueText(index === 1 ? "power_hp" : index === 2 ? "gearbox" : "type", fact),
                )
                .join(" · ")}
            </p>
            {vehicle.category === "comparison-no-offer" ? (
              <p className="comparison-only-note">
                Wyłącznie porównanie techniczne. Brak otrzymanej oferty dealerskiej, ceny i finansowania.
              </p>
            ) : null}
            <div className="hero-price">
              <span>{hasActivePrice ? "Cena z aktywnej oferty" : "Status ceny"}</span>
              <strong>{hasActivePrice ? pln(activePrice) : "brak konkretnej oferty"}</strong>
            </div>
            {vehicle.offer_variants.length > 1 ? (
              <div className="hero-offer-switcher" role="group" aria-label="Wariant konfiguracji">
                {vehicle.offer_variants.map((offer, index) => (
                  <button
                    key={offer.id}
                    type="button"
                    aria-pressed={selectedOfferIndex === index}
                    className={selectedOfferIndex === index ? "is-active" : ""}
                    onClick={() => selectOffer(index)}
                  >
                    {offer.exterior ?? offer.label}
                  </button>
                ))}
              </div>
            ) : null}
            <label className="comparison-toggle">
              <input
                type="checkbox"
                checked={comparisonIds.includes(vehicle.id)}
                disabled={!comparisonIds.includes(vehicle.id) && comparisonIds.length >= 3}
                onChange={() => toggleComparison(vehicle.id)}
              />
              Dodaj ten model do porównania ({comparisonIds.length}/3)
            </label>
            <div className="model-navigation">
              <button type="button" onClick={() => moveVehicle(-1)} aria-label="Poprzedni model">
                ← Poprzedni
              </button>
              <button type="button" onClick={() => moveVehicle(1)} aria-label="Następny model">
                Następny →
              </button>
            </div>
          </div>

          <div className="vehicle-media">
            <figure className="main-image-frame">
              {selectedImage ? <ImageWithFallback item={selectedImage} className="main-image" /> : null}
              <figcaption>
                <span>{selectedImage?.label ?? "Brak zdjęcia"}</span>
                {selectedImage ? <small>{colorMatchLabel(selectedImage.colorMatch)}</small> : null}
              </figcaption>
            </figure>

            <div className="thumbnail-rail" role="group" aria-label="Galeria samochodu">
              {gallery.map((item, index) => (
                <button
                  type="button"
                  className={imageIndex === index ? "thumbnail is-active" : "thumbnail"}
                  key={`${item.src}-${index}`}
                  onClick={() => setImageIndex(index)}
                  aria-label={`Pokaż zdjęcie: ${item.label}`}
                  aria-pressed={imageIndex === index}
                >
                  <ImageWithFallback item={item} />
                  <span>{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <nav className="tabs" role="tablist" aria-label="Sekcje informacji">
          {tabs.map((tab, index) => (
            <button
              id={`tab-${tab.id}`}
              key={tab.id}
              type="button"
              role="tab"
              aria-controls="tab-panel"
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {tab.label}
              {tab.id === "issues" && vehicle.conflicts.length + vehicle.unknown_fields.length > 0 ? (
                <span>{vehicle.conflicts.length + vehicle.unknown_fields.length}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <section
          id="tab-panel"
          className="tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          <TabContent
            tab={activeTab}
            vehicle={vehicle}
            selectedOfferIndex={selectedOfferIndex}
            onSelectOffer={selectOffer}
            onOpenDocument={openDocument}
          />
        </section>

        <GlobalFinancingSection onOpenDocument={openDocument} />

        <footer>
          <p>
            Dane wygenerowano {catalog.generatedAt}. Zachowano wartości handlowe, wyposażenie, warunki finansowania i jawne luki źródłowe.
          </p>
          <a href={`https://github.com/${catalog.upstream.repository}`} target="_blank" rel="noreferrer">
            Repozytorium źródłowe
          </a>
        </footer>
      </main>

      <DocumentViewer
        document={openDocumentLink}
        dialogRef={documentDialog}
        onClose={closeDocument}
      />
      <ComparisonDialog
        vehicles={comparisonVehicles}
        dialogRef={comparisonDialog}
        onClose={() => requestAnimationFrame(() => comparisonTrigger.current?.focus())}
      />
    </>
  );
}
