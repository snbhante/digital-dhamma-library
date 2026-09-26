import Link from "next/link";
import profiles from "../../../../data/citation-profiles.json";

export default function CitationsPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Citation Profiles</span></nav>
    <header className="reader-header"><p className="eyebrow">CITATION ENGINE</p><h1>Citation Profiles</h1><p>Reusable citation templates for stable paragraph URLs. These profiles are intentionally conservative and should be enriched with verified edition/editor/publisher data when those records become available.</p></header>
    <section className="section result-list">{profiles.map((profile) => <article className="card" key={profile.id}><div className="result-meta"><span>{profile.format}</span><span>{profile.id}</span></div><h3>{profile.label}</h3><pre className="citation-template">{profile.template}</pre><p className="muted">{profile.note}</p></article>)}</section>
  </main>;
}
