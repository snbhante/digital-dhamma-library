"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import corpus from "../../../../data/corpus.json";

export default function WorksPage() {
  const [collection, setCollection] = useState("all");
  const [type, setType] = useState("all");
  const collections = useMemo(() => [...new Set(corpus.map((w) => w.collection))].sort(), []);
  const types = useMemo(() => [...new Set(corpus.map((w) => w.type))].sort(), []);
  const works = useMemo(() => corpus.filter((w) => (collection === "all" || w.collection === collection) && (type === "all" || w.type === type)), [collection,type]);
  return <main className="shell search-page">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Library Index</span></nav>
    <header className="reader-header search-header"><p className="eyebrow">LIBRARY INDEX</p><h1>Works</h1><p>Browse the structured research corpus by collection and record type.</p></header>
    <section className="filters" aria-label="Library filters">
      <label>Collection<select value={collection} onChange={(e)=>setCollection(e.target.value)}><option value="all">All collections</option>{collections.map((x)=><option key={x}>{x}</option>)}</select></label>
      <label>Type<select value={type} onChange={(e)=>setType(e.target.value)}><option value="all">All types</option>{types.map((x)=><option key={x}>{x}</option>)}</select></label>
    </section>
    <section className="section"><div className="section-heading"><h2>{works.length} works</h2><span className="badge">Stable IDs</span></div><div className="grid">{works.map((w)=><Link className="card" href={`/read/${w.id}/`} key={w.id}><span className="card-kicker">{w.id} · {w.collection}</span><h3>{w.title}</h3><p>{w.description}</p><span className="card-link">{w.paragraphs.length} paragraphs →</span></Link>)}</div></section>
  </main>;
}
