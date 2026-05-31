"use client";

import Link from "next/link";
import { useState } from "react";

type FormState = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
            <svg
              className="h-8 w-8 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">¡Cuenta creada!</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Tu cuenta fue creada correctamente. Ya podés iniciar sesión.
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Registrate para inscribirte en torneos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Apellido
              </label>
              <input
                name="apellido"
                type="text"
                required
                value={form.apellido}
                onChange={handleChange}
                placeholder="García"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Confirmar contraseña
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repetí tu contraseña"
              className={`w-full rounded-lg border bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-colors focus:outline-none ${
                passwordsMismatch
                  ? "border-red-500 focus:border-red-500"
                  : "border-zinc-700 focus:border-emerald-500"
              }`}
            />
            {passwordsMismatch && (
              <p className="mt-1 text-xs text-red-400">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordsMismatch}
            className="mt-2 w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
