import Link from "next/link";
import dictionary from "../../../../data/dictionary.json";

export default function DictionaryPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Dictionary</span></nav>
    <header className="reader-header"><p className="eyebrow">PĀḶI RESEARCH DICTIONARY</p><h1>Starter Lexicon</h1><p>Source-aware lexical records with variants, grammatical notes, meanings, references, and a starter morphology index.</p></header>
    <div className="actions"><Link className="button" href="/dictionary-sources/">Dictionary sources</Link><Link className="button" href="/derivations/">Compounds &amp; forms</Link></div><section className="section grid">{dictionary.map((entry) => <Link className="card" href={`/dictionary/${entry.slug}/`} key={entry.id}><span className="card-kicker">{entry.grammar}</span><h3>{entry.headword}</h3><p>{entry.meanings[0]?.english}</p><p className="bangla">{entry.meanings[0]?.bangla}</p><span className="card-link">Research entry →</span></Link>)}</section>
    <section className="section"><div className="notice"><strong>Scope:</strong> this is a Phase 2 starter lexicon, not a replacement for DPD, PED, PEA, DPPN, or a complete Pāḷi morphological database. Licensed dictionary datasets can be integrated later without changing the research UI.</div></section>
  </main>;
}
