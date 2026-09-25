import Link from "next/link";
import ReviewWorkbench from "../../components/ReviewWorkbench";

export default function ReviewPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Review Queue</span></nav>
    <header className="reader-header"><p className="eyebrow">PHASE 2.3 · RESEARCH REVIEW</p><h1>Research Review Queue</h1><p>Review sentence alignments, occurrence/lemma assignments, and morphology analyses without changing canonical corpus text. Browser-local review notes prepare the project for authenticated editorial workflows in Phase 3/4.</p></header>
    <ReviewWorkbench />
    <section className="section"><div className="notice"><strong>Research integrity:</strong> “Verified” in this local queue means only that a reviewer marked the item as checked in this browser. It is not a public scholarly verification record until authenticated reviewer identity, source citations, and audit logging are implemented.</div></section>
  </main>;
}
