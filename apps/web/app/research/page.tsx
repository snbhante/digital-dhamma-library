import Link from "next/link";
import corpus from "../../../../data/corpus.json";
import dictionary from "../../../../data/dictionary.json";
import editions from "../../../../data/editions.json";
import translations from "../../../../data/translations.json";
import morphology from "../../../../data/morphology.json";
import occurrences from "../../../../data/occurrences.json";
import crossReferences from "../../../../data/cross-references.json";
import sentences from "../../../../data/sentences.json";
import alignments from "../../../../data/translation-alignments.json";
import sentenceAlignments from "../../../../data/sentence-alignments.json";
import dictionarySources from "../../../../data/dictionary-sources.json";
import derivations from "../../../../data/derivations.json";
import witnesses from "../../../../data/edition-witnesses.json";
import citationProfiles from "../../../../data/citation-profiles.json";
import reviewQueue from "../../../../data/review-queue.json";

const paragraphCount = corpus.reduce((sum, work) => sum + work.paragraphs.length, 0);
const occurrenceCount = occurrences.reduce((sum, item) => sum + item.count, 0);

export default function ResearchPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Phase 2.3 Research Engine</span></nav>
    <header className="reader-header">
      <p className="eyebrow">PHASE 2.3 · RESEARCH ENGINE</p>
      <h1>Research Workbench</h1>
      <p>A source-aware foundation for editions, translations, dictionary research, word occurrences, morphology, sentence alignment, review status, and scholarly citation.</p>
    </header>
    <section className="section">
      <div className="stats-grid">
        <div className="stat-card"><strong>{corpus.length}</strong><span>Works</span></div>
        <div className="stat-card"><strong>{paragraphCount}</strong><span>Paragraphs</span></div>
        <div className="stat-card"><strong>{dictionary.length}</strong><span>Dictionary entries</span></div>
        <div className="stat-card"><strong>{occurrences.length}</strong><span>Indexed Pāḷi tokens</span></div>
        <div className="stat-card"><strong>{occurrenceCount}</strong><span>Token occurrences</span></div>
        <div className="stat-card"><strong>{crossReferences.length}</strong><span>Research links</span></div>
        <div className="stat-card"><strong>{sentences.length}</strong><span>Sentence records</span></div>
        <div className="stat-card"><strong>{alignments.length}</strong><span>Paragraph alignments</span></div>
        <div className="stat-card"><strong>{sentenceAlignments.length}</strong><span>Sentence alignments</span></div>
        <div className="stat-card"><strong>{witnesses.length}</strong><span>Edition witness records</span></div>
        <div className="stat-card"><strong>{citationProfiles.length}</strong><span>Citation profiles</span></div>
        <div className="stat-card"><strong>{reviewQueue.length}</strong><span>Review queue items</span></div>
      </div>
    </section>
    <section className="section grid">
      <Link className="card" href="/search/"><span className="card-kicker">01</span><h3>Advanced Search</h3><p>Search the multilingual corpus with filters and stable paragraph links.</p><span className="card-link">Open search →</span></Link>
      <Link className="card" href="/editions/"><span className="card-kicker">02</span><h3>Editions</h3><p>Track edition identity, provenance, verification status, and licensing notes.</p><span className="card-link">Open editions →</span></Link>
      <Link className="card" href="/edition-witnesses/"><span className="card-kicker">02A</span><h3>Edition Witnesses</h3><p>Track actual bundled witnesses and explicit future alternate-edition slots.</p><span className="card-link">Open witnesses →</span></Link>
      <Link className="card" href="/translations/"><span className="card-kicker">03</span><h3>Translations</h3><p>Separate translation identity from canonical text and preserve rights metadata.</p><span className="card-link">Open translations →</span></Link>
      <Link className="card" href="/occurrences/"><span className="card-kicker">04A</span><h3>Occurrences</h3><p>Inspect exact Pāḷi token and lemma occurrences across stable paragraph IDs.</p><span className="card-link">Open occurrences →</span></Link>
      <Link className="card" href="/dictionary/"><span className="card-kicker">04</span><h3>Dictionary</h3><p>Explore source-aware lexical entries and starter morphological forms.</p><span className="card-link">Open dictionary →</span></Link>
      <Link className="card" href="/morphology/"><span className="card-kicker">04B</span><h3>Morphology &amp; Formation</h3><p>Inspect lemma analyses, lexical forms, and starter compound metadata.</p><span className="card-link">Open morphology →</span></Link>
      <Link className="card" href="/sources/"><span className="card-kicker">05</span><h3>Sources</h3><p>Review provenance and redistribution status before publishing research data.</p><span className="card-link">Open sources →</span></Link>
      <Link className="card" href="/works/"><span className="card-kicker">06</span><h3>Works</h3><p>Browse stable work records and enter the research reader.</p><span className="card-link">Open library →</span></Link>
      <Link className="card" href="/sentences/"><span className="card-kicker">07</span><h3>Sentences</h3><p>Explore punctuation-based starter sentence segmentation without changing paragraph IDs.</p><span className="card-link">Open sentences →</span></Link>
      <Link className="card" href="/alignments/"><span className="card-kicker">08</span><h3>Translation Alignment</h3><p>Inspect paragraph and sentence-level alignment records awaiting review.</p><span className="card-link">Open alignments →</span></Link>
      <Link className="card" href="/dictionary-sources/"><span className="card-kicker">09</span><h3>Dictionary Sources</h3><p>Review adapter contracts and licensing status for future dictionary imports.</p><span className="card-link">Open sources →</span></Link>
      <Link className="card" href="/derivations/"><span className="card-kicker">10</span><h3>Compounds &amp; Forms</h3><p>Explore starter lexical-form and compound metadata.</p><span className="card-link">Open formation index →</span></Link>
      <Link className="card" href="/citations/"><span className="card-kicker">11</span><h3>Citation Profiles</h3><p>Review reusable plain, Markdown, BibTeX, APA-style, and Chicago-style templates.</p><span className="card-link">Open citation profiles →</span></Link>
      <Link className="card" href="/review/"><span className="card-kicker">12</span><h3>Research Review Queue</h3><p>Review sentence alignments, occurrence assignments, and morphology analyses in-browser.</p><span className="card-link">Open review queue →</span></Link><Link className="card" href="/workspace/"><span className="card-kicker">13</span><h3>My Research Workspace</h3><p>Save passages, private notes, research searches, and personal collections in a local-first workspace.</p><span className="card-link">Open workspace →</span></Link>
    </section>
    <section className="section"><div className="notice"><strong>Research integrity:</strong> Phase 2.3 adds edition-witness metadata, sentence-level alignment review records, richer starter morphology provenance, citation profiles, and a browser-local research review queue. These features do not claim a complete critical edition, complete morphology engine, or authenticated scholarly verification. Future imports must retain source, edition, license, checksum, provenance, reviewer, and audit metadata.</div></section>
  </main>;
}
