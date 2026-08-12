"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // on success redirect to homepage
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Error desconocido");
      setLoading(false);
    }
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
            disabled={loading}
            className={`mt-2 w-full rounded-lg bg-emerald-500 py-2.5 font-semibold text-black transition-colors ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-emerald-400"
            }`}
            aria-busy={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {errorMsg && (
            <p className="mt-2 text-sm text-red-400">{errorMsg}</p>
          )}
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
        
        <div>
          <button
            type="button"
            className="text-white"
            onClick={async () => {
              const supabase = createClient()
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=/`,
                },
              })

              if (error) {
                console.error("Error iniciando sesión con Google:", error.message)
              }
            }}
          >
            Google
          </button>
        </div>

      </div>
    </div>
  );
}
