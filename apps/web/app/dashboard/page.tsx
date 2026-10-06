import Link from "next/link";
import AuthStatus from "../../components/AuthStatus";
import { AuthenticatedGate } from "../../components/AccessGate";
import DashboardPanel from "../../components/DashboardPanel";

export default function DashboardPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/">← Library</Link><span className="topbar-right"><span>Researcher Dashboard</span><AuthStatus /></span></nav>
    <header className="reader-header"><p className="eyebrow">AUTHENTICATED WORKSPACE</p><h1>Dashboard</h1><p>Your identity, workspace, research activity, contribution status, and available permissions in one place.</p></header>
    <AuthenticatedGate><DashboardPanel /></AuthenticatedGate>
  </main>;
}
