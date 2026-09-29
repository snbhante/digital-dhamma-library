"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthForm() {
  const { configured, loading, user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (loading) return <div className="notice">Checking authentication…</div>;
  if (user) return <div className="notice"><strong>You are signed in.</strong> Open <Link href="/account/">your account</Link> to manage profile and workspace sync.</div>;
  if (!configured) return <div className="notice"><strong>Cloud workspace is not configured yet.</strong><br />For local development, copy <code>.env.example</code> to <code>.env.local</code> and set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>. The library continues to work fully in local-first mode without these values.</div>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      if (mode === "signin") {
        await signIn(email, password);
        setMessage("Signed in successfully.");
      } else {
        const result = await signUp(email, password, displayName);
        setMessage(result.confirmed ? "Account created and signed in." : "Account created. Check your email to confirm the account, then sign in.");
      }
    } catch (value) {
      setError(value instanceof Error ? value.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="auth-card card">
    <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
      <button className={`small-button${mode === "signin" ? " active" : ""}`} type="button" onClick={() => setMode("signin")}>Sign in</button>
      <button className={`small-button${mode === "signup" ? " active" : ""}`} type="button" onClick={() => setMode("signup")}>Create account</button>
    </div>
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" placeholder="Your research name" /></label>}
      <label><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>
      <label><span>Password</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required /></label>
      {error && <div className="notice error-notice" role="alert">{error}</div>}
      {message && <div className="notice success-notice" role="status">{message}</div>}
      <button className="button primary" type="submit" disabled={busy}>{busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}</button>
    </form>
  </section>;
}
