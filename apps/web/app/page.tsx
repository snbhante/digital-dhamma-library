import Link from "next/link";
import corpus from "../../../data/corpus.json";
import SearchBox from "../components/SearchBox";
import RecentReads from "../components/RecentReads";
import SiteBrand from "../components/SiteBrand";
import AuthStatus from "../components/AuthStatus";

const paragraphCount = corpus.reduce((sum, work) => sum + work.paragraphs.length, 0);

export default function Home() {
  return <main id="main-content" className="shell">
    <header className="home-header">
      <div className="hero-brand-row home-masthead"><SiteBrand /><AuthStatus /></div>
      <nav className="primary-nav" aria-label="Main navigation">
        <Link href="/works/">Library</Link><Link href="/search/">Search</Link><Link href="/dictionary/">Dictionary</Link><Link href="/research/">Research</Link><Link href="/workspace/">Workspace</Link><Link href="/account/">Account</Link>
      </nav>
      <div className="hero">
        <p className="eyebrow">OPEN BUDDHIST DIGITAL KNOWLEDGE</p>
        <h1>Digital Dhamma Library</h1>
        <p className="lead">Read, search, study, and research Buddhist texts through stable, source-aware digital records.</p>
        <SearchBox />
        <div className="actions hero-actions"><Link className="button primary" href="/read/mn10/">Start reading <span aria-hidden="true">↗</span></Link><Link className="button" href="/research/">Open research workbench</Link><Link className="button" href="#library">Explore the library</Link></div>
        <div className="hero-assurance"><span>Source-aware records</span><span>Parallel Pāḷi · English · বাংলা</span><span>Stable paragraph citations</span></div>
      </div>
    </header>
    <RecentReads />
    <section id="library" className="section"><div className="section-heading"><div><p className="eyebrow">THE DIGITAL COLLECTION</p><h2>Available records</h2></div><span className="badge">{corpus.length} works · {paragraphCount} paragraphs</span></div><div className="grid">{corpus.map((work) => <Link className="card" href={`/read/${work.id}/`} key={work.id}><span className="card-kicker">{work.collection}</span><h3>{work.title}</h3><p>{work.description}</p><span className="card-link">Read →</span></Link>)}</div></section>
    <section className="section feature-grid"><article className="feature-card"><span className="feature-number">01</span><h3>Research search</h3><p>Search Pāḷi, English, বাংলা, metadata, phrases, collections, types, and languages.</p></article><article className="feature-card"><span className="feature-number">02</span><h3>Reader controls</h3><p>Toggle languages, adjust text size and line spacing, and keep stable paragraph anchors.</p></article><article className="feature-card"><span className="feature-number">03</span><h3>Source-aware data</h3><p>Every starter record carries edition and provenance notes so later licensed imports can be audited.</p></article><article className="feature-card"><span className="feature-number">04</span><h3>Research engine</h3><p>Edition witnesses, translation alignment, dictionary, morphology, occurrence, review, cross-reference, and citation layers are modeled as separate research resources.</p></article></section>
    <section className="section"><div className="notice"><strong>Phase 2.4:</strong> The Research Workbench now exposes edition-witness metadata, sentence-level alignment review, richer morphology provenance, citation profiles, and browser-local research review tools alongside the Phase 2 research foundations.<br /><br /><strong>Data principle:</strong> the expanded corpus is a structured research starter dataset. It is not presented as a complete critical edition; source editions and redistribution rights must be verified before any future public data release.</div></section>
  </main>;
}
