"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGate } from "../../../components/AccessGate";
import { useAuth } from "../../../components/AuthProvider";
import { listAdminAuditLogs } from "../../../lib/supabase";

export default function AdminAuditPage() {
  const { session } = useAuth();
  const [logs, setLogs] = useState<Array<{ id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; reason: string | null; created_at: string }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    listAdminAuditLogs(session).then(setLogs).catch((value) => setError(value instanceof Error ? value.message : "Could not load audit history."));
  }, [session]);

  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/admin/">← Administration</Link><span>Audit History</span></nav>
    <header className="reader-header"><p className="eyebrow">AUDIT · PHASE 4.3</p><h1>Audit History</h1><p>Append-only audit records are readable only through the database policy for authorized administrators.</p></header>
    <RoleGate permissions={["audit.read"]}>
      <section className="section">
        {error && <div className="notice error-notice">{error}</div>}
        <div className="result-list">{logs.map((log) => <article className="card" key={log.id}><div className="result-meta"><span>{log.action}</span><span>{new Date(log.created_at).toLocaleString()}</span></div><h3>{log.entity_type} · {log.entity_id ?? "—"}</h3><p>{log.reason || "No reason supplied."}</p><p className="muted">Actor: {log.actor_id ?? "system"}</p></article>)}</div>
        {!logs.length && !error && <div className="notice">No audit records are available yet.</div>}
      </section>
    </RoleGate>
  </main>;
}
