import Link from "next/link";
import ReviewWorkbench from "../../components/ReviewWorkbench";
import EditorialReviewQueue from "../../components/EditorialReviewQueue";

export default function ReviewPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Review Queue</span></nav>
    <header className="reader-header"><p className="eyebrow">PHASE 4.3 · REVIEW</p><h1>Research &amp; Editorial Review</h1><p>Authenticated editorial decisions are separate from browser-local research annotations. The database records reviewer identity, workflow state, and audit events; the local queue remains a staging tool for corpus research review.</p></header>
    <EditorialReviewQueue />
    <ReviewWorkbench />
    <section className="section"><div className="notice"><strong>Research integrity:</strong> Local “Verified” status is not a scholarly publication claim. Authenticated editorial decisions are the authoritative workflow record for project contributions.</div></section>
  </main>;
}
