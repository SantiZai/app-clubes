"use client";

import { useMemo, useState } from "react";
import { Torneo } from "@/lib/data";
import TorneoCard from "./TorneoCard";

type Props = { initialTorneos: Torneo[] };

const CATEGORIES = ["8va", "7ma", "6ta", "5ta", "4ta", "Mixto"];

function matchesCategory(t: Torneo, cat: string) {
  if (!t) return false;
  if (cat.toLowerCase() === "mixto") return (t.categoria || "").toLowerCase() === "mixto";
  const nivel = (t.nivel || "").toLowerCase();
  return nivel.includes(cat.toLowerCase());
}

export default function TorneosDiscovery({ initialTorneos }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIES.forEach((c) => (map[c] = initialTorneos.filter((t) => matchesCategory(t, c)).length));
    return map;
  }, [initialTorneos]);

  const filtered = useMemo(() => {
    if (!selected) return initialTorneos;
    return initialTorneos.filter((t) => matchesCategory(t, selected));
  }, [initialTorneos, selected]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[40px] font-bold text-white">Torneos próximos</h2>
          <p className="mt-2 text-zinc-400">Filtra por nivel para encontrar tu categoría.</p>
        </div>
        <div className="flex items-center gap-3">
          {selected && (
            <button
              className="text-sm text-zinc-300 px-3 py-2 rounded-md border border-zinc-800"
              onClick={() => setSelected(null)}
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(selected === c ? null : c)}
            className={`category-card ${selected === c ? "ring-2 ring-[var(--accent)]" : ""} glow-hover`}
          >
            <div className="text-2xl">🎾</div>
            <div className="mt-2 text-sm font-semibold text-white">{c}</div>
            <div className="text-xs text-zinc-400">{counts[c]} torneos</div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TorneoCard key={t.id} torneo={t} />
        ))}
      </div>
    </section>
  );
}
