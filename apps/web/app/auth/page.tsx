import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export default function AuthPage() {
  return <main id="main-content" className="shell compact-section">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Account</span></nav>
    <header className="reader-header"><p className="eyebrow">PHASE 3 · WORKSPACE 2.0</p><h1>Researcher account</h1><p>Sign in to connect your personal research workspace to cloud persistence while keeping the public Dhamma corpus immutable and source-aware.</p></header>
    <AuthForm />
    <section className="section"><div className="notice"><strong>Privacy model:</strong> authentication and personal workspace data are separate from the public corpus. The browser can continue in local-first mode when cloud credentials are not configured.</div></section>
  </main>;
}
