"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function AuthStatus() {
  const { configured, loading, user } = useAuth();
  if (loading) return <span className="auth-status muted">Checking account…</span>;
  if (!configured) return <Link className="small-button" href="/auth/">Account</Link>;
  return user ? <Link className="small-button" href="/account/">{user.user_metadata?.display_name ? String(user.user_metadata.display_name) : user.email || "Account"}</Link> : <Link className="small-button" href="/auth/">Sign in</Link>;
}
