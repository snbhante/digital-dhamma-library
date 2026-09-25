import Link from "next/link";
import derivations from "../../../../data/derivations.json";

export default function DerivationsPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Derivations</span></nav>
    <header className="reader-header"><p className="eyebrow">PĀḶI FORMATION METADATA</p><h1>Compounds &amp; Forms</h1><p>Starter relationships for lexical forms and transparent compound metadata. These are research aids, not a replacement for a full Pāḷi grammar or commentarial derivation system.</p></header>
    <section className="section grid">{derivations.map((item)=><article className="card" key={item.id}><div className="result-meta"><span>{item.relation}</span><span>{item.confidence}</span></div><h3 className="pali">{item.headword}</h3><p><strong>Base:</strong> <span className="pali">{item.base}</span></p><p><strong>Components:</strong> <span className="pali">{item.components.join(" + ")}</span></p><p>{item.note}</p></article>)}</section>
  </main>;
}
