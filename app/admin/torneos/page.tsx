"use client";

import { useState } from "react";
import Link from "next/link";
import { torneos as mockData, Torneo } from "@/lib/data";

type FormState = {
  nombre: string;
  categoria: Torneo["categoria"];
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

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none";

export default function AdminTorneosPage() {
  const [lista, setLista] = useState<Torneo[]>(mockData);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nuevo: Torneo = {
      id: String(Date.now()),
      nombre: form.nombre,
      categoria: form.categoria,
      nivel: form.nivel,
      fecha: form.fecha,
      fechaFin: form.fechaFin,
      inscripcionHasta: form.inscripcionHasta,
      precio: Number(form.precio),
      cupos: Number(form.cupos),
      inscriptos: 0,
      descripcion: form.descripcion,
      formato: form.formato,
      activo: true,
    };
    setLista((l) => [nuevo, ...l]);
    setForm(emptyForm);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  function handleEliminar(id: string) {
    setLista((l) => l.filter((t) => t.id !== id));
  }

  function handleToggleActivo(id: string) {
    setLista((l) =>
      l.map((t) => (t.id === id ? { ...t, activo: !t.activo } : t))
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Panel de administración
          </p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Gestión de torneos
          </h1>
        </div>
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-white"
        >
          ← Inicio
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-5 text-lg font-semibold text-white">
            Agregar torneo
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            {toast && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                Torneo agregado correctamente.
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Nombre del torneo
              </label>
              <input
                name="nombre"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Copa Verano 2026"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Mixto</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Nivel
                </label>
                <input
                  name="nivel"
                  required
                  value={form.nivel}
                  onChange={handleChange}
                  placeholder="Ej: 5ta / 6ta"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Inicio
                </label>
                <input
                  name="fecha"
                  type="date"
                  required
                  value={form.fecha}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Fin
                </label>
                <input
                  name="fechaFin"
                  type="date"
                  required
                  value={form.fechaFin}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Inscripción hasta
              </label>
              <input
                name="inscripcionHasta"
                type="date"
                required
                value={form.inscripcionHasta}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Precio ($)
                </label>
                <input
                  name="precio"
                  type="number"
                  required
                  min="0"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="8000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Cupos
                </label>
                <input
                  name="cupos"
                  type="number"
                  required
                  min="2"
                  value={form.cupos}
                  onChange={handleChange}
                  placeholder="32"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Formato
              </label>
              <input
                name="formato"
                required
                value={form.formato}
                onChange={handleChange}
                placeholder="Ej: Fase de grupos + eliminación directa"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Descripción
              </label>
              <textarea
                name="descripcion"
                required
                rows={3}
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción del torneo..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              Agregar torneo
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-5 text-lg font-semibold text-white">
            Torneos ({lista.length})
          </h2>
          <div className="space-y-3">
            {lista.length === 0 && (
              <p className="py-10 text-center text-sm text-zinc-600">
                No hay torneos cargados.
              </p>
            )}
            {lista.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {t.nombre}
                    </p>
                    {!t.activo && (
                      <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                        inactivo
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {t.categoria} · {t.nivel} · {t.inscriptos}/{t.cupos}{" "}
                    inscriptos
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => handleToggleActivo(t.id)}
                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {t.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => handleEliminar(t.id)}
                    className="text-xs text-zinc-600 transition-colors hover:text-red-400"
                  >
                    Eliminar
                  </button>
                  <Link
                    href={`/admin/torneos/${t.id}/manage`}
                    className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    Gestionar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
