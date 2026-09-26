import Link from "next/link";
import analyses from "../../../../data/morphology-analyses.json";
import derivations from "../../../../data/derivations.json";

export default function MorphologyPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Morphology &amp; Formation</span></nav>
    <header className="reader-header"><p className="eyebrow">PĀḶI MORPHOLOGY LAYER</p><h1>Forms, Lemmas &amp; Derivations</h1><p>Starter lexical analyses and compound/form metadata with explicit provenance and review status. This is research scaffolding, not a complete Pāḷi morphology, sandhi, or grammar engine.</p><div className="metadata"><span>{analyses.length} indexed analyses</span><span>{derivations.length} formation records</span></div></header>
    <section className="section grid">{analyses.map((item) => <article className="card" key={item.id}><div className="result-meta"><span>{item.analysisType}</span><span>{item.reviewStatus}</span></div><h3 className="pali">{item.token}</h3><p><strong>Lemma:</strong> <span className="pali">{item.lemma}</span></p><p>{item.grammar || "No grammar note."}</p><p className="muted">Source: {item.sourceRecord || "token-level starter assignment"}</p></article>)}</section>
    <section className="section"><h2>Formation records</h2><div className="result-list">{derivations.map((item) => <article className="card" key={item.id}><div className="result-meta"><span>{item.relation}</span><span>{item.confidence}</span></div><h3 className="pali">{item.headword}</h3><p>{item.analysis}</p><p className="muted">{item.note}</p></article>)}</div></section>
  </main>;
}
