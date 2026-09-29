import Link from "next/link";
import AccountPanel from "../../components/AccountPanel";

export default function AccountPage() {
  return <main id="main-content" className="shell compact-section">
    <nav className="topbar"><Link href="/workspace/">← My Workspace</Link><span>Account</span></nav>
    <header className="reader-header"><p className="eyebrow">PERSONAL IDENTITY</p><h1>My account</h1><p>Manage your profile and authentication. Your workspace can remain browser-local or synchronize with your authenticated cloud workspace.</p></header>
    <AccountPanel />
  </main>;
}
