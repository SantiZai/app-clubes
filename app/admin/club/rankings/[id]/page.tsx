"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getAdminClub } from "@/lib/clubUtils";
import {
  getRankingById,
  getRankingMovements,
  getRankingPlayers,
  updateRanking,
} from "@/lib/rankingsUtils";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Ranking = Tables<"rankings">;
type RankingPlayer = Tables<"ranking_jugadores">;
type RankingMovement = Tables<"ranking_movimientos">;
type RankingPreviewPlayer = RankingPlayer & {
  nombre: string;
  iniciales: string;
  tendencia: "sube" | "baja" | "igual";
};

const genders = ["masculino", "femenino", "mixto", "otro"] as const;
const inputClassName =
  "w-full border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30";
const selectClassName =
  "w-full border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30";

const rankingPreviewPlayers: RankingPreviewPlayer[] = [
  {
    id: "preview-player-001",
    jugador_id: "preview-user-001",
    ranking_id: "preview-ranking",
    posicion: 1,
    puntos: 1840,
    partidos_jugados: 42,
    partidos_ganados: 35,
    partidos_perdidos: 7,
    torneos_jugados: 8,
    torneos_ganados: 3,
    semifinales: 6,
    cuartos_final: 8,
    finales_jugadas: 4,
    mejor_racha: 9,
    racha_actual: 5,
    ultima_actualizacion: "2026-08-15T18:30:00.000Z",
    nombre: "Sofía Martínez",
    iniciales: "SM",
    tendencia: "sube",
  },
  {
    id: "preview-player-002",
    jugador_id: "preview-user-002",
    ranking_id: "preview-ranking",
    posicion: 2,
    puntos: 1715,
    partidos_jugados: 39,
    partidos_ganados: 31,
    partidos_perdidos: 8,
    torneos_jugados: 7,
    torneos_ganados: 2,
    semifinales: 5,
    cuartos_final: 7,
    finales_jugadas: 3,
    mejor_racha: 7,
    racha_actual: 3,
    ultima_actualizacion: "2026-08-14T16:10:00.000Z",
    nombre: "Valentina Gómez",
    iniciales: "VG",
    tendencia: "igual",
  },
  {
    id: "preview-player-003",
    jugador_id: "preview-user-003",
    ranking_id: "preview-ranking",
    posicion: 3,
    puntos: 1630,
    partidos_jugados: 36,
    partidos_ganados: 27,
    partidos_perdidos: 9,
    torneos_jugados: 7,
    torneos_ganados: 1,
    semifinales: 4,
    cuartos_final: 6,
    finales_jugadas: 2,
    mejor_racha: 6,
    racha_actual: 2,
    ultima_actualizacion: "2026-08-13T20:45:00.000Z",
    nombre: "Camila Fernández",
    iniciales: "CF",
    tendencia: "sube",
  },
  {
    id: "preview-player-004",
    jugador_id: "preview-user-004",
    ranking_id: "preview-ranking",
    posicion: 4,
    puntos: 1495,
    partidos_jugados: 34,
    partidos_ganados: 23,
    partidos_perdidos: 11,
    torneos_jugados: 6,
    torneos_ganados: 1,
    semifinales: 3,
    cuartos_final: 5,
    finales_jugadas: 1,
    mejor_racha: 5,
    racha_actual: 1,
    ultima_actualizacion: "2026-08-12T12:00:00.000Z",
    nombre: "Lucía Romero",
    iniciales: "LR",
    tendencia: "baja",
  },
  {
    id: "preview-player-005",
    jugador_id: "preview-user-005",
    ranking_id: "preview-ranking",
    posicion: 5,
    puntos: 1380,
    partidos_jugados: 31,
    partidos_ganados: 20,
    partidos_perdidos: 11,
    torneos_jugados: 5,
    torneos_ganados: 0,
    semifinales: 2,
    cuartos_final: 4,
    finales_jugadas: 1,
    mejor_racha: 4,
    racha_actual: 2,
    ultima_actualizacion: "2026-08-11T19:20:00.000Z",
    nombre: "Martina Silva",
    iniciales: "MS",
    tendencia: "sube",
  },
];

const podiumStyles = {
  1: {
    card: "border-amber-400/60 bg-amber-400/10 shadow-[0_10px_30px_rgba(251,191,36,0.12)]",
    badge: "bg-amber-300 text-amber-950",
    label: "1°",
  },
  2: {
    card: "border-zinc-300/50 bg-zinc-300/10 shadow-[0_10px_30px_rgba(212,212,216,0.08)]",
    badge: "bg-zinc-200 text-zinc-900",
    label: "2°",
  },
  3: {
    card: "border-orange-400/60 bg-orange-400/10 shadow-[0_10px_30px_rgba(251,146,60,0.1)]",
    badge: "bg-orange-300 text-orange-950",
    label: "3°",
  },
} as const;

