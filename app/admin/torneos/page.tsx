"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PencilLine, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createTournament, getTournamentsByClubId } from "@/lib/tournamentsUtils";
import { getAdminClub } from "@/lib/clubUtils";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import type { Tables, TablesInsert } from "@/types/database.types";
import { useAuth } from "@/hooks/useAuth";
import { getRankingsByClubId } from "@/lib/rankingsUtils";

type Tournament = Tables<"torneos">
type TournamentInsert = TablesInsert<"torneos">
type Club = Tables<"clubes">
type Rankings = Tables<"rankings">

const parseDateOnly = (value: string | null | undefined) => {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
};

type FormState = {
  nombre: string;
  categoria: string;
  nivel: string;
  fecha: DateRange | undefined;
  inscripcionHasta: string;
  precio: string;
  cupos: string;
  minimoParejas: string;
  descripcion: string;
  formato: string;
  rankingOtorgaPuntos: boolean;
  rankingId: string | null;
};

const categorias = ["Masculino", "Femenino", "Mixto"];

const getTournamentStatusMeta = (estado?: string | null) => {
  const normalized = (estado ?? "").trim().toLowerCase();

  switch (normalized) {
    case "en curso":
    case "en_curso":
    case "curso":
      return {
        dotClass: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]",
        label: "En curso",
      };
    case "cancelado":
    case "cancelada":
      return {
        dotClass: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.75)]",
        label: "Cancelado",
      };
    case "inscripciones":
    case "abierto":
    case "abierta":
      return {
        dotClass: "bg-sky-400 shadow-[0_0_10px_rgba(96,165,250,0.75)]",
        label: "Inscripciones",
      };
    case "finalizado":
    case "finalizada":
    default:
      return {
        dotClass: "bg-zinc-400 shadow-[0_0_8px_rgba(161,161,170,0.5)]",
        label: "Finalizado",
      };
  }
};

const MAX_PRICE = 50000;
const PRICE_STEP = 500;

const emptyForm: FormState = {
  nombre: "",
  categoria: "Masculino",
  nivel: "",
  fecha: { from: new Date(new Date().getFullYear(), 0, 20), to: addDays(new Date(new Date().getFullYear(), 0, 20), 20) },
  inscripcionHasta: "",
  precio: "8000",
  cupos: "",
  minimoParejas: "",
  descripcion: "",
  formato: "",
  rankingOtorgaPuntos: false,
  rankingId: null,
};

