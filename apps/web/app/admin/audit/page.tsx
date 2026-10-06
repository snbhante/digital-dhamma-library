import Link from "next/link";
import { RoleGate } from "../../../components/AccessGate";

export default function AdminAuditPage() {
  return <main id="main-content" className="shell"><nav className="topbar"><Link href="/admin/">← Administration</Link><span>Audit History</span></nav><header className="reader-header"><p className="eyebrow">AUDIT</p><h1>Audit History</h1><p>Structured audit records are stored separately from public canonical corpus data.</p></header><RoleGate permissions={["audit.read"]}><section className="section"><div className="notice">Audit reads are RLS-protected. The next editorial increment can expose paginated records and filters without weakening the database boundary.</div></section></RoleGate></main>;
}
