"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dictionary from "../../../../data/dictionary.json";

function norm(value: string) { return value.normalize("NFKC").toLocaleLowerCase().trim(); }

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = norm(query);
    if (!q) return dictionary;
    return dictionary.filter((e) => [e.headword, ...e.variants, e.meanings.map((m)=>m.english).join(" "), e.meanings.map((m)=>m.bangla).join(" ")].join(" ").toLocaleLowerCase().includes(q));
  }, [query]);
  return <main className="shell search-page">
    <nav className="topbar"><Link href="/">← Digital Dhamma Library</Link><span>Dictionary</span></nav>
    <header className="reader-header search-header"><p className="eyebrow">PHASE 1.3 DICTIONARY</p><h1>Pāḷi Research Dictionary</h1><p>A small project-curated starter lexicon. It is a research interface prototype, not a replacement for established Pāḷi dictionaries.</p></header>
    <form className="search-form large" onSubmit={(e)=>e.preventDefault()}><label className="sr-only" htmlFor="dictionary-search">Search dictionary</label><input id="dictionary-search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search headword, variant, English, or বাংলা" /></form>
    <section className="section"><div className="section-heading"><h2>{results.length} entries</h2><span className="badge">Starter lexicon</span></div><div className="result-list">{results.map((entry)=><article className="result-card" key={entry.id} id={entry.id}><div className="result-meta"><span>{entry.grammar}</span><span>{entry.id}</span></div><h3>{entry.headword}</h3><p><strong>Variants:</strong> {entry.variants.join(", ")}</p>{entry.meanings.map((m,i)=><div key={i}><p><strong>English:</strong> {m.english}</p><p className="bangla"><strong>বাংলা:</strong> {m.bangla}</p></div>)}<p><strong>Research note:</strong> {entry.note}</p><p><strong>Starter references:</strong> {entry.sources.join(", ")}</p></article>)}</div></section>
  </main>;
}
