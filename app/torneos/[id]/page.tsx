import { torneos } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import LogoMap from "@/components/logos";
import TorneoSidebar from "@/components/TorneoSidebar";

function formatFechaLarga(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  return torneos.map((t) => ({ id: t.id }));
}

export default async function TorneoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const torneo = torneos.find((t) => t.id === id);

  if (!torneo) notFound();

  const restantes = torneo.cupos - torneo.inscriptos;
  const ocupado = (torneo.inscriptos / torneo.cupos) * 100;
  const LogoComponent = torneo.logoKey ? LogoMap[torneo.logoKey] : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/torneos" className="mb-6 inline-block text-sm text-zinc-400 hover:text-white">
        Volver a torneos
      </Link>

      <div className="grid gap-8 lg:grid-cols-12">
        <main className="lg:col-span-8">
          <div className="premium-card p-6 card-hover" style={{ borderRadius: "24px" }}>
            <div className="relative overflow-hidden" style={{ borderRadius: "20px" }}>
              {torneo.banner && (
                <div className="relative h-64 sm:h-80 md:h-96 w-full">
                  <img src={torneo.banner} alt={torneo.nombre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/10" />

                  <div className="absolute left-6 top-6">
                    <span className="inline-block rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-zinc-200 border border-zinc-800">
                      TORNEO DESTACADO
                    </span>
                  </div>

                  <div className="absolute left-6 bottom-6 max-w-[85%]">
                    <div className="mb-1 text-xs font-medium text-zinc-300">{torneo.club}</div>
                    <h1 className="hero-title">{torneo.nombre}</h1>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="badge-premium">{torneo.categoria}</span>
                      <span className="text-sm text-zinc-300">{torneo.nivel}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-6">
              <p className="hero-sub text-zinc-300 leading-relaxed">{torneo.descripcion}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="premium-card p-4" style={{ borderRadius: "16px" }}>
                  <div className="text-xs text-zinc-400">Inicio del torneo</div>
                  <div className="mt-2 text-sm font-semibold text-white">{formatFechaLarga(torneo.fecha)}</div>
                </div>

                <div className="premium-card p-4" style={{ borderRadius: "16px" }}>
                  <div className="text-xs text-zinc-400">Fin del torneo</div>
                  <div className="mt-2 text-sm font-semibold text-white">{formatFechaLarga(torneo.fechaFin)}</div>
                </div>

                <div className="premium-card p-4" style={{ borderRadius: "16px" }}>
                  <div className="text-xs text-zinc-400">Cupos</div>
                  <div className="mt-2 text-sm font-semibold text-white">{torneo.inscriptos} / {torneo.cupos}</div>
                </div>

                <div className="premium-card p-4" style={{ borderRadius: "16px" }}>
                  <div className="text-xs text-zinc-400">Formato</div>
                  <div className="mt-2 text-sm font-semibold text-white">{torneo.formato}</div>
                </div>

                <div className="premium-card p-4" style={{ borderRadius: "16px" }}>
                  <div className="text-xs text-zinc-400">Sede</div>
                  <div className="mt-2 text-sm font-semibold text-white">{torneo.club}</div>
                </div>

                <div className="premium-card p-4" style={{ borderRadius: "16px" }}>
                  <div className="text-xs text-zinc-400">Inscripcion</div>
                  <div className="mt-2 text-sm font-semibold text-white">${torneo.precio.toLocaleString("es-AR")}</div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white">Premios</h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="premium-card p-4 flex items-center justify-between" style={{ borderRadius: "16px" }}>
                    <div>
                      <div className="text-xs text-zinc-400">Campeones</div>
                      <div className="mt-1 font-semibold text-accent">$100.000</div>
                    </div>
                  </div>

                  <div className="premium-card p-4 flex items-center justify-between" style={{ borderRadius: "16px" }}>
                    <div>
                      <div className="text-xs text-zinc-400">Subcampeones</div>
                      <div className="mt-1 font-semibold text-accent">$50.000</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-zinc-300">Por que participar?</h4>
                <div className="mt-3 why-list">
                  <div className="why-item">
                    <div className="dot" />
                    <div>
                      <div className="text-sm font-semibold text-white">Competir y subir en el ranking</div>
                      <div className="text-xs text-zinc-400">Partidos oficiales y resultados publicos</div>
                    </div>
                  </div>

                  <div className="why-item">
                    <div className="dot" />
                    <div>
                      <div className="text-sm font-semibold text-white">Premios y reconocimiento</div>
                      <div className="text-xs text-zinc-400">Trofeos y premios en efectivo</div>
                    </div>
                  </div>

                  <div className="why-item">
                    <div className="dot" />
                    <div>
                      <div className="text-sm font-semibold text-white">Ambiente competitivo</div>
                      <div className="text-xs text-zinc-400">Encuentros presenciales y networking</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-zinc-300">Jugadores inscriptos</h4>
                <div className="mt-4 flex items-center">
                  {/* simple avatar stack */}
                  {Array.from({ length: Math.min(8, torneo.inscriptos) }).map((_, i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/40?img=${10 + i}`}
                      alt={`jugador-${i}`}
                      className="h-8 w-8 rounded-full border-2 border-black/30 object-cover"
                      style={{ marginLeft: i === 0 ? 0 : -10 }}
                    />
                  ))}
                  <div className="ml-4 text-sm text-zinc-400">{torneo.inscriptos} inscriptos</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="lg:col-span-4">
          <TorneoSidebar torneo={torneo} />
        </div>
      </div>
    </div>
  );
}
