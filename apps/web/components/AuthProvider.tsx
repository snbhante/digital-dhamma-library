"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getUserPermissions,
  getUserRoles,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
  supabaseConfigured,
  type AuthSession,
  type AuthUser,
} from "../lib/supabase";
import { supabaseBrowserClient } from "../lib/supabaseBrowser";
import type { Permission, UserRole } from "../lib/authz";

export type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  authorizationLoading: boolean;
  authorizationError: string | null;
  session: AuthSession | null;
  user: AuthUser | null;
  roles: UserRole[];
  permissions: Permission[];
  refreshAuthorization: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ confirmed: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorizationLoading, setAuthorizationLoading] = useState(false);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  async function loadAuthorization(nextSession: AuthSession | null) {
    if (!nextSession) {
      setAuthorizationError(null);
      setRoles([]);
      setPermissions([]);
      setAuthorizationLoading(false);
      return;
    }
    setAuthorizationLoading(true);
    setAuthorizationError(null);
    try {
      const [nextRoles, nextPermissions] = await Promise.all([
        getUserRoles(nextSession),
        getUserPermissions(nextSession),
      ]);
      setRoles(nextRoles);
      setPermissions(nextPermissions);
    } catch (value) {
      const record = value && typeof value === "object" ? value as Record<string, unknown> : null;
      const message = value instanceof Error ? value.message : typeof record?.message === "string" ? record.message : typeof record?.details === "string" ? record.details : "Could not load role and permission records.";
      setAuthorizationError(message);
      setRoles([]);
      setPermissions([]);
    } finally {
      setAuthorizationLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = supabaseBrowserClient();

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await loadAuthorization(data.session);
      if (!cancelled) setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setSession(null);
        setRoles([]);
        setPermissions([]);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      setTimeout(() => { void loadAuthorization(nextSession); }, 0);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: supabaseConfigured,
    loading,
    authorizationLoading,
    authorizationError,
    session,
    user: session?.user ?? null,
    roles,
    permissions,
    refreshAuthorization: async () => loadAuthorization(session),
    async signIn(email, password) {
      const next = await apiSignIn(email.trim(), password);
      setSession(next);
      await loadAuthorization(next);
    },
    async signUp(email, password, displayName) {
      const result = await apiSignUp(email.trim(), password, displayName?.trim());
      if (result.session) {
        setSession(result.session);
        await loadAuthorization(result.session);
      }
      return { confirmed: Boolean(result.session) };
    },
    async signOut() {
      await apiSignOut(session);
      setSession(null);
      setRoles([]);
      setPermissions([]);
      setAuthorizationError(null);
    },
  }), [loading, authorizationLoading, authorizationError, session, roles, permissions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
