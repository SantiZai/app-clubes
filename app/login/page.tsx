"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Accedé a tu cuenta para inscribirte en torneos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
}
