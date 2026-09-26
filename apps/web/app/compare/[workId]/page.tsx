import Link from "next/link";
import { notFound } from "next/navigation";
import corpus from "../../../../../data/corpus.json";
import translations from "../../../../../data/translations.json";
import witnesses from "../../../../../data/edition-witnesses.json";

export const dynamicParams = false;

export function generateStaticParams() { return corpus.map((work) => ({ workId: work.id })); }

export default async function ComparePage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = await params;
  const work = corpus.find((item) => item.id === workId);
  if (!work) notFound();
  const workWitnesses = witnesses.filter((item) => item.workId === work.id);
  const bundled = workWitnesses.filter((item) => item.textStatus === "BUNDLED");
  const alternate = workWitnesses.filter((item) => item.role === "ALTERNATE_TEMPLATE");
  return <main id="main-content" className="shell">
    <nav className="topbar"><Link href={`/read/${work.id}/`}>← Reader</Link><span>Text Comparison</span></nav>
    <header className="reader-header"><p className="eyebrow">RESEARCH COMPARISON</p><h1>{work.title}</h1><p>Side-by-side comparison of the bundled Pāḷi witness and project-curated translations. Independent alternate-edition text is displayed only when a verified witness has actually been imported; Phase 2.2 never invents variant readings.</p><div className="metadata"><span>Edition: {work.edition}</span><span>{translations.length} registered translation resource(s)</span><span>{bundled.length} bundled witness</span><span>{alternate.length} future witness slot</span></div></header>
    <section className="section grid"><article className="card"><div className="result-meta"><span>PRIMARY WITNESS</span><span>{bundled[0]?.verificationStatus ?? "UNKNOWN"}</span></div><h3>{bundled[0]?.editionLabel ?? work.edition}</h3><p>{bundled[0]?.note}</p><p className="muted">{bundled[0]?.licenseStatus}</p></article><article className="card"><div className="result-meta"><span>ALTERNATE EDITION</span><span>NOT BUNDLED</span></div><h3>Independent witness slot</h3><p>No independent alternate-edition text is bundled for this work yet.</p><Link className="small-button" href="/edition-witnesses/">Review witness registry →</Link></article></section>
    <section className="comparison-table" aria-label="Text comparison"><div className="comparison-head"><strong>Paragraph</strong><strong>Pāḷi</strong><strong>English</strong><strong>বাংলা</strong></div>{Array.from(new Map(work.paragraphs.map((p) => [p.id, p])).values()).map((p) => <article className="comparison-row" id={p.id} key={`${work.id}-${p.id}`}><div className="paragraph-id">{p.id}</div><div className="pali">{p.pali}</div><div>{p.english || "—"}</div><div className="bangla">{p.bangla || "—"}</div></article>)}</section>
  </main>;
}