export default function AdminTorneosPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState(false);
  const [club, setClub] = useState<Club>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tournamentDate, setTournamentDate] = useState<DateRange | undefined>(undefined);
  const [inscripcionDate, setInscripcionDate] = useState<Date | undefined>(() =>
    parseDateOnly(form.inscripcionHasta)
  );
  const [isClubLoading, setIsClubLoading] = useState(false);
  const [tournamentsList, setTournamentsList] = useState<Tournament[]>([]);
  const [isTournamentsLoading, setIsTournamentsLoading] = useState(false);
  const [availableRankings, setAvailableRankings] = useState<Rankings[]>([]);
  const [isRankingsLoading, setIsRankingsLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      setClub(undefined);
      setAvailableRankings([]);
      setIsClubLoading(false);
      setIsTournamentsLoading(false);
      setIsRankingsLoading(false);
      return;
    }

    let isMounted = true;
    setIsClubLoading(true);
    setIsTournamentsLoading(true);
    setIsRankingsLoading(true);
    setAvailableRankings([]);

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
      } finally {
        if (isMounted) {
          setIsClubLoading(false);
        }
      }
    };

    fetchAdminClub();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!club || !club.id) {
      setTournamentsList([]);
      setAvailableRankings([]);
      setIsTournamentsLoading(false);
      setIsRankingsLoading(false);
      return;
    }

    let isMounted = true;
    setIsTournamentsLoading(true);
    setIsRankingsLoading(true);

    const fetchAvailableTournaments = async () => {
      try {
        const tournaments = await getTournamentsByClubId(club.id);
        if (isMounted) {
          setTournamentsList(tournaments);
        }
      } catch (error) {
        console.error("Error fetching available tournaments:", error);
        if (isMounted) {
          setTournamentsList([]);
        }
      } finally {
        if (isMounted) {
          setIsTournamentsLoading(false);
        }
      }
    };

    const fetchAvailableRankings = async () => {
      try {
        const rankings = await getRankingsByClubId(club.id);
        if (isMounted) {
          setAvailableRankings(rankings);
        }
      } catch (error) {
        console.error("Error fetching available rankings:", error);
        if (isMounted) {
          setAvailableRankings([]);
        }
      } finally {
        if (isMounted) {
          setIsRankingsLoading(false);
        }
      }
    };

    fetchAvailableTournaments();
    fetchAvailableRankings();

    return () => {
      isMounted = false;
    };
  }, [club]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handlePriceChange(value: number[]) {
    const selected = value[0] ?? 0;
    setForm((f) => ({
      ...f,
      precio: String(selected),
    }));
  }

  function handleRankingToggle(checked: boolean) {
    setForm((f) => ({
      ...f,
      rankingOtorgaPuntos: checked,
      rankingId: checked ? f.rankingId : null,
    }));
  }

  function handleRankingSelect(ranking: string) {
    setForm((f) => ({
      ...f,
      rankingId: ranking,
    }));
  }

  useEffect(() => {
    if (tournamentDate?.from) {
      setForm((f) => ({
        ...f,
        fecha: tournamentDate,
      }));
    }

    if (inscripcionDate) {
      setForm((f) => ({
        ...f,
        inscripcionHasta: format(inscripcionDate, "yyyy-MM-dd"),
      }));
    }
  }, [inscripcionDate, tournamentDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user || !club || !club.id) {
      setSubmitError("Todavía no se pudo cargar el club del administrador. Intenta nuevamente en unos segundos.");
      return;
    }

    const errors: string[] = [];

    if (!form.nombre.trim()) {
      errors.push("El nombre del torneo es obligatorio.");
    }

    if (!form.nivel.trim()) {
      errors.push("El nivel del torneo es obligatorio.");
    }

    if (!tournamentDate?.from || !tournamentDate.to) {
      errors.push("Debes seleccionar la fecha de inicio y fin del torneo.");
    }

    if (!inscripcionDate) {
      errors.push("Debes seleccionar la fecha de cierre de inscripciones.");
    }

    if (!form.cupos || Number(form.cupos) <= 0) {
      errors.push("Los cupos deben ser mayores a 0.");
    }

    if (!form.formato.trim()) {
      errors.push("El formato del torneo es obligatorio.");
    }

    if (!form.descripcion.trim()) {
      errors.push("La descripción del torneo es obligatoria.");
    }

    if (form.rankingOtorgaPuntos && !form.rankingId) {
      errors.push("Cuando habilitas rankings, debes seleccionar uno.");
    }

    if (errors.length > 0) {
      setSubmitError(errors.join(" "));
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

      fecha_inicio: tournamentDate?.from ? format(tournamentDate.from, "yyyy-MM-dd") : null,
      fecha_fin: tournamentDate?.to ? format(tournamentDate.to, "yyyy-MM-dd") : null,
      fecha_limite_inscripcion: form.inscripcionHasta || null,

      cupos: Number(form.cupos),
      parejas_inscriptas: 0,
      minimo_parejas: Number(form.minimoParejas),
      /* TODO: agregar campo para cantidad de canchas del club */
      cantidad_canchas: 6,

      precio_inscripcion: Number(form.precio),

      descripcion: form.descripcion,
      resumen:
        `Torneo de ${form.nivel} categoría con ${form.cupos} cupos y premios para los finalistas.`,

      premios: "Trofeos + órdenes de compra",
      reglamento: "Reglamento oficial de pádel con fase de grupos y playoffs.",

      color_tema: "#10B981",
      banner: "/images/torneos/open-verano.jpg",

      ranking_otorga_puntos: form.rankingOtorgaPuntos,
      ranking_id: form.rankingOtorgaPuntos ? form.rankingId : null,

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
      const data = await createTournament(nuevo);
      setTournamentsList((prev) => [data, ...prev]);
      setToast(true);
      setSubmitError(null);
      setTimeout(() => setToast(false), 5000);
    } catch (error) {
      console.error("Error creating tournament:", error);
      setSubmitError("No se pudo guardar el torneo. Revisá los datos o vuelve a intentarlo.");
    }
  }

  function handleEliminar(id: string) {
    /* setLista((l) => l.filter((t) => t.id !== id)); */
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
                    value={form.categoria}
                    onValueChange={(value) =>
                      setForm((f) => ({
                        ...f,
                        categoria: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950/90 text-white">
                      <SelectGroup>
                        {
                          categorias.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-zinc-200">Nivel</Label>
                  <Input
                    id="nivel"
                    name="nivel"
                    value={form.nivel}
                    onChange={handleChange}
                    placeholder="Ej: 5ta / 6ta"
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaTorneo" className="text-zinc-200">Fecha del torneo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        id="fechaTorneo"
                        variant="outline"
                        className="flex h-10 w-full justify-start rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-left text-sm font-normal text-zinc-200 shadow-sm transition-colors hover:border-zinc-600 hover:bg-zinc-950/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                      >
                        <CalendarIcon className="mr-2 size-4 text-zinc-400" />
                        {tournamentDate?.from ? (
                          tournamentDate.to ? (
                            <>
                              {format(tournamentDate.from, "dd/MM/yyyy")} - {format(tournamentDate.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(tournamentDate.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span className="text-zinc-500">Seleccione una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto rounded-lg border border-zinc-800 bg-zinc-950/95 p-0 text-zinc-100 shadow-2xl shadow-black/30"
                      align="start"
                    >
                      <Calendar mode="range" defaultMonth={tournamentDate?.from} selected={tournamentDate} onSelect={setTournamentDate} numberOfMonths={2} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inscripcionHasta" className="text-zinc-200">Cierre de inscripciones</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        id="inscripcionHasta"
                        variant="outline"
                        className="flex h-10 w-full justify-start rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-left text-sm font-normal text-zinc-200 shadow-sm transition-colors hover:border-zinc-600 hover:bg-zinc-950/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                      >
                        <CalendarIcon className="mr-2 size-4 text-zinc-400" />
                        {inscripcionDate ? (
                          format(inscripcionDate, "dd/MM/yyyy")
                        ) : (
                          <span className="text-zinc-500">Seleccione fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto rounded-lg border border-zinc-800 bg-zinc-950/95 p-0 text-zinc-100 shadow-2xl shadow-black/30"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={inscripcionDate}
                        onSelect={setInscripcionDate}
                        defaultMonth={tournamentDate?.from}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="precio" className="text-zinc-200">Precio de inscripción</Label>
                <div className="flex w-full items-center gap-4 rounded-md border border-zinc-700 bg-zinc-950/70 px-3 py-3">
                  <div className="flex h-10 min-w-[120px] items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm font-semibold text-emerald-400 shadow-inner">
                    ${Number(form.precio || 0).toLocaleString("es-AR")}
                  </div>

                  <div className="flex-1">
                    <Slider
                      id="precio"
                      min={0}
                      max={MAX_PRICE}
                      step={PRICE_STEP}
                      value={[Number(form.precio || 8000)]}
                      onValueChange={handlePriceChange}
                      className="w-full"
                    />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>$0</span>
                      <span>$50.000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cupos" className="text-zinc-200">Cupos</Label>
                  <Input
                    id="cupos"
                    name="cupos"
                    type="number"
                    min="2"
                    value={form.cupos}
                    onChange={handleChange}
                    placeholder="32"
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimoParejas" className="text-zinc-200">Mínimo de parejas</Label>
                  <Input
                    id="minimoParejas"
                    name="minimoParejas"
                    type="number"
                    min="2"
                    value={form.minimoParejas || ""}
                    onChange={handleChange}
                    placeholder="8"
                    className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formato" className="text-zinc-200">Formato</Label>
                <Input
                  id="formato"
                  name="formato"
                  value={form.formato}
                  onChange={handleChange}
                  placeholder="Ej: Fase de grupos + eliminación directa"
                  className="border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 shadow-inner shadow-black/20">
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-white">Ranking del torneo</p>
                      <p className="text-[11px] text-zinc-400">Puntos / clasificación</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={form.rankingOtorgaPuntos}
                        onChange={(e) => handleRankingToggle(e.target.checked)}
                        disabled={isClubLoading || isRankingsLoading || !club || availableRankings.length === 0}
                        className="peer sr-only disabled:cursor-not-allowed"
                      />
                      <span className="h-6 w-11 rounded-full border border-zinc-700 bg-zinc-800 transition-colors peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-disabled:opacity-40" />
                      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-zinc-300 transition-transform peer-checked:translate-x-5 peer-checked:bg-zinc-950 peer-disabled:opacity-60" />
                    </label>
                  </div>

                  {isClubLoading || isRankingsLoading ? (
                    <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/30 p-4 text-center text-sm text-zinc-400">
                      {isClubLoading ? "Cargando club..." : "Cargando rankings..."}
                    </div>
                  ) : availableRankings.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/30 p-4 text-center text-sm text-zinc-400">
                      No hay rankings disponibles para este club.
                    </div>
                  ) : (
                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1 custom-scroll">
                      {availableRankings.map((ranking) => {
                        const isSelected = form.rankingId === ranking.id;

                        return (
                          <button
                            key={ranking.id}
                            type="button"
                            disabled={!form.rankingOtorgaPuntos}
                            onClick={() => handleRankingSelect(ranking.id)}
                            className={[
                              "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                              isSelected
                                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900",
                              !form.rankingOtorgaPuntos && "cursor-not-allowed opacity-40",
                            ].join(" ")}
                          >
                            <span>{ranking.nombre}</span>
                            {isSelected && <span className="size-2 rounded-full bg-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-zinc-200">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    rows={8}
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del torneo..."
                    className="min-h-[220px] w-full resize-none border-zinc-700 bg-zinc-950/70 text-white! placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
                  />
                </div>
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
                <CardDescription className="text-zinc-400">{tournamentsList.length} torneo(s) cargado(s)</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {isClubLoading || isTournamentsLoading ? (
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/30 p-8 text-center text-sm text-zinc-400">
                {isClubLoading ? "Cargando club..." : "Cargando torneos..."}
              </div>
            ) : tournamentsList.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/30 p-8 text-center text-sm text-zinc-400">
                No hay torneos cargados.
              </div>
            ) : (
              tournamentsList.map((t: Tournament) => {
                const statusMeta = getTournamentStatusMeta(t.estado);
                const fechaInicio = parseDateOnly(t.fecha_inicio);
                const fechaFin = parseDateOnly(t.fecha_fin);
                const fechaTexto = [fechaInicio, fechaFin]
                  .map((date) => (date ? format(date, "dd-MM-yy") : "--"))
                  .join(" - ");

                return (
                  <div
                    key={t.id!}
                    className="rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">{t.nombre}</p>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                          {t.categoria} · {t.nivel} · {t.parejas_inscriptas}/{t.cupos} inscriptos
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-2 py-1 backdrop-blur-sm">
                        <span className={`inline-block size-2 rounded-full animate-pulse ${statusMeta.dotClass}`} />
                        <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-zinc-400">{statusMeta.label}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
                      <div className="text-[10px] tracking-[0.04em] text-zinc-500">
                        {fechaTexto}
                      </div>

                      <div className="flex items-center gap-2">
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
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
