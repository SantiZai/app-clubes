import Reveal from "./Reveal";

const categories = ["8va", "7ma", "6ta", "5ta", "4ta", "Mixto"];

const descriptions: Record<string, string> = {
  "8va": "Iniciación / Recreativo",
  "7ma": "Principiantes",
  "6ta": "Intermedio",
  "5ta": "Competitivo",
  "4ta": "Avanzado",
  Mixto: "Categoría mixta",
};

export default function Categories() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Explorá por categoría</h3>
        <p className="text-sm text-zinc-400">Seleccioná tu nivel y encontrá torneos cercanos.</p>
      </div>

      <Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((c) => (
            <div key={c} className="category-card">
              <div className="text-2xl">🎾</div>
              <div className="mt-2 text-sm font-semibold text-white">{c}</div>
              <div className="text-xs text-zinc-400">{descriptions[c]}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
