"use client";

import { createContext, useContext, useEffect, useState, createElement, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/types/db";
import { upsertUser } from "@/lib/userUtils";

interface AuthContextValue {
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      const supabase = await createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setSupabaseUser(session.user);
        setSession(session);
        await handleUserSync(session.user);
      }

      setIsLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        if (nextSession?.user) {
          setSupabaseUser(nextSession.user);
          setSession(nextSession);
          await handleUserSync(nextSession.user);
        } else {
          setSupabaseUser(null);
          setUser(null);
          setSession(null);
        }

        setIsLoading(false);
      });

      unsubscribe = () => subscription.unsubscribe();
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleUserSync = async (supabaseUser: SupabaseUser) => {
    try {
      const userData = await upsertUser(supabaseUser);
      setUser(userData);
    } catch (error) {
      console.error("Error syncing user:", error);
      setUser(null);
    }
  };

  return createElement(
    AuthContext.Provider,
    {
      value: {
        supabaseUser,
        session,
        user,
        isLoading,
        isAuthenticated: !!supabaseUser,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
