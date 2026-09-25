import Link from "next/link";
import witnesses from "../../../../data/edition-witnesses.json";

export default function EditionWitnessesPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Edition Witnesses</span></nav>
    <header className="reader-header"><p className="eyebrow">EDITION WITNESS REGISTRY</p><h1>Edition Witnesses</h1><p>Every text comparison must identify the actual witness being compared. Phase 2.2 records the bundled starter witness and creates explicit metadata-only slots for future independently verified editions; it does not fabricate alternate texts.</p></header>
    <section className="section result-list">{witnesses.map((item) => <article className="card" key={item.id}><div className="result-meta"><span>{item.role}</span><span>{item.verificationStatus}</span><span>{item.workId}</span></div><h3>{item.editionLabel}</h3><p>{item.note}</p><p className="muted">Text: {item.textStatus} · Paragraphs: {item.paragraphCount} · Independent witness: {item.independentWitness ? "yes" : "no"}</p><p className="muted">Rights: {item.licenseStatus}</p></article>)}</section>
  </main>;
}
