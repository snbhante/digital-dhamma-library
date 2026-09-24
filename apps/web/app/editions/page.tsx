import Link from "next/link";
import editions from "../../../../data/editions.json";
import corpus from "../../../../data/corpus.json";

export default function EditionsPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Editions</span></nav>
    <header className="reader-header"><p className="eyebrow">EDITION MANAGEMENT</p><h1>Text Editions</h1><p>Edition identity is kept separate from individual work records so the same canonical work can later have multiple verified editions.</p></header>
    <section className="section grid">{editions.map((edition) => {
      const works = corpus.filter((w) => w.edition === edition.edition);
      return <article className="card" key={edition.id}><span className="card-kicker">{edition.status}</span><h3>{edition.edition}</h3><p>{edition.title}</p><div className="metadata"><span>{works.length} works</span><span>{edition.language}</span><span>{edition.isCriticalEdition ? "Critical" : "Starter"}</span></div><p className="muted">{edition.provenance}</p><p className="notice compact">{edition.verification}</p></article>;
    })}</section>
  </main>;
}
