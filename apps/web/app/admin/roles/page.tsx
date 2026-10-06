import Link from "next/link";
import { RoleGate } from "../../../components/AccessGate";

export default function AdminRolesPage() {
  return <main id="main-content" className="shell"><nav className="topbar"><Link href="/admin/">← Administration</Link><span>Roles &amp; Permissions</span></nav><header className="reader-header"><p className="eyebrow">RBAC</p><h1>Roles &amp; Permissions</h1><p>Canonical roles are stored in Supabase and permissions are the actual authorization boundary.</p></header><RoleGate permissions={["role.assign"]}><section className="section"><div className="card"><h2>Canonical role hierarchy</h2><p>GUEST → READER → RESEARCHER / CONTRIBUTOR / TRANSLATOR → EDITOR / MODERATOR → ADMIN → SUPER_ADMIN.</p><p className="muted">Assignment actions will be added only through RLS-protected administrative operations; no service-role key is exposed in this static client.</p></div></section></RoleGate></main>;
}
