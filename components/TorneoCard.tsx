import Link from "next/link";
import { Torneo } from "@/lib/data";
import type { Tables } from "@/types/database.types";
import LogoMap from "@/components/logos";

/* TODO: cambiar el tipado para usar el tipado que provee supabase */
//type Tournament = Tables<"torneos">

const badgeBg: Record<string, string> = {
  Masculino: "bg-blue-700/20 text-blue-300",
  Femenino: "bg-pink-700/20 text-pink-300",
  Mixto: "bg-purple-700/20 text-purple-300",
};

const accentStrip: Record<string, string> = {
  Masculino: "bg-gradient-to-r from-blue-600/60 to-blue-500/40",
  Femenino: "bg-gradient-to-r from-pink-600/60 to-pink-500/40",
  Mixto: "bg-gradient-to-r from-violet-600/60 to-violet-500/40",
};

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export default function TorneoCard({ torneo }: { torneo: Torneo }) {
  const restantes = torneo.cupos - torneo.inscriptos;
  const ocupado = (torneo.inscriptos / torneo.cupos) * 100;
  const LogoComponent = torneo.logoKey ? LogoMap[torneo.logoKey] : undefined;

  return (
    <Link
      href={`/torneos/${torneo.id}`}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900/40 transition-transform transform hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
    >
      {torneo.banner && (
        <div className="relative h-44 w-full">
          <img src={torneo.banner} alt={torneo.nombre} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10" />
        </div>
      )}

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden ${
                badgeBg[torneo.categoria] ?? "bg-zinc-800/30"
              } text-xs font-semibold`}
            >
              {LogoComponent ? (
                <LogoComponent className="h-full w-full" />
              ) : (
                <span>{torneo.categoria.charAt(0)}</span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-white">
                {torneo.nombre}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                {torneo.clubLogo && (
                  <img
                    src={torneo.clubLogo}
                    alt={torneo.club ?? "club logo"}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span className="truncate">{torneo.club}</span>
                <span className="mx-1">·</span>
                <span>{torneo.nivel}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-white">
              ${torneo.precio.toLocaleString("es-AR")}
            </div>
          </div>
        </div>

        <p className="mb-2 text-sm text-zinc-400 line-clamp-2">{torneo.descripcion}</p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              {formatFecha(torneo.fecha)} — {formatFecha(torneo.fechaFin)}
            </span>
            <span className={restantes <= 4 ? "text-amber-400" : "text-zinc-400"}>
              {restantes} cupos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#00C887)] transition-all"
                  style={{ width: `${ocupado}%` }}
                />
              </div>
            </div>

            <div className="shrink-0">
              <div className="rounded-lg bg-accent px-3 py-1 text-black text-sm font-semibold">
                Inscribirme
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
