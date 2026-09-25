import Link from "next/link";
import sentences from "../../../../data/sentences.json";

export default function SentencesPage() {
  const groups = new Map<string, typeof sentences>();
  for (const sentence of sentences) groups.set(sentence.paragraphId, [...(groups.get(sentence.paragraphId) ?? []), sentence]);
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Sentences</span></nav>
    <header className="reader-header"><p className="eyebrow">SENTENCE SEGMENTATION</p><h1>Sentence Index</h1><p>Starter Pāḷi sentence boundaries generated without changing the canonical paragraph IDs. Segmentation is punctuation-based and should be reviewed for scholarly-grade editions.</p><div className="metadata"><span>{sentences.length} sentence records</span><span>{groups.size} source paragraphs</span></div></header>
    <section className="section result-list">{sentences.map((sentence)=><article className="card" key={sentence.id}><div className="result-meta"><span>{sentence.workId}</span><span>{sentence.paragraphId}</span><span>{sentence.id}</span></div><p className="pali">{sentence.pali}</p><p className="muted">{sentence.segmentationMethod} · {sentence.confidence}</p><Link className="small-button" href={`/read/${sentence.workId}/#${sentence.paragraphId}`}>Open paragraph →</Link></article>)}</section>
  </main>;
}
