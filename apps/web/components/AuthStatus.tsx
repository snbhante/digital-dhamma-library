"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { UserAvatar } from "./UserAvatar";

export default function AuthStatus() {
  const { configured, loading, user } = useAuth();
  if (loading) return <span className="auth-status muted">Checking account…</span>;
  if (!configured) return <Link className="small-button" href="/auth/">Account</Link>;
  if (!user) return <Link className="small-button" href="/auth/">Sign in</Link>;
  const meta = user.user_metadata || {};
  return <span className="auth-status-avatar"><UserAvatar src={typeof meta.avatar_url === "string" ? meta.avatar_url : null} gender={meta.gender} name="Account" size="small" href="/account/" /><span className="sr-only">Signed in</span></span>;
}
