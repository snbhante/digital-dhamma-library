export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  locale: string;
  is_public: boolean;
};

const STORAGE_KEY = "digital-dhamma-library:auth:v1";
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export function getFallbackName(email?: string): string {
  if (!email) return "Researcher";
  const username = email.split("@")[0] || "";
  if (username.length > 10) {
    return `${username.slice(0, 5)}...${username.slice(-4)}`;
  }
  return username || "Researcher";
}

function headers(accessToken?: string, extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...extra,
  };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(normalized).split("").map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`).join(""))) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sessionFromResponse(value: Record<string, unknown>): AuthSession | null {
  const accessToken = typeof value.access_token === "string" ? value.access_token : "";
  const refreshToken = typeof value.refresh_token === "string" ? value.refresh_token : "";
  const user = value.user as AuthUser | undefined;
  if (!accessToken || !refreshToken || !user?.id) return null;
  const expiresIn = typeof value.expires_in === "number" ? value.expires_in : 3600;
  const payload = decodeJwtPayload(accessToken);
  const exp = typeof payload?.exp === "number" ? payload.exp : Math.floor(Date.now() / 1000) + expiresIn;
  return { access_token: accessToken, refresh_token: refreshToken, expires_at: exp, user };
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined" || !supabaseConfigured) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as AuthSession;
    if (!value?.access_token || !value?.refresh_token || !value?.user?.id) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("ddl-auth-updated"));
}

async function request<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: headers(accessToken, (init.headers || {}) as Record<string, string>),
  });
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const message = typeof body === "object" && body && "message" in body ? String((body as { message: unknown }).message) : `Supabase request failed (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

export async function signIn(email: string, password: string) {
  const value = await request<Record<string, unknown>>(`/auth/v1/token?grant_type=password`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session = sessionFromResponse(value);
  if (!session) throw new Error("Sign-in succeeded without a usable session.");
  writeAuthSession(session);
  return session;
}

export async function signUp(email: string, password: string, displayName?: string) {
  const value = await request<Record<string, unknown>>(`/auth/v1/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password, data: displayName ? { display_name: displayName } : undefined }),
  });
  const session = sessionFromResponse(value);
  if (session) writeAuthSession(session);
  return { session, user: (value.user as AuthUser | undefined) ?? null };
}

export async function refreshAuthSession(session: AuthSession) {
  const value = await request<Record<string, unknown>>(`/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const refreshed = sessionFromResponse(value);
  if (!refreshed) throw new Error("Session refresh returned no usable session.");
  writeAuthSession(refreshed);
  return refreshed;
}

export async function getCurrentUser(session: AuthSession) {
  return request<AuthUser>(`/auth/v1/user`, { method: "GET" }, session.access_token);
}

export async function signOut(session: AuthSession | null) {
  if (session) {
    try { await request<unknown>(`/auth/v1/logout`, { method: "POST" }, session.access_token); } catch { /* local session is still cleared */ }
  }
  writeAuthSession(null);
}

export async function getProfile(session: AuthSession) {
  const rows = await request<Profile[]>(`/rest/v1/profiles?select=id,display_name,avatar_url,bio,locale,is_public&id=eq.${encodeURIComponent(session.user.id)}&limit=1`, { method: "GET" }, session.access_token);
  return rows[0] ?? null;
}

export async function upsertProfile(session: AuthSession, profile: Omit<Profile, "id">) {
  const rows = await request<Profile[]>(`/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ id: session.user.id, ...profile }]),
  }, session.access_token);
  return rows[0] ?? { id: session.user.id, ...profile };
}

export type WorkspaceSnapshot = {
  state: unknown;
  schema_version: number;
  updated_at: string;
};

export async function getWorkspaceSnapshot(session: AuthSession) {
  const rows = await request<WorkspaceSnapshot[]>(`/rest/v1/workspace_snapshots?select=state,schema_version,updated_at&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`, { method: "GET" }, session.access_token);
  return rows[0] ?? null;
}

export async function saveWorkspaceSnapshot(session: AuthSession, state: unknown) {
  const rows = await request<WorkspaceSnapshot[]>(`/rest/v1/workspace_snapshots?on_conflict=user_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ user_id: session.user.id, state, schema_version: 2 }]),
  }, session.access_token);
  return rows[0] ?? null;
}
