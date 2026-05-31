import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-gradient-to-t from-zinc-950 to-zinc-900/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <p className="text-lg font-bold">
              <span className="text-emerald-400">Pádel</span>
              <span className="text-white">Club</span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">Torneos y reservas de pádel.</p>
          </div>

          <div className="flex gap-8 text-sm text-zinc-400">
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Club</p>
              <Link href="/" className="transition-colors hover:text-white">Inicio</Link>
              <Link href="/torneos" className="transition-colors hover:text-white">Torneos</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cuenta</p>
              <Link href="/login" className="transition-colors hover:text-white">Iniciar sesión</Link>
              <Link href="/register" className="transition-colors hover:text-white">Registrarse</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} PádelClub. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
