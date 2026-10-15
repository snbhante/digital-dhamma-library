"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { UserAvatar } from "./UserAvatar";

export default function DashboardPanel() {
  const { user, roles, permissions, authorizationLoading, authorizationError } = useAuth();
  return <section className="section">
    {authorizationError && <div className="notice error-notice" role="alert">Role and permission data could not be loaded: {authorizationError}. Check Supabase migrations, table policies, and the current user role assignment.</div>}
    <div className="stats-grid" aria-label="Account overview">
      <div className="stat-card"><strong>{roles.length}</strong><span>Assigned roles</span></div>
      <div className="stat-card"><strong>{permissions.length}</strong><span>Effective permissions</span></div>
      <div className="stat-card"><strong>{user?.email ? "ACTIVE" : "—"}</strong><span>Authentication</span></div>
      <div className="stat-card"><strong>{authorizationLoading ? "Checking" : "RLS"}</strong><span>Database authorization</span></div>
    </div>
    <div className="grid dashboard-grid">
      <article className="card dashboard-card"><span className="card-kicker">IDENTITY</span><div className="dashboard-identity"><UserAvatar src={typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null} gender={user?.user_metadata?.gender} name="Account" size="medium" href="/account/" /><div><h2>{String(user?.user_metadata?.display_name || user?.email || "Researcher")}</h2><p className="muted">{user?.email || "Authenticated account"}</p></div></div><div className="actions"><Link className="button primary" href="/account/">Profile &amp; settings</Link><Link className="button" href="/workspace/">Workspace</Link></div></article>
      <article className="card dashboard-card"><span className="card-kicker">ROLES &amp; ACCESS</span><h2>Authorization</h2><p>{roles.length ? roles.map((role) => role.name).join(", ") : "No roles loaded"}</p><p className="muted">Permissions are enforced by Supabase RLS; UI gates are only an additional user-experience layer.</p></article>
      <article className="card dashboard-card"><span className="card-kicker">RESEARCH</span><h2>Research tools</h2><div className="actions"><Link className="button" href="/research/">Workbench</Link><Link className="button" href="/research-reader/mn10/">Advanced reader</Link><Link className="button" href="/review/">Review queue</Link></div></article>
      <article className="card dashboard-card"><span className="card-kicker">CONTRIBUTION</span><h2>Editorial workflow</h2><p>Submit corrections, translations, source metadata, citations, and media metadata without mutating the canonical Git corpus directly.</p><Link className="small-button" href="/editorial/">Open contributor workspace →</Link></article>
    </div>
  </section>;
}
