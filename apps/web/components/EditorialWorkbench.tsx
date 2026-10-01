"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import workflow from "../../../data/editorial-workflow.json";
import reviewQueue from "../../../data/review-queue.json";
import { createEditorialSubmission, getUserRoles, type UserRole } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

const draftKey = "digital-dhamma-library:editorial-draft:v1";

export default function EditorialWorkbench() {
  const { configured, loading, session } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [targetId, setTargetId] = useState("mn10.p002");
  const [kind, setKind] = useState("CORRECTION");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const value = JSON.parse(raw) as { targetId?: string; kind?: string; title?: string; body?: string };
        if (value.targetId) setTargetId(value.targetId);
        if (value.kind) setKind(value.kind);
        if (value.title) setTitle(value.title);
        if (value.body) setBody(value.body);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify({ targetId, kind, title, body }));
  }, [targetId, kind, title, body]);

  useEffect(() => {
    if (!session) { setRoles([]); return; }
    getUserRoles(session).then(setRoles).catch(() => setRoles([]));
  }, [session]);

  const roleNames = useMemo(() => new Set(roles.map((role) => role.name)), [roles]);
  const canSubmit = Boolean(session) && (roleNames.has("CONTRIBUTOR") || roleNames.has("TRANSLATOR") || roleNames.has("RESEARCHER") || roleNames.has("EDITOR") || roleNames.has("ADMIN") || roleNames.has("SUPER_ADMIN"));
  const canReview = roleNames.has("EDITOR") || roleNames.has("MODERATOR") || roleNames.has("ADMIN") || roleNames.has("SUPER_ADMIN");

  async function submit() {
    setError(""); setStatus("");
    if (!session) { setError("Sign in first to submit an editorial contribution."); return; }
    if (!canSubmit) { setError("Your account has no contributor/research role yet. Ask an administrator to assign the appropriate role."); return; }
    if (!title.trim() || !body.trim()) { setError("Title and contribution text are required."); return; }
    try {
      const result = await createEditorialSubmission(session, { target_id: targetId.trim(), kind, title: title.trim(), body: body.trim() });
      if (!result) throw new Error("No submission record was returned.");
      setStatus(`Submitted ${result.id}. Status: ${result.status}.`);
      setTitle(""); setBody("");
    } catch (value) { setError(value instanceof Error ? value.message : "Submission failed."); }
  }

  return <section className="section editorial-workbench">
    <div className="stats-grid"><div className="stat-card"><strong>{reviewQueue.length}</strong><span>Existing review records</span></div><div className="stat-card"><strong>{workflow.states.length}</strong><span>Editorial states</span></div><div className="stat-card"><strong>{roles.length}</strong><span>Your assigned roles</span></div><div className="stat-card"><strong>{canReview ? "YES" : "NO"}</strong><span>Reviewer access</span></div></div>
    <div className="grid editorial-grid">
      <article className="card"><span className="card-kicker">CONTRIBUTOR WORKFLOW</span><h2>Submit a research contribution</h2><p className="muted">Drafts remain separate from canonical corpus data. Submission enters the authenticated editorial workflow.</p><div className="auth-form"><label>Target stable ID<input value={targetId} onChange={(e) => setTargetId(e.target.value)} placeholder="mn10.p002" /></label><label>Contribution type<select value={kind} onChange={(e) => setKind(e.target.value)}>{workflow.submissionKinds.map((item) => <option key={item}>{item}</option>)}</select></label><label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>Contribution<textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} /></label><button className="button primary" onClick={submit} disabled={loading}>{session ? "Submit for review" : "Sign in to submit"}</button>{status && <div className="notice success-notice">{status}</div>}{error && <div className="notice error-notice">{error}</div>}</div></article>
      <article className="card"><span className="card-kicker">WORKFLOW</span><h2>Editorial states</h2><div className="workflow-steps">{workflow.states.map((state, index) => <div className="workflow-step" key={state}><strong>{index + 1}</strong><span>{state}</span></div>)}</div><div className="notice compact"><strong>Your roles:</strong> {roles.length ? roles.map((role) => role.name).join(", ") : "No authenticated role is visible."}<br /><br /><strong>Reviewer:</strong> {canReview ? "enabled" : "not enabled"}</div><Link className="small-button" href="/review/">Open existing research review queue →</Link></article>
    </div>
    <div className="notice"><strong>Editorial integrity:</strong> {workflow.reviewPrinciples.join(" ")}</div>
    {!configured && <div className="notice">Supabase is not configured in this build. The static reader and research features remain available; authenticated editorial submission requires the public Supabase URL/key configuration.</div>}
  </section>;
}
