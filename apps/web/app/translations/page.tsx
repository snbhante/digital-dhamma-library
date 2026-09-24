import Link from "next/link";
import translations from "../../../../data/translations.json";

export default function TranslationsPage() {
  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Translations</span></nav>
    <header className="reader-header"><p className="eyebrow">TRANSLATION MANAGEMENT</p><h1>Translation Registry</h1><p>Translations are first-class records with their own language, identity, rights, and scope. This prevents translation metadata from being confused with the underlying Pāḷi edition.</p></header>
    <section className="section grid">{translations.map((item) => <article className="card" key={item.id}><span className="card-kicker">{item.status}</span><h3>{item.label}</h3><p><strong>Language:</strong> {item.language}</p><p><strong>Type:</strong> {item.type}</p><p>{item.scope}</p><div className="notice compact"><strong>Rights:</strong> {item.licenseStatus}</div></article>)}</section>
  </main>;
}
