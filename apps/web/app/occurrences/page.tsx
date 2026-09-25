"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import occurrences from "../../../../data/occurrences.json";

type Mode = "surface" | "lemma" | "both";

export default function OccurrencesPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("both");
  const results = useMemo(() => {
    const q = query.normalize("NFKC").toLocaleLowerCase().trim();
    if (!q) return occurrences.slice(0, 80);
    return occurrences.filter((item) => {
      const surface = item.token.includes(q);
      const lemma = Boolean(item.lemma?.includes(q));
      return mode === "surface" ? surface : mode === "lemma" ? lemma : surface || lemma;
    }).slice(0, 120);
  }, [query, mode]);

  return <main className="shell">
    <nav className="topbar"><Link href="/research/">← Research Workbench</Link><span>Occurrences</span></nav>
    <header className="reader-header">
      <p className="eyebrow">PĀḶI OCCURRENCE INDEX</p>
      <h1>Word &amp; Lemma Occurrences</h1>
      <p>Search the starter occurrence index by surface form, indexed lemma, or both. Lemma assignments are starter metadata derived from the project morphology index, not a complete morphological parser.</p>
      <form className="search-form large" onSubmit={(e)=>e.preventDefault()}>
        <label className="sr-only" htmlFor="occurrence-query">Token or lemma</label>
        <input id="occurrence-query" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Try: dhamma, dhammaṃ, mettā, satimā…" />
        <select aria-label="Occurrence search mode" value={mode} onChange={(e)=>setMode(e.target.value as Mode)}>
          <option value="both">Surface + lemma</option>
          <option value="surface">Surface form</option>
          <option value="lemma">Lemma</option>
        </select>
      </form>
    </header>
    <section className="section grid">
      {results.map((item)=><article className="card" key={item.token}>
        <div className="result-meta"><span>{item.count} token occurrence{item.count===1?"":"s"} · {item.paragraphCount} paragraph{item.paragraphCount===1?"":"s"}</span></div>
        <h3 className="pali">{item.token}</h3>
        <p><strong>Lemma:</strong> <span className="pali">{item.lemma || "Not indexed"}</span></p>
        <div className="result-list">{item.references.slice(0,8).map(ref=><Link className="result-card" key={`${ref.workId}-${ref.paragraphId}`} href={`/read/${ref.workId}/#${ref.paragraphId}`}><span>{ref.paragraphId}</span><strong>Open →</strong></Link>)}</div>
      </article>)}
    </section>
  </main>;
}
