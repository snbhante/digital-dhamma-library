import Link from "next/link";
import SiteBrand from "../../components/SiteBrand";
import EditorialWorkbench from "../../components/EditorialWorkbench";

export default function EditorialPage() { return <main id="main-content" className="shell"><nav className="topbar"><SiteBrand compact /><div className="topbar-actions"><Link href="/research/">Research</Link><Link href="/account/">Account</Link></div></nav><header className="reader-header"><p className="eyebrow">PHASE 4 FOUNDATION</p><h1>Contributor &amp; Editorial Platform</h1><p>Role-aware contribution submission, review-state modeling, provenance boundaries, and authenticated editorial handoff. Publication is controlled by Supabase PostgreSQL RLS and authorization helpers; the GitHub Pages client never receives privileged service-role credentials.</p></header><EditorialWorkbench /></main>; }
