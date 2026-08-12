import Link from "next/link";
import { torneos } from "@/lib/data";

export default function FeaturedTorneos() {
  const featured = [...torneos].sort((a, b) => (b.inscriptos || 0) - (a.inscriptos || 0)).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">🔥 Torneos destacados</h3>
        <p className="text-sm text-zinc-400">Los eventos más concurridos y recomendados.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((t) => (
          <article key={t.id} className="glass-card overflow-hidden card-hover">
            <div className="relative h-44 w-full">
              <img src={t.banner} alt={t.nombre} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10" />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white truncate">{t.nombre}</h4>
                  <div className="text-xs text-zinc-400 mt-1">{t.club} · {new Date(t.fecha).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-accent">${t.precio}</div>
                  <div className="text-xs text-zinc-400">{t.inscriptos}/{t.cupos}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link href={`/torneos/${t.id}`} className="rounded-md bg-accent px-4 py-2 text-black font-semibold">
                  Ver evento
                </Link>
                <div className="badge-premium">Destacado</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
