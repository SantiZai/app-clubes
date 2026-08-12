"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 text-white">
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (!user || !(user.rol === "admin" || user.rol === "administrador")) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h1 className="mb-4 text-2xl font-bold">Acceso restringido</h1>
          <p className="mb-6 text-zinc-400">
            Solo los administradores pueden ver esta página.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-white hover:border-zinc-500"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Panel de administración
          </p>
          <h1 className="text-3xl font-bold text-white">Bienvenido, administrador</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Usa este panel para gestionar torneos y participantes. Puedes crear un torneo nuevo, administrar inscripciones y revisar el estado de los eventos.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/admin/torneos"
          className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition hover:border-emerald-500"
        >
          <h2 className="mb-2 text-xl font-semibold text-white">Torneos</h2>
          <p className="text-sm text-zinc-400">
            Gestiona torneos existentes y crea nuevos eventos de pádel desde el panel de administración.
          </p>
          <span className="mt-4 inline-flex text-sm text-emerald-400 group-hover:text-emerald-300">
            Ir a torneos →
          </span>
        </Link>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="mb-2 text-xl font-semibold text-white">Información rápida</h2>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li>• Solo los usuarios con rol “admin” pueden acceder a este panel.</li>
            <li>• Usa la navegación superior para acceder a tus torneos.</li>
            <li>• El resto del sitio sigue disponible para los clubes y participantes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
