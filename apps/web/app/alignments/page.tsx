import Link from "next/link";
import alignments from "../../../../data/translation-alignments.json";
import sentenceAlignments from "../../../../data/sentence-alignments.json";

export default function AlignmentsPage() {
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Translation Alignments</span></nav>
    <header className="reader-header"><p className="eyebrow">TRANSLATION ALIGNMENT</p><h1>Alignment Records</h1><p>Paragraph-level alignment remains the stable baseline. Phase 2.2 adds sentence-level heuristic alignment records with explicit review status; ordinal matches are not treated as scholarly verified alignments.</p><div className="metadata"><span>{alignments.length} paragraph records</span><span>{sentenceAlignments.length} sentence records</span><span>Needs human review</span></div><div className="reader-actions"><Link className="small-button" href="/review/">Open review queue →</Link></div></header>
    <section className="section"><h2>Sentence-level review samples</h2><div className="result-list">{sentenceAlignments.slice(0, 120).map((item)=><article className="card" key={item.id}><div className="result-meta"><span>{item.language}</span><span>{item.workId}</span><span>{item.reviewStatus}</span></div><p className="pali">{item.sourcePali || "No source sentence"}</p><p>{item.translationText || "No translation sentence aligned"}</p><p className="muted">{item.alignmentType} · {item.confidence}</p><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open source paragraph →</Link></article>)}</div></section>
    <section className="section"><h2>Paragraph-level baseline</h2><div className="result-list">{alignments.slice(0, 120).map((item)=><article className="card" key={item.id}><div className="result-meta"><span>{item.language}</span><span>{item.workId}</span><span>{item.paragraphId}</span></div><p>{item.translationText}</p><p className="muted">{item.alignmentType} · {item.confidence}</p><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open source paragraph →</Link></article>)}</div></section>
  </main>;
}
