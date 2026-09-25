import Link from "next/link";
import sources from "../../../../data/dictionary-sources.json";

export default function DictionarySourcesPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/dictionary/">← Dictionary</Link><span>Dictionary Sources</span></nav>
    <header className="reader-header"><p className="eyebrow">DICTIONARY SOURCE ADAPTERS</p><h1>Dictionary Sources</h1><p>Adapter contracts separate dictionary-source metadata from imported lexical content. Planned external sources are not bundled unless redistribution rights are verified.</p></header>
    <section className="section grid">{sources.map((source)=><article className="card" key={source.id}><span className="card-kicker">{source.status}</span><h3>{source.title}</h3><p>{source.note}</p><p><strong>Mapping:</strong> {source.mapping}</p><p className="muted">{source.licenseStatus}</p></article>)}</section>
  </main>;
}
