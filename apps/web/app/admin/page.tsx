import Link from "next/link";
import AuthStatus from "../../components/AuthStatus";
import { RoleGate } from "../../components/AccessGate";
import AdminPanel from "../../components/AdminPanel";

export default function AdminPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/dashboard/">← Dashboard</Link><span className="topbar-right"><span>Administration</span><AuthStatus /></span></nav>
    <header className="reader-header"><p className="eyebrow">ADMINISTRATION FOUNDATION</p><h1>Control Center</h1><p>Role-aware administration surface for users, roles, editorial records, sources, media, licenses, and audit history.</p></header>
    <RoleGate permissions={["user.read", "role.assign", "source.manage", "license.manage", "audit.read"]}><AdminPanel /></RoleGate>
  </main>;
}
