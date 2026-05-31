import Link from "next/link";
import Stats from "./Stats";
import { torneos } from "@/lib/data";
import fs from "fs";
import path from "path";

export default function Hero() {
  const destacado = torneos.find((t) => t.activo) ?? torneos[0];
  const publicHeroPath = path.join(process.cwd(), "public", "images", "hero-padel.jpg");
  const heroSrc = fs.existsSync(publicHeroPath) ? "/images/hero-padel.jpg" : (destacado.banner ?? "/images/hero-padel.jpg");

  return (
    <section className="hero-section relative overflow-hidden py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
              PádelClub
            </span>

            <h1 className="mt-4 text-[48px] leading-tight font-extrabold text-white">
              Encontrá tu próximo torneo
            </h1>

            <p className="mt-3 max-w-xl text-lg text-zinc-400">
              Inscribite, competí y seguí todos los resultados desde un solo
              lugar.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/torneos"
                className="inline-block rounded-xl bg-[var(--accent)] px-6 py-3 text-black font-semibold shadow-md transition hover:brightness-95 glow-hover"
              >
                Explorar torneos
              </Link>
            </div>

            <div className="mt-6">
              <Stats />
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative w-[460px] h-[300px] rounded-2xl overflow-hidden shadow-xl">
              <img
                src={heroSrc}
                alt={destacado.nombre}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            </div>

            <div className="absolute -right-6 bottom-6 w-72 glass-card p-4 glow-hover reveal">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Próximo partido
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-white">
                    {destacado.nombre}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {destacado.club} · {new Date(destacado.fecha).toLocaleDateString()}
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="rounded-md bg-[var(--accent)] px-3 py-1 text-black text-sm font-semibold">
                    Inscribirme
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
