"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { getFallbackName } from "../lib/supabase";

export default function AuthStatus() {
  const { configured, loading, user } = useAuth();
  if (loading) return <span className="auth-status muted">Checking account…</span>;
  if (!configured) return <Link className="small-button" href="/auth/">Account</Link>;
  const meta = user?.user_metadata || {};
  const name = meta.display_name || meta.full_name || meta.name;
  return user ? <Link className="small-button" href="/account/">{name ? String(name) : getFallbackName(user.email)}</Link> : <Link className="small-button" href="/auth/">Sign in</Link>;
}
