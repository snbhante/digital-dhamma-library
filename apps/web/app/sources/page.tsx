import Link from "next/link";
import sources from "../../../../data/sources.json";

export default function SourcesPage() {
  return <main className="shell search-page">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Sources & Provenance</span></nav>
    <header className="reader-header search-header"><p className="eyebrow">PROVENANCE</p><h1>Sources</h1><p>Source records make the corpus auditable: edition, provenance, rights status, and import intent are kept explicit.</p></header>
    <section className="section"><div className="result-list">{sources.map((source)=><article className="result-card" key={source.id}><div className="result-meta"><span>{source.kind}</span><span>{source.id}</span></div><h3>{source.title}</h3><p><strong>Edition:</strong> {source.edition}</p><p><strong>License:</strong> {source.licenseStatus}</p><p><strong>Provenance:</strong> {source.provenance}</p></article>)}</div></section>
  </main>;
}
