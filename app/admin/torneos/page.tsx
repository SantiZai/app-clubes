"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PencilLine, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { torneosMock as mockData } from "@/lib/data";
import { createTournament } from "@/lib/tournamentsUtils";
import { getAdminClub } from "@/lib/clubUtils";

import type { Tables, TablesInsert } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";

type Tournament = Tables<"torneos">
type TournamentInsert = TablesInsert<"torneos">
type Club = Tables<"clubes">

type FormState = {
  nombre: string;
  categoria: Tournament["nivel"];
  nivel: string;
  fecha: string;
  fechaFin: string;
  inscripcionHasta: string;
  precio: string;
  cupos: string;
  descripcion: string;
  formato: string;
};

const emptyForm: FormState = {
  nombre: "",
  categoria: "Masculino",
  nivel: "",
  fecha: "",
  fechaFin: "",
  inscripcionHasta: "",
  precio: "",
  cupos: "",
  descripcion: "",
  formato: "",
};

export default function AdminTorneosPage() {
  const [lista, setLista] = useState<TournamentInsert[]>(mockData);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState(false);
  const [club, setClub] = useState<Club>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      return;
    }

    let isMounted = true;

    const fetchAdminClub = async () => {
      try {
        const adminClub = await getAdminClub(user.id);
        if (isMounted) {
          setClub(adminClub);
        }
      } catch (error) {
        console.error("Error fetching admin club:", error);
        if (isMounted) {
          setClub(undefined);
        }
      }
    };

    fetchAdminClub();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    console.log(club)
  }, [club])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !club || !club.id) {
      setSubmitError("Todavía no se pudo cargar el club del administrador. Intenta nuevamente en unos segundos.");
      return;
    }

    setSubmitError(null);

    const nuevo: TournamentInsert = {
      nombre: form.nombre,
      slug: form.nombre.split(" ").map(p => p.toLowerCase()).join("-"),
      estado: "inscripciones",
      visibilidad: "publico",

      categoria: form.categoria,
      nivel: form.nivel,
      ciudad: club.ciudad,
      provincia: club.provincia,
      direccion: club.direccion,

      cupos: Number(form.cupos),
      parejas_inscriptas: 24,
      minimo_parejas: 8,
      cantidad_canchas: 6,

      precio_inscripcion: Number(form.precio),

      descripcion: form.descripcion,
      resumen:
        "Torneo de 5ta categoría con 32 cupos y premios para los finalistas.",

      premios: "Trofeos + órdenes de compra",
      reglamento: "Reglamento oficial de pádel con fase de grupos y playoffs.",

      color_tema: "#10B981",
      banner: "/images/torneos/open-verano.jpg",

      /* destacado: true,
      eliminado: false,
      clima_suspendido: false,

      permite_lista_espera: true,
      requiere_confirmacion_admin: true,

      autoplay_fixture: true,
      autoplay_playoffs: true,

      ranking_otorga_puntos: true,
      ranking_id: "ranking-padel-001",*/

      club_id: club.id,
      organizador_id: user.id,

      email_contacto: user.email,
      whatsapp_contacto: "+5493415551234",
      instagram: "@padelclubrosario",

      alias_pago: "PADEL.CLUB",
      mercado_pago_link: "https://mpago.la/ejemplo1",
      qr_pago: "/images/qr/open-verano.png",

      motivo_suspension: null,
    };

    try {
      await createTournament(nuevo);
      setLista((l) => [nuevo, ...l]);
      setToast(true);
      setSubmitError(null);
      setTimeout(() => setToast(false), 3000);
    } catch (error) {
      console.error("Error creating tournament:", error);
      setSubmitError("No se pudo guardar el torneo. Revisá los datos o vuelve a intentarlo.");
    }
  }

  function handleEliminar(id: string) {
    setLista((l) => l.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Panel de administración
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Gestión de torneos
          </h1>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Inicio
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-zinc-800 bg-zinc-900/90 text-white shadow-2xl shadow-black/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Agregar torneo</CardTitle>
            <CardDescription className="text-zinc-400">Completa los datos del nuevo torneo.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {toast && (
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Torneo agregado correctamente.
                </div>
              )}

              {submitError && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-zinc-200">Nombre del torneo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Copa Verano 2026"
                  className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-zinc-200">Categoría</Label>
                  <Select
                    id="categoria"
                    name="categoria"
                    value={form.categoria!}
                    onChange={handleChange}
                    className="border-zinc-700 bg-zinc-950/70 text-white! focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  >
                    <option value="Masculino" className="bg-zinc-950/70">Masculino</option>
                    <option value="Femenino" className="bg-zinc-950/70">Femenino</option>
                    <option value="Mixto" className="bg-zinc-950/70">Mixto</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-zinc-200">Nivel</Label>
                  <Input
                    id="nivel"
                    name="nivel"
                    required
                    value={form.nivel}
                    onChange={handleChange}
                    placeholder="Ej: 5ta / 6ta"
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="text-zinc-200">Inicio</Label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    required
                    value={form.fecha}
                    onChange={handleChange}
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaFin" className="text-zinc-200">Fin</Label>
                  <Input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    required
                    value={form.fechaFin}
                    onChange={handleChange}
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inscripcionHasta" className="text-zinc-200">Inscripción hasta</Label>
                <Input
                  id="inscripcionHasta"
                  name="inscripcionHasta"
                  type="date"
                  required
                  value={form.inscripcionHasta}
                  onChange={handleChange}
                  className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="precio" className="text-zinc-200">Precio ($)</Label>
                  <Input
                    id="precio"
                    name="precio"
                    type="number"
                    required
                    min="0"
                    value={form.precio}
                    onChange={handleChange}
                    placeholder="8000"
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cupos" className="text-zinc-200">Cupos</Label>
                  <Input
                    id="cupos"
                    name="cupos"
                    type="number"
                    required
                    min="2"
                    value={form.cupos}
                    onChange={handleChange}
                    placeholder="32"
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formato" className="text-zinc-200">Formato</Label>
                <Input
                  id="formato"
                  name="formato"
                  required
                  value={form.formato}
                  onChange={handleChange}
                  placeholder="Ej: Fase de grupos + eliminación directa"
                  className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-zinc-200">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  required
                  rows={4}
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del torneo..."
                  className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>

              <Button
                type="submit"
                disabled={!user || !club}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!user || !club ? "Cargando club..." : "Agregar torneo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/90 text-white shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl text-white">Torneos</CardTitle>
                <CardDescription className="text-zinc-400">{lista.length} torneo(s) cargado(s)</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {lista.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/30 p-8 text-center text-sm text-zinc-400">
                No hay torneos cargados.
              </div>
            )}

            {lista.map((t) => (
              <div
                key={t.id!}
                className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 shadow-sm transition-colors hover:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">{t.nombre}</p>
                      {/* TODO: el badge debe decir el estado del torneo */}
                      {t.estado == "finalizado" && (
                        <Badge className="border-zinc-700 bg-zinc-800 text-zinc-300">Finalizado</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {t.categoria} · {t.nivel} · {t.parejas_inscriptas}/{t.cupos} inscriptos
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminar(t.id!)}
                    className="h-8 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    Eliminar
                  </Button>

                  <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white">
                    <Link href={`/admin/torneos/${t.id}/manage`} className="inline-flex items-center gap-1">
                      <PencilLine className="size-3.5" />
                      Gestionar
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
