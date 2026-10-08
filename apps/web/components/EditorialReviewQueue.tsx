"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { listEditorialSubmissions, reviewEditorialSubmission, type EditorialSubmission } from "../lib/supabase";
import { RoleGate } from "./AccessGate";

export default function EditorialReviewQueue() {
  const { session } = useAuth();
  const [items, setItems] = useState<EditorialSubmission[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    if (!session) return;
    const data = await listEditorialSubmissions(session);
    setItems(data.filter((item) => ["SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED"].includes(item.status)));
  }

  useEffect(() => {
    void load().catch((value) => setError(value instanceof Error ? value.message : "Could not load editorial submissions."));
  }, [session]);

  async function decide(id: string, decision: "APPROVE" | "REQUEST_CHANGES" | "REJECT") {
    if (!session) return;
    const note = window.prompt("Reviewer note (optional):") ?? "";
    setBusy(id); setError("");
    try { await reviewEditorialSubmission(session, id, decision, note); await load(); }
    catch (value) { setError(value instanceof Error ? value.message : "Review operation failed."); }
    finally { setBusy(""); }
  }

  return <RoleGate permissions={["content.review"]}>
    <section className="section">
      <div className="notice"><strong>Authenticated editorial queue.</strong> Decisions are recorded in Supabase with reviewer identity and audit events. The older browser-local research review queue remains separate.</div>
      {error && <div className="notice error-notice">{error}</div>}
      <div className="result-list">
        {items.map((item) => <article className="card" key={item.id}>
          <div className="result-meta"><span>{item.status}</span><span>{item.kind}</span><span>{new Date(item.updated_at).toLocaleString()}</span></div>
          <h2>{item.title}</h2>
          <p className="muted">Target: {item.target_id} · Contributor: {item.contributor_id}</p>
          <p>{item.body}</p>
          <div className="actions">
            <button className="small-button" disabled={Boolean(busy)} onClick={() => void decide(item.id, "APPROVE")}>{busy === item.id ? "Working…" : "Approve"}</button>
            <button className="small-button" disabled={Boolean(busy)} onClick={() => void decide(item.id, "REQUEST_CHANGES")}>Request changes</button>
            <button className="small-button" disabled={Boolean(busy)} onClick={() => void decide(item.id, "REJECT")}>Reject</button>
          </div>
        </article>)}
      </div>
      {!items.length && !error && <div className="notice">No submissions are waiting for editorial review.</div>}
    </section>
  </RoleGate>;
}
