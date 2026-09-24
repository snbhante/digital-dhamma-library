import Link from "next/link";
import { notFound } from "next/navigation";
import dictionary from "../../../../../data/dictionary.json";
import morphology from "../../../../../data/morphology.json";
import occurrences from "../../../../../data/occurrences.json";

export function generateStaticParams() { return dictionary.map((entry) => ({ id: entry.id })); }

export default async function DictionaryEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = dictionary.find((item) => item.id === id);
  if (!entry) notFound();
  const morph = morphology.find((item) => item.id === id);
  const occurrenceMap = new Map(occurrences.map((item) => [item.token, item]));
  const exact = occurrenceMap.get(entry.headword.toLowerCase());
  return <main className="shell">
    <nav className="topbar"><Link href="/dictionary/">← Dictionary</Link><span>{entry.headword}</span></nav>
    <header className="reader-header"><p className="eyebrow">LEXICAL RECORD</p><h1>{entry.headword}</h1><p>{entry.note}</p></header>
    <section className="section grid">
      <article className="card"><span className="card-kicker">GRAMMAR</span><h3>Grammatical profile</h3><p>{entry.grammar}</p><h4>Variants</h4><p className="pali">{entry.variants.join(" · ") || "No variants recorded."}</p></article>
      <article className="card"><span className="card-kicker">MEANING</span><h3>Research senses</h3>{entry.meanings.map((meaning, i) => <div key={i}><p><strong>English:</strong> {meaning.english}</p><p className="bangla"><strong>বাংলা:</strong> {meaning.bangla}</p></div>)}</article>
      <article className="card"><span className="card-kicker">MORPHOLOGY</span><h3>Starter form index</h3><p>{morph?.analysis}</p><p className="pali">{morph?.forms.join(" · ") || "No starter forms recorded."}</p><div className="notice compact">Confidence: {morph?.confidence}. {morph?.note}</div></article>
      <article className="card"><span className="card-kicker">OCCURRENCES</span><h3>Exact token index</h3><p>{exact ? `${exact.count} exact-token occurrence(s) in the starter corpus.` : "No exact-token occurrence was indexed."}</p>{exact && <div className="result-list">{exact.references.slice(0,20).map((ref) => <Link className="result-card" key={`${ref.workId}-${ref.paragraphId}`} href={`/read/${ref.workId}/#${ref.paragraphId}`}><span>{ref.paragraphId}</span><strong>Open occurrence →</strong></Link>)}</div>}</article>
    </section>
    <section className="section"><div className="notice"><strong>Sources:</strong> {entry.sources.join(" · ")}. These starter references are navigation aids; verify against the cited edition before scholarly publication.</div></section>
  </main>;
}
