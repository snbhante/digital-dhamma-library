import Link from "next/link";
import { notFound } from "next/navigation";
import corpus from "../../../../../data/corpus.json";
import translations from "../../../../../data/translations.json";

export function generateStaticParams() { return corpus.map((work) => ({ workId: work.id })); }

export default async function ComparePage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = await params;
  const work = corpus.find((item) => item.id === workId);
  if (!work) notFound();
  return <main className="shell">
    <nav className="topbar"><Link href={`/read/${work.id}/`}>← Reader</Link><span>Text Comparison</span></nav>
    <header className="reader-header"><p className="eyebrow">RESEARCH COMPARISON</p><h1>{work.title}</h1><p>Side-by-side display of the starter Pāḷi text and available project-curated translations. Future editions/translations can be added as independent records.</p><div className="metadata"><span>Edition: {work.edition}</span><span>{translations.length} registered translation resource(s)</span></div></header>
    <section className="comparison-table" aria-label="Text comparison"><div className="comparison-head"><strong>Paragraph</strong><strong>Pāḷi</strong><strong>English</strong><strong>বাংলা</strong></div>{work.paragraphs.map((p) => <article className="comparison-row" id={p.id} key={p.id}><div className="paragraph-id">{p.id}</div><div className="pali">{p.pali}</div><div>{p.english || "—"}</div><div className="bangla">{p.bangla || "—"}</div></article>)}</section>
  </main>;
}
