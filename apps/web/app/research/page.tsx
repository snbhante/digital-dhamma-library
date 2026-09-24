import Link from "next/link";
import corpus from "../../../../data/corpus.json";
import dictionary from "../../../../data/dictionary.json";
import editions from "../../../../data/editions.json";
import translations from "../../../../data/translations.json";
import morphology from "../../../../data/morphology.json";
import occurrences from "../../../../data/occurrences.json";
import crossReferences from "../../../../data/cross-references.json";

const paragraphCount = corpus.reduce((sum, work) => sum + work.paragraphs.length, 0);
const occurrenceCount = occurrences.reduce((sum, item) => sum + item.count, 0);

export default function ResearchPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Phase 2 Research Engine</span></nav>
    <header className="reader-header">
      <p className="eyebrow">PHASE 2 · RESEARCH ENGINE</p>
      <h1>Research Workbench</h1>
      <p>A source-aware foundation for editions, translations, dictionary research, word occurrences, morphology, cross-references, and scholarly citation.</p>
    </header>
    <section className="section">
      <div className="stats-grid">
        <div className="stat-card"><strong>{corpus.length}</strong><span>Works</span></div>
        <div className="stat-card"><strong>{paragraphCount}</strong><span>Paragraphs</span></div>
        <div className="stat-card"><strong>{dictionary.length}</strong><span>Dictionary entries</span></div>
        <div className="stat-card"><strong>{occurrences.length}</strong><span>Indexed Pāḷi tokens</span></div>
        <div className="stat-card"><strong>{occurrenceCount}</strong><span>Token occurrences</span></div>
        <div className="stat-card"><strong>{crossReferences.length}</strong><span>Research links</span></div>
      </div>
    </section>
    <section className="section grid">
      <Link className="card" href="/search/"><span className="card-kicker">01</span><h3>Advanced Search</h3><p>Search the multilingual corpus with filters and stable paragraph links.</p><span className="card-link">Open search →</span></Link>
      <Link className="card" href="/editions/"><span className="card-kicker">02</span><h3>Editions</h3><p>Track edition identity, provenance, verification status, and licensing notes.</p><span className="card-link">Open editions →</span></Link>
      <Link className="card" href="/translations/"><span className="card-kicker">03</span><h3>Translations</h3><p>Separate translation identity from canonical text and preserve rights metadata.</p><span className="card-link">Open translations →</span></Link>
      <Link className="card" href="/occurrences/"><span className="card-kicker">04A</span><h3>Occurrences</h3><p>Inspect exact Pāḷi token occurrences across stable paragraph IDs.</p><span className="card-link">Open occurrences →</span></Link>
      <Link className="card" href="/dictionary/"><span className="card-kicker">04</span><h3>Dictionary</h3><p>Explore source-aware lexical entries and starter morphological forms.</p><span className="card-link">Open dictionary →</span></Link>
      <Link className="card" href="/sources/"><span className="card-kicker">05</span><h3>Sources</h3><p>Review provenance and redistribution status before publishing research data.</p><span className="card-link">Open sources →</span></Link>
      <Link className="card" href="/works/"><span className="card-kicker">06</span><h3>Works</h3><p>Browse stable work records and enter the research reader.</p><span className="card-link">Open library →</span></Link>
    </section>
    <section className="section"><div className="notice"><strong>Research integrity:</strong> Phase 2 starter indexes are research infrastructure, not a claim of a complete critical edition, complete morphology engine, or complete Aṭṭhakathā/Ṭīkā corpus. Every future import must retain edition, source, license, provenance, and review metadata.</div></section>
  </main>;
}
