"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Torneo } from "@/lib/data";

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-AR")}`;
}

function getTimeParts(targetIso: string) {
  const target = new Date(targetIso + "T23:59:59");
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { diff, days, hours, minutes, seconds };
}

export default function TorneoSidebar({ torneo }: { torneo: Torneo }) {
  const restantes = torneo.cupos - torneo.inscriptos;
  const ocupado = Math.round((torneo.inscriptos / torneo.cupos) * 100);

  const [time, setTime] = useState<ReturnType<typeof getTimeParts> | null>(null);

  useEffect(() => {
    // set initial time on client only to avoid SSR/client mismatch
    setTime(getTimeParts(torneo.inscripcionHasta));
    const id = setInterval(() => setTime(getTimeParts(torneo.inscripcionHasta)), 1000);
    return () => clearInterval(id);
  }, [torneo.inscripcionHasta]);

  const countdown = time ? `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s` : "--d --h --m --s";

  const avatars = Array.from({ length: Math.min(6, torneo.inscriptos) }).map((_, i) => (
    <img
      key={i}
      src={`https://i.pravatar.cc/40?img=${10 + i}`}
      alt={`jugador-${i}`}
      className="h-8 w-8 rounded-full border-2 border-black/30 object-cover"
      style={{ marginLeft: i === 0 ? 0 : -10 }}
    />
  ));

  return (
    <aside className="lg:sticky top-24">
      <div className="premium-card p-6 card-hover" style={{ borderRadius: "24px" }}>
        <div className="mb-3">
          <div className="pill-urgent inline-block">{torneo.activo ? "Inscripciones abiertas" : "Cerrado"}</div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-zinc-400">Precio</div>
          <div className="mt-2 flex items-end gap-3">
            <div className="price-giant">{formatCurrency(torneo.precio)}</div>
            <div className="text-sm text-zinc-400">por persona</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400">Cupos disponibles</div>
              <div className="text-lg font-semibold text-white">{restantes} restantes</div>
            </div>
            <div className="text-sm text-zinc-400">{torneo.inscriptos}/{torneo.cupos}</div>
          </div>

          <div className="mt-3 w-full rounded-full bg-zinc-800 h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${ocupado}%` }} />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex -ml-0">{avatars}</div>
          <div className="text-sm text-zinc-300">{torneo.inscriptos} jugadores</div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-zinc-400">Inscripcion hasta</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="countdown" suppressHydrationWarning>{countdown}</div>
            <div className="text-xs text-zinc-400">
              {(() => {
                const parts = torneo.inscripcionHasta.split("-");
                return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : torneo.inscripcionHasta;
              })()}
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="block w-full mt-2 rounded-lg bg-[var(--accent)] text-black text-center font-bold py-4 glow-hover"
          style={{ borderRadius: "18px", boxShadow: '0 20px 50px rgba(0,229,160,0.12)', color: '#000' }}
        >
          Inscribirme ahora
        </Link>

        <button
          type="button"
          className="mt-3 w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
          style={{ borderRadius: "18px" }}
        >
          Compartir torneo
        </button>
      </div>
    </aside>
  );
}
