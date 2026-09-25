import Link from "next/link";
import alignments from "../../../../data/translation-alignments.json";

export default function AlignmentsPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Translation Alignments</span></nav>
    <header className="reader-header"><p className="eyebrow">TRANSLATION ALIGNMENT</p><h1>Alignment Records</h1><p>Paragraph-level 1-to-1 alignment records for the project-curated starter translations. These records are designed to support later sentence-level alignment without changing stable paragraph IDs.</p><div className="metadata"><span>{alignments.length} alignment records</span><span>Starter confidence</span></div></header>
    <section className="section result-list">{alignments.slice(0, 120).map((item)=><article className="card" key={item.id}><div className="result-meta"><span>{item.language}</span><span>{item.workId}</span><span>{item.paragraphId}</span></div><p>{item.translationText}</p><p className="muted">{item.alignmentType} · {item.confidence}</p><Link className="small-button" href={`/read/${item.workId}/#${item.paragraphId}`}>Open source paragraph →</Link></article>)}</section>
  </main>;
}