export default function AdminRankingPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [rankingId, setRankingId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [players, setPlayers] = useState<RankingPlayer[]>([]);
  const [movements, setMovements] = useState<RankingMovement[]>([]);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    genero: "masculino" as Ranking["genero"],
    activo: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve(params).then(({ id }) => setRankingId(id));
  }, [params]);

  useEffect(() => {
    if (!user || user.rol !== "admin" || !rankingId) return;
    let mounted = true;
    const load = async () => {
      try {
        const [adminClub, loadedRanking] = await Promise.all([
          getAdminClub(user.id),
          getRankingById(rankingId),
        ]);
        if (loadedRanking.club_id !== adminClub.id)
          throw new Error("Este ranking no pertenece a tu club.");
        const [rankingPlayers, rankingMovements] = await Promise.all([
          getRankingPlayers(rankingId),
          getRankingMovements(rankingId),
        ]);
        if (!mounted) return;
        setRanking(loadedRanking);
        setForm({
          nombre: loadedRanking.nombre,
          categoria: loadedRanking.categoria,
          genero: loadedRanking.genero,
          activo: loadedRanking.activo ?? false,
        });
        setPlayers(rankingPlayers);
        setMovements(rankingMovements);
      } catch (loadError) {
        if (mounted)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar el ranking.",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user, rankingId]);

  if (isLoading || loading)
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-white">
        Cargando ranking...
      </div>
    );
  if (!isAuthenticated || !user || user.rol !== "admin")
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-white">
        Acceso restringido.
      </div>
    );
  if (!ranking)
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-white">
        {error ?? "Ranking no encontrado."}
      </div>
    );

  const saveRanking = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateRanking(ranking.id, form);
      setRanking(updated);
      setMessage("Ranking actualizado.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el ranking.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/club"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Gestión del club
      </Link>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Ranking
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">{ranking.nombre}</h1>
        <p className="mt-2 text-zinc-400">
          Edita su configuración y consulta sus jugadores y movimientos.
        </p>
      </div>
      {(message || error) && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm ${error ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}
        >
          {error ?? message}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="h-fit border-zinc-800 bg-zinc-900/90 text-white">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription className="text-zinc-400">
              Datos que identifican este ranking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveRanking} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-zinc-200">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nombre: event.target.value,
                    }))
                  }
                  required
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-zinc-200">
                  Categoría
                </Label>
                <Input
                  id="categoria"
                  value={form.categoria}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      categoria: event.target.value,
                    }))
                  }
                  required
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-200">Género</Label>
                <Select
                  value={form.genero}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      genero: value as Ranking["genero"],
                    }))
                  }
                >
                  <SelectTrigger className={inputClassName}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      activo: event.target.checked,
                    }))
                  }
                  className="accent-emerald-500"
                />{" "}
                Ranking activo
              </label>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
              >
                <Save className="mr-2 size-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/90 text-white">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Vista previa del ranking</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Ejemplo visual con jugadores ficticios.
                  </CardDescription>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  Demo
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {rankingPreviewPlayers.slice(0, 3).map((player) => {
                  const podium = podiumStyles[player.posicion as 1 | 2 | 3];

                  return (
                    <div
                      key={player.id}
                      className={`relative overflow-hidden rounded-2xl border p-4 text-center ${podium.card}`}
                    >
                      <span
                        className={`mx-auto mb-3 flex size-10 items-center justify-center rounded-full text-sm font-black ${podium.badge}`}
                      >
                        {podium.label}
                      </span>
                      <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-white/15 bg-zinc-950/70 text-sm font-bold text-white">
                        {player.iniciales}
                      </div>
                      <p className="mt-3 truncate text-sm font-semibold text-white">
                        {player.nombre}
                      </p>
                      <p className="mt-1 text-lg font-black text-white">
                        {(player.puntos ?? 0).toLocaleString("es-AR")}
                        <span className="ml-1 text-xs font-medium text-zinc-400">
                          pts
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {player.partidos_ganados}/{player.partidos_jugados} partidos ganados
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                {rankingPreviewPlayers.slice(3).map((player) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2.5"
                  >
                    <span className="text-center text-sm font-bold text-zinc-500">
                      {player.posicion}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">
                        {player.iniciales}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {player.nombre}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {player.partidos_ganados}/{player.partidos_jugados} partidos ganados
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-zinc-200">
                      {(player.puntos ?? 0).toLocaleString("es-AR")} pts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900/90 text-white">
            <CardHeader>
              <CardTitle>Clasificación ({players.length})</CardTitle>
              <CardDescription className="text-zinc-400">
                Jugadores registrados en este ranking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Todavía no hay jugadores en este ranking.
                </p>
              ) : (
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-lg border border-zinc-800 p-3"
                    >
                      <span className="text-sm font-semibold text-emerald-400">
                        {player.posicion ?? "-"}
                      </span>
                      <span className="text-sm text-zinc-300">
                        Jugador{" "}
                        {player.jugador_id?.slice(0, 8) ?? "sin identificar"}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {player.puntos ?? 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900/90 text-white">
            <CardHeader>
              <CardTitle>Movimientos ({movements.length})</CardTitle>
              <CardDescription className="text-zinc-400">
                Historial de puntos del ranking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Todavía no hay movimientos registrados.
                </p>
              ) : (
                <div className="space-y-2">
                  {movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 p-3"
                    >
                      <div>
                        <p className="text-sm text-zinc-300">
                          {movement.motivo ?? "Movimiento manual"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {movement.fecha
                            ? new Date(movement.fecha).toLocaleDateString(
                                "es-AR",
                              )
                            : "Sin fecha"}
                        </p>
                      </div>
                      <span
                        className={
                          movement.tipo === "suma"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {movement.tipo === "suma" ? "+" : "-"}
                        {movement.puntos}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
