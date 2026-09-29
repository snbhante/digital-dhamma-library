"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  readAuthSession,
  refreshAuthSession,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
  supabaseConfigured,
  type AuthSession,
  type AuthUser,
} from "../lib/supabase";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ confirmed: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!supabaseConfigured) {
        setLoading(false);
        return;
      }
      let current = readAuthSession();
      try {
        if (current && current.expires_at * 1000 < Date.now() + 60_000) current = await refreshAuthSession(current);
        if (current) {
          const user = await getCurrentUser(current);
          current = { ...current, user };
        }
      } catch {
        current = null;
        localStorage.removeItem("digital-dhamma-library:auth:v1");
      }
      if (!cancelled) {
        setSession(current);
        setLoading(false);
      }
    }
    restore();
    const refresh = () => setSession(readAuthSession());
    window.addEventListener("ddl-auth-updated", refresh);
    return () => { cancelled = true; window.removeEventListener("ddl-auth-updated", refresh); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: supabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    async signIn(email, password) {
      const next = await apiSignIn(email.trim(), password);
      setSession(next);
    },
    async signUp(email, password, displayName) {
      const result = await apiSignUp(email.trim(), password, displayName?.trim());
      if (result.session) setSession(result.session);
      return { confirmed: Boolean(result.session) };
    },
    async signOut() {
      await apiSignOut(session);
      setSession(null);
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
