import Link from "next/link";
import { notFound } from "next/navigation";
import corpus from "../../../../../data/corpus.json";
import ReaderView from "../../../components/ReaderView";

type Work = (typeof corpus)[number];

export function generateStaticParams() {
  return corpus.map((work) => ({ workId: work.id }));
}

export default async function WorkPage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = await params;
  const work = corpus.find((item) => item.id === workId) as Work | undefined;
  if (!work) notFound();

  return <main className="reader-shell">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><div className="topbar-actions"><Link href="/search/">Search</Link><span>{work.collection}</span></div></nav>
    <header className="reader-header">
      <p className="eyebrow">{work.id.toUpperCase()}</p><h1>{work.title}</h1><p>{work.description}</p>
      <div className="metadata"><span>Language: {work.language}</span><span>Type: {work.type}</span><span>Edition: {work.edition}</span><span>{work.paragraphs.length} paragraphs</span></div><div className="source-note"><strong>Provenance:</strong> {work.source.provenance}<br /><strong>Rights note:</strong> {work.source.licenseStatus}</div>
    </header>
    <ReaderView work={work} />
  </main>;
}
