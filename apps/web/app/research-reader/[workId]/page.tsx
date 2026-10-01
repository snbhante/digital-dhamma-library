import Link from "next/link";
import { notFound } from "next/navigation";
import corpus from "../../../../../data/corpus.json";
import AdvancedResearchReader from "../../../components/AdvancedResearchReader";
import SiteBrand from "../../../components/SiteBrand";

export const dynamicParams = false;

export function generateStaticParams() {
  return corpus.map((work) => ({ workId: work.id }));
}

export default async function ResearchReaderPage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = await params;
  const work = corpus.find((item) => item.id === workId);
  if (!work) notFound();

  return <main id="main-content" className="reader-shell">
    <nav className="topbar"><SiteBrand compact /><div className="topbar-actions"><Link href="/research/">Research Workbench</Link><span>{work.collection}</span></div></nav>
    <header className="reader-header research-reader-header"><p className="eyebrow">ADVANCED RESEARCH READER</p><h1>{work.title}</h1><p>{work.description}</p><div className="metadata"><span>{work.edition}</span><span>{work.paragraphs.length} paragraphs</span><span>Parallel text · dictionary · commentary registry · citations</span></div></header>
    <AdvancedResearchReader work={work} />
  </main>;
}
