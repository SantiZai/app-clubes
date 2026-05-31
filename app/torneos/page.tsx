import { torneos } from "@/lib/data";
import TorneoCard from "@/components/TorneoCard";

export const metadata = {
  title: "Torneos — PádelClub",
};

export default function TorneosPage() {
  const activos = torneos.filter((t) => t.activo);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Torneos</h1>
        <p className="mt-2 text-zinc-400">
          Todos los torneos disponibles para inscripción.
        </p>
      </div>

      {activos.length === 0 ? (
        <div className="py-24 text-center text-zinc-500">
          No hay torneos disponibles por el momento.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activos.map((t) => (
            <TorneoCard key={t.id} torneo={t} />
          ))}
        </div>
      )}
    </div>
  );
}
