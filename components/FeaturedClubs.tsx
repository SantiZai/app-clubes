import Reveal from "./Reveal";
import { torneosMock } from "@/lib/data";
import { clubs as CLUBS } from "@/lib/clubs";
import fs from "fs";
import path from "path";
import type { Tables } from "@/types/database.types";

type Tournament = Tables<"torneos">

export default function FeaturedClubs() {
  const map = new Map<string, any>();

  // Start from the curated CLUBS list so we can show city/rating
  CLUBS.forEach((c) => {
    const clubTorneos = torneosMock.filter((t) => t.club_id === c.name);
    const tournaments = clubTorneos.length;
    const players = clubTorneos.reduce((s, t) => s + (t.parejas_inscriptas || 0), 0);

    // prefer curated photo if exists
    let photo = c.photo;
    if (photo) {
      const disk = path.join(process.cwd(), "public", photo.replace(/^\//, ""));
      if (!fs.existsSync(disk)) photo = clubTorneos[0]?.banner ?? "/images/club-placeholder.jpg";
    } else {
      photo = clubTorneos[0]?.banner ?? "/images/club-placeholder.jpg";
    }

    map.set(c.name, { ...c, tournaments, players, photo });
  });

  const items = Array.from(map.values()).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Clubes destacados</h3>
        <p className="text-sm text-zinc-400">Descubrí dónde jugar y competir cerca tuyo.</p>
      </div>

      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.name} className="glass-card club-card glow-hover">
              <img src={c.photo} alt={c.name} />
              <div>
                <div className="text-sm font-semibold text-white">{c.name}</div>
                <div className="text-xs text-zinc-400">{c.city}</div>
                <div className="mt-2 text-xs text-zinc-400">{c.tournaments} torneos · {c.players} jugadores</div>
                <div className="mt-2 text-sm font-semibold text-accent">{c.rating ?? 4.5} ★</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
