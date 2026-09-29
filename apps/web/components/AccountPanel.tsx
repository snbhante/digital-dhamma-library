"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getProfile, upsertProfile, type Profile } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

export default function AccountPanel() {
  const { configured, loading, session, user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locale, setLocale] = useState("en");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    getProfile(session).then((value) => {
      setProfile(value);
      setDisplayName(value?.display_name ?? (typeof user?.user_metadata?.display_name === "string" ? user.user_metadata.display_name : ""));
      setBio(value?.bio ?? "");
      setLocale(value?.locale ?? "en");
      setIsPublic(value?.is_public ?? false);
    }).catch((value) => setError(value instanceof Error ? value.message : "Could not load profile."));
  }, [session, user]);

  if (loading) return <div className="notice">Loading account…</div>;
  if (!configured) return <div className="notice">Supabase is not configured. Your workspace remains local-first.</div>;
  if (!session || !user) return <div className="notice"><strong>You are not signed in.</strong> <Link href="/auth/">Sign in</Link> to enable cloud workspace sync.</div>;

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus(""); setError("");
    try {
      const next = await upsertProfile(session, { display_name: displayName.trim() || null, avatar_url: profile?.avatar_url ?? null, bio: bio.trim() || null, locale, is_public: isPublic });
      setProfile(next);
      setStatus("Profile saved.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not save profile.");
    }
  }

  return <div className="account-grid">
    <section className="card account-card">
      <span className="card-kicker">ACCOUNT</span>
      <h2>{displayName || user.email || "Researcher"}</h2>
      <p>{user.email}</p>
      <div className="actions"><Link className="button primary" href="/workspace/">Open workspace</Link><button className="button" type="button" onClick={() => signOut()}>Sign out</button></div>
    </section>
    <section className="card account-card">
      <span className="card-kicker">PROFILE</span>
      <form className="auth-form" onSubmit={save}>
        <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
        <label><span>Bio</span><textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} /></label>
        <label><span>Interface language</span><select value={locale} onChange={(event) => setLocale(event.target.value)}><option value="en">English</option><option value="bn">বাংলা</option><option value="pi">Pāḷi</option></select></label>
        <label className="checkbox-row"><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /><span>Make my profile publicly discoverable</span></label>
        {error && <div className="notice error-notice" role="alert">{error}</div>}
        {status && <div className="notice success-notice" role="status">{status}</div>}
        <button className="button primary" type="submit">Save profile</button>
      </form>
    </section>
  </div>;
}
