import Link from "next/link";
import corpus from "../../../data/corpus.json";
import SearchBox from "../components/SearchBox";

export default function Home() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">OPEN BUDDHIST DIGITAL KNOWLEDGE</p>
        <h1>Digital Dhamma Library</h1>
        <p className="lead">
          Read, search, study, and research Buddhist texts through stable,
          source-aware digital records.
        </p>
        <SearchBox />
        <div className="actions">
          <Link className="button primary" href="/read/mn10/">Open MN 10</Link>
          <Link className="button" href="#library">Explore library</Link>
        </div>
      </header>

      <section id="library" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PHASE 1 CORPUS</p>
            <h2>Available records</h2>
          </div>
          <span className="badge">{corpus.length} works</span>
        </div>

        <div className="grid">
          {corpus.map((work) => (
            <Link className="card" href={`/read/${work.id}/`} key={work.id}>
              <span className="card-kicker">{work.collection}</span>
              <h3>{work.title}</h3>
              <p>{work.description}</p>
              <span className="card-link">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section feature-grid">
        <article className="feature-card">
          <span className="feature-number">01</span>
          <h3>Stable citations</h3>
          <p>Every paragraph has a durable identifier that can be linked, quoted, and cited.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">02</span>
          <h3>Source-aware data</h3>
          <p>Provenance, edition, and licensing metadata are part of the data model from the beginning.</p>
        </article>
        <article className="feature-card">
          <span className="feature-number">03</span>
          <h3>Open architecture</h3>
          <p>The public reader is designed to grow into dictionaries, commentaries, research tools, and APIs.</p>
        </article>
      </section>

      <section className="section">
        <div className="notice">
          <strong>Data principle:</strong> every published text will carry
          provenance, edition, source, and licensing metadata. Internet
          availability alone is not treated as redistribution permission.
        </div>
      </section>
    </main>
  );
}
