"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, PencilLine, Plus, Save, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  createCourt,
  deleteCourt,
  getAdminClub,
  getCourtsByClubId,
  updateClub,
  updateCourt,
} from "@/lib/clubUtils";
import {
  createRanking,
  deleteRanking,
  getRankingsByClubId,
} from "@/lib/rankingsUtils";
import type { Tables, TablesInsert } from "@/types/database.types";
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

type Club = Tables<"clubes">;
type Court = Tables<"canchas">;
type CourtInsert = TablesInsert<"canchas">;
type Ranking = Tables<"rankings">;

const courtStatuses = ["disponible", "mantenimiento", "clausurada"] as const;
const surfaces = [
  "polvo_ladrillo",
  "cemento",
  "cesped_sintetico",
  "indoor",
  "acrilico",
] as const;
const genders = ["masculino", "femenino", "mixto", "otro"] as const;
const inputClassName =
  "border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30";
const selectClassName =
  "w-full border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30";

export default function AdminClubPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [clubForm, setClubForm] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    telefono: "",
    email: "",
    logo: "",
  });
  const [newCourt, setNewCourt] = useState<CourtInsert>({
    nombre: "",
    estado: "disponible" as Court["estado"],
    tipo_superficie: "polvo_ladrillo" as Court["tipo_superficie"],
    techada: false,
    iluminacion: false,
  });
  const [newRanking, setNewRanking] = useState({
    nombre: "",
    categoria: "",
    genero: "masculino" as Ranking["genero"],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") return;
    let mounted = true;
    const load = async () => {
      try {
        const adminClub = await getAdminClub(user.id);
        const [clubCourts, clubRankings] = await Promise.all([
          getCourtsByClubId(adminClub.id),
          getRankingsByClubId(adminClub.id),
        ]);
        if (!mounted) return;
        setClub(adminClub);
        setClubForm({
          nombre: adminClub.nombre,
          direccion: adminClub.direccion ?? "",
          ciudad: adminClub.ciudad ?? "",
          provincia: adminClub.provincia ?? "",
          telefono: adminClub.telefono ?? "",
          email: adminClub.email ?? "",
          logo: adminClub.logo ?? "",
        });
        setCourts(clubCourts);
        setRankings(clubRankings);
      } catch (loadError) {
        if (mounted)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar el club.",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (isLoading || loading)
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-white">
        Cargando gestión del club...
      </div>
    );
  if (!isAuthenticated || !user || user.rol !== "admin")
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-white">
        Acceso restringido.
      </div>
    );
  if (!club)
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-white">
        {error ?? "No se encontró un club asociado."}
      </div>
    );

  const saveClub = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateClub(club.id, clubForm);
      setClub(updated);
      setMessage("Datos del club guardados.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el club.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addCourt = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newCourt.nombre.trim())
      return setError("La cancha necesita un nombre.");
    try {
      const court = await createCourt({ ...newCourt, club_id: club.id });
      setCourts((current) =>
        [...current, court].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      );
      setNewCourt({
        nombre: "",
        estado: "disponible",
        tipo_superficie: "polvo_ladrillo",
        techada: false,
        iluminacion: false,
      });
      setMessage("Cancha agregada.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo agregar la cancha.",
      );
    }
  };

  const editCourt = async (court: Court) => {
    const nombre = window.prompt("Nombre de la cancha", court.nombre)?.trim();
    if (!nombre || nombre === court.nombre) return;
    try {
      const updated = await updateCourt(court.id, { nombre });
      setCourts((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage("Cancha actualizada.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la cancha.",
      );
    }
  };

  const removeCourt = async (court: Court) => {
    if (!window.confirm(`¿Eliminar ${court.nombre}?`)) return;
    try {
      await deleteCourt(court.id);
      setCourts((current) => current.filter((item) => item.id !== court.id));
      setMessage("Cancha eliminada.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo eliminar la cancha.",
      );
    }
  };

  const addRanking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newRanking.nombre.trim() || !newRanking.categoria.trim())
      return setError("El ranking necesita nombre y categoría.");
    try {
      const ranking = await createRanking({
        ...newRanking,
        club_id: club.id,
        activo: true,
      });
      setRankings((current) => [ranking, ...current]);
      setNewRanking({ nombre: "", categoria: "", genero: "masculino" });
      setMessage("Ranking creado.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo crear el ranking.",
      );
    }
  };

  const removeRanking = async (ranking: Ranking) => {
    if (!window.confirm(`¿Eliminar el ranking ${ranking.nombre}?`)) return;
    try {
      await deleteRanking(ranking.id);
      setRankings((current) =>
        current.filter((item) => item.id !== ranking.id),
      );
      setMessage("Ranking eliminado.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo eliminar el ranking.",
      );
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="size-4" /> Panel admin
      </Link>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Administración
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">{club.nombre}</h1>
        <p className="mt-2 text-zinc-400">
          Actualiza la información del club, sus canchas y rankings.
        </p>
      </div>
      {(message || error) && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm ${error ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}
        >
          {error ?? message}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/90 text-white">
          <CardHeader>
            <CardTitle>Información del club</CardTitle>
            <CardDescription className="text-zinc-400">
              Estos datos se muestran a los jugadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveClub} className="space-y-4">
              {(
                [
                  ["nombre", "Nombre"],
                  ["direccion", "Dirección"],
                  ["ciudad", "Ciudad"],
                  ["provincia", "Provincia"],
                  ["telefono", "Teléfono"],
                  ["email", "Email"],
                  ["logo", "Logo (URL)"],
                ] as const
              ).map(([name, label]) => (
                <div key={name} className="space-y-2">
                  <Label htmlFor={name} className="text-zinc-200">
                    {label}
                  </Label>
                  <Input
                    id={name}
                    value={clubForm[name]}
                    onChange={(event) =>
                      setClubForm((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                    required={name === "nombre"}
                    className={inputClassName}
                  />
                </div>
              ))}
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
              >
                <Save className="mr-2 size-4" />
                {saving ? "Guardando..." : "Guardar información"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/90 text-white">
          <CardHeader>
            <CardTitle>Canchas ({courts.length})</CardTitle>
            <CardDescription className="text-zinc-400">
              Administra cantidad, nombres y características.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form
              onSubmit={addCourt}
              className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <Input
                value={newCourt.nombre}
                onChange={(event) =>
                  setNewCourt((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
                placeholder="Nombre, por ejemplo Cancha 1"
                className={inputClassName}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  value={newCourt.tipo_superficie ?? undefined}
                  onValueChange={(value) =>
                    setNewCourt((current) => ({
                      ...current,
                      tipo_superficie: value as Court["tipo_superficie"],
                    }))
                  }
                >
                  <SelectTrigger className={selectClassName}>
                    <SelectValue placeholder="Superficie" />
                  </SelectTrigger>
                  <SelectContent>
                    {surfaces.map((surface) => (
                      <SelectItem key={surface} value={surface}>
                        {surface.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newCourt.estado ?? undefined}
                  onValueChange={(value) =>
                    setNewCourt((current) => ({
                      ...current,
                      estado: value as Court["estado"],
                    }))
                  }
                >
                  <SelectTrigger className={selectClassName}>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {courtStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
                <label>
                  <input
                    type="checkbox"
                    checked={newCourt.techada ?? false}
                    onChange={(event) =>
                      setNewCourt((current) => ({
                        ...current,
                        techada: event.target.checked,
                      }))
                    }
                    className="mr-2 accent-emerald-500"
                  />
                  Techada
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newCourt.iluminacion ?? false}
                    onChange={(event) =>
                      setNewCourt((current) => ({
                        ...current,
                        iluminacion: event.target.checked,
                      }))
                    }
                    className="mr-2 accent-emerald-500"
                  />
                  Iluminación
                </label>
              </div>
              <Button
                type="submit"
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
              >
                <Plus className="mr-2 size-4" />
                Agregar cancha
              </Button>
            </form>
            <div className="space-y-2">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 p-3"
                >
                  <div>
                    <p className="font-medium text-white">{court.nombre}</p>
                    <p className="text-xs text-zinc-400">
                      {court.estado} ·{" "}
                      {court.tipo_superficie?.replaceAll("_", " ")}
                      {court.techada ? " · techada" : ""}
                      {court.iluminacion ? " · iluminada" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => editCourt(court)}
                      aria-label={`Editar ${court.nombre}`}
                      className="group hover:bg-transparent hover:text-current"
                    >
                      <PencilLine className="size-4 transition-transform duration-150 group-hover:scale-110" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCourt(court)}
                      aria-label={`Eliminar ${court.nombre}`}
                      className="group text-red-400 hover:bg-transparent hover:text-red-400"
                    >
                      <Trash2 className="size-4 transition-transform duration-150 group-hover:scale-110" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 border-zinc-800 bg-zinc-900/90 text-white">
        <CardHeader>
          <CardTitle>Rankings ({rankings.length})</CardTitle>
          <CardDescription className="text-zinc-400">
            Crea rankings y entra a cada uno para administrarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={addRanking}
            className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]"
          >
            <Input
              value={newRanking.nombre}
              onChange={(event) =>
                setNewRanking((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
              placeholder="Nombre del ranking"
              className={inputClassName}
            />
            <Input
              value={newRanking.categoria}
              onChange={(event) =>
                setNewRanking((current) => ({
                  ...current,
                  categoria: event.target.value,
                }))
              }
              placeholder="Categoría, por ejemplo 5ta"
              className={inputClassName}
            />
            <Select
              value={newRanking.genero}
              onValueChange={(value) =>
                setNewRanking((current) => ({
                  ...current,
                  genero: value as Ranking["genero"],
                }))
              }
            >
              <SelectTrigger className={selectClassName}>
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
            <Button
              type="submit"
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <Plus className="mr-2 size-4" />
              Crear
            </Button>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {rankings.map((ranking) => (
              <div
                key={ranking.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 p-4"
              >
                <Link
                  href={`/admin/club/rankings/${ranking.id}`}
                  className="min-w-0 flex-1 hover:text-emerald-300"
                >
                  <p className="truncate font-semibold text-white">
                    {ranking.nombre}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {ranking.categoria} · {ranking.genero} ·{" "}
                    {ranking.activo ? "Activo" : "Inactivo"}
                  </p>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRanking(ranking)}
                  aria-label={`Eliminar ${ranking.nombre}`}
                  className="group text-red-400 hover:bg-transparent hover:text-red-400"
                >
                  <Trash2 className="size-4 transition-transform duration-150 group-hover:scale-110" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
