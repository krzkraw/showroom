import { useState } from "react";
import catalogData from "./data/showroom.json";
import { Catalog } from "./domain/showroom";
import { copy } from "./ui/copy.pl";
import { factText } from "./ui/facts";

// The catalog is validated once, at module load, without any fetch call.
const catalog = Catalog.fromJSON(catalogData);

export default function App() {
  const [modelIndex, setModelIndex] = useState(0);
  const [versionIndex, setVersionIndex] = useState(0);

  const model = catalog.models[modelIndex];
  const version = model.versions[versionIndex];

  function showModel(index: number) {
    const total = catalog.models.length;
    setModelIndex(((index % total) + total) % total);
    setVersionIndex(0);
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 font-sans text-neutral-900">
      <p className="text-neutral-500">
        {copy.modelCounter(modelIndex + 1, catalog.models.length)}
      </p>

      <h1 className="text-3xl font-semibold">
        {factText(model.brand)} {factText(model.model)}
      </h1>

      <nav className="flex gap-3">
        <button
          type="button"
          className="min-h-12 rounded border border-neutral-300 px-4"
          onClick={() => showModel(modelIndex - 1)}
        >
          {copy.previousModel}
        </button>
        <button
          type="button"
          className="min-h-12 rounded border border-neutral-300 px-4"
          onClick={() => showModel(modelIndex + 1)}
        >
          {copy.nextModel}
        </button>
      </nav>

      <section className="flex flex-col gap-2">
        <h2 className="text-neutral-500">{copy.versions}</h2>
        <ul className="flex flex-wrap gap-4">
          {model.versions.map((item, index) => (
            <li
              key={item.id}
              className={index === versionIndex ? "font-semibold" : "text-neutral-500"}
            >
              {factText(item.name)}
            </li>
          ))}
        </ul>
      </section>

      <dl className="grid grid-cols-2 gap-2">
        <dt className="text-neutral-500">{copy.modelYear}</dt>
        <dd>{factText(version.modelYear)}</dd>
        <dt className="text-neutral-500">{copy.powertrain}</dt>
        <dd>{factText(version.powertrain)}</dd>
        <dt className="text-neutral-500">{copy.powerHp}</dt>
        <dd>{factText(version.powerHp)}</dd>
        <dt className="text-neutral-500">{copy.gearbox}</dt>
        <dd>{factText(version.gearbox.name)}</dd>
      </dl>
    </main>
  );
}
