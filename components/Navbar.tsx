"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Tables } from "@/types/database.types";

type User = Tables<"usuarios">

const links = [
  { href: "/", label: "Inicio" },
  { href: "/torneos", label: "Torneos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-400 text-black font-black">
            PC
          </span>
          <span className="text-white">PádelClub</span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${pathname === l.href
                ? "text-white"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {
          user ? (
            <>
              {user.rol && (user.rol === "admin" && user.club_id) ? (
                <Link
                  href="/admin"
                  className="hidden text-sm text-emerald-400 transition-colors hover:text-emerald-300 sm:inline-flex"
                >
                  Panel admin
                </Link>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger className="hover:bg-accent-foreground rounded-lg p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Avatar>
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback>{user.name!.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <p className="text-white">{user.name}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-accent-foreground text-white">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                    <DropdownMenuItem className="hover:bg-emerald-500">
                      <Link href="/profile" className="w-full">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      Ajustes
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="hover:bg-transparent">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left text-emerald-400 hover:underline hover:bg-transparent"
                      >
                        Cerrar sesión
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/login"
                className="text-sm text-zinc-300 transition-colors hover:text-white px-3 py-2"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-emerald-400"
              >
                Registrarse
              </Link>
            </div>
          )
        }

        <button
          className="p-2 text-zinc-400 transition-colors hover:text-white sm:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-zinc-800 px-4 py-5 sm:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-300 transition-colors hover:text-white"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-zinc-800" />
          {user ? (
            <>
              {user.rol === "admin" ? (
                <Link
                  href="/admin"
                  className="text-sm text-zinc-300"
                  onClick={() => setOpen(false)}
                >
                  Panel admin
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                Perfil
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setOpen(false);
                }}
                className="text-left text-sm text-zinc-300 hover:text-white"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
